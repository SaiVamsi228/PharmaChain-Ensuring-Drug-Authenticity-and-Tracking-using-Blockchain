"use client"

import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Badge } from "../../components/ui/badge"
import { Progress } from "../../components/ui/progress"
import { ArrowDown, ArrowUp, BarChart, Calendar, Download, Package, Stethoscope, Users } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string
  change: string
  isPositive: boolean
  icon: React.ReactNode
}

function MetricCard({ title, value, change, isPositive, icon }: MetricCardProps) {
  return (
    <Card className="border fadeIn">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium">{title}</p>
          {icon}
        </div>
        <div className="flex items-baseline justify-between">
          <h3 className="text-3xl font-bold">{value}</h3>
          <Badge className={`${isPositive ? 'bg-green-500' : 'bg-red-500'}`}>
            {isPositive ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
            {change}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

export default function PharmacistAnalyticsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Pharmacy Analytics</h1>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" /> Export Report
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <MetricCard
          title="Total Dispensations"
          value="1,234"
          change="+12.5%"
          isPositive={true}
          icon={<Stethoscope className="h-5 w-5 text-[#007BFF]" />}
        />
        <MetricCard
          title="Inventory Value"
          value="$45,678"
          change="-3.2%"
          isPositive={false}
          icon={<Package className="h-5 w-5 text-[#28A745]" />}
        />
        <MetricCard
          title="Patient Satisfaction"
          value="94%"
          change="+2.1%"
          isPositive={true}
          icon={<Users className="h-5 w-5 text-[#6c757d]" />}
        />
        <MetricCard
          title="Prescription Accuracy"
          value="99.8%"
          change="+0.3%"
          isPositive={true}
          icon={<BarChart className="h-5 w-5 text-[#DC3545]" />}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Dispensing Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Monthly Dispensations</h3>
                  <p className="text-sm text-muted-foreground">Last 6 months</p>
                </div>
                <Button variant="outline" size="sm">
                  <Calendar className="mr-2 h-4 w-4" /> View All
                </Button>
              </div>
              <div className="h-[200px] bg-gray-50 rounded-lg flex items-end justify-between p-4">
                {[120, 150, 180, 160, 200, 240].map((height, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className="w-8 bg-blue-500 rounded-t"
                      style={{ height: `${height}px` }}
                    />
                    <span className="text-xs mt-2">
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][index]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Medications</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medication</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Paracetamol</TableCell>
                  <TableCell>450</TableCell>
                  <TableCell>
                    <Badge className="bg-green-500">
                      <ArrowUp className="h-3 w-3 mr-1" /> 15%
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Ibuprofen</TableCell>
                  <TableCell>320</TableCell>
                  <TableCell>
                    <Badge className="bg-red-500">
                      <ArrowDown className="h-3 w-3 mr-1" /> 8%
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Amoxicillin</TableCell>
                  <TableCell>280</TableCell>
                  <TableCell>
                    <Badge className="bg-green-500">
                      <ArrowUp className="h-3 w-3 mr-1" /> 12%
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Aspirin</TableCell>
                  <TableCell>210</TableCell>
                  <TableCell>
                    <Badge className="bg-green-500">
                      <ArrowUp className="h-3 w-3 mr-1" /> 5%
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Prescription Processing Time</span>
                <span className="text-sm text-muted-foreground">Average: 4.2 min</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Inventory Turnover</span>
                <span className="text-sm text-muted-foreground">Rate: 6.5</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Patient Wait Time</span>
                <span className="text-sm text-muted-foreground">Average: 8.5 min</span>
              </div>
              <Progress value={90} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
