import { Outlet } from "react-router-dom"
import { NavigationSidebar } from "../components/navigation-sidebar"
import { BarChart, Home, Package, ShieldAlert, Stethoscope } from "lucide-react"

export default function PharmacistLayout() {
  const sidebarItems = [
    {
      title: "Dashboard",
      href: "/pharmacist",
      icon: Home,
    },
    {
      title: "Shipments",
      href: "/pharmacist/shipments",
      icon: Package,
    },
    {
      title: "Inventory",
      href: "/pharmacist/inventory",
      icon: Package,
    },
    {
      title: "Dispensing",
      href: "/pharmacist/dispensing",
      icon: Stethoscope,
    },
    {
      title: "Recalls",
      href: "/pharmacist/recalls",
      icon: ShieldAlert,
    },
    {
      title: "Analytics",
      href: "/pharmacist/analytics",
      icon: BarChart,
    },
  ]

  return (
    <div className="flex">
      <NavigationSidebar title="Pharmacist Portal" items={sidebarItems} />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  )
}
