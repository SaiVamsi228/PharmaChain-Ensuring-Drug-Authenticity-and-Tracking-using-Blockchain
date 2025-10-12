import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"
import { AlertTriangle, Search, Filter, Camera, Upload, AlertCircle } from "lucide-react"

export default function DefectsPage() {
  const [defectForm, setDefectForm] = React.useState({ defectId: "", status: "" });

  const handleUpdateDefectStatus = (defectId: string, status: string) => {
    console.log(`Updating defect ${defectId} to status ${status}`);
    // Add logic to update defect status
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Equipment Defects</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Critical Defects</p>
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="text-3xl font-bold">2</h3>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Minor Defects</p>
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            </div>
            <h3 className="text-3xl font-bold">5</h3>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Resolved This Month</p>
              <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                ✓
              </div>
            </div>
            <h3 className="text-3xl font-bold">8</h3>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Defect Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input type="search" placeholder="Search defects..." className="pl-8 bg-white" />
              </div>
              <Button variant="outline" className="flex items-center">
                <Filter className="mr-2 h-4 w-4" /> Filter
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Reported</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">DEF-001</TableCell>
                  <TableCell>Liquid Filling Machine (EQ-004)</TableCell>
                  <TableCell>2024-04-18</TableCell>
                  <TableCell>
                    <Badge className="bg-red-500">Critical</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-red-500 text-red-500">
                      Open
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">DEF-002</TableCell>
                  <TableCell>Labeling Machine (EQ-011)</TableCell>
                  <TableCell>2024-04-19</TableCell>
                  <TableCell>
                    <Badge className="bg-red-500">Critical</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-red-500 text-red-500">
                      Open
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">DEF-003</TableCell>
                  <TableCell>Capsule Filling Machine (EQ-002)</TableCell>
                  <TableCell>2024-04-15</TableCell>
                  <TableCell>
                    <Badge className="bg-yellow-500">Minor</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                      In Progress
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">DEF-004</TableCell>
                  <TableCell>Coating Machine (EQ-007)</TableCell>
                  <TableCell>2024-04-10</TableCell>
                  <TableCell>
                    <Badge className="bg-yellow-500">Minor</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-green-500 text-green-500">
                      Resolved
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Report New Defect</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Equipment ID</label>
                  <Input placeholder="Enter ID" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Severity</label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2">
                    <option>Critical</option>
                    <option>Major</option>
                    <option>Minor</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Defect Description</label>
                <Textarea placeholder="Describe the defect in detail" rows={3} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Impact on Production</label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2">
                  <option>Production Halted</option>
                  <option>Reduced Capacity</option>
                  <option>Minimal Impact</option>
                  <option>No Impact</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="w-full">
                  <Camera className="mr-2 h-4 w-4" /> Take Photo
                </Button>
                <Button variant="outline" className="w-full">
                  <Upload className="mr-2 h-4 w-4" /> Upload Image
                </Button>
              </div>

              <Button className="w-full bg-[#007BFF] hover:bg-blue-600">Submit Defect Report</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Critical Defect Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 border border-red-200 bg-red-50 rounded-lg mb-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
              <div>
                <h3 className="font-medium">Liquid Filling Machine (EQ-004)</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Pressure valve malfunction causing inconsistent fill volumes. Machine has been taken offline to
                  prevent product quality issues.
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs font-medium">Reported by:</p>
                    <p className="text-sm">Michael Brown</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium">Date:</p>
                    <p className="text-sm">2024-04-18</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium">Batch affected:</p>
                    <p className="text-sm">PA-2024-042</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium">Estimated repair time:</p>
                    <p className="text-sm">48 hours</p>
                  </div>
                </div>
                <div className="mt-3 flex space-x-2">
                  <Button size="sm" className="bg-red-600 hover:bg-red-700">
                    Escalate
                  </Button>
                  <Button size="sm" variant="outline">
                    Assign Technician
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
              <div>
                <h3 className="font-medium">Labeling Machine (EQ-011)</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Print head alignment error causing misaligned labels. Quality control has rejected the last batch due
                  to this issue.
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs font-medium">Reported by:</p>
                    <p className="text-sm">Sarah Johnson</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium">Date:</p>
                    <p className="text-sm">2024-04-19</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium">Batch affected:</p>
                    <p className="text-sm">IB-2024-015</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium">Estimated repair time:</p>
                    <p className="text-sm">24 hours</p>
                  </div>
                </div>
                <div className="mt-3 flex space-x-2">
                  <Button size="sm" className="bg-red-600 hover:bg-red-700">
                    Escalate
                  </Button>
                  <Button size="sm" variant="outline">
                    Assign Technician
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Update Defect Status</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdateDefectStatus(defectForm.defectId, defectForm.status);
            }}
          >
            <div className="space-y-2">
              <label className="text-sm font-medium">Defect ID</label>
              <select
                className="w-full p-2 border rounded"
                value={defectForm.defectId}
                onChange={(e) =>
                  setDefectForm({ ...defectForm, defectId: e.target.value })
                }
                required
              >
                <option value="">Select Defect ID</option>
                <option value="DEF-001">DEF-001</option>
                <option value="DEF-002">DEF-002</option>
                <option value="DEF-003">DEF-003</option>
                <option value="DEF-004">DEF-004</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select
                className="w-full p-2 border rounded"
                value={defectForm.status}
                onChange={(e) =>
                  setDefectForm({ ...defectForm, status: e.target.value })
                }
                required
              >
                <option value="">Select Status</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
            <Button className="bg-[#007BFF] hover:bg-blue-600" type="submit">
              Update Status
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
