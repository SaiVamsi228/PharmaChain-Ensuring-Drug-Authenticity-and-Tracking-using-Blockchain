"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import {
  Bell,
  Plus,
  Clock,
  Calendar,
  Pill,
  CheckCircle,
  AlertTriangle,
} from "lucide-react"
import { Badge } from "../../components/ui/badge"

interface Reminder {
  id: string
  medication: string
  dosage: string
  time: string
  frequency: string
  nextDose: string
  status: "upcoming" | "missed" | "taken"
}

const sampleReminders: Reminder[] = [
  {
    id: "1",
    medication: "Lisinopril",
    dosage: "10mg",
    time: "08:00 AM",
    frequency: "Daily",
    nextDose: "2024-03-20 08:00",
    status: "upcoming"
  },
  {
    id: "2",
    medication: "Ibuprofen",
    dosage: "200mg",
    time: "12:00 PM",
    frequency: "As needed",
    nextDose: "2024-03-20 12:00",
    status: "missed"
  },
  {
    id: "3",
    medication: "Amoxicillin",
    dosage: "500mg",
    time: "08:00 PM",
    frequency: "Twice daily",
    nextDose: "2024-03-20 20:00",
    status: "taken"
  }
]

export default function PatientReminders() {
  const [reminders, setReminders] = useState<Reminder[]>(sampleReminders)

  const handleMarkAsTaken = (id: string) => {
    setReminders(reminders.map(reminder => 
      reminder.id === id ? { ...reminder, status: "taken" } : reminder
    ))
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Medication Reminders</h1>

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Active Reminders</CardTitle>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Reminder
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className="p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Pill className="h-5 w-5 text-blue-600 mr-3" />
                    <div>
                      <h3 className="font-medium">{reminder.medication}</h3>
                      <p className="text-sm text-muted-foreground">{reminder.dosage}</p>
                    </div>
                  </div>
                  <Badge
                    className={
                      reminder.status === "upcoming"
                        ? "bg-blue-500"
                        : reminder.status === "missed"
                        ? "bg-red-500"
                        : "bg-green-500"
                    }
                  >
                    {reminder.status}
                  </Badge>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{reminder.time}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{reminder.frequency}</span>
                  </div>
                </div>
                {reminder.status === "upcoming" && (
                  <div className="mt-4">
                    <Button
                      className="w-full"
                      onClick={() => handleMarkAsTaken(reminder.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Taken
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reminder Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="font-medium">Upcoming</h3>
              </div>
              <p className="text-2xl font-bold mt-2">1</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="font-medium">Taken Today</h3>
              </div>
              <p className="text-2xl font-bold mt-2">1</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                <h3 className="font-medium">Missed</h3>
              </div>
              <p className="text-2xl font-bold mt-2">1</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
