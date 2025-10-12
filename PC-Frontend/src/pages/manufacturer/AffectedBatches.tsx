import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Button } from "../../components/ui/button"
import { Textarea } from "../../components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Badge } from "../../components/ui/badge"
import { Check, CircleAlert, Loader2, Search, X } from "lucide-react"
import { useToast } from "../../hooks/use-toast"

// Mock data for equipment
const equipmentOptions = [
  { id: "EQ-001", name: "Tablet Press Machine A" },
  { id: "EQ-002", name: "Liquid Filling Line B" },
  { id: "EQ-003", name: "Packaging Unit C" },
  { id: "EQ-004", name: "Mixer D" },
  { id: "EQ-005", name: "Granulator E" },
]

// Mock data for batches
const mockBatches = [
  {
    id: "BAT-2024-001",
    product: "Paracetamol 500mg",
    quantity: 50000,
    equipmentId: "EQ-001",
    createdAt: "2024-04-15T10:30:00",
    status: "Distributed",
    location: "Distributor A",
  },
  {
    id: "BAT-2024-002",
    product: "Amoxicillin 250mg",
    quantity: 25000,
    equipmentId: "EQ-001",
    createdAt: "2024-04-16T09:15:00",
    status: "In Transit",
    location: "Shipping",
  },
  {
    id: "BAT-2024-003",
    product: "Ibuprofen 400mg",
    quantity: 35000,
    equipmentId: "EQ-002",
    createdAt: "2024-04-17T14:45:00",
    status: "Manufacturing",
    location: "Factory",
  },
  {
    id: "BAT-2024-004",
    product: "Paracetamol 500mg",
    quantity: 45000,
    equipmentId: "EQ-001",
    createdAt: "2024-04-18T11:20:00",
    status: "Quality Check",
    location: "QA Lab",
  },
  {
    id: "BAT-2024-005",
    product: "Aspirin 100mg",
    quantity: 60000,
    equipmentId: "EQ-003",
    createdAt: "2024-04-19T08:30:00",
    status: "Distributed",
    location: "Distributor B",
  },
  {
    id: "BAT-2024-006",
    product: "Loratadine 10mg",
    quantity: 30000,
    equipmentId: "EQ-001",
    createdAt: "2024-04-20T13:10:00",
    status: "Distributed",
    location: "Distributor C",
  },
  {
    id: "BAT-2024-007",
    product: "Cetirizine 5mg",
    quantity: 40000,
    equipmentId: "EQ-004",
    createdAt: "2024-04-21T15:25:00",
    status: "In Transit",
    location: "Shipping",
  },
]

export default function AffectedBatches() {
  const { toast } = useToast()
  const [selectedEquipment, setSelectedEquipment] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [recallReason, setRecallReason] = useState("")
  const [additionalNotes, setAdditionalNotes] = useState("")
  const [affectedBatches, setAffectedBatches] = useState<any[]>([])
  const [selectedBatches, setSelectedBatches] = useState<string[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isRecalling, setIsRecalling] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [recallComplete, setRecallComplete] = useState(false)
  const [recallId, setRecallId] = useState("")

  // Handle search for affected batches
  const handleSearch = () => {
    if (!selectedEquipment || !startDate || !endDate) {
      toast({
        title: "Missing information",
        description: "Please select equipment and date range",
        variant: "destructive",
      })
      return
    }

    setIsSearching(true)

    // Simulate API call with timeout
    setTimeout(() => {
      const startTimestamp = new Date(startDate).getTime()
      const endTimestamp = new Date(endDate).getTime()

      const filteredBatches = mockBatches.filter((batch) => {
        const batchDate = new Date(batch.createdAt).getTime()
        return batch.equipmentId === selectedEquipment && batchDate >= startTimestamp && batchDate <= endTimestamp
      })

      setAffectedBatches(filteredBatches)
      setSelectedBatches([])
      setIsSearching(false)
    }, 1000)
  }

  // Toggle selection of a batch
  const toggleBatchSelection = (batchId: string) => {
    setSelectedBatches((prev) => (prev.includes(batchId) ? prev.filter((id) => id !== batchId) : [...prev, batchId]))
  }

  // Toggle selection of all batches
  const toggleSelectAll = () => {
    if (selectedBatches.length === affectedBatches.length) {
      setSelectedBatches([])
    } else {
      setSelectedBatches(affectedBatches.map((batch) => batch.id))
    }
  }

  // Initiate recall process
  const initiateRecall = () => {
    if (selectedBatches.length === 0) {
      toast({
        title: "No batches selected",
        description: "Please select at least one batch to process",
        variant: "destructive",
      })
      return
    }

    if (!recallReason.trim()) {
      toast({
        title: "Reason required",
        description: "Please provide a reason for the process",
        variant: "destructive",
      })
      return
    }

    setShowConfirmation(true)
  }

  // Confirm and process recall
  const confirmRecall = () => {
    setIsRecalling(true)
    setShowConfirmation(false)

    // Simulate API call with timeout
    setTimeout(() => {
      // Generate a recall ID
      const newRecallId = `REC-${Date.now().toString().slice(-8)}`
      setRecallId(newRecallId)

      setIsRecalling(false)
      setRecallComplete(true)

      toast({
        title: "Process initiated successfully",
        description: `Process ID: ${newRecallId}`,
        variant: "default",
      })
    }, 2000)
  }

  // Reset the form for a new recall
  const resetForm = () => {
    setSelectedEquipment("")
    setStartDate("")
    setEndDate("")
    setRecallReason("")
    setAdditionalNotes("")
    setAffectedBatches([])
    setSelectedBatches([])
    setRecallComplete(false)
    setRecallId("")
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Distributed":
        return <Badge className="bg-blue-500">Distributed</Badge>
      case "In Transit":
        return <Badge className="bg-yellow-500">In Transit</Badge>
      case "Manufacturing":
        return <Badge className="bg-green-500">Manufacturing</Badge>
      case "Quality Check":
        return <Badge className="bg-purple-500">Quality Check</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (recallComplete) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Card className="border-green-200 bg-green-50 mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Check className="h-6 w-6 text-green-600" />
              <CardTitle>Affected Batches Successfully Processed</CardTitle>
            </div>
            <CardDescription>The process has been completed for the selected batches.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Process ID</p>
                    <p className="font-medium">{recallId}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Equipment</p>
                    <p className="font-medium">{equipmentOptions.find((eq) => eq.id === selectedEquipment)?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Date Range</p>
                    <p className="font-medium">
                      {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Batches Processed</p>
                    <p className="font-medium">{selectedBatches.length}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg">Reason</h3>
                <p className="mt-1 text-sm">{recallReason}</p>
              </div>

              {additionalNotes && (
                <div>
                  <h3 className="font-semibold text-lg">Additional Notes</h3>
                  <p className="mt-1 text-sm">{additionalNotes}</p>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-lg">Processed Batches</h3>
                <div className="border rounded-md mt-2 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Batch ID</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Location</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {affectedBatches
                        .filter((batch) => selectedBatches.includes(batch.id))
                        .map((batch) => (
                          <TableRow key={batch.id}>
                            <TableCell className="font-medium">{batch.id}</TableCell>
                            <TableCell>{batch.product}</TableCell>
                            <TableCell>{batch.quantity.toLocaleString()}</TableCell>
                            <TableCell>{batch.location}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={resetForm} className="w-full">
              Process Another Batch
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Affected Batches Management</h1>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Manage Affected Batches</CardTitle>
            <CardDescription>
              Identify and manage batches produced by specific equipment within a date range
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="equipment">Equipment</Label>
                  <select
                    id="equipment"
                    value={selectedEquipment}
                    onChange={(e) => setSelectedEquipment(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Select Equipment</option>
                    {equipmentOptions.map((equipment) => (
                      <option key={equipment.id} value={equipment.id}>
                        {equipment.name} ({equipment.id})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </div>

              <Button
                onClick={handleSearch}
                disabled={isSearching || !selectedEquipment || !startDate || !endDate}
                className="w-full md:w-auto"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Find Affected Batches
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {affectedBatches.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Affected Batches</CardTitle>
                <Badge variant="outline" className="ml-2">
                  {affectedBatches.length} batches found
                </Badge>
              </div>
              <CardDescription>Select the batches you want to include in this process</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <input
                          type="checkbox"
                          checked={selectedBatches.length === affectedBatches.length && affectedBatches.length > 0}
                          onChange={toggleSelectAll}
                          className="h-4 w-4"
                        />
                      </TableHead>
                      <TableHead>Batch ID</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Created Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Location</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {affectedBatches.map((batch) => (
                      <TableRow key={batch.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedBatches.includes(batch.id)}
                            onChange={() => toggleBatchSelection(batch.id)}
                            className="h-4 w-4"
                          />
                        </TableCell>
                        <TableCell className="font-medium">{batch.id}</TableCell>
                        <TableCell>{batch.product}</TableCell>
                        <TableCell>{batch.quantity.toLocaleString()}</TableCell>
                        <TableCell>{formatDate(batch.createdAt)}</TableCell>
                        <TableCell>{getStatusBadge(batch.status)}</TableCell>
                        <TableCell>{batch.location}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recallReason" className="text-red-600 font-medium">
                    Reason <span className="text-red-600">*</span>
                  </Label>
                  <Textarea
                    id="recallReason"
                    placeholder="Provide a detailed reason for this process..."
                    value={recallReason}
                    onChange={(e) => setRecallReason(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalNotes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="additionalNotes"
                    placeholder="Any additional information or instructions..."
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="destructive"
                onClick={initiateRecall}
                disabled={selectedBatches.length === 0 || !recallReason.trim()}
                className="w-full sm:w-auto"
              >
                <CircleAlert className="mr-2 h-4 w-4" />
                Process {selectedBatches.length} Batches
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setAffectedBatches([])
                  setSelectedBatches([])
                }}
                className="w-full sm:w-auto"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </CardFooter>
          </Card>
        )}

        {showConfirmation && (
          <Alert className="bg-red-50 border-red-200">
            <CircleAlert className="h-4 w-4 text-red-600" />
            <AlertTitle>Confirm Process</AlertTitle>
            <AlertDescription className="space-y-4">
              <p>
                You are about to process <strong>{selectedBatches.length}</strong> batches produced by <strong>{equipmentOptions.find((eq) => eq.id === selectedEquipment)?.name}</strong>. This action will notify all stakeholders in the supply chain and cannot be undone.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="destructive" onClick={confirmRecall} disabled={isRecalling}>
                  {isRecalling ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CircleAlert className="mr-2 h-4 w-4" />
                      Confirm Process
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setShowConfirmation(false)} disabled={isRecalling}>
                  Cancel
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
