import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { BarChart, LineChart, PieChart, Download, Calendar, Filter } from "lucide-react"

export default function TechnicianAnalytics() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-bold">Equipment Analytics</h1>
        <div className="flex items-center mt-4 md:mt-0 space-x-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" /> Date Range
          </Button>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export Report
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Equipment Uptime</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.3%</div>
            <p className="text-xs text-muted-foreground">+2.5% from last month</p>
            <div className="mt-4 h-[80px]">
              <svg className="w-full h-full" viewBox="0 0 100 20">
                <rect x="0" y="10" width="10" height="10" fill="#4CAF50" />
                <rect x="12" y="5" width="10" height="15" fill="#4CAF50" />
                <rect x="24" y="8" width="10" height="12" fill="#4CAF50" />
                <rect x="36" y="4" width="10" height="16" fill="#4CAF50" />
                <rect x="48" y="2" width="10" height="18" fill="#4CAF50" />
                <rect x="60" y="6" width="10" height="14" fill="#4CAF50" />
                <rect x="72" y="3" width="10" height="17" fill="#4CAF50" />
                <rect x="84" y="1" width="10" height="19" fill="#4CAF50" />
              </svg>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Maintenance Efficiency</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87.2%</div>
            <p className="text-xs text-muted-foreground">+1.8% from last month</p>
            <div className="mt-4 h-[80px]">
              <svg className="w-full h-full" viewBox="0 0 100 20">
                <polyline
                  points="0,15 12,10 24,12 36,8 48,6 60,9 72,5 84,3 96,7"
                  fill="none"
                  stroke="#007BFF"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Defect Resolution Time</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18.5 hrs</div>
            <p className="text-xs text-muted-foreground">-3.2 hrs from last month</p>
            <div className="mt-4 h-[80px] flex justify-center">
              <svg className="h-full" viewBox="0 0 42 42" width="80">
                <circle cx="21" cy="21" r="15" fill="none" stroke="#e9ecef" strokeWidth="3" />
                <circle
                  cx="21"
                  cy="21"
                  r="15"
                  fill="none"
                  stroke="#007BFF"
                  strokeWidth="3"
                  strokeDasharray="75 25"
                  strokeDashoffset="0"
                />
              </svg>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Equipment Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <svg className="w-full h-full" viewBox="0 0 100 50">
                <rect x="5" y="30" width="10" height="20" fill="#4CAF50" />
                <rect x="20" y="20" width="10" height="30" fill="#4CAF50" />
                <rect x="35" y="15" width="10" height="35" fill="#4CAF50" />
                <rect x="50" y="10" width="10" height="40" fill="#4CAF50" />
                <rect x="65" y="5" width="10" height="45" fill="#4CAF50" />
                <rect x="80" y="15" width="10" height="35" fill="#4CAF50" />

                <text x="10" y="55" fontSize="3" textAnchor="middle">
                  EQ-001
                </text>
                <text x="25" y="55" fontSize="3" textAnchor="middle">
                  EQ-002
                </text>
                <text x="40" y="55" fontSize="3" textAnchor="middle">
                  EQ-003
                </text>
                <text x="55" y="55" fontSize="3" textAnchor="middle">
                  EQ-004
                </text>
                <text x="70" y="55" fontSize="3" textAnchor="middle">
                  EQ-005
                </text>
                <text x="85" y="55" fontSize="3" textAnchor="middle">
                  EQ-007
                </text>

                <line x1="0" y1="50" x2="100" y2="50" stroke="#e9ecef" strokeWidth="0.5" />
              </svg>
            </div>
            <div className="flex justify-center mt-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-[#4CAF50] mr-1"></div>
                <span className="text-xs">Performance Score</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Maintenance Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex justify-center items-center">
              <svg height="160" width="160" viewBox="0 0 42 42">
                <circle cx="21" cy="21" r="15" fill="none" stroke="#e9ecef" strokeWidth="3" />
                <circle
                  cx="21"
                  cy="21"
                  r="15"
                  fill="none"
                  stroke="#007BFF"
                  strokeWidth="3"
                  strokeDasharray="60 40"
                  strokeDashoffset="25"
                />
                <circle
                  cx="21"
                  cy="21"
                  r="15"
                  fill="none"
                  stroke="#FFC107"
                  strokeWidth="3"
                  strokeDasharray="25 75"
                  strokeDashoffset="-35"
                />
                <circle
                  cx="21"
                  cy="21"
                  r="15"
                  fill="none"
                  stroke="#DC3545"
                  strokeWidth="3"
                  strokeDasharray="15 85"
                  strokeDashoffset="-10"
                />
              </svg>
            </div>
            <div className="flex justify-center space-x-4 mt-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-[#007BFF] mr-1"></div>
                <span className="text-xs">Preventive (60%)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-[#FFC107] mr-1"></div>
                <span className="text-xs">Corrective (25%)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-[#DC3545] mr-1"></div>
                <span className="text-xs">Emergency (15%)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Equipment Maintenance History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipment ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Total Maintenance</TableHead>
                <TableHead>Avg. Downtime</TableHead>
                <TableHead>Defects</TableHead>
                <TableHead>Reliability Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">EQ-001</TableCell>
                <TableCell>Tablet Press Machine</TableCell>
                <TableCell>12</TableCell>
                <TableCell>4.2 hrs</TableCell>
                <TableCell>1</TableCell>
                <TableCell>
                  <Badge className="bg-green-500">95%</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">EQ-002</TableCell>
                <TableCell>Capsule Filling Machine</TableCell>
                <TableCell>8</TableCell>
                <TableCell>6.5 hrs</TableCell>
                <TableCell>3</TableCell>
                <TableCell>
                  <Badge className="bg-yellow-500">82%</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">EQ-003</TableCell>
                <TableCell>Blister Packaging Machine</TableCell>
                <TableCell>10</TableCell>
                <TableCell>3.8 hrs</TableCell>
                <TableCell>0</TableCell>
                <TableCell>
                  <Badge className="bg-green-500">97%</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">EQ-004</TableCell>
                <TableCell>Liquid Filling Machine</TableCell>
                <TableCell>15</TableCell>
                <TableCell>8.2 hrs</TableCell>
                <TableCell>5</TableCell>
                <TableCell>
                  <Badge className="bg-red-500">76%</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">EQ-005</TableCell>
                <TableCell>Quality Control Analyzer</TableCell>
                <TableCell>6</TableCell>
                <TableCell>2.1 hrs</TableCell>
                <TableCell>1</TableCell>
                <TableCell>
                  <Badge className="bg-green-500">98%</Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
