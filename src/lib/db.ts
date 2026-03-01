/**
 * Database access layer for DynamoDB.
 * Used by Server Components to fetch data directly without HTTP overhead.
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

// Singleton client - reused across requests
const client = new DynamoDBClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const ddb = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DDB_TABLE_NAME || "MonarchData";

/** Decoded column payload (DynamoDB unmarshalled: imu, json, env, lte, location). */
export interface DecodedColumnPayload {
  imu?: { lx?: number; ly?: number; lz?: number; [key: string]: unknown };
  json?: { ts?: number; [key: string]: unknown };
  env?: { hum?: number; temp_c?: number; [key: string]: unknown };
  lte?: Record<string, unknown>;
  location?: { lat?: number; lng?: number; [key: string]: unknown };
}

/** Ingest metadata stored by ingest Lambda. */
export interface IngestMeta {
  received_at?: number;
  source?: string;
}

export interface RawDeviceItem {
  device_id: string;
  timestamp: number;
  /** Decoded payload (env, imu, json, lte, location) when stored as a column */
  decoded?: DecodedColumnPayload;
  device_local_ip?: string;
  ingest_meta?: IngestMeta;
  log_index?: number;
  raw_message?: string;
  raw_payload?: string;
  // Legacy
  status?: string;
  humidity?: number;
  temperature?: number;
}

/**
 * Fetches device items directly from DynamoDB.
 * When deviceId is provided, uses Query for that partition (latest first).
 * Otherwise scans with a higher limit so recent items are more likely included.
 */
export async function getDeviceItems(
  limit = 300,
  deviceId?: string
): Promise<RawDeviceItem[]> {
  if (deviceId) {
    const result = await ddb.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "device_id = :id",
        ExpressionAttributeValues: { ":id": deviceId },
        ScanIndexForward: false,
        Limit: Math.min(limit, 100),
      })
    );
    return (result.Items as RawDeviceItem[]) ?? [];
  }

  const result = await ddb.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      Limit: limit,
    })
  );

  return (result.Items as RawDeviceItem[]) ?? [];
}
