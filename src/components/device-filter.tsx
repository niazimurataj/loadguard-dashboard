"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface DeviceFilterProps {
  deviceIds: string[];
  currentDeviceId: string | null;
  className?: string;
}

export function DeviceFilter({
  deviceIds,
  currentDeviceId,
  className,
}: DeviceFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (value === "" || value === "all") {
      params.delete("device");
    } else {
      params.set("device", value);
    }
    const q = params.toString();
    router.push(q ? `${pathname}?${q}` : pathname);
  }

  const sortedIds = [...deviceIds].filter(Boolean).sort();

  return (
    <div className={className}>
      <label htmlFor="device-filter" className="sr-only">
        Filter by device
      </label>
      <select
        id="device-filter"
        value={currentDeviceId ?? "all"}
        onChange={(e) => handleChange(e.target.value)}
        className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <option value="all">All devices</option>
        {sortedIds.map((id) => (
          <option key={id} value={id}>
            {id.replace("monarch_", "").slice(-8)}
          </option>
        ))}
      </select>
    </div>
  );
}
