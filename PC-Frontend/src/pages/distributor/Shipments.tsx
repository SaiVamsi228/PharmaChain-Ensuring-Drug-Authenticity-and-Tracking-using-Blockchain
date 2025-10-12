import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { BrowserQRCodeReader } from "@zxing/library";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Search, Filter, Plus, Download, Truck, Package, Clock, CheckCircle, AlertTriangle, X, Video, VideoOff } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { Shipment } from "../../types/shipment";

export default function ShipmentsPage() {
  const [verificationResult, setVerificationResult] = useState<{
    batchId: string;
    drug: string;
    units: number;
    verified: boolean;
    shipmentId?: string;
    manufacturerId?: string; // Added to store manufacturerId from batch verification
  } | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [manualBatchId, setManualBatchId] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isScannerEnabled, setIsScannerEnabled] = useState<boolean>(true);
  const [analytics, setAnalytics] = useState({
    totalShipments: 0,
    verifiedShipments: 0,
    pendingShipments: 0,
    issuesDetected: 0,
  });
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserQRCodeReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const handleScan = async (data: string | null) => {
    if (data) {
      setIsVerifying(true);
      try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/batches/verify`, { ipfsHash: data });
        console.log("Verify response:", response.data);

        let shipment = shipments.find((s: any) => s.batchId === response.data.batchId);

        if (!shipment) {
          console.log("Shipment not found locally. Fetching from database...");
          const shipmentResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/shipments/batch/${response.data.batchId}`);
          shipment = shipmentResponse.data.shipment;
          console.log("Fetched shipment from database:", shipment);
        }

        const result = {
          ...response.data,
          shipmentId: shipment?.shipmentId,
          manufacturerId: response.data.manufacturerId || shipment?.origin, // Assuming batch verification returns manufacturerId or use shipment origin
        };
        setVerificationResult(result);
        console.log("Verification result set:", result, "Matched shipment:", shipment);
        setCameraError(null);
      } catch (error: any) {
        setVerificationResult(null);
        if (error.response) {
          setCameraError(
            `API error: ${error.response.status} - ${
              error.response.data?.message || "Invalid batch ID or server error"
            }`,
          );
        } else if (error.request) {
          setCameraError("Network error: Unable to reach the server. Check your connection.");
        } else {
          setCameraError("Error verifying batch. Please try again.");
        }
      } finally {
        setIsVerifying(false);
      }
    }
  };

  const handleManualSubmit = async () => {
    if (manualBatchId.trim()) {
      console.log("Manual submit with batchId:", manualBatchId);
      await handleScan(manualBatchId);
      setManualBatchId("");
    }
  };

  const handleError = (error: any) => {
    if (error.name === "NotAllowedError") {
      setCameraError("Camera access denied. Please allow camera access in your browser settings.");
    } else if (error.name === "NotFoundError") {
      setCameraError("No camera found. Please ensure a camera is connected.");
    } else {
      setCameraError("Error scanning QR code. Ensure the QR code is clear, well-lit, and centered.");
    }
  };

  const toggleCamera = async () => {
    const newFacingMode = facingMode === "environment" ? "user" : "environment";
    console.log("Toggling camera to:", newFacingMode);
    setFacingMode(newFacingMode);
    if (codeReaderRef.current && isScannerEnabled) {
      codeReaderRef.current.reset();
      await startScanner(newFacingMode);
    }
  };

  const stopStream = () => {
    console.log("Stopping stream, current stream:", streamRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        console.log("Stopping track:", track);
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
      console.log("Video srcObject cleared");
    }
  };

  const toggleScanner = async () => {
    console.log("Toggling scanner, current state:", isScannerEnabled);
    if (isScannerEnabled) {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
        codeReaderRef.current = null;
        console.log("Code reader reset");
      }
      stopStream();
      setCameraError(null);
    } else {
      if (videoRef.current) {
        await startScanner(facingMode);
      }
    }
    setIsScannerEnabled(!isScannerEnabled);
  };

  const startScanner = async (facingMode: "environment" | "user") => {
    if (videoRef.current) {
      try {
        console.log("Starting scanner with facingMode:", facingMode);
        const codeReader = new BrowserQRCodeReader();
        codeReaderRef.current = codeReader;
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
        });
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        console.log("Stream assigned to video:", stream);
        codeReader
          .decodeFromVideoDevice(undefined, videoRef.current, (result, error) => {
            if (result) {
              handleScan(result.getText());
            }
            if (error) {
              handleError(error);
            }
          }, { constraints: { facingMode } })
          .catch((err) => handleError(err));
      } catch (err) {
        handleError(err);
      }
    }
  };

  const fetchShipments = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/shipments/all`);
      console.log("Fetched shipments:", response.data.shipments);
      setShipments(response.data.shipments);
    } catch (error) {
      console.error("Fetch shipments error:", error);
      toast({
        title: "Error",
        description: "Failed to fetch shipments. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/shipments/stats`);
      console.log("Fetched analytics:", response.data);
      setAnalytics(response.data);
    } catch (error) {
      console.error("Fetch analytics error:", error);
      toast({
        title: "Error",
        description: "Failed to fetch analytics data. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleStatusUpdate = async (shipmentId: string, accepted: boolean) => {
    console.log("Handling status update for shipmentId:", shipmentId, "Accepted:", accepted);
    try {
      // Update shipment status
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/shipments/${shipmentId}/status`, { accepted });
      console.log("Status update response:", response.data);
      toast({
        title: "Success",
        description: `Shipment marked as ${accepted ? "Received" : "Issue"}.`,
      });

      if (accepted && verificationResult) {
        // Update batch status
        const batchUpdateResponse = await axios.put(
          `${import.meta.env.VITE_API_URL}/api/batches/${verificationResult.batchId}/status`,
          { status: "Active" }
        );
        console.log("Batch status updated:", batchUpdateResponse.data);

        // Update transfer status
        const transferUpdateResponse = await axios.put(
          `${import.meta.env.VITE_API_URL}/api/manufacturerTransfers/${verificationResult.batchId}/accept`
        );
        console.log("Transfer status updated:", transferUpdateResponse.data);

        // Find the shipment to get destination (distributorId)
        const shipment = shipments.find((s: any) => s.shipmentId === shipmentId);

        // Add batch to DistributorInventory
        const inventoryResponse = await axios.post(`${import.meta.env.VITE_API_URL}/api/inventory`, {
          batchId: verificationResult.batchId,
          drugName: verificationResult.drug,
          batchSize: verificationResult.units,
          ipfsHash: manualBatchId || verificationResult.batchId, // Use manualBatchId if available, else batchId
          manufacturerId: verificationResult.manufacturerId || shipment?.origin || "UNKNOWN_MANUFACTURER", // Fallback to shipment origin
          distributorId: shipment?.destination || "UNKNOWN_DISTRIBUTOR", // Use shipment destination as distributorId
          status: "Active",
        });
        console.log("Batch added to inventory:", inventoryResponse.data);

        toast({
          title: "Success",
          description: "Shipment, batch, transfer, and inventory updated successfully.",
        });

        // Reset verification result for new scan
        setVerificationResult(null);
        setManualBatchId("");
        console.log("Reset verification result for new scan");
      }

      await fetchShipments();
      await fetchAnalytics();
    } catch (error: any) {
      console.error("Status update error:", error);
      toast({
        title: "Error",
        description: `Failed to update shipment status or inventory: ${error.response?.data?.message || error.message}`,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    console.log("useEffect triggered, isScannerEnabled:", isScannerEnabled);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError("This browser does not support camera access. Please use a modern browser.");
      setIsScannerEnabled(false);
      console.log("Camera access not supported");
      return;
    }

    if (isScannerEnabled) {
      startScanner(facingMode);
    }
    fetchShipments();
    fetchAnalytics();

    return () => {
      console.log("Cleaning up useEffect");
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
        codeReaderRef.current = null;
      }
      stopStream();
    };
  }, [isScannerEnabled, facingMode]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Shipment Management</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">In Transit</p>
              <Truck className="h-5 w-5 text-[#007BFF]" />
            </div>
            <h3 className="text-3xl font-bold">{analytics.totalShipments}</h3>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Delivered</p>
              <CheckCircle className="h-5 w-5 text-[#28A745]" />
            </div>
            <h3 className="text-3xl font-bold">{analytics.verifiedShipments}</h3>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Pending</p>
              <Clock className="h-5 w-5 text-[#FFC107]" />
            </div>
            <h3 className="text-3xl font-bold">{analytics.pendingShipments}</h3>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Issues</p>
              <AlertTriangle className="h-5 w-5 text-[#DC3545]" />
            </div>
            <h3 className="text-3xl font-bold">{analytics.issuesDetected}</h3>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-2xl font-bold">Shipments</h2>
        <div className="flex items-center mt-4 md:mt-0 space-x-2">
          <Button className="bg-[#007BFF] hover:bg-blue-600">
            <Plus className="mr-2 h-4 w-4" /> New Shipment
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 mb-6">
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
                  {isScannerEnabled ? (
                    <video
                      ref={videoRef}
                      style={{ width: "100%", maxWidth: "400px", height: "auto" }}
                      className="transform scale-x-[-1]"
                    />
                  ) : (
                    <div className="w-full max-w-[400px] h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                      <p className="text-sm text-muted-foreground">Scanner Disabled</p>
                    </div>
                  )}
                  <p className="mt-2 text-sm text-muted-foreground">
                    Scan a QR code or enter batch ID manually
                  </p>
                  {cameraError && (
                    <p className="mt-2 text-sm text-red-500">{cameraError}</p>
                  )}
                  <div className="flex gap-2 mt-2">
                    <Button
                      onClick={toggleCamera}
                      variant="outline"
                      disabled={isVerifying || !isScannerEnabled}
                    >
                      Switch to {facingMode === "environment" ? "Front" : "Rear"} Camera
                    </Button>
                    <Button
                      onClick={toggleScanner}
                      variant="outline"
                      disabled={isVerifying}
                    >
                      {isScannerEnabled ? (
                        <>
                          <VideoOff className="mr-2 h-4 w-4" /> Disable Scanner
                        </>
                      ) : (
                        <>
                          <Video className="mr-2 h-4 w-4" /> Enable Scanner
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="flex gap-2 mt-4 w-full max-w-[400px]">
                    <Input
                      type="text"
                      placeholder="Enter batch ID manually"
                      value={manualBatchId}
                      onChange={(e) => setManualBatchId(e.target.value)}
                      className="flex-1"
                      disabled={isVerifying}
                    />
                    <Button
                      onClick={handleManualSubmit}
                      className="bg-[#007BFF] hover:bg-blue-600"
                      disabled={isVerifying}
                    >
                      {isVerifying ? "Verifying..." : "Verify"}
                    </Button>
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
                    <div className="flex items-center text-sm mb-3">
                      <span className="font-medium mr-1">Shipment ID:</span>
                      <span>{verificationResult.shipmentId || "Not found"}</span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-[#28A745] hover:bg-green-600 flex-1"
                        onClick={async () => {
                          console.log("Accept button clicked, shipmentId:", verificationResult.shipmentId, "batchId:", verificationResult.batchId);
                          if (verificationResult.shipmentId) {
                            await handleStatusUpdate(verificationResult.shipmentId, true);
                          } else {
                            console.log("No shipment ID found for batch:", verificationResult.batchId);
                            toast({
                              title: "Error",
                              description: "No shipment ID found for this batch.",
                              variant: "destructive",
                            });
                          }
                        }}
                        disabled={!verificationResult.shipmentId || isVerifying}
                      >
                        <CheckCircle className="mr-1 h-4 w-4" /> Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-[#DC3545] flex-1"
                        onClick={async () => {
                          console.log("Reject button clicked, shipmentId:", verificationResult.shipmentId, "batchId:", verificationResult.batchId);
                          if (verificationResult.shipmentId) {
                            try {
                              // Update shipment status
                              await handleStatusUpdate(verificationResult.shipmentId, false);

                              // Update transfer status
                              const transferUpdateResponse = await axios.put(
                                `${import.meta.env.VITE_API_URL}/api/manufacturerTransfers/${verificationResult.batchId}/status`,
                                { accepted: false }
                              );
                              console.log("Transfer marked as failed:", transferUpdateResponse.data);

                              toast({
                                title: "Success",
                                description: "Shipment and transfer marked as failed.",
                              });
                            } catch (error: any) {
                              console.error("Error updating shipment or transfer:", error);
                              toast({
                                title: "Error",
                                description: error.response?.data?.message || "Failed to update shipment or transfer.",
                                variant: "destructive",
                              });
                            }
                          } else {
                            console.log("No shipment ID found for batch:", verificationResult.batchId);
                            toast({
                              title: "Error",
                              description: "No shipment ID found for this batch.",
                              variant: "destructive",
                            });
                          }
                        }}
                        disabled={!verificationResult.shipmentId || isVerifying}
                      >
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
            <CardTitle>Shipment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium">{shipments[0]?.shipmentId || "SH-2024-001"}</h3>
                  <p className="text-sm text-muted-foreground">
                    {shipments[0]?.products[0]?.batchId || "Paracetamol"} ({shipments[0]?.products[0]?.quantity || 1500} units)
                  </p>
                </div>
                <Badge className={
                  shipments[0]?.status === "Received" ? "bg-green-500" :
                  shipments[0]?.status === "Issue" ? "bg-red-500" :
                  shipments[0]?.status === "In Transit" ? "bg-blue-500" :
                  "bg-yellow-500"
                }>
                  {shipments[0]?.status || "In Transit"}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs font-medium">Origin:</p>
                    <p className="text-sm">{shipments[0]?.origin || "Manufacturing Plant A"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium">Destination:</p>
                    <p className="text-sm">{shipments[0]?.destination || "Main Distributor Warehouse"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs font-medium">Departure:</p>
                    <p className="text-sm">{shipments[0]?.departureDate ? new Date(shipments[0].departureDate).toLocaleString() : "2024-04-18, 08:30 AM"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium">ETA:</p>
                    <p className="text-sm">{shipments[0]?.eta ? new Date(shipments[0].eta).toLocaleString() : "2024-04-22, 02:00 PM"}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium">Carrier:</p>
                  <p className="text-sm">{shipments[0]?.carrier || "SecurePharm Logistics"}</p>
                </div>

                <div>
                  <p className="text-xs font-medium">Tracking:</p>
                  <p className="text-sm">{shipments[0]?.trackingDetails || "SP12345678"}</p>
                </div>

                <div>
                  <p className="text-xs font-medium">Temperature Control:</p>
                  <p className="text-sm">{shipments[0]?.temperature ? `${shipments[0].temperature}°C (Monitored)` : "15-25°C (Monitored)"}</p>
                </div>

                <div className="pt-2">
                  <Button className="w-full bg-[#007BFF] hover:bg-blue-600">
                    <Truck className="mr-2 h-4 w-4" /> Track Shipment
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Shipment Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search by shipment ID, destination, or product..."
                className="pl-8 bg-white"
              />
            </div>
            <Button variant="outline" className="flex items-center">
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Shipments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shipment ID</TableHead>
                <TableHead>Origin</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Departure</TableHead>
                <TableHead>ETA</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shipments.map((shipment: any) => (
                <TableRow key={shipment.shipmentId}>
                  <TableCell className="font-medium">{shipment.shipmentId}</TableCell>
                  <TableCell>{shipment.origin}</TableCell>
                  <TableCell>{shipment.destination}</TableCell>
                  <TableCell>
                    {shipment.products.map((product: any) => (
                      <div key={product.batchId}>
                        {product.batchId} ({product.quantity} units)
                      </div>
                    ))}
                  </TableCell>
                  <TableCell>{new Date(shipment.departureDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(shipment.eta).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge className={
                      shipment.status === "Received" ? "bg-green-500" :
                      shipment.status === "Issue" ? "bg-red-500" :
                      shipment.status === "In Transit" ? "bg-blue-500" :
                      "bg-yellow-500"
                    }>
                      {shipment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {shipments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    No shipments found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button variant="outline" size="sm">
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}