import React, { useState, useEffect } from 'react';
import { toast } from "sonner";
import Chatbot from '../components/Chatbot';
import AlertingChain from '../components/AlertingChain';
import MembersMap from '../components/MembersMap';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const initialMarkers = [
  { name: "Container 1", coordinates: [-75.1652, 39.9526] },
  { name: "Container 2", coordinates: [-122.3321, 47.6062] },
  { name: "Container 3", coordinates: [-79.8899, -2.1710] },
  { name: "Container 4", coordinates: [19.8187, 41.3275] }
];

const routes = [
    { from: "Container 3", to: "Container 4" },
    { from: "Container 3", to: "Container 1" }
];

const googleMapsMarkers = initialMarkers.map(marker => ({
  name: marker.name,
  position: {
    lat: marker.coordinates[1],
    lng: marker.coordinates[0]
  }
}));

const DataTable = () => {
  const initialData = [
    { deviceId: 'LG-001', motion: 'Normal', temperature: 2, humidity: 80, voc: 150, spoilage: 'Low', access: 'No' },
    { deviceId: 'LG-002', motion: 'Vibration Detected', temperature: 3, humidity: 82, voc: 180, spoilage: 'Medium', access: 'Yes' },
    { deviceId: 'LG-003', motion: 'Normal', temperature: 1, humidity: 79, voc: 140, spoilage: 'Low', access: 'No' },
    { deviceId: 'LG-004', motion: 'Normal', temperature: 2.5, humidity: 81, voc: 160, spoilage: 'Low', access: 'No' },
  ];

  const [data, setData] = useState(initialData);

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prevData => 
        prevData.map(row => ({...row, temperature: parseFloat((row.temperature + (Math.random() - 0.5) * 0.1).toFixed(1))}))
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleBlockedFeatureClick = () => {
    toast("This feature is blocked right now! Check back later");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Real-Time Container Status</CardTitle>
        <CardDescription>Live sensor data from your active containers.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Device ID</TableHead>
              <TableHead>Motion</TableHead>
              <TableHead>Temperature</TableHead>
              <TableHead>Humidity</TableHead>
              <TableHead>VOC Index</TableHead>
              <TableHead>Spoilage</TableHead>
              <TableHead>Illegal Access</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.deviceId}</TableCell>
                <TableCell>{row.motion}</TableCell>
                <TableCell>{row.temperature}°C</TableCell>
                <TableCell>{row.humidity}%</TableCell>
                <TableCell>{row.voc}</TableCell>
                <TableCell>{row.spoilage}</TableCell>
                <TableCell>{row.access}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex justify-end mt-4">
          <Button onClick={handleBlockedFeatureClick}>Add device</Button>
        </div>
      </CardContent>
    </Card>
  );
};

const MembersPage = () => {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Members Dashboard</h1>
      <Tabs defaultValue="monitor" className="w-full">
        <TabsList>
          <TabsTrigger value="monitor">Monitor</TabsTrigger>
          <TabsTrigger value="agent">Agent</TabsTrigger>
          <TabsTrigger value="alerting">Alerting Chain</TabsTrigger>
        </TabsList>
        <TabsContent value="monitor" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Container Tracking</CardTitle>
                <CardDescription>Live location of your 4 containers.</CardDescription>
              </CardHeader>
              <CardContent>
                <MembersMap markers={googleMapsMarkers} routes={routes} />
              </CardContent>
            </Card>
            <div className="col-span-4 lg:col-span-3">
              <DataTable />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="agent" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Agent</CardTitle>
              <CardDescription>Chat with our AI to get insights and information.</CardDescription>
            </CardHeader>
            <CardContent>
              <Chatbot />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="alerting" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Alerting Chain</CardTitle>
              <CardDescription>Configure your notification preferences.</CardDescription>
            </CardHeader>
            <CardContent>
              <AlertingChain />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MembersPage;