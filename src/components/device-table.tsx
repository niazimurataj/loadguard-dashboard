import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { decodeSensorData } from "@/lib/decode-sensor-data";
import { getDeviceItems } from "@/lib/db";
import type { DeviceData } from "@/lib/types";

interface DeviceTableProps {
  className?: string;
}

/**
 * Transforms raw DynamoDB items into display-ready DeviceData.
 * Called directly in Server Component - no HTTP overhead.
 */
async function fetchDeviceData(): Promise<DeviceData[]> {
  // Direct DynamoDB call - no self-referential HTTP request
  const items = await getDeviceItems(50);

  return items.map((item) => {
    const sensors = item.raw_message
      ? decodeSensorData(item.raw_message)
      : null;

    // Simple online/offline heuristic based on timestamp recency
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    const isRecent = item.timestamp > fiveMinutesAgo;
    const status: DeviceData["status"] = sensors
      ? isRecent
        ? "online"
        : "offline"
      : "unknown";

    return {
      deviceId: item.device_id ?? "unknown",
      timestamp: item.timestamp,
      logIndex: sensors?.logIndex ?? null,
      status,
      humidity: sensors?.shtHum ?? item.humidity ?? null,
      temperature: sensors?.shtTemp ?? item.temperature ?? null,
      sensors,
    };
  });
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

export default async function DeviceTable({ className }: DeviceTableProps) {
  let devices: DeviceData[] = [];
  let error: string | null = null;

  try {
    devices = await fetchDeviceData();
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

  return (
    <div className={`overflow-auto ${className ?? ""}`}>
      <Table>
        <TableCaption>End of device list.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Device ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Timestamp</TableHead>
            <TableHead>Temp</TableHead>
            <TableHead>Humidity</TableHead>
            <TableHead>Operator</TableHead>
            <TableHead>RSRP</TableHead>
            <TableHead>Band</TableHead>
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

              {/* Status */}
              <TableCell className={getStatusColor(device.status)}>
                {device.status}
              </TableCell>

              {/* Timestamp */}
              <TableCell className="text-xs text-muted-foreground">
                {formatTimestamp(device.sensors?.timestamp ?? device.timestamp)}
              </TableCell>

              {/* Temperature (shtTemp) */}
              <TableCell>{formatValue(device.temperature, "°C")}</TableCell>

              {/* Humidity (shtHum) */}
              <TableCell>{formatValue(device.humidity, "%")}</TableCell>

              {/* LTE Operator */}
              <TableCell className="text-xs">
                {device.sensors?.operatorName || "—"}
              </TableCell>

              {/* LTE Signal Strength (RSRP) */}
              <TableCell className="text-xs">
                {formatValue(device.sensors?.rsrp, " dBm", 0)}
              </TableCell>

              {/* LTE Band */}
              <TableCell className="text-xs">
                {device.sensors?.band ?? "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
