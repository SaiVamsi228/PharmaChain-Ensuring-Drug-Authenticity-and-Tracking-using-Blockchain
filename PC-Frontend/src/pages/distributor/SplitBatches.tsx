import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert"
import { Badge } from "../../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { useToast } from "../../hooks/use-toast"
import {
  SquareSplitVerticalIcon as SplitSquare,
  Info,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Plus,
  ArrowRight,
  PackageCheck,
} from "lucide-react"

// Mock data for original batch
const originalBatch = {
  id: "BTC-2024-0568",
  product: "Amoxicillin 500mg",
  quantity: 1000,
  manufacturer: "PharmaCorp Inc.",
  manufactureDate: "2024-01-15",
  expiryDate: "2026-01-15",
  location: "NYC Warehouse",
  status: "In Stock",
  batchValue: "$5,000.00",
}

// Function to generate a unique batch ID
const generateBatchId = () => {
  const randomPart = Math.floor(1000 + Math.random() * 9000)
  return `BTC-2024-${randomPart}`
}

export default function SplitBatchesPage() {
  const { toast } = useToast()
  const [splitMethod, setSplitMethod] = useState<"equal" | "custom">("equal")
  const [numberOfSplits, setNumberOfSplits] = useState<number>(2)
  const [customSplits, setCustomSplits] = useState<{ id: string; quantity: number }[]>([
    { id: generateBatchId(), quantity: 500 },
    { id: generateBatchId(), quantity: 500 },
  ])
  const [previewSplits, setPreviewSplits] = useState<{ id: string; quantity: number }[]>([])
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)

  // Update custom splits when number of splits changes
  useEffect(() => {
    if (splitMethod === "equal") {
      const equalQuantity = Math.floor(originalBatch.quantity / numberOfSplits)
      const newSplits = Array.from({ length: numberOfSplits }, () => ({
        id: generateBatchId(),
        quantity: equalQuantity,
      }))

      // Adjust the last split to account for any remainder
      const remainder = originalBatch.quantity - equalQuantity * numberOfSplits
      if (remainder > 0 && newSplits.length > 0) {
        newSplits[newSplits.length - 1].quantity += remainder
      }

      setCustomSplits(newSplits)
    }
  }, [numberOfSplits, splitMethod])

  // Validate splits
  const validateSplits = () => {
    const totalSplitQuantity = customSplits.reduce((sum, split) => sum + split.quantity, 0)

    if (totalSplitQuantity > originalBatch.quantity) {
      setValidationError(
        `Total split quantity (${totalSplitQuantity}) exceeds original batch quantity (${originalBatch.quantity})`,
      )
      return false
    }

    if (totalSplitQuantity < originalBatch.quantity) {
      setValidationError(
        `Total split quantity (${totalSplitQuantity}) is less than original batch quantity (${originalBatch.quantity})`,
      )
      return false
    }

    if (customSplits.some((split) => split.quantity <= 0)) {
      setValidationError("Each split must have at least 1 item")
      return false
    }

    setValidationError(null)
    return true
  }

  // Handle custom split quantity change
  const handleQuantityChange = (index: number, value: number) => {
    const newSplits = [...customSplits]
    newSplits[index].quantity = value
    setCustomSplits(newSplits)
  }

  // Add a new custom split
  const addCustomSplit = () => {
    setCustomSplits([...customSplits, { id: generateBatchId(), quantity: 0 }])
  }

  // Remove a custom split
  const removeCustomSplit = (index: number) => {
    if (customSplits.length > 1) {
      const newSplits = customSplits.filter((_, i) => i !== index)
      setCustomSplits(newSplits)
    }
  }

  // Preview the splits
  const previewBatchSplit = () => {
    if (validateSplits()) {
      setPreviewSplits([...customSplits])
    }
  }

  // Execute the batch split
  const executeBatchSplit = () => {
    if (validateSplits()) {
      // In a real application, this would call an API to perform the split
      setIsSuccess(true)
      toast({
        title: "Batch Split Successful",
        description: `Original batch ${originalBatch.id} has been split into ${customSplits.length} new batches.`,
        variant: "default",
      })
    }
  }

  // Reset the form
  const resetForm = () => {
    setSplitMethod("equal")
    setNumberOfSplits(2)
    setCustomSplits([
      { id: generateBatchId(), quantity: 500 },
      { id: generateBatchId(), quantity: 500 },
    ])
    setPreviewSplits([])
    setValidationError(null)
    setIsSuccess(false)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Split Batches</h1>
          <p className="text-muted-foreground mt-1">
            Divide a single batch into multiple smaller batches while maintaining traceability
          </p>
        </div>
        <Button variant="outline" onClick={resetForm} className="mt-4 md:mt-0">
          Reset Form
        </Button>
      </div>

      {isSuccess ? (
        <div className="space-y-6">
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <AlertTitle className="text-green-800">Batch Split Successful</AlertTitle>
            <AlertDescription className="text-green-700">
              Original batch {originalBatch.id} has been successfully split into {customSplits.length} new batches. The
              blockchain has been updated with the new batch information.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Split Results</CardTitle>
              <CardDescription>The following new batches have been created from the original batch</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center mb-2">
                  <PackageCheck className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="font-medium text-blue-800">Original Batch</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Batch ID</p>
                    <p className="font-medium">{originalBatch.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Product</p>
                    <p>{originalBatch.product}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Quantity</p>
                    <p>{originalBatch.quantity} units</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                      Split
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex justify-center my-4">
                <div className="flex items-center">
                  <SplitSquare className="h-6 w-6 text-blue-600" />
                  <ArrowRight className="h-6 w-6 text-blue-600 mx-2" />
                  <div className="flex">
                    {Array.from({ length: Math.min(customSplits.length, 3) }).map((_, i) => (
                      <div
                        key={i}
                        className="h-6 w-6 bg-blue-600 rounded-sm text-white flex items-center justify-center text-xs mr-1"
                      >
                        {i + 1}
                      </div>
                    ))}
                    {customSplits.length > 3 && (
                      <div className="h-6 px-1 bg-blue-600 rounded-sm text-white flex items-center justify-center text-xs">
                        +{customSplits.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>New Batch ID</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customSplits.map((split, index) => (
                    <TableRow key={split.id}>
                      <TableCell className="font-medium">{split.id}</TableCell>
                      <TableCell>{originalBatch.product}</TableCell>
                      <TableCell>{split.quantity} units</TableCell>
                      <TableCell>{originalBatch.expiryDate}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800 border-green-300">Created</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-end space-x-4">
              <Button variant="outline" onClick={resetForm}>
                Split Another Batch
              </Button>
              <Button className="bg-[#007BFF] hover:bg-blue-600">View Batch Details</Button>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Original Batch Details</CardTitle>
              <CardDescription>Review the details of the batch you want to split</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <Label className="text-xs">Batch ID</Label>
                  <p className="font-medium">{originalBatch.id}</p>
                </div>
                <div>
                  <Label className="text-xs">Product</Label>
                  <p>{originalBatch.product}</p>
                </div>
                <div>
                  <Label className="text-xs">Quantity</Label>
                  <p>{originalBatch.quantity} units</p>
                </div>
                <div>
                  <Label className="text-xs">Manufacturer</Label>
                  <p>{originalBatch.manufacturer}</p>
                </div>
                <div>
                  <Label className="text-xs">Manufacture Date</Label>
                  <p>{originalBatch.manufactureDate}</p>
                </div>
                <div>
                  <Label className="text-xs">Expiry Date</Label>
                  <p>{originalBatch.expiryDate}</p>
                </div>
                <div>
                  <Label className="text-xs">Location</Label>
                  <p>{originalBatch.location}</p>
                </div>
                <div>
                  <Label className="text-xs">Status</Label>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                    {originalBatch.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Split Configuration</CardTitle>
              <CardDescription>Choose how you want to split this batch</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={splitMethod} onValueChange={(value) => setSplitMethod(value as "equal" | "custom")}>
                <TabsList className="mb-6">
                  <TabsTrigger value="equal">Equal Splits</TabsTrigger>
                  <TabsTrigger value="custom">Custom Splits</TabsTrigger>
                </TabsList>

                <TabsContent value="equal" className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="numberOfSplits">Number of Equal Splits</Label>
                    <div className="flex items-center space-x-4">
                      <Input
                        id="numberOfSplits"
                        type="number"
                        min={2}
                        max={10}
                        value={numberOfSplits}
                        onChange={(e) => setNumberOfSplits(Number.parseInt(e.target.value) || 2)}
                        className="w-24"
                      />
                      <p className="text-sm text-muted-foreground">
                        Each split will contain approximately {Math.floor(originalBatch.quantity / numberOfSplits)}{" "}
                        units
                      </p>
                    </div>
                  </div>

                  <Alert className="bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-700">
                      The system will automatically distribute {originalBatch.quantity} units equally among{" "}
                      {numberOfSplits} new batches. Any remainder will be added to the last batch.
                    </AlertDescription>
                  </Alert>
                </TabsContent>

                <TabsContent value="custom" className="space-y-6">
                  <div className="space-y-4">
                    {customSplits.map((split, index) => (
                      <div key={split.id} className="flex items-end space-x-4">
                        <div className="flex-1 space-y-2">
                          <Label htmlFor={`split-${index}`}>Split {index + 1} Quantity</Label>
                          <Input
                            id={`split-${index}`}
                            type="number"
                            min={1}
                            max={originalBatch.quantity}
                            value={split.quantity}
                            onChange={(e) => handleQuantityChange(index, Number.parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <Label htmlFor={`id-${index}`}>Batch ID (Auto-generated)</Label>
                          <Input id={`id-${index}`} value={split.id} disabled className="bg-gray-50" />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeCustomSplit(index)}
                          disabled={customSplits.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    <div className="flex items-center justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addCustomSplit}
                        className="flex items-center"
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Another Split
                      </Button>

                      <div className="text-sm">
                        <span className="font-medium">Total:</span>{" "}
                        {customSplits.reduce((sum, split) => sum + split.quantity, 0)} / {originalBatch.quantity} units
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {validationError && (
                <Alert className="mt-6 bg-red-50 border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">{validationError}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancel</Button>
              <div className="space-x-2">
                <Button variant="outline" onClick={previewBatchSplit} disabled={previewSplits.length > 0}>
                  Preview Split
                </Button>
                <Button className="bg-[#007BFF] hover:bg-blue-600" onClick={executeBatchSplit}>
                  Split Batch
                </Button>
              </div>
            </CardFooter>
          </Card>

          {previewSplits.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Preview Split Results</CardTitle>
                <CardDescription>Review the new batches that will be created</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>New Batch ID</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Percentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewSplits.map((split) => (
                      <TableRow key={split.id}>
                        <TableCell className="font-medium">{split.id}</TableCell>
                        <TableCell>{originalBatch.product}</TableCell>
                        <TableCell>{split.quantity} units</TableCell>
                        <TableCell>{((split.quantity / originalBatch.quantity) * 100).toFixed(1)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button className="bg-[#007BFF] hover:bg-blue-600" onClick={executeBatchSplit}>
                  Confirm Split
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
