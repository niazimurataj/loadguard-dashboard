"use client"

import { useState } from 'react';
import Link from 'next/link';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Menu,
  Search,
  Settings,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Data for the table
const devices = [
  {
    invoice: "INV001",
    paymentStatus: "Paid",
    totalAmount: "$250.00",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "INV002",
    paymentStatus: "Pending",
    totalAmount: "$150.00",
    paymentMethod: "PayPal",
  },
  // Add more data as needed
];

export default function Home() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navLinks = [
    {
      title: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      variant: 'default' as 'default' | 'ghost',
    },
    {
      title: 'Users',
      href: '#',
      icon: Users,
      variant: 'ghost' as 'default' | 'ghost',
    },
    {
      title: 'Settings',
      href: '#',
      icon: Settings,
      variant: 'ghost' as 'default' | 'ghost',
    },
  ];

  //stop wasting time with vibe coding
  // just use libraries and components
  return (<>
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r flex flex-col">
        {/* nav */}
      </aside>
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <header className="h-16">  </header>
        <main className="flex-1 overflow-auto">  </main>
      </div>
    </div>

  </>);
}
