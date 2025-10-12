"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { CheckCircle, AlertTriangle, Clock } from "lucide-react"

export default function EquipmentManagement() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Equipment Monitoring</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Equipment Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipment ID</TableHead>
                <TableHead>Last Service</TableHead>
                <TableHead>Next Due</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">EQP-789</TableCell>
                <TableCell>07/01/2024</TableCell>
                <TableCell>10/01/2024</TableCell>
                <TableCell>
                  <Badge className="bg-green-500">
                    <CheckCircle className="mr-1 h-3 w-3" /> Operational
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">EQP-790</TableCell>
                <TableCell>06/15/2024</TableCell>
                <TableCell>09/15/2024</TableCell>
                <TableCell>
                  <Badge className="bg-yellow-500">
                    <Clock className="mr-1 h-3 w-3" /> Needs Maintenance
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">
                    Schedule Service
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">EQP-791</TableCell>
                <TableCell>05/30/2024</TableCell>
                <TableCell>08/30/2024</TableCell>
                <TableCell>
                  <Badge className="bg-red-500">
                    <AlertTriangle className="mr-1 h-3 w-3" /> Needs Immediate Service
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">
                    Request Urgent Service
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">EQP-792</TableCell>
                <TableCell>08/05/2024</TableCell>
                <TableCell>11/05/2024</TableCell>
                <TableCell>
                  <Badge className="bg-green-500">
                    <CheckCircle className="mr-1 h-3 w-3" /> Operational
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg flex items-start">
                <div className="p-2 bg-yellow-100 rounded-full mr-3">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-medium">EQP-790 Maintenance Due</h3>
                  <p className="text-sm text-muted-foreground">Schedule service by 09/15/2024</p>
                  <Button className="mt-2" size="sm">
                    Schedule Now
                  </Button>
                </div>
              </div>

              <div className="p-4 border rounded-lg flex items-start">
                <div className="p-2 bg-red-100 rounded-full mr-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-medium">EQP-791 Critical Alert</h3>
                  <p className="text-sm text-muted-foreground">Urgent: Service overdue by 25 days</p>
                  <Button className="mt-2 bg-red-500 hover:bg-red-600" size="sm">
                    Request Urgent Service
                  </Button>
                </div>
              </div>

              <div className="p-4 border rounded-lg flex items-start">
                <div className="p-2 bg-green-100 rounded-full mr-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">EQP-789 Certification Valid</h3>
                  <p className="text-sm text-muted-foreground">Next certification due in 62 days</p>
                  <Button className="mt-2" variant="outline" size="sm">
                    View Certificate
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Equipment Production</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">EQP-789</span>
                  <span className="text-sm font-medium">50%</span>
                </div>
                <div className="w-full bg-blue-100 rounded-full h-4">
                  <div className="bg-blue-500 h-4 rounded-full" style={{ width: "50%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">EQP-790</span>
                  <span className="text-sm font-medium">30%</span>
                </div>
                <div className="w-full bg-blue-100 rounded-full h-4">
                  <div className="bg-blue-500 h-4 rounded-full" style={{ width: "30%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">EQP-792</span>
                  <span className="text-sm font-medium">15%</span>
                </div>
                <div className="w-full bg-blue-100 rounded-full h-4">
                  <div className="bg-blue-500 h-4 rounded-full" style={{ width: "15%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">EQP-791</span>
                  <span className="text-sm font-medium">5%</span>
                </div>
                <div className="w-full bg-blue-100 rounded-full h-4">
                  <div className="bg-blue-500 h-4 rounded-full" style={{ width: "5%" }}></div>
                </div>
              </div>

              <div className="text-sm text-muted-foreground mt-4">
                Production volume by equipment for the last 30 days
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

