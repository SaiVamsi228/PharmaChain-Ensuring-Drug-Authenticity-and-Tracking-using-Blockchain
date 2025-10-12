import type React from "react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "../lib/utils"
import { Button } from "./ui/button"
import type { LucideIcon } from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  items: {
    href: string
    title: string
    icon: LucideIcon
  }[]
}

export function NavigationSidebar({ className, title, items }: SidebarProps) {
  const location = useLocation()
  const pathname = location.pathname

  return (
    <div className={cn("pb-12 border-r min-h-screen w-[15rem]", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <Link to="/" className="flex items-center mb-8">
            <h2 className="text-xl font-bold">{title}</h2>
          </Link>
          <div className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} to={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn("w-full justify-start", isActive ? "bg-[#007BFF] text-white" : "")}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.title}
                  </Button>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
