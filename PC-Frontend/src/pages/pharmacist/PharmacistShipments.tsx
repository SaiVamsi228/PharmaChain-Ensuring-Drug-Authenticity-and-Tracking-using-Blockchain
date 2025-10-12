import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { ethers } from "ethers";
import { BrowserQRCodeReader } from "@zxing/library";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Search, Filter, Plus, Download, Truck, Clock, CheckCircle, AlertTriangle, X, Video, VideoOff } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { Shipment } from "../../types/shipment";
import PharmaChainABI from "../../abis/PharmaChain.json";

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

export default function PharmacistShipmentsPage() {
  const [verificationResult, setVerificationResult] = useState<{
    batchId: string;
    drug: string;
    quantity: number;
    verified: boolean;
    shipmentId?: string;
    distributorId?: string;
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
  const [pharmacistAddress, setPharmacistAddress] = useState<string | null>(null);
  const [isLoadingShipments, setIsLoadingShipments] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserQRCodeReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  // Initialize pharmacist address from MetaMask
  useEffect(() => {
    const getPharmacistAddress = async () => {
      if (window.ethereum) {
        try {
          await window.ethereum.request({ method: "eth_requestAccounts" });
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const address = await signer.getAddress();
          console.log("Pharmacist address retrieved:", address);
          setPharmacistAddress(address.toLowerCase());
        } catch (error: any) {
          console.error("MetaMask error:", error);
          setCameraError("Failed to connect to MetaMask. Please ensure MetaMask is installed.");
          toast({
            title: "MetaMask Error",
            description: "Failed to connect to MetaMask.",
            variant: "destructive",
          });
        }
      } else {
        console.error("MetaMask not installed");
        setCameraError("MetaMask is not installed.");
      }
    };
    getPharmacistAddress();
  }, []);

  // Fetch all shipments
  const fetchShipments = async () => {
    setIsLoadingShipments(true);
    try {
      console.log("Fetching all shipments");
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/pharmacist/shipments/all`);
      console.log("Shipments response:", response.data);
      setShipments(response.data.shipments?.reverse() || []);
    } catch (error: any) {
      console.error("Fetch shipments error:", error);
      toast({
        title: "Error",
        description: `Failed to fetch shipments: ${error.response?.data?.message || error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoadingShipments(false);
    }
  };

  // Fetch shipment analytics
  const fetchAnalytics = async () => {
    try {
      console.log("Fetching analytics");
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/pharmacist/shipments/stats`);
      console.log("Analytics response:", response.data);
      setAnalytics(response.data);
    } catch (error: any) {
      console.error("Fetch analytics error:", error);
      toast({
        title: "Error",
        description: `Failed to fetch analytics: ${error.response?.data?.message || error.message}`,
        variant: "destructive",
      });
    }
  };

  // Handle QR code scan with smart contract verification
  const handleScan = async (data: string | null) => {
    if (data) {
      setIsVerifying(true);
      console.log("Scanning QR code:", data);

      let ipfsHash = data

      try {
        // Attempt smart contract verification
        let batchData;
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const contract = new ethers.Contract(contractAddress, PharmaChainABI, provider);
          
          const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/batches/verify`, { ipfsHash: data });
          
          console.log("Verify response:", response.data);

          console.log(response.data.batchId)

          batchData = {
            batchId: response.data.batchId,
            drugName: response.data.drug, 
            quantity: response.data.units, 
            isGenuine: response.data.verified
          };
        } catch (contractError: any) {
          console.error("Smart contract verification failed:", contractError);
          // Fallback to backend verification
          const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/batches/verify`, { ipfsHash: data });
          console.log("Backend verify response:", response.data);
          batchData = response.data;
        }

        // Find matching shipment
        let shipment = shipments.find((s: any) => s.products.some((p: any) => p.batchId === batchData.batchId));
        if (!shipment) {
          console.log("Shipment not found locally. Fetching from database...");
          const shipmentResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/pharmacist/shipments/batch/${batchData.batchId}`);
          shipment = shipmentResponse.data.shipment;
          console.log("Fetched shipment:", shipment);
        }

        const result = {
          batchId: batchData.batchId,
          drug: batchData.drugName || "Unknown Drug",
          quantity: batchData.quantity || 0,
          verified: batchData.isGenuine && !batchData.isRecalled && !batchData.isDispensed,
          shipmentId: shipment?.shipmentId,
          distributorId: shipment?.origin,
        };
        console.log("Verification result set:", result);
        setVerificationResult(result);
        setCameraError(null);
      } catch (error: any) {
        setVerificationResult(null);
        console.error("Scan error:", error);
        setCameraError(
          error.response
            ? `API error: ${error.response.status} - ${error.response.data?.message || "Invalid batch ID"}`
            : error.request
            ? "Network error: Unable to reach server."
            : "Error verifying batch."
        );
      } finally {
        setIsVerifying(false);
      }
    }
  };

  // Handle manual batch ID submission
  const handleManualSubmit = async () => {
    if (manualBatchId.trim()) {
      console.log("Manual submit with batchId:", manualBatchId);
      await handleScan(manualBatchId);
      setManualBatchId("");
    }
  };

  // Handle camera errors
  const handleError = (error: any) => {
    if (error.name === "NotAllowedError") {
      setCameraError("Camera access denied. Please allow camera access.");
    } else if (error.name === "NotFoundError") {
      setCameraError("No camera found. Please ensure a camera is connected.");
    } else {
      setCameraError("Error scanning QR code. Ensure QR code is clear and centered.");
    }

  };

  // Toggle camera facing mode
  const toggleCamera = async () => {
    const newFacingMode = facingMode === "environment" ? "user" : "environment";
    console.log("Toggling camera to:", newFacingMode);
    setFacingMode(newFacingMode);
    if (codeReaderRef.current && isScannerEnabled) {
      codeReaderRef.current.reset();
      await startScanner(newFacingMode);
    }
  };

  // Stop camera stream
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

  // Toggle scanner on/off
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

  // Start QR code scanner
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

  // Handle shipment status update with optimistic UI update
  const handleStatusUpdate = async (shipmentId: string, accepted: boolean) => {
    console.log("Handling status update for shipmentId:", shipmentId, "Accepted:", accepted);
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask not installed.");
      }

      if (!verificationResult) {
        throw new Error("No batch verification result.");
      }

      // Check if batch is already verified
      const isAlreadyVerified = shipments.some(
        (s: any) => s.products.some((p: any) => p.batchId === verificationResult.batchId && s.status === "Verified")
      );
      if (isAlreadyVerified) {
        toast({
          title: "Warning",
          description: "This batch is already verified and in inventory.",
          variant: "warning",
        });
        return;
      }

      // Validate payload
      const payload = {
        batchId: verificationResult.batchId,
        drugName: verificationResult.drug,
        batchSize: verificationResult.quantity,
        ipfsHash:  data,
        distributorId: verificationResult.distributorId || shipment.origin || "SINGLE_DISTRIBUTOR",
        pharmacistId: pharmacistAddress || "SINGLE_PHARMACIST",
        status: "Active",
      };
      if (!payload.batchId || !payload.drugName || !payload.batchSize) {
        throw new Error("Invalid batch data.");
      }
      console.log("Inventory POST payload:", payload);

      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, PharmaChainABI, signer);

      const reason = accepted ? "Shipment accepted" : "Shipment rejected";
      const tx = await contract.logShipmentStatus(
        verificationResult.batchId,
        accepted,
        reason,
        { gasLimit: 200000 }
      );
      await tx.wait();
      console.log("Blockchain transaction:", tx);

      const shipmentResponse = await axios.put(`${import.meta.env.VITE_API_URL}/api/pharmacist/shipments/${shipmentId}/status`, { accepted });
      console.log("Shipment status updated:", shipmentResponse.data);

      if (accepted && verificationResult) {
        const shipment = shipments.find((s: any) => s.shipmentId === shipmentId);
        if (!shipment) {
          throw new Error("Shipment not found for inventory update.");
        }

        try {
          const inventoryResponse = await axios.post(`${import.meta.env.VITE_API_URL}/api/pharmacist/shipments/inventory`, payload);
          console.log("Inventory updated:", inventoryResponse.data);
          toast({
            title: "Success",
            description: "Shipment successfully added to inventory.",
            variant: "success",
          });
        } catch (error: any) {
          if (error.response?.status === 400) {
            toast({
              title: "Warning",
              description: error.response.data.message || "Batch already exists in inventory.",
              variant: "warning",
            });
          } else {
            throw error; // Re-throw other errors
          }
        }

        setVerificationResult(null);
        setManualBatchId("");
        if (isScannerEnabled && codeReaderRef.current) {
          codeReaderRef.current.reset();
          await startScanner(facingMode);
        }
        console.log("Scanner reset for new scan");
      } else if (!accepted && verificationResult) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/distributorTransfers/${verificationResult.batchId}/status`,
          { accepted: false }
        );
        console.log("Transfer marked as Failed");
        toast({
          title: "Success",
          description: "Shipment and transfer marked as failed.",
          variant: "success",
        });
      }

      // Fetch latest shipments and analytics to ensure sync
      await Promise.all([fetchShipments(), fetchAnalytics()]);
    } catch (error: any) {
      // Revert optimistic update on error
      setShipments(shipments);
      console.error("Status update error:", error);
      toast({
        title: "Error",
        description: `Failed to update shipment: ${error.response?.data?.message || error.message}`,
        variant: "destructive",
      });
    }
  };

  // Fetch shipments and analytics on mount
  useEffect(() => {
    console.log("Fetching initial data");
    fetchShipments();
    fetchAnalytics();
  }, []);

  // Initialize scanner
  useEffect(() => {
    console.log("Scanner useEffect, isScannerEnabled:", isScannerEnabled);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError("Browser does not support camera access.");
      setIsScannerEnabled(false);
      console.log("Camera access not supported");
      return;
    }

    if (isScannerEnabled) {
      startScanner(facingMode);
    }

    return () => {
      console.log("Cleaning up scanner");
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
        codeReaderRef.current = null;
      }
      stopStream();
    };
  }, [isScannerEnabled, facingMode]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Pharmacist Shipment Management</h1>

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
              <p className="text-sm font-medium">Verified</p>
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
                  <div className="p-3 bg-gray-50 rounded-lg">
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
                      <span>{verificationResult.quantity}</span>
                    </div>
                    <div className="flex items-center text-sm mb-3">
                      <span className="font-medium mr-1">Shipment ID:</span>
                      <span>{verificationResult.shipmentId || "Not found"}</span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-[#28A745] hover:bg-green-600 flex-1"
                        onClick={() => verificationResult.shipmentId && handleStatusUpdate(verificationResult.shipmentId, true)}
                        disabled={!verificationResult.shipmentId || isVerifying}
                      >
                        <CheckCircle className="mr-1 h-4 w-4" /> Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-[#DC3545] flex-1"
                        onClick={() => verificationResult.shipmentId && handleStatusUpdate(verificationResult.shipmentId, false)}
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
                  <h3 className="font-medium">{shipments[0]?.shipmentId || "SH-2025-001"}</h3>
                  <p className="text-sm text-muted-foreground">
                    {shipments[0]?.products[0]?.batchId || "Unknown"} ({shipments[0]?.products[0]?.quantity || 0} units)
                  </p>
                </div>
                <Badge className={
                  shipments[0]?.status === "Verified" ? "bg-green-500" :
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
                    <p className="text-sm">{shipments[0]?.origin?.slice(0, 6) || "Unknown"}...{shipments[0]?.origin?.slice(-4) || ""}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium">Destination:</p>
                    <p className="text-sm">{shipments[0]?.destination?.slice(0, 6) || "Unknown"}...{shipments[0]?.destination?.slice(-4) || ""}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs font-medium">Departure:</p>
                    <p className="text-sm">{shipments[0]?.departureDate ? new Date(shipments[0].departureDate).toLocaleString() : "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium">ETA:</p>
                    <p className="text-sm">{shipments[0]?.eta ? new Date(shipments[0].eta).toLocaleString() : "N/A"}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium">Carrier:</p>
                  <p className="text-sm">{shipments[0]?.carrier || "Pharma Logistics"}</p>
                </div>

                <div>
                  <p className="text-xs font-medium">Tracking:</p>
                  <p className="text-sm">{shipments[0]?.trackingDetails || "N/A"}</p>
                </div>

                <div>
                  <p className="text-xs font-medium">Temperature Control:</p>
                  <p className="text-sm">{shipments[0]?.temperature ? `${shipments[0].temperature}°C (Monitored)` : "N/A"}</p>
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
        <CardHeader>
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
          {isLoadingShipments ? (
            <div className="text-center py-4">Loading shipments...</div>
          ) : (
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
                    <TableCell>{shipment.origin?.slice(0, 6)}...{shipment.origin?.slice(-4)}</TableCell>
                    <TableCell>{shipment.destination?.slice(0, 6)}...{shipment.destination?.slice(-4)}</TableCell>
                    <TableCell>
                      {shipment.products.map((product: any) => (
                        <div key={product.batchId}>
                          {product.batchId} ({product.quantity} units)
                        </div>
                      ))}
                    </TableCell>
                    <TableCell>{shipment.departureDate ? new Date(shipment.departureDate).toLocaleDateString() : "N/A"}</TableCell>
                    <TableCell>{shipment.eta ? new Date(shipment.eta).toLocaleDateString() : "N/A"}</TableCell>
                    <TableCell>
                      <Badge className={
                        shipment.status === "Verified" ? "bg-green-500" :
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
          )}
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button variant="outline" size="sm">Previous</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}