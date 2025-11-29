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
  // TODO 
  // fetch from API later
];

export default function Home() {
  
  const navLinks = [
    { title: 'Dashboard', href: '/', variant: 'default' },
    { title: 'Devices', href: '/devices', variant: 'ghost' },
    { title: 'Agent', href: '/agent', variant: 'ghost' },
    { title: 'Settings', href: '/settings', variant: 'ghost' },
    { title: 'Alerts', href: '/alerts', variant: 'ghost' },
  ] as const;

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
