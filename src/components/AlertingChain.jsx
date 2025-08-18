import React from 'react';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const AlertingChain = () => {
  // Placeholder data
  const contacts = [
    { id: 1, name: 'Niazi M', email: 'niazi@loadguard.io', phone: '201-657-9820' },
    { id: 2, name: 'Akshay H', email: 'akshay@loadguard.io', phone: '551-470-8796' },
  ];

  const handleBlockedFeatureClick = (event) => {
    if (event && event.preventDefault) {
      event.preventDefault();
    }
    toast("This feature is blocked right now! Check back later");
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Alerting Chain</CardTitle>
          <CardDescription>
            Manage the contacts that will be notified in case of an alert.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>{contact.name}</TableCell>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell>{contact.phone}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={handleBlockedFeatureClick}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={handleBlockedFeatureClick}>Alert</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add a new contact</CardTitle>
          <CardDescription>
            The new contact will be added to the alerting chain.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleBlockedFeatureClick}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Enter contact's name" />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter contact's email" />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="Enter contact's phone number" />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button type="submit">Add Contact</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AlertingChain;