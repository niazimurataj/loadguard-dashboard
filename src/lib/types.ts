import type { DecodedSensorData } from "./decode-sensor-data";

// Re-export RawDeviceItem from db for backwards compatibility
export type { RawDeviceItem as DynamoDBDeviceItem } from "./db";

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
