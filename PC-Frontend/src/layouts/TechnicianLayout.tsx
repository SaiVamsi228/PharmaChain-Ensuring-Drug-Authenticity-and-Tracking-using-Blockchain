import { Outlet } from "react-router-dom"
import { NavigationSidebar } from "../components/navigation-sidebar"
import { HardDrive, Home, WrenchIcon, BarChart, AlertTriangle } from "lucide-react"

export default function TechnicianLayout() {
  const sidebarItems = [
    {
      title: "Dashboard",
      href: "/technician",
      icon: Home,
    },
    {
      title: "Registry",
      href: "/technician/registry",
      icon: HardDrive,
    },
    {
      title: "Maintenance",
      href: "/technician/maintenance",
      icon: WrenchIcon,
    },
    {
      title: "Defects",
      href: "/technician/defects",
      icon: AlertTriangle,
    },
    {
      title: "Analytics",
      href: "/technician/analytics",
      icon: BarChart,
    },
  ]

  return (
    <div className="flex">
      <NavigationSidebar title="Technician Portal" items={sidebarItems} />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  )
}
