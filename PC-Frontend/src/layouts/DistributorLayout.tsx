import { Outlet } from "react-router-dom"
import { NavigationSidebar } from "../components/navigation-sidebar"
import { BarChart, Box, Home, Package, Truck,Split   } from "lucide-react"

export default function DistributorLayout() {
  const sidebarItems = [
    {
      title: "Dashboard",
      href: "/distributor",
      icon: Home,
    },
    {
      title: "Shipments",
      href: "/distributor/shipments",
      icon: Package,
    },
    {
      title: "Inventory",
      href: "/distributor/inventory",
      icon: Box,
    },
    {
      title: "Transfers",
      href: "/distributor/transfers",
      icon: Truck,
    },
    {
      title: "Split Batches",
      href: "/distributor/split-batches",
      icon: Split  ,
    },
    {
      title: "Analytics",
      href: "/distributor/analytics",
      icon: BarChart,
    },
  ]

  return (
    <div className="flex">
      <NavigationSidebar title="Distributor Portal" items={sidebarItems} />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  )
}
