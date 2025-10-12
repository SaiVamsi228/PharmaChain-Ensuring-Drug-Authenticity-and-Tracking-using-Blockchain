"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import {
  BarChart3,
  Calendar,
  AlertTriangle,
  CheckCircle,
  FileText,
  Download,
} from "lucide-react"

interface ReportData {
  date: string
  adherence: number
  sideEffects: string[]
}

const sampleReportData: ReportData[] = [
  {
    date: "2024-03-20",
    adherence: 100,
    sideEffects: ["None reported"]
  },
  {
    date: "2024-03-19",
    adherence: 75,
    sideEffects: ["Mild headache", "Dizziness"]
  },
  {
    date: "2024-03-18",
    adherence: 100,
    sideEffects: ["None reported"]
  },
  {
    date: "2024-03-17",
    adherence: 50,
    sideEffects: ["Nausea"]
  }
]

export default function PatientReport() {
  const [selectedDate, setSelectedDate] = useState<string>(sampleReportData[0].date)

  const selectedReport = sampleReportData.find(report => report.date === selectedDate)

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Medication Reports</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Adherence Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sampleReportData.map((report) => (
              <div
                key={report.date}
                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedDate(report.date)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-blue-600 mr-3" />
                    <div>
                      <h3 className="font-medium">{new Date(report.date).toLocaleDateString()}</h3>
                      <p className="text-sm text-muted-foreground">
                        Adherence: {report.adherence}%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {report.adherence === 100 ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedReport && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Detailed Report</CardTitle>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="font-medium">Adherence Rate</h3>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-blue-600 h-4 rounded-full"
                      style={{ width: `${selectedReport.adherence}%` }}
                    ></div>
                  </div>
                  <p className="text-2xl font-bold mt-2">{selectedReport.adherence}%</p>
                </div>
              </div>

              <div className="p-4 bg-red-50 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                  <h3 className="font-medium">Reported Side Effects</h3>
                </div>
                <div className="mt-4">
                  {selectedReport.sideEffects.map((effect, index) => (
                    <div key={index} className="flex items-center mb-2">
                      <FileText className="h-4 w-4 text-red-600 mr-2" />
                      <span>{effect}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <h3 className="font-medium">Recommendations</h3>
                </div>
                <div className="mt-4">
                  {selectedReport.adherence < 100 ? (
                    <p className="text-sm">
                      Consider setting up medication reminders to improve adherence.
                    </p>
                  ) : (
                    <p className="text-sm">Great job maintaining your medication schedule!</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
