import { Suspense } from "react";
import { DeviceFilter } from "@/components/device-filter";
import { SortableDeviceTable } from "@/components/sortable-device-table";
import { decodeSensorData } from "@/lib/decode-sensor-data";
import { getDeviceItems, type DecodedColumnPayload } from "@/lib/db";
import type { DeviceData } from "@/lib/types";

/** Read number from decoded payload (handles DynamoDB unmarshalled number or raw { N: string }). */
function num(value: unknown): number | null {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (value != null && typeof value === "object" && "N" in value && typeof (value as { N: string }).N === "string") {
    const n = parseFloat((value as { N: string }).N);
    return Number.isNaN(n) ? null : n;
  }
  return null;
}

interface DeviceTableProps {
  className?: string;
  /** When set, only this device's latest entries are fetched (Query). Otherwise scan 300 for latest mix. */
  deviceId?: string | null;
}

/**
 * Transforms raw DynamoDB items into display-ready DeviceData.
 * Called directly in Server Component - no HTTP overhead.
 */
async function fetchDeviceData(deviceId?: string | null): Promise<DeviceData[]> {
  const limit = deviceId ? 100 : 300;
  const items = await getDeviceItems(limit, deviceId ?? undefined);

  return items.map((item) => {
    const sensors = item.raw_message
      ? decodeSensorData(item.raw_message)
      : null;
    const d = item.decoded as DecodedColumnPayload | undefined;

    // Prefer decoded column for timestamp; fallback to item.timestamp (DynamoDB stores seconds, e.g. 1772404093)
    const tsFromDecoded = d?.json ? num((d.json as Record<string, unknown>).ts) : null;
    let rawTs = tsFromDecoded ?? item.timestamp;
    let timestampMs = rawTs < 1e12 ? rawTs * 1000 : rawTs;
    // If device sent a bogus future date (e.g. 2069 from ts=3155760013), use DynamoDB item timestamp instead
    const now = Date.now();
    if (timestampMs > now + 86400000) {
      const fallback = item.timestamp < 1e12 ? item.timestamp * 1000 : item.timestamp;
      timestampMs = fallback;
    }
    const humidity =
      (d?.env ? num((d.env as Record<string, unknown>).hum) : null) ??
      sensors?.shtHum ??
      item.humidity ??
      null;
    const temperature =
      (d?.env ? num((d.env as Record<string, unknown>).temp_c) : null) ??
      sensors?.shtTemp ??
      item.temperature ??
      null;
    const latitude = d?.location ? num((d.location as Record<string, unknown>).lat) ?? null : null;
    const longitude = d?.location ? num((d.location as Record<string, unknown>).lng) ?? null : null;

    // Simple online/offline heuristic based on timestamp recency
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    const isRecent = timestampMs > fiveMinutesAgo;
    const status: DeviceData["status"] = sensors || d
      ? isRecent
        ? "online"
        : "offline"
      : "unknown";

    return {
      deviceId: item.device_id ?? "unknown",
      timestamp: timestampMs,
      logIndex: item.log_index ?? sensors?.logIndex ?? null,
      status,
      humidity,
      temperature,
      latitude,
      longitude,
      deviceLocalIp: item.device_local_ip ?? null,
      sensors,
    };
  }).sort((a, b) => b.timestamp - a.timestamp);
}

export default async function DeviceTable({
  className,
  deviceId = null,
}: DeviceTableProps) {
  let devices: DeviceData[] = [];
  let error: string | null = null;

  try {
    devices = await fetchDeviceData(deviceId);
  } catch (e) {
    console.error("Failed to fetch device data:", e);
    error = "Unable to load device data. Please try again later.";
  }

  if (error) {
    return (
      <div className={`p-4 text-center ${className ?? ""}`}>
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <div className={`p-4 text-center ${className ?? ""}`}>
        <p className="text-muted-foreground">No devices found.</p>
      </div>
    );
  }

  const uniqueDeviceIds = [...new Set(devices.map((d) => d.deviceId))];

  return (
    <div className={`flex flex-col gap-2 ${className ?? ""}`}>
      <Suspense fallback={<div className="h-9 shrink-0" />}>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm font-medium text-muted-foreground">Device</span>
          <DeviceFilter
            deviceIds={uniqueDeviceIds}
            currentDeviceId={deviceId}
          />
        </div>
      </Suspense>
      <div className="min-h-0 flex-1 overflow-auto">
        <SortableDeviceTable devices={devices} />
      </div>
    </div>
  );
}
