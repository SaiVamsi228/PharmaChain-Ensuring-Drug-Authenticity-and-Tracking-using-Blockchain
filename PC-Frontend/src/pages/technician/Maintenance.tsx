import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"
import { Calendar, Clock, PenToolIcon as Tool, CheckCircle, AlertCircle, CalendarIcon } from "lucide-react"

export default function MaintenancePage() {
  const [statusForm, setStatusForm] = useState({ equipmentId: "", status: "" });
  const [loading, setLoading] = useState(false);

  const handleUpdateStatus = (equipmentId: string, status: string) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      console.log(`Updated Equipment ID: ${equipmentId}, Status: ${status}`);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Equipment Maintenance</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Scheduled Today</p>
              <Calendar className="h-5 w-5 text-[#007BFF]" />
            </div>
            <h3 className="text-3xl font-bold">3</h3>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Completed</p>
              <CheckCircle className="h-5 w-5 text-[#28A745]" />
            </div>
            <h3 className="text-3xl font-bold">12</h3>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Pending</p>
              <Clock className="h-5 w-5 text-[#FFC107]" />
            </div>
            <h3 className="text-3xl font-bold">5</h3>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Overdue</p>
              <AlertCircle className="h-5 w-5 text-[#DC3545]" />
            </div>
            <h3 className="text-3xl font-bold">2</h3>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Scheduled Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipment ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">EQ-002</TableCell>
                  <TableCell>Capsule Filling Machine</TableCell>
                  <TableCell>Today, 10:00 AM</TableCell>
                  <TableCell>
                    <Badge className="bg-blue-500">Scheduled</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" className="text-blue-600 border-blue-600">
                      Start
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">EQ-007</TableCell>
                  <TableCell>Coating Machine</TableCell>
                  <TableCell>Today, 2:00 PM</TableCell>
                  <TableCell>
                    <Badge className="bg-blue-500">Scheduled</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" className="text-blue-600 border-blue-600">
                      Start
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">EQ-009</TableCell>
                  <TableCell>Granulation Equipment</TableCell>
                  <TableCell>Today, 4:30 PM</TableCell>
                  <TableCell>
                    <Badge className="bg-blue-500">Scheduled</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" className="text-blue-600 border-blue-600">
                      Start
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">EQ-004</TableCell>
                  <TableCell>Liquid Filling Machine</TableCell>
                  <TableCell>2024-04-20</TableCell>
                  <TableCell>
                    <Badge className="bg-red-500">Overdue</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" className="text-red-600 border-red-600">
                      Urgent
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">EQ-011</TableCell>
                  <TableCell>Labeling Machine</TableCell>
                  <TableCell>2024-04-22</TableCell>
                  <TableCell>
                    <Badge className="bg-red-500">Overdue</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" className="text-red-600 border-red-600">
                      Urgent
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Maintenance Form</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Equipment ID</label>
                  <Input placeholder="Enter ID" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Maintenance Type</label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2">
                    <option>Preventive</option>
                    <option>Corrective</option>
                    <option>Predictive</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Scheduled Date</label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input type="date" className="pl-10" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Maintenance Tasks</label>
                <Textarea placeholder="List all maintenance tasks to be performed" rows={3} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Parts Required</label>
                <Textarea placeholder="List any replacement parts needed" rows={2} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Technician Name</label>
                <Input placeholder="Enter Technician Name" />
              </div>

              <div className="flex justify-between">
                <Button variant="outline">Cancel</Button>
                <Button className="bg-[#007BFF] hover:bg-blue-600">
                  <Tool className="mr-2 h-4 w-4" /> Schedule Maintenance
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Maintenance History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipment ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Maintenance Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Technician</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">EQ-001</TableCell>
                <TableCell>Tablet Press Machine</TableCell>
                <TableCell>2024-03-15</TableCell>
                <TableCell>Preventive</TableCell>
                <TableCell>John Smith</TableCell>
                <TableCell>
                  <Badge className="bg-green-500">Completed</Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">EQ-003</TableCell>
                <TableCell>Blister Packaging Machine</TableCell>
                <TableCell>2024-04-05</TableCell>
                <TableCell>Preventive</TableCell>
                <TableCell>Sarah Johnson</TableCell>
                <TableCell>
                  <Badge className="bg-green-500">Completed</Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">EQ-005</TableCell>
                <TableCell>Quality Control Analyzer</TableCell>
                <TableCell>2024-03-28</TableCell>
                <TableCell>Calibration</TableCell>
                <TableCell>Michael Brown</TableCell>
                <TableCell>
                  <Badge className="bg-green-500">Completed</Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button variant="outline" size="sm">
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Update Equipment Status</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            handleUpdateStatus(statusForm.equipmentId, statusForm.status);
          }}>
            <div className="space-y-2">
              <label className="text-sm font-medium">Equipment ID</label>
              <Input
                placeholder="Enter Equipment ID"
                value={statusForm.equipmentId}
                onChange={e => setStatusForm({ ...statusForm, equipmentId: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select
                className="w-full p-2 border rounded"
                value={statusForm.status}
                onChange={e => setStatusForm({ ...statusForm, status: e.target.value })}
                required
              >
                <option value="">Select Status</option>
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <Button className="bg-[#007BFF] hover:bg-blue-600" type="submit" disabled={loading}>
              Update Status
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
