import type React from "react"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Progress } from "../../components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { BarChart, Package, ShieldAlert, Stethoscope, AlertTriangle, Calendar, Users, QrCode } from "lucide-react"

interface StatusCardProps {
  title: string
  value: string
  icon: React.ReactNode
  color: string
}

function StatusCard({ title, value, icon, color }: StatusCardProps) {
  return (
    <Card className={`${color} border fadeIn`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium">{title}</p>
          {icon}
        </div>
        <h3 className="text-3xl font-bold">{value}</h3>
      </CardContent>
    </Card>
  )
}

export default function PharmacistDashboard() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Pharmacist Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatusCard
          title="Total Medications"
          value="24"
          icon={<Package className="h-5 w-5 text-[#007BFF]" />}
          color="border-blue-200 bg-blue-50"
        />
        <StatusCard
          title="Active Prescriptions"
          value="42"
          icon={<Stethoscope className="h-5 w-5 text-[#28A745]" />}
          color="border-green-200 bg-green-50"
        />
        <StatusCard
          title="Recalled Products"
          value="2"
          icon={<ShieldAlert className="h-5 w-5 text-[#DC3545]" />}
          color="border-red-200 bg-red-50"
        />
        <StatusCard
          title="Dispensing Rate"
          value="50/hr"
          icon={<BarChart className="h-5 w-5 text-[#6c757d]" />}
          color="border-gray-200 bg-gray-50"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Inventory Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch ID</TableHead>
                  <TableHead>Medication</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">PA-2024</TableCell>
                  <TableCell>Paracetamol</TableCell>
                  <TableCell>1500</TableCell>
                  <TableCell>12/31/2025</TableCell>
                  <TableCell>
                    <Badge className="bg-green-500">Active</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">IB-2024</TableCell>
                  <TableCell>Ibuprofen</TableCell>
                  <TableCell>500</TableCell>
                  <TableCell>11/30/2024</TableCell>
                  <TableCell>
                    <Badge className="bg-red-500">Recalled</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">AM-2024</TableCell>
                  <TableCell>Amoxicillin</TableCell>
                  <TableCell>750</TableCell>
                  <TableCell>10/15/2025</TableCell>
                  <TableCell>
                    <Badge className="bg-green-500">Active</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">AS-2024</TableCell>
                  <TableCell>Aspirin</TableCell>
                  <TableCell>1200</TableCell>
                  <TableCell>08/20/2025</TableCell>
                  <TableCell>
                    <Badge className="bg-yellow-500">Low Stock</Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recall Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Urgent Recall: IB-2024</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Ibuprofen batch IB-2024 has been recalled due to potential contamination. Please remove from
                      shelves immediately.
                    </p>
                    <div className="mt-2">
                      <div className="flex justify-between mb-1 text-sm">
                        <span>Recovery progress:</span>
                        <span>500 units affected</span>
                      </div>
                      <Progress value={0} className="h-2 bg-red-100" />
                    </div>
                    <Button className="mt-3 bg-red-500 hover:bg-red-600">Generate Return Labels</Button>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-medium">Recent Recalls</h3>
                <ul className="mt-2 space-y-2">
                  <li className="text-sm flex items-center justify-between">
                    <span>PA-2023 (Paracetamol)</span>
                    <Badge className="bg-green-500">Completed</Badge>
                  </li>
                  <li className="text-sm flex items-center justify-between">
                    <span>DZ-2023 (Diazepam)</span>
                    <Badge className="bg-yellow-500">In Progress</Badge>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Dispensing Interface</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center justify-center mb-3">
                  <div className="p-3 rounded-full bg-blue-100">
                    <QrCode className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="text-center mb-4">
                  <h3 className="text-sm font-medium">Scan Medication Batch</h3>
                  <p className="text-xs text-muted-foreground">Place QR code in the center of the camera</p>
                </div>
                <div className="p-3 bg-green-100 border border-green-200 rounded text-center">
                  <div className="flex items-center justify-center">
                    <span className="font-medium text-green-700 mr-1">IB-2024 Verified</span>
                    <span className="text-green-700">✅</span>
                  </div>
                </div>
              </div>

              <div className="grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Patient ID</label>
                    <input
                      type="text"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 mt-1"
                      defaultValue="P123"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Quantity</label>
                    <input
                      type="number"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 mt-1"
                      defaultValue="10"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Prescription</label>
                  <div className="flex items-center mt-1">
                    <Button variant="outline" className="w-full">
                      <Calendar className="mr-2 h-4 w-4" /> Upload Prescription
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Prescription uploaded: rx-p123-08202024.pdf</p>
                </div>

                <Button className="bg-[#007BFF] hover:bg-blue-600 mt-2">
                  <Stethoscope className="mr-2 h-4 w-4" /> Confirm Dispensing
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Patient Safety</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button className="h-auto py-6 flex flex-col bg-blue-100 hover:bg-blue-200 text-blue-700">
                  <Users className="h-6 w-6 mb-2" />
                  <span>Interaction Checker</span>
                </Button>
                <Button className="h-auto py-6 flex flex-col bg-green-100 hover:bg-green-200 text-green-700">
                  <Calendar className="h-6 w-6 mb-2" />
                  <span>Schedule Reminder</span>
                </Button>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Today's Patient Alerts</h3>
                <ul className="space-y-2">
                  <li className="text-sm flex items-start">
                    <div className="p-1 rounded-full bg-amber-100 mr-2">
                      <AlertTriangle className="h-3 w-3 text-amber-600" />
                    </div>
                    <span>P123 - Potential interaction with existing medication</span>
                  </li>
                  <li className="text-sm flex items-start">
                    <div className="p-1 rounded-full bg-blue-100 mr-2">
                      <Calendar className="h-3 w-3 text-blue-600" />
                    </div>
                    <span>P145 - Medication refill due today</span>
                  </li>
                  <li className="text-sm flex items-start">
                    <div className="p-1 rounded-full bg-red-100 mr-2">
                      <ShieldAlert className="h-3 w-3 text-red-600" />
                    </div>
                    <span>P162 - Has medication from recalled batch IB-2024</span>
                  </li>
                </ul>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Dispensing Speed</h3>
                <div className="h-[60px]">
                  <svg className="w-full h-full" viewBox="0 0 100 25">
                    <path
                      d="M0,20 Q5,18 10,15 T20,10 T30,15 T40,18 T50,10 T60,5 T70,15 T80,20 T90,18 T100,15"
                      fill="none"
                      stroke="#007BFF"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <div className="text-xs text-center text-muted-foreground">Average: 50 units/hr</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
