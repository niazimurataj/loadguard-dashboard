// app/components/header.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Header() {
  return (
    <header className="flex items-center justify-between border-b px-6 py-3 bg-background">
      {/* Left: logo */}
      <Link href="/" className="font-semibold tracking-tight">
        LoadGuard
      </Link>

      {/* Middle: nav */}
      <nav className="hidden gap-4 text-sm md:flex">
        <Link href="/devices">Devices</Link>
        <Link href="/alerts">Alerts</Link>
        <Link href="/onboarding">Onboarding</Link>
      </nav>

      {/* Right: actions */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm">
          Docs
        </Button>
        <Avatar className="h-8 w-8">
          <AvatarFallback>NM</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
