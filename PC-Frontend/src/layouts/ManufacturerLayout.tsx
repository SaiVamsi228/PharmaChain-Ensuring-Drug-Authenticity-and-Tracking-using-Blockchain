import { Outlet } from "react-router-dom"
import { NavigationSidebar } from "../components/navigation-sidebar"
import { BarChart, Box, FileWarning, HardDrive, Home,AlertTriangle } from "lucide-react"

export default function ManufacturerLayout() {
  const sidebarItems = [
    {
      title: "Dashboard",
      href: "/manufacturer",
      icon: Home,
    },
    {
      title: "Batch Management",
      href: "/manufacturer/batch",
      icon: Box,
    },
    {
      title: "Equipment",
      href: "/manufacturer/equipment",
      icon: HardDrive,
    },
    {
      title: "Recalls",
      href: "/manufacturer/recalls",
      icon: FileWarning,
    },
    {
      title: "Affected Batches",
      href: "/manufacturer/affected-batches",
      icon: AlertTriangle,
    },
    {
      title: "Analytics",
      href: "/manufacturer/analytics",
      icon: BarChart,
    },
  ]

  return (
    <div className="flex">
      <NavigationSidebar title="Manufacturer Portal" items={sidebarItems} />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  )
}
