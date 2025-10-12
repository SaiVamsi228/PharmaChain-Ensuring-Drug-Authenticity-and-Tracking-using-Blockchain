import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { ArrowDownToLine, ArrowUpFromLine, Package, Truck, QrCode, CheckCircle, X } from "lucide-react"

interface StatusCardProps {
  title: string
  value: string
  icon: React.ReactNode
  color: string
}

function StatusCard({ title, value, icon, color }: StatusCardProps) {
  return (
    <Card className={`${color} border fadeIn`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium">{title}</p>
          {icon}
        </div>
        <h3 className="text-3xl font-bold">{value}</h3>
      </CardContent>
    </Card>
  )
}

export default function DistributorDashboard() {
  const [verificationResult, setVerificationResult] = useState<null | {
    batchId: string
    drug: string
    units: number
    verified: boolean
  }>(null)

  const handleScan = () => {
    setVerificationResult({
      batchId: "PA-2024",
      drug: "Paracetamol",
      units: 2000,
      verified: true,
    })
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Distributor Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatusCard
          title="Incoming Shipments"
          value="5"
          icon={<ArrowDownToLine className="h-5 w-5 text-[#007BFF]" />}
          color="border-blue-200 bg-blue-50"
        />
        <StatusCard
          title="Outgoing Transfers"
          value="8"
          icon={<ArrowUpFromLine className="h-5 w-5 text-[#28A745]" />}
          color="border-green-200 bg-green-50"
        />
        <StatusCard
          title="Current Inventory"
          value="12"
          icon={<Package className="h-5 w-5 text-[#FFC107]" />}
          color="border-yellow-200 bg-yellow-50"
        />
        <StatusCard
          title="In Transit"
          value="3"
          icon={<Truck className="h-5 w-5 text-[#6c757d]" />}
          color="border-gray-200 bg-gray-50"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Incoming Shipments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Batch Verification</h3>
                  <Badge className={verificationResult?.verified ? "bg-green-500" : "bg-red-500"}>
                    {verificationResult?.verified ? "Verified" : "Not Verified"}
                  </Badge>
                </div>

                <div className="flex flex-col items-center mb-4">
                  <div
                    onClick={handleScan}
                    className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 cursor-pointer hover:bg-gray-100"
                  >
                    <div className="text-center">
                      <QrCode className="mx-auto h-8 w-8 text-gray-400" />
                      <p className="mt-1 text-sm text-muted-foreground">Click to scan QR code</p>
                    </div>
                  </div>
                </div>

                {verificationResult && (
                  <div className="p-3 bg-gray-50 rounded-lg fadeIn">
                    <div className="flex items-center text-sm mb-1">
                      <span className="font-medium mr-1">Batch:</span>
                      <span>{verificationResult.batchId}</span>
                      <CheckCircle className="ml-2 h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex items-center text-sm mb-1">
                      <span className="font-medium mr-1">Drug:</span>
                      <span>{verificationResult.drug}</span>
                    </div>
                    <div className="flex items-center text-sm mb-3">
                      <span className="font-medium mr-1">Units:</span>
                      <span>{verificationResult.units}</span>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="bg-[#28A745] hover:bg-green-600 flex-1">
                        <CheckCircle className="mr-1 h-4 w-4" /> Accept
                      </Button>
                      <Button size="sm" variant="outline" className="text-[#DC3545] flex-1">
                        <X className="mr-1 h-4 w-4" /> Reject
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch ID</TableHead>
                  <TableHead>Drug</TableHead>
                  <TableHead>Units</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">PA-2024</TableCell>
                  <TableCell>Paracetamol</TableCell>
                  <TableCell>2000</TableCell>
                  <TableCell>
                    <Badge className="bg-green-500">In Stock</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">IB-2024</TableCell>
                  <TableCell>Ibuprofen</TableCell>
                  <TableCell>800</TableCell>
                  <TableCell>
                    <Badge className="bg-yellow-500">Low Stock</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">AM-2024</TableCell>
                  <TableCell>Amoxicillin</TableCell>
                  <TableCell>1500</TableCell>
                  <TableCell>
                    <Badge className="bg-green-500">In Stock</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">AS-2024</TableCell>
                  <TableCell>Aspirin</TableCell>
                  <TableCell>1200</TableCell>
                  <TableCell>
                    <Badge className="bg-green-500">In Stock</Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Transfer Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Batch ID</label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2">
                  <option value="IB-2024">IB-2024 (Ibuprofen - 800 units)</option>
                  <option value="PA-2024">PA-2024 (Paracetamol - 2000 units)</option>
                  <option value="AM-2024">AM-2024 (Amoxicillin - 1500 units)</option>
                </select>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Pharmacy Wallet</label>
                <input
                  type="text"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                  defaultValue="Pharma123"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Transfer Quantity</label>
                <input
                  type="number"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                  defaultValue="500"
                />
              </div>

              <Button className="w-full bg-[#007BFF] hover:bg-blue-600">
                <Truck className="mr-2 h-4 w-4" />
                Initiate Transfer
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transfer History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 border rounded flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-blue-100 mr-3">
                    <Truck className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">IB-2024 to Pharma123</h4>
                    <p className="text-xs text-muted-foreground">500 units on 08/20/2024</p>
                  </div>
                </div>
                <Badge className="bg-green-500">Completed</Badge>
              </div>

              <div className="p-3 border rounded flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-blue-100 mr-3">
                    <Truck className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">AM-2024 to PharmaPlus</h4>
                    <p className="text-xs text-muted-foreground">750 units on 08/18/2024</p>
                  </div>
                </div>
                <Badge className="bg-green-500">Completed</Badge>
              </div>

              <div className="p-3 border rounded flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-blue-100 mr-3">
                    <Truck className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">PA-2024 to MedCare</h4>
                    <p className="text-xs text-muted-foreground">1000 units on 08/15/2024</p>
                  </div>
                </div>
                <Badge className="bg-yellow-500">In Transit</Badge>
              </div>

              <div className="p-3 border rounded flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-blue-100 mr-3">
                    <Truck className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">AS-2024 to HealthPharm</h4>
                    <p className="text-xs text-muted-foreground">600 units on 08/12/2024</p>
                  </div>
                </div>
                <Badge className="bg-green-500">Completed</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
