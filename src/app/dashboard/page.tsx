import MembersMap from "@/components/members-map";
import DeviceTable from "@/components/device-table";

export default async function Dashboard() {
  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <h1 className="text-xl font-semibold">Observability Command</h1>

      <div className="flex flex-1 flex-row gap-4 min-h-0">
        {/* Map Panel - fixed reasonable height */}
        <div className="bg-muted/50 h-[400px] flex-1 rounded-xl overflow-hidden">
          <MembersMap
            markers={[
              { name: "New York", position: { lat: 40.7128, lng: -74.006 } },
            ]}
            routes={[]}
          />
        </div>

        {/* Device Table Panel - scrollable within fixed height */}
        <div className="bg-muted/50 h-[400px] flex-1 rounded-xl overflow-hidden">
          <DeviceTable className="h-full" />
        </div>
      </div>
    </div>
  );
}
