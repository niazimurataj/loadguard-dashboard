import type { DecodedSensorData } from "./decode-sensor-data";

/**
 * Raw item shape returned from DynamoDB MonarchData table.
 * The `raw_message` field contains Base64URL-encoded, zlib-compressed binary sensor data.
 */
export interface DynamoDBDeviceItem {
  device_id: string;
  timestamp: number;
  raw_message?: string; // Base64URL-encoded compressed binary from ESP32
  // Legacy fields (may exist in older records before binary encoding)
  status?: string;
  humidity?: number;
  temperature?: number;
}

/**
 * Processed device data ready for display.
 * Combines DynamoDB metadata with decoded sensor readings.
 */
export interface DeviceData {
  deviceId: string;
  timestamp: number;
  logIndex: number | null;
  status: "online" | "offline" | "unknown";
  humidity: number | null;
  temperature: number | null;
  // Full decoded sensor data if raw_message was present and valid
  sensors: DecodedSensorData | null;
}
