import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

import Dashboard from "./dashboard/page"
import Devices from "./devices/page"
import Alerts from "./alerts/page"
import Agent from "./agent/page"
import Settings from "./settings/page"

export const iframeHeight = "800px"

export const description = "A sidebar with a header and a search form."

type PageProps = {
  searchParams?: Promise<{ device?: string }>
}

export default async function Page({ searchParams }: PageProps) {
  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <Dashboard searchParams={searchParams} />
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}
