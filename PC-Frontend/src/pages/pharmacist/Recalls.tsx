"use client"

import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Badge } from "../../components/ui/badge"
import { Progress } from "../../components/ui/progress"
import { AlertTriangle, ArrowUpRight, CheckCircle, FileText, ShieldAlert } from "lucide-react"

export default function PharmacistRecallsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Recall Management</h1>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Recalls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                <div className="flex items-start">
                  <ShieldAlert className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
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
                    <div className="mt-3 flex gap-2">
                      <Button className="bg-red-500 hover:bg-red-600">
                        <FileText className="mr-2 h-4 w-4" /> Generate Return Labels
                      </Button>
                      <Button variant="outline">
                        <ArrowUpRight className="mr-2 h-4 w-4" /> View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Precautionary Recall: PA-2024</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Paracetamol batch PA-2024 has been recalled for quality control testing.
                    </p>
                    <div className="mt-2">
                      <div className="flex justify-between mb-1 text-sm">
                        <span>Recovery progress:</span>
                        <span>1500 units affected</span>
                      </div>
                      <Progress value={75} className="h-2 bg-yellow-100" />
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button className="bg-yellow-500 hover:bg-yellow-600">
                        <FileText className="mr-2 h-4 w-4" /> Generate Return Labels
                      </Button>
                      <Button variant="outline">
                        <ArrowUpRight className="mr-2 h-4 w-4" /> View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recall History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch ID</TableHead>
                  <TableHead>Medication</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">PA-2023</TableCell>
                  <TableCell>Paracetamol</TableCell>
                  <TableCell>03/15/2024</TableCell>
                  <TableCell>
                    <Badge className="bg-green-500">
                      <CheckCircle className="mr-1 h-3 w-3" /> Completed
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      View Report
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">DZ-2023</TableCell>
                  <TableCell>Diazepam</TableCell>
                  <TableCell>02/28/2024</TableCell>
                  <TableCell>
                    <Badge className="bg-yellow-500">In Progress</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      View Report
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">AM-2023</TableCell>
                  <TableCell>Amoxicillin</TableCell>
                  <TableCell>01/10/2024</TableCell>
                  <TableCell>
                    <Badge className="bg-green-500">
                      <CheckCircle className="mr-1 h-3 w-3" /> Completed
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      View Report
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recall Management Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button className="h-auto py-6 flex flex-col bg-blue-100 hover:bg-blue-200 text-blue-700">
              <FileText className="h-6 w-6 mb-2" />
              <span>Generate Recall Report</span>
            </Button>
            <Button className="h-auto py-6 flex flex-col bg-green-100 hover:bg-green-200 text-green-700">
              <ShieldAlert className="h-6 w-6 mb-2" />
              <span>Initiate New Recall</span>
            </Button>
            <Button className="h-auto py-6 flex flex-col bg-purple-100 hover:bg-purple-200 text-purple-700">
              <CheckCircle className="h-6 w-6 mb-2" />
              <span>Complete Recall</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
