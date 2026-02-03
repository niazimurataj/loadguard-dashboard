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
import type { DynamoDBDeviceItem, DeviceData } from "@/lib/types";

interface DeviceTableProps {
  className?: string;
}

/**
 * Fetches device data from the API and decodes raw sensor payloads.
 * This is a Server Component — data fetching happens at request time.
 */
async function fetchDeviceData(): Promise<DeviceData[]> {
  // Use relative URL so it works in both dev and prod
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api`, {
    method: "GET",
    cache: "no-store", // Always fetch fresh data
  });

  if (!res.ok) {
    // Throw so error boundary or try/catch can handle it
    throw new Error(`API request failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const items: DynamoDBDeviceItem[] = data.items ?? [];

  // Transform and decode each item
  return items.map((item) => {
    // Attempt to decode raw_message if present
    const sensors = item.raw_message ? decodeSensorData(item.raw_message) : null;

    // Determine status: if we have recent sensor data, device is "online"
    // This is a simple heuristic — adjust as needed for your use case
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
      status,
      // Prefer decoded sensor values, fall back to legacy fields
      humidity: sensors?.shtHum ?? item.humidity ?? null,
      temperature: sensors?.shtTemp ?? item.temperature ?? null,
      sensors,
    };
  });
}

/**
 * Formats a number for display, returning "—" if null/undefined.
 */
function formatValue(value: number | null, unit: string, decimals = 1): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "—";
  }
  return `${value.toFixed(decimals)}${unit}`;
}

/**
 * Returns a status badge color based on device status.
 */
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
    // Log full error server-side, show safe message to user
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
    <Table className={className}>
      <TableCaption>End of device list.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[120px]">Device ID</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Humidity</TableHead>
          <TableHead>Temperature</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {devices.map((device) => (
          <TableRow key={`${device.deviceId}#${device.timestamp}`}>
            <TableCell className="font-medium font-mono text-sm">
              {device.deviceId}
            </TableCell>
            <TableCell className={getStatusColor(device.status)}>
              {device.status}
            </TableCell>
            <TableCell>{formatValue(device.humidity, "%")}</TableCell>
            <TableCell>{formatValue(device.temperature, "°C")}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
