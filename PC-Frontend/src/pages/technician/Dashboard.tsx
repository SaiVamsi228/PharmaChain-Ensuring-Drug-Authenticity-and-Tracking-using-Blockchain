import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert"
import { Progress } from "../../components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { CheckCircle, AlertTriangle, Clock, WrenchIcon, Gauge, HardDrive } from "lucide-react"

interface StatusCardProps {
  title: string
  value: string
  total: string
  icon: React.ReactNode
  color: string
}

function StatusCard({ title, value, total, icon, color }: StatusCardProps) {
  const percentage = (Number.parseInt(value) / Number.parseInt(total)) * 100

  return (
    <Card className={`${color} border fadeIn`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium">{title}</p>
          {icon}
        </div>
        <div className="flex items-baseline space-x-2">
          <h3 className="text-3xl font-bold">{value}</h3>
          <p className="text-sm text-muted-foreground">of {total}</p>
        </div>
        <Progress value={percentage} className="h-1 mt-3" />
      </CardContent>
    </Card>
  )
}

interface ActivityItemProps {
  date?: string
  title?: string
  description?: string
  icon: React.ReactNode
}

function ActivityItem({ date, title, description, icon }: ActivityItemProps) {
  return (
    <li className="flex items-start">
      <div className="mr-4 mt-1">{icon}</div>
      <div className="flex-1">
        {title && date && (
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">{title}</h4>
            <span className="text-xs text-muted-foreground">{date}</span>
          </div>
        )}
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
    </li>
  )
}

export default function TechnicianDashboard() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Technician Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatusCard
          title="Equipment Operational"
          value="10"
          total="12"
          icon={<CheckCircle className="h-5 w-5 text-green-500" />}
          color="border-green-200 bg-green-50"
        />
        <StatusCard
          title="Pending Maintenance"
          value="3"
          total="12"
          icon={<WrenchIcon className="h-5 w-5 text-amber-500" />}
          color="border-amber-200 bg-amber-50"
        />
        <StatusCard
          title="Calibrations Due"
          value="2"
          total="12"
          icon={<Gauge className="h-5 w-5 text-blue-500" />}
          color="border-blue-200 bg-blue-50"
        />
        <StatusCard
          title="Active Defects"
          value="1"
          total="12"
          icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
          color="border-red-200 bg-red-50"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipment ID</TableHead>
                  <TableHead>Last Service</TableHead>
                  <TableHead>Next Due</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">EQP-789</TableCell>
                  <TableCell>07/01/2024</TableCell>
                  <TableCell>10/01/2024</TableCell>
                  <TableCell>
                    <Badge className="bg-green-500">
                      <CheckCircle className="mr-1 h-3 w-3" /> On Track
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">EQP-790</TableCell>
                  <TableCell>06/15/2024</TableCell>
                  <TableCell>09/15/2024</TableCell>
                  <TableCell>
                    <Badge className="bg-red-500">
                      <AlertTriangle className="mr-1 h-3 w-3" /> Overdue
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">EQP-791</TableCell>
                  <TableCell>05/30/2024</TableCell>
                  <TableCell>08/30/2024</TableCell>
                  <TableCell>
                    <Badge className="bg-amber-500">
                      <Clock className="mr-1 h-3 w-3" /> Due Soon
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Calibration Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-amber-50 border-amber-200">
              <Clock className="h-4 w-4 text-amber-600" />
              <AlertTitle>EQP-789 - Calibration Due</AlertTitle>
              <AlertDescription>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Due by 09/30/2024</span>
                  <span>8 days remaining</span>
                </div>
                <Button size="sm" className="mt-2 bg-[#007BFF] hover:bg-blue-600">
                  Schedule Now
                </Button>
              </AlertDescription>
            </Alert>

            <Alert className="bg-red-50 border-red-200">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertTitle>EQP-790 - Calibration Overdue</AlertTitle>
              <AlertDescription>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Due by 08/20/2024</span>
                  <span>3 days overdue</span>
                </div>
                <Button size="sm" className="mt-2 bg-[#DC3545] hover:bg-red-600">
                  Urgent Calibration
                </Button>
              </AlertDescription>
            </Alert>

            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle>EQP-792 - Calibration Completed</AlertTitle>
              <AlertDescription>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Completed on 08/15/2024</span>
                  <span>Next due: 11/15/2024</span>
                </div>
                <Button size="sm" variant="outline" className="mt-2">
                  View Certificate
                </Button>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            <ActivityItem
              date="08/20/2024"
              title="Maintenance Completed"
              description="EQP-792 routine maintenance performed"
              icon={<WrenchIcon className="h-4 w-4 text-green-500" />}
            />
            <ActivityItem
              date="08/19/2024"
              title="New Equipment Registered"
              description="EQP-791 (Mixer) added to registry"
              icon={<HardDrive className="h-4 w-4 text-blue-500" />}
            />
            <ActivityItem
              date="08/18/2024"
              title="Defect Reported"
              description="EQP-790 reported overheating issues"
              icon={<AlertTriangle className="h-4 w-4 text-red-500" />}
            />
            <ActivityItem icon={<AlertTriangle className="h-4 w-4 text-red-500" />} />
            <ActivityItem
              date="08/17/2024"
              title="Calibration Performed"
              description="EQP-792 calibrated to manufacturer standards"
              icon={<Gauge className="h-4 w-4 text-blue-500" />}
            />
            <ActivityItem
              date="08/16/2024"
              title="Certification Issued"
              description="EQP-789 certification renewed for 90 days"
              icon={<CheckCircle className="h-4 w-4 text-green-500" />}
            />
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
