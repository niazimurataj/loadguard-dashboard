/**
 * Decodes Base64URL-encoded, zlib-compressed binary sensor data from ESP32 devices.
 *
 * Encoding pipeline on device (int_transmission.c):
 *   1. Pack struct to binary (99 bytes)
 *   2. Zlib compress (miniz)
 *   3. Base64URL encode (uses -_ instead of +/)
 *
 * Binary format (little-endian, 99 bytes uncompressed):
 *   - uint32: logIndex
 *   - uint32: timestamp (seconds since UNIX epoch)
 *   - int16 × 3: yaw, roll, pitch (÷100 for degrees)
 *   - int16 × 3: ax, ay, az (÷1000 for m/s²)
 *   - int16 × 3: gx, gy, gz (÷1000 for rad/s)
 *   - int16 × 3: mx, my, mz (÷10 for µT)
 *   - int16 × 3: lx, ly, lz (÷1000 for m/s²)
 *   - uint16 × 2: lux, white (raw)
 *   - int16 × 2: shtTemp, shtHum (÷100 for °C and %)
 *   - uint16 × 7: mcc, mnc, tac, pci, earfcn, cid, band
 *   - uint8 × 3: paging, bw, ceLevel
 *   - int8 × 4: rsrp, rsrq, rssi, cinr
 *   - char[32]: operatorName
 */

import { inflate } from "pako";

export interface DecodedSensorData {
  // Log metadata
  logIndex: number;
  timestamp: number;

  // IMU orientation (BNO055) - degrees
  yaw: number;
  roll: number;
  pitch: number;

  // IMU acceleration - m/s²
  ax: number;
  ay: number;
  az: number;

  // IMU gyroscope - rad/s
  gx: number;
  gy: number;
  gz: number;

  // IMU magnetometer - µT
  mx: number;
  my: number;
  mz: number;

  // Linear acceleration - m/s²
  lx: number;
  ly: number;
  lz: number;

  // VEML7700 light sensor - raw values
  lux: number;
  white: number;

  // SHT41 temperature & humidity
  shtTemp: number; // °C
  shtHum: number; // %

  // LTE cell info
  mcc: number;
  mnc: number;
  tac: number;
  pci: number;
  earfcn: number;
  cid: number;
  band: number;

  // LTE signal params
  paging: number;
  bw: number;
  ceLevel: number;

  // LTE signal strength (dBm)
  rsrp: number;
  rsrq: number;
  rssi: number;
  cinr: number;

  // Operator name
  operatorName: string;
}

// Expected size after decompression
const EXPECTED_UNCOMPRESSED_SIZE = 99;

/**
 * Converts Base64URL to standard Base64.
 * Base64URL uses -_ instead of +/ to be URL-safe.
 */
function base64UrlToBase64(base64Url: string): string {
  let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

  // Add padding if needed (Base64 strings must be divisible by 4)
  const padding = base64.length % 4;
  if (padding === 2) base64 += "==";
  else if (padding === 3) base64 += "=";

  return base64;
}

/**
 * Decodes a Base64URL-encoded, zlib-compressed binary payload.
 * Returns null if decoding fails.
 */
export function decodeSensorData(
  base64UrlString: string
): DecodedSensorData | null {
  try {
    // Step 1: Convert Base64URL → standard Base64
    const base64String = base64UrlToBase64(base64UrlString);

    // Step 2: Base64 decode → compressed bytes
    const binaryString = atob(base64String);
    const compressedBytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      compressedBytes[i] = binaryString.charCodeAt(i);
    }

    // Step 3: Zlib decompress → raw binary
    let bytes: Uint8Array;
    try {
      bytes = inflate(compressedBytes);
    } catch {
      // Data might not be compressed (older firmware or compression failed)
      // Fall back to using the raw decoded bytes
      console.warn("Decompression failed, trying uncompressed data");
      bytes = compressedBytes;
    }

    if (bytes.length !== EXPECTED_UNCOMPRESSED_SIZE) {
      console.warn(
        `Unexpected binary size: got ${bytes.length}, expected ${EXPECTED_UNCOMPRESSED_SIZE}`
      );
      return null;
    }

    // Step 4: Unpack binary struct
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    let offset = 0;

    // Helper functions for reading little-endian values
    const readUint32 = () => {
      const val = view.getUint32(offset, true);
      offset += 4;
      return val;
    };

    const readInt16 = () => {
      const val = view.getInt16(offset, true);
      offset += 2;
      return val;
    };

    const readUint16 = () => {
      const val = view.getUint16(offset, true);
      offset += 2;
      return val;
    };

    const readUint8 = () => {
      const val = view.getUint8(offset);
      offset += 1;
      return val;
    };

    const readInt8 = () => {
      const val = view.getInt8(offset);
      offset += 1;
      return val;
    };

    const readString = (length: number) => {
      const slice = bytes.slice(offset, offset + length);
      offset += length;
      // Find null terminator
      const nullIndex = slice.indexOf(0);
      const trimmed = nullIndex >= 0 ? slice.slice(0, nullIndex) : slice;
      return new TextDecoder().decode(trimmed);
    };

    // Unpack in exact order from packCombinedDataBinary() in int_transmission.c
    const logIndex = readUint32();
    // Device stores seconds since UNIX epoch in a uint32 (max ~2106).
    // Convert to milliseconds so it's consistent with JS Date / DynamoDB timestamps.
    const timestamp = readUint32() * 1000;

    // IMU data - stored as scaled int16, convert back to float
    const yaw = readInt16() / 100; // degrees
    const roll = readInt16() / 100;
    const pitch = readInt16() / 100;

    const ax = readInt16() / 1000; // m/s²
    const ay = readInt16() / 1000;
    const az = readInt16() / 1000;

    const gx = readInt16() / 1000; // rad/s
    const gy = readInt16() / 1000;
    const gz = readInt16() / 1000;

    const mx = readInt16() / 10; // µT
    const my = readInt16() / 10;
    const mz = readInt16() / 10;

    const lx = readInt16() / 1000; // m/s² (linear accel)
    const ly = readInt16() / 1000;
    const lz = readInt16() / 1000;

    // Light sensor - raw uint16 values
    const lux = readUint16();
    const white = readUint16();

    // Environmental - scaled int16
    const shtTemp = readInt16() / 100; // °C
    const shtHum = readInt16() / 100; // %

    // LTE cell info - uint16 values
    const mcc = readUint16();
    const mnc = readUint16();
    const tac = readUint16();
    const pci = readUint16();
    const earfcn = readUint16();
    const cid = readUint16();
    const band = readUint16();

    // LTE params - uint8
    const paging = readUint8();
    const bw = readUint8();
    const ceLevel = readUint8();

    // LTE signal strength - signed int8
    const rsrp = readInt8();
    const rsrq = readInt8();
    const rssi = readInt8();
    const cinr = readInt8();

    // Operator name - 32-byte null-terminated string
    const operatorName = readString(32);

    return {
      logIndex,
      timestamp,
      yaw,
      roll,
      pitch,
      ax,
      ay,
      az,
      gx,
      gy,
      gz,
      mx,
      my,
      mz,
      lx,
      ly,
      lz,
      lux,
      white,
      shtTemp,
      shtHum,
      mcc,
      mnc,
      tac,
      pci,
      earfcn,
      cid,
      band,
      paging,
      bw,
      ceLevel,
      rsrp,
      rsrq,
      rssi,
      cinr,
      operatorName,
    };
  } catch (error) {
    console.error("Failed to decode sensor data:", error);
    return null;
  }
}
