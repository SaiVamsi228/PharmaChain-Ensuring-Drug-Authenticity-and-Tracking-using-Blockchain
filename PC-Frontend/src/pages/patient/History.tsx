"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import {
  Pill,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Stethoscope,
  FileText,
} from "lucide-react"
import { Badge } from "../../components/ui/badge"

interface MedicationHistoryItem {
  id: string
  name: string
  dosage: string
  date: string
  status: "completed" | "ongoing" | "missed"
  doctor: string
  notes?: string
}

const sampleHistory: MedicationHistoryItem[] = [
  {
    id: "1",
    name: "Ibuprofen",
    dosage: "200mg",
    date: "2024-03-15",
    status: "completed",
    doctor: "Dr. Smith",
    notes: "For headache relief"
  },
  {
    id: "2",
    name: "Amoxicillin",
    dosage: "500mg",
    date: "2024-03-10",
    status: "completed",
    doctor: "Dr. Johnson",
    notes: "Antibiotic course completed"
  },
  {
    id: "3",
    name: "Lisinopril",
    dosage: "10mg",
    date: "2024-03-01",
    status: "ongoing",
    doctor: "Dr. Williams",
    notes: "Daily blood pressure medication"
  }
]

export default function PatientHistory() {
  const [selectedMedication, setSelectedMedication] = useState<MedicationHistoryItem | null>(null)

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Medication History</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Recent Medications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sampleHistory.map((medication) => (
              <div
                key={medication.id}
                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedMedication(medication)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Pill className="h-5 w-5 text-blue-600 mr-3" />
                    <div>
                      <h3 className="font-medium">{medication.name}</h3>
                      <p className="text-sm text-muted-foreground">{medication.dosage}</p>
                    </div>
                  </div>
                  <Badge
                    className={
                      medication.status === "completed"
                        ? "bg-green-500"
                        : medication.status === "ongoing"
                        ? "bg-blue-500"
                        : "bg-red-500"
                    }
                  >
                    {medication.status}
                  </Badge>
                </div>
                <div className="mt-2 flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{medication.date}</span>
                  <Stethoscope className="h-4 w-4 ml-4 mr-1" />
                  <span>{medication.doctor}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedMedication && (
        <Card>
          <CardHeader>
            <CardTitle>Medication Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start">
                <div className="p-2 bg-blue-100 rounded-full mr-3">
                  <Pill className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">Medication</h3>
                  <p className="text-sm text-muted-foreground">{selectedMedication.name}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="p-2 bg-green-100 rounded-full mr-3">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">Dosage</h3>
                  <p className="text-sm text-muted-foreground">{selectedMedication.dosage}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="p-2 bg-amber-100 rounded-full mr-3">
                  <Calendar className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-medium">Prescribed Date</h3>
                  <p className="text-sm text-muted-foreground">{selectedMedication.date}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="p-2 bg-purple-100 rounded-full mr-3">
                  <Stethoscope className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium">Prescribed By</h3>
                  <p className="text-sm text-muted-foreground">{selectedMedication.doctor}</p>
                </div>
              </div>
            </div>

            {selectedMedication.notes && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start">
                  <div className="p-2 bg-gray-100 rounded-full mr-3">
                    <FileText className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Notes</h3>
                    <p className="text-sm text-muted-foreground">{selectedMedication.notes}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
