/**
 * Database access layer for DynamoDB.
 * Used by Server Components to fetch data directly without HTTP overhead.
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

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

export interface RawDeviceItem {
  device_id: string;
  timestamp: number;
  raw_message?: string;
  /** Decoded payload (imu, json, env, lte) when stored as a column */
  decoded?: DecodedColumnPayload;
  // Legacy fields
  status?: string;
  humidity?: number;
  temperature?: number;
}

/**
 * Fetches device items directly from DynamoDB.
 * For use in Server Components - no HTTP overhead.
 */
export async function getDeviceItems(limit = 50): Promise<RawDeviceItem[]> {
  const result = await ddb.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      Limit: limit,
    })
  );

  return (result.Items as RawDeviceItem[]) ?? [];
}
