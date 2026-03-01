import MembersMap from "@/components/members-map";
import DeviceTable, { fetchDeviceData } from "@/components/device-table";
import { getDeviceItems } from "@/lib/db";

type PageProps = {
  searchParams?: Promise<{ device?: string }>;
};

export default async function Dashboard({ searchParams }: PageProps = {}) {
  const params = searchParams ? await searchParams : {};
  const deviceId = params?.device ?? null;

  const allItems = await getDeviceItems(300);
  const deviceIds = [...new Set(allItems.map((i) => i.device_id))].filter(Boolean).sort();

  let devices = null;
  if (deviceId) {
    devices = await fetchDeviceData(deviceId);
  }

  const markers =
    devices
      ?.filter((d) => d.latitude != null && d.longitude != null)
      .map((d, i) => ({
        name: `${d.deviceId}-${d.timestamp}-${i}`,
        position: { lat: d.latitude as number, lng: d.longitude as number },
      })) ?? [];

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <h1 className="text-xl font-semibold">Observability Command</h1>

      <div className="flex flex-1 flex-row gap-4 min-h-0">
        {/* Map Panel - shows selected device locations when device has lat/long */}
        <div className="bg-muted/50 h-[400px] flex-1 rounded-xl overflow-hidden">
          <MembersMap markers={markers} routes={[]} />
        </div>

        {/* Device Table Panel - only shows data for selected device */}
        <div className="bg-muted/50 h-[400px] flex-1 rounded-xl overflow-hidden">
          <DeviceTable
            className="h-full"
            deviceId={deviceId}
            deviceIds={deviceIds}
            devices={devices}
          />
        </div>
      </div>
    </div>
  );
}
