import { Outlet } from "react-router-dom"
import { NavigationSidebar } from "../components/navigation-sidebar"
import { Home, Calendar, AlertCircle, BadgeInfo, History } from "lucide-react"

export default function PatientLayout() {
  const sidebarItems = [
    {
      title: "Verify",
      href: "/patient",
      icon: Home,
    },
    {
      title: "History",
      href: "/patient/history",
      icon: History,
    },
    {
      title: "Reminders",
      href: "/patient/reminders",
      icon: Calendar,
    },
    {
      title: "Report",
      href: "/patient/report",
      icon: AlertCircle,
    },
    {
      title: "Info",
      href: "/patient/info",
      icon: BadgeInfo,
    },
  ]

  return (
    <div className="flex">
      <NavigationSidebar title="Patient Portal" items={sidebarItems} />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  )
}
