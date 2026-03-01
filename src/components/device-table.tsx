import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeviceFilter } from "@/components/device-filter";
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

    // Prefer decoded column for timestamp, humidity, temperature, lat/long when present
    const tsFromDecoded = d?.json ? num((d.json as Record<string, unknown>).ts) : null;
    const timestampMs =
      tsFromDecoded != null
        ? (tsFromDecoded < 1e12 ? tsFromDecoded * 1000 : tsFromDecoded)
        : item.timestamp;
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
      logIndex: sensors?.logIndex ?? null,
      status,
      humidity,
      temperature,
      latitude,
      longitude,
      sensors,
    };
  }).sort((a, b) => b.timestamp - a.timestamp);
}

/** Formats a number for display, returning "—" if null/undefined/NaN. */
function formatValue(
  value: number | null | undefined,
  unit: string,
  decimals = 1
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "—";
  }
  return `${value.toFixed(decimals)}${unit}`;
}

/** Formats a timestamp as a readable date string. */
function formatTimestamp(ts: number): string {
  if (!ts) return "—";
  const date = new Date(ts);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Formats lat/long for display. */
function formatLatLong(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return "—";
  return value.toFixed(4);
}

/** Returns a status badge color based on device status. */
function getStatusColor(status: DeviceData["status"]): string {
  switch (status) {
    case "online":
      return "text-green-600";
    case "offline":
      return "text-red-500";
    default:
      return "text-muted-foreground";
  }
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
      <DeviceFilter
        deviceIds={uniqueDeviceIds}
        currentDeviceId={deviceId}
        className="shrink-0"
      />
      <div className="min-h-0 flex-1 overflow-auto">
      <Table>
        <TableCaption>End of device list.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Device ID</TableHead>
            <TableHead>Timestamp</TableHead>
            <TableHead>Temp</TableHead>
            <TableHead>Humidity</TableHead>
            <TableHead>Lat</TableHead>
            <TableHead>Long</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {devices.map((device) => (
            <TableRow key={`${device.deviceId}#${device.timestamp}`}>
              {/* Device ID - truncated for space */}
              <TableCell
                className="font-mono text-xs max-w-[100px] truncate"
                title={device.deviceId}
              >
                {device.deviceId.replace("monarch_", "").slice(-6)}
              </TableCell>

              {/* Timestamp */}
              <TableCell className="text-xs text-muted-foreground">
                {formatTimestamp(device.sensors?.timestamp ?? device.timestamp)}
              </TableCell>

              {/* Temperature */}
              <TableCell>{formatValue(device.temperature, "°C")}</TableCell>

              {/* Humidity */}
              <TableCell>{formatValue(device.humidity, "%")}</TableCell>

              {/* Latitude / Longitude from decoded */}
              <TableCell className="text-xs font-mono">
                {formatLatLong(device.latitude)}
              </TableCell>
              <TableCell className="text-xs font-mono">
                {formatLatLong(device.longitude)}
              </TableCell>

              {/* Status */}
              <TableCell className={getStatusColor(device.status)}>
                {device.status}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
    </div>
  );
}
