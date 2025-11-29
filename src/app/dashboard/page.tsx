
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"


export default async function Dashboard() {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 col-2">
                <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" > 
                    <Table>
                        <TableCaption>This is the end of your devices.</TableCaption>
                        <TableHeader>
                            <TableRow>
                            <TableHead className="w-[100px]">Device ID</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Humdity</TableHead>
                            <TableHead className="text-right">Temperature</TableHead>
                            <TableHead>Access</TableHead>
                            <TableHead>Ethylene</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* Fetch data from your API on the server */}
                            {/* This assumes Dashboard is declared as: `export default async function Dashboard()` */}

                            {(
                                await fetch("http://localhost:3000/api", {
                                method: "GET",
                                // prevent caching in dev so you always see fresh data
                                cache: "no-store",
                                }).then((res) => res.json())
                            ).items?.map((item: any) => (
                                <TableRow key={`${item.device_id}#${item.timestamp}`}>
                                <TableCell className="font-medium">
                                    {item.device_id ?? "unknown"}
                                </TableCell>
                                <TableCell>{item.status ?? "n/a"}</TableCell>
                                <TableCell>{item.humidity ?? "n/a"}</TableCell>
                                <TableCell className="text-right">
                                    {item.temperature ?? "n/a"}
                                </TableCell>
                                <TableCell>{item.access ?? "n/a"}</TableCell>
                                <TableCell>{item.ethylene ?? "n/a"}</TableCell>
                                </TableRow>
                            ))}
                            </TableBody>

                    </Table>
              </div>
              <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
        </div> 
    );
}

