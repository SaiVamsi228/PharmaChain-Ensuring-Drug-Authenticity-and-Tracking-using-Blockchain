"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"

export default function AnalyticsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>

        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <Select defaultValue="30days">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="year">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="production" className="space-y-4">
        <TabsList>
          <TabsTrigger value="production">Production</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
          <TabsTrigger value="recalls">Recalls</TabsTrigger>
        </TabsList>

        <TabsContent value="production" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard title="Total Batches" value="126" change="+8.2%" positive={true} />
            <MetricCard title="Units Produced" value="478,250" change="+12.3%" positive={true} />
            <MetricCard title="Active Recalls" value="2" change="+1" positive={false} />
            <MetricCard title="Avg. Production Time" value="3.2 days" change="-0.5 days" positive={true} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Production Volume by Equipment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <BarChart />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equipment" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard title="Total Equipment" value="12" change="+2" positive={true} />
            <MetricCard title="Operational %" value="83.3%" change="-5.4%" positive={false} />
            <MetricCard title="Avg. Uptime" value="92.7%" change="+1.3%" positive={true} />
            <MetricCard title="Maintenance Cost" value="$45,200" change="-8.1%" positive={true} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Equipment Efficiency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <LineChart />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard title="Quality Score" value="94.6%" change="+2.3%" positive={true} />
            <MetricCard title="Failed Batches" value="3" change="-2" positive={true} />
            <MetricCard title="QA Pass Rate" value="97.2%" change="+0.8%" positive={true} />
            <MetricCard title="Avg. QA Time" value="6.5 hrs" change="-1.2 hrs" positive={true} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quality Metrics by Drug Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <RadarChart />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recalls" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard title="Total Recalls" value="2" change="+1" positive={false} />
            <MetricCard title="Recovery Rate" value="62.5%" change="+7.3%" positive={true} />
            <MetricCard title="Avg. Response Time" value="4.2 hrs" change="-0.8 hrs" positive={true} />
            <MetricCard title="Recall Cost" value="$78,500" change="+$23,200" positive={false} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recall History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <AreaChart />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string
  change: string
  positive: boolean
}

function MetricCard({ title, value, change, positive }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold">{value}</p>
            <p className={`text-sm font-medium ${positive ? "text-green-500" : "text-red-500"}`}>{change}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function BarChart() {
  return (
    <div className="w-full h-full flex items-end justify-between px-2">
      <ChartBar label="EQP-789" value={50} color="#007BFF" />
      <ChartBar label="EQP-790" value={30} color="#007BFF" />
      <ChartBar label="EQP-792" value={15} color="#007BFF" />
      <ChartBar label="EQP-791" value={5} color="#007BFF" />
    </div>
  )
}

function LineChart() {
  return (
    <div className="w-full h-full flex flex-col justify-between">
      <div className="flex-1 relative">
        <svg className="w-full h-full" viewBox="0 0 100 50">
          <path d="M0,35 Q10,20 20,25 T40,15 T60,25 T80,10 T100,15" fill="none" stroke="#007BFF" strokeWidth="2" />
        </svg>
      </div>
      <div className="flex justify-between px-2 pt-4 text-xs text-muted-foreground">
        <div>Jan</div>
        <div>Feb</div>
        <div>Mar</div>
        <div>Apr</div>
        <div>May</div>
        <div>Jun</div>
        <div>Jul</div>
        <div>Aug</div>
      </div>
    </div>
  )
}

function RadarChart() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative w-[250px] h-[250px]">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[200px] h-[200px] border border-gray-200 rounded-full"></div>
          <div className="absolute w-[150px] h-[150px] border border-gray-200 rounded-full"></div>
          <div className="absolute w-[100px] h-[100px] border border-gray-200 rounded-full"></div>
          <div className="absolute w-[50px] h-[50px] border border-gray-200 rounded-full"></div>
        </div>

        <svg className="absolute inset-0" viewBox="0 0 100 100">
          <polygon
            points="50,10 85,30 85,70 50,90 15,70 15,30"
            fill="rgba(0, 123, 255, 0.2)"
            stroke="#007BFF"
            strokeWidth="1"
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="text-xs text-muted-foreground absolute"
            style={{ top: "0", left: "50%", transform: "translateX(-50%)" }}
          >
            Purity
          </div>
          <div className="text-xs text-muted-foreground absolute" style={{ top: "30%", right: "10%" }}>
            Consistency
          </div>
          <div className="text-xs text-muted-foreground absolute" style={{ bottom: "30%", right: "10%" }}>
            Stability
          </div>
          <div
            className="text-xs text-muted-foreground absolute"
            style={{ bottom: "0", left: "50%", transform: "translateX(-50%)" }}
          >
            Dissolution
          </div>
          <div className="text-xs text-muted-foreground absolute" style={{ bottom: "30%", left: "10%" }}>
            Appearance
          </div>
          <div className="text-xs text-muted-foreground absolute" style={{ top: "30%", left: "10%" }}>
            Assay
          </div>
        </div>
      </div>
    </div>
  )
}

function AreaChart() {
  return (
    <div className="w-full h-full flex flex-col justify-between">
      <div className="flex-1 relative">
        <svg className="w-full h-full" viewBox="0 0 100 50">
          <path
            d="M0,50 L0,40 Q20,35 40,38 T70,30 T100,35 L100,50 Z"
            fill="rgba(220, 53, 69, 0.2)"
            stroke="#DC3545"
            strokeWidth="2"
          />
        </svg>
      </div>
      <div className="flex justify-between px-2 pt-4 text-xs text-muted-foreground">
        <div>2021-Q1</div>
        <div>2021-Q3</div>
        <div>2022-Q1</div>
        <div>2022-Q3</div>
        <div>2023-Q1</div>
        <div>2023-Q3</div>
        <div>2024-Q1</div>
        <div>2024-Q3</div>
      </div>
    </div>
  )
}

interface ChartBarProps {
  label: string
  value: number
  color: string
}

function ChartBar({ label, value, color }: ChartBarProps) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="w-16 rounded-t-md"
        style={{
          backgroundColor: color,
          height: `${value * 2}px`,
        }}
      ></div>
      <div className="text-xs text-muted-foreground mt-2">{label}</div>
      <div className="text-xs font-medium">{value}%</div>
    </div>
  )
}