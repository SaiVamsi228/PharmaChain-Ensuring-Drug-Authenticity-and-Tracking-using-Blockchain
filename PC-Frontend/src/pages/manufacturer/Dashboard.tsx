"use client";

import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "../../components/ui/alert";
import { Progress } from "../../components/ui/progress";
import { ArrowUpCircle, CircleAlert, Truck } from "lucide-react";

interface StatusCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

function StatusCard({ title, value, icon, color }: StatusCardProps) {
  return (
    <Card className={`${color} border-2 fadeIn`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{title}</p>
            <h3 className="text-3xl font-bold">{value}</h3>
          </div>
          <div>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ActivityItemProps {
  date: string;
  description: string;
}

function ActivityItem({ date, description }: ActivityItemProps) {
  return (
    <li className="flex items-start">
      <div className="bg-blue-100 text-[#007BFF] px-2 py-1 rounded text-xs font-medium mr-3">{date}</div>
      <span className="text-sm">{description}</span>
    </li>
  );
}

export default function ManufacturerDashboard() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Manufacturer Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <StatusCard
          title="Operational Batches"
          value="45"
          icon={<ArrowUpCircle className="h-6 w-6 text-[#28A745]" />}
          color="border-green-200 bg-green-50"
        />
        <StatusCard
          title="Recalled Batches"
          value="2"
          icon={<CircleAlert className="h-6 w-6 text-[#DC3545]" />}
          color="border-red-200 bg-red-50"
        />
        <StatusCard
          title="In Transit"
          value="12"
          icon={<Truck className="h-6 w-6 text-[#FFC107]" />}
          color="border-yellow-200 bg-yellow-50"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <ActivityItem date="08/20" description="Transferred PA-2024 to Distributor A" />
              <ActivityItem date="08/19" description="Registered batch IB-2024 (5000 units)" />
              <ActivityItem date="08/18" description="Equipment EQP-790 maintenance scheduled" />
              <ActivityItem date="08/17" description="Batch AN-2023 fully distributed" />
              <ActivityItem date="08/16" description="Quality check completed for IB-2024" />
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recall Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">PA-2024 Recovery</span>
                  <span className="text-sm font-medium text-[#DC3545]">45%</span>
                </div>
                <Progress value={45} className="h-2 bg-red-100" />
                <p className="text-sm text-muted-foreground mt-1">Recall initiated on 08/15/2024</p>
              </div>
              <Alert className="bg-red-50 border-red-200">
                <CircleAlert className="h-4 w-4 text-[#DC3545]" />
                <AlertTitle>Active Recall Notice</AlertTitle>
                <AlertDescription>
                  Paracetamol batch PA-2024 is under recall due to packaging concerns.
                </AlertDescription>
              </Alert>
              <button className="w-full bg-[#DC3545] text-white py-2 rounded hover:bg-red-600 transition-colors">
                Start New Recall
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}