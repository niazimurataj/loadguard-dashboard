"use client";

import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DeviceData } from "@/lib/types";

type SortKey = "deviceId" | "timestamp" | "latitude" | "longitude" | "humidity" | "temperature";
type SortDir = "asc" | "desc";

function formatValue(
  value: number | null | undefined,
  unit: string,
  decimals = 1
): string {
  if (value === null || value === undefined || isNaN(value)) return "—";
  return `${value.toFixed(decimals)}${unit}`;
}

function formatTimestamp(ts: number): string {
  if (!ts) return "—";
  const date = new Date(ts);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatLatLong(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return "—";
  return value.toFixed(4);
}

function formatResolution(
  rangeM: number | null | undefined,
  source: string | null | undefined
): string {
  const parts: string[] = [];
  if (rangeM != null && !isNaN(rangeM)) parts.push(`±${rangeM} m`);
  if (source) parts.push(source);
  return parts.length ? parts.join(" · ") : "—";
}

function sortNumeric(
  a: number | null | undefined,
  b: number | null | undefined,
  dir: SortDir
): number {
  const an = a ?? Infinity;
  const bn = b ?? Infinity;
  if (an === bn) return 0;
  return dir === "asc" ? (an < bn ? -1 : 1) : an > bn ? -1 : 1;
}

interface SortableDeviceTableProps {
  devices: DeviceData[];
}

export function SortableDeviceTable({ devices }: SortableDeviceTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("timestamp");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sortedDevices = useMemo(() => {
    const arr = [...devices];
    arr.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "deviceId":
          cmp = (a.deviceId ?? "").localeCompare(b.deviceId ?? "");
          return sortDir === "asc" ? cmp : -cmp;
        case "timestamp":
          cmp = a.timestamp - b.timestamp;
          return sortDir === "asc" ? cmp : -cmp;
        case "latitude":
          return sortNumeric(a.latitude, b.latitude, sortDir);
        case "longitude":
          return sortNumeric(a.longitude, b.longitude, sortDir);
        case "humidity":
          return sortNumeric(a.humidity, b.humidity, sortDir);
        case "temperature":
          return sortNumeric(a.temperature, b.temperature, sortDir);
      }
      return 0;
    });
    return arr;
  }, [devices, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "timestamp" ? "desc" : "asc");
    }
  }

  const SortHeader = ({
    colKey,
    children,
    className,
  }: {
    colKey: SortKey;
    children: React.ReactNode;
    className?: string;
  }) => (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => handleSort(colKey)}
        className="w-full text-left inline-flex items-center gap-1 cursor-pointer select-none hover:bg-muted/50 rounded px-1 -mx-1 py-1.5 font-medium"
      >
        {children}
        {sortKey === colKey && (
          <span className="text-muted-foreground" aria-hidden>
            {sortDir === "asc" ? " ↑" : " ↓"}
          </span>
        )}
      </button>
    </TableHead>
  );

  return (
    <Table>
      <TableCaption>End of device list. Click column headers to sort.</TableCaption>
      <TableHeader>
        <TableRow>
          <SortHeader colKey="deviceId" className="w-[100px]">
            Device ID
          </SortHeader>
          <SortHeader colKey="timestamp">Timestamp</SortHeader>
          <SortHeader colKey="latitude">Lat</SortHeader>
          <SortHeader colKey="longitude">Long</SortHeader>
          <TableHead className="w-[120px]">Resolution</TableHead>
          <SortHeader colKey="humidity">Hum</SortHeader>
          <SortHeader colKey="temperature">Temp</SortHeader>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedDevices.map((device) => (
          <TableRow key={`${device.deviceId}#${device.timestamp}`}>
            <TableCell
              className="font-mono text-xs max-w-[100px] truncate"
              title={device.deviceId}
            >
              {device.deviceId.replace("monarch_", "").slice(-6)}
            </TableCell>
            <TableCell className="text-xs text-muted-foreground">
              {formatTimestamp(device.timestamp)}
            </TableCell>
            <TableCell className="text-xs font-mono">
              {formatLatLong(device.latitude)}
            </TableCell>
            <TableCell className="text-xs font-mono">
              {formatLatLong(device.longitude)}
            </TableCell>
            <TableCell className="text-xs text-muted-foreground">
              {formatResolution(device.locationRangeM, device.locationSource)}
            </TableCell>
            <TableCell>{formatValue(device.humidity, "%")}</TableCell>
            <TableCell>{formatValue(device.temperature, "°C")}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
