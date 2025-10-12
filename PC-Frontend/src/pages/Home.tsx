import type React from "react"
import { Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { ShieldCheck, Truck, Stethoscope, Activity, User } from "lucide-react"

interface RoleCardProps {
  title: string
  description: string
  icon: React.ReactNode
  color: string
  href: string
}

function RoleCard({ title, description, icon, color, href }: RoleCardProps) {
  return (
    <Link to={href}>
      <Card className={`h-full transition-all duration-200 hover:shadow-lg ${color} border-2`}>
        <CardContent className="p-6 flex flex-col items-center text-center">
          <div className="mb-4">{icon}</div>
          <h2 className="text-xl font-bold mb-2 text-[#343A40]">{title}</h2>
          <p className="text-[#6c757d]">{description}</p>
          <Button className="mt-4 bg-[#007BFF] hover:bg-blue-600">Access Dashboard</Button>
        </CardContent>
      </Card>
    </Link>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#343A40] mb-4">Pharmaceutical Blockchain Supply Chain</h1>
          <p className="text-lg text-[#6c757d] max-w-3xl">
            Secure, transparent, and efficient pharmaceutical supply chain management system powered by blockchain
            technology.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <RoleCard
            title="Manufacturer"
            description="Manage drug production, batch creation, and recalls"
            icon={<ShieldCheck className="h-12 w-12 text-[#007BFF]" />}
            color="bg-blue-50 border-blue-200"
            href="/manufacturer"
          />

          <RoleCard
            title="Technician"
            description="Maintain equipment, schedule calibrations, and report defects"
            icon={<Activity className="h-12 w-12 text-[#28A745]" />}
            color="bg-green-50 border-green-200"
            href="/technician"
          />

          <RoleCard
            title="Distributor"
            description="Manage shipments, inventory, and transfer of products"
            icon={<Truck className="h-12 w-12 text-[#FFC107]" />}
            color="bg-yellow-50 border-yellow-200"
            href="/distributor"
          />

          <RoleCard
            title="Pharmacist"
            description="Verify and dispense medications, manage inventory"
            icon={<Stethoscope className="h-12 w-12 text-[#DC3545]" />}
            color="bg-red-50 border-red-200"
            href="/pharmacist"
          />

          <RoleCard
            title="Patient/Customer"
            description="Verify medications and access safety information"
            icon={<User className="h-12 w-12 text-[#6c757d]" />}
            color="bg-gray-50 border-gray-200"
            href="/patient"
          />
        </div>

        <div className="mt-12 text-center">
          <p className="text-[#6c757d] mb-4">
            Ensuring safety and transparency at every step of the pharmaceutical supply chain
          </p>
        </div>
      </div>
    </div>
  )
}
