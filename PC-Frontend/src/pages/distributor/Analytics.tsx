"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"

export default function DistributorAnalyticsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Distribution Analytics</h1>

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

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="transfers">Transfers</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard title="Total Shipments" value="24" change="+8.2%" positive={true} />
            <MetricCard title="Active Transfers" value="3" change="+1" positive={false} />
            <MetricCard title="Inventory Value" value="$245,000" change="+12.3%" positive={true} />
            <MetricCard title="Avg. Delivery Time" value="2.3 days" change="-0.5 days" positive={true} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Distribution Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <BarChart />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard title="Total Products" value="5" change="+1" positive={true} />
            <MetricCard title="Stock Level" value="83.4%" change="-2.1%" positive={false} />
            <MetricCard title="Turnover Rate" value="4.2x" change="+0.3x" positive={true} />
            <MetricCard title="Expiring Soon" value="1" change="-2" positive={true} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Inventory Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <PieChart />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfers" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard title="Completed" value="18" change="+5" positive={true} />
            <MetricCard title="In Transit" value="3" change="+1" positive={false} />
            <MetricCard title="Success Rate" value="98.2%" change="+0.5%" positive={true} />
            <MetricCard title="Avg. Value" value="$12,500" change="+$1,200" positive={true} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Transfer Destinations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <LineChart />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard title="Compliance Score" value="97.5%" change="+1.2%" positive={true} />
            <MetricCard title="Verified Batches" value="100%" change="+0%" positive={true} />
            <MetricCard title="Audit Readiness" value="92.8%" change="+3.5%" positive={true} />
            <MetricCard title="Recall Response" value="4.2 hrs" change="-0.8 hrs" positive={true} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Compliance History</CardTitle>
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
      <ChartBar label="Paracetamol" value={40} color="#007BFF" />
      <ChartBar label="Ibuprofen" value={20} color="#007BFF" />
      <ChartBar label="Amoxicillin" value={25} color="#007BFF" />
      <ChartBar label="Aspirin" value={10} color="#007BFF" />
      <ChartBar label="Diazepam" value={5} color="#007BFF" />
    </div>
  )
}

function PieChart() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative w-[250px] h-[250px]">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="45" fill="transparent" stroke="#e9ecef" strokeWidth="10" />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="transparent"
            stroke="#007BFF"
            strokeWidth="10"
            strokeDasharray="282.7"
            strokeDashoffset="113.1"
            transform="rotate(-90 50 50)"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="transparent"
            stroke="#28A745"
            strokeWidth="10"
            strokeDasharray="282.7"
            strokeDashoffset="197.9"
            transform="rotate(-90 50 50)"
            strokeLinecap="round"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="transparent"
            stroke="#FFC107"
            strokeWidth="10"
            strokeDasharray="282.7"
            strokeDashoffset="240.3"
            transform="rotate(-90 50 50)"
            strokeLinecap="round"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="transparent"
            stroke="#DC3545"
            strokeWidth="10"
            strokeDasharray="282.7"
            strokeDashoffset="268.6"
            transform="rotate(-90 50 50)"
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-2xl font-bold">6000</span>
          <span className="text-xs text-muted-foreground">Total Units</span>
        </div>

        <div className="absolute bottom-0 w-full flex flex-wrap justify-around text-xs text-muted-foreground">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-[#007BFF] rounded-full mr-1"></div>
            <span>Paracetamol (40%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-[#28A745] rounded-full mr-1"></div>
            <span>Amoxicillin (30%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-[#FFC107] rounded-full mr-1"></div>
            <span>Ibuprofen (15%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-[#DC3545] rounded-full mr-1"></div>
            <span>Others (15%)</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function LineChart() {
  return (
    <div className="w-full h-full flex flex-col justify-between">
      <div className="flex-1 relative">
        <svg className="w-full h-full" viewBox="0 0 100 50">
          <path d="M0,40 Q10,35 20,30 T40,25 T60,20 T80,15 T100,10" fill="none" stroke="#007BFF" strokeWidth="2" />
          <path d="M0,45 Q10,42 20,40 T40,35 T60,30 T80,25 T100,20" fill="none" stroke="#28A745" strokeWidth="2" />
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

function AreaChart() {
  return (
    <div className="w-full h-full flex flex-col justify-between">
      <div className="flex-1 relative">
        <svg className="w-full h-full" viewBox="0 0 100 50">
          <path
            d="M0,50 L0,10 Q20,8 40,5 T70,8 T100,5 L100,50 Z"
            fill="rgba(0, 123, 255, 0.2)"
            stroke="#007BFF"
            strokeWidth="2"
          />
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
