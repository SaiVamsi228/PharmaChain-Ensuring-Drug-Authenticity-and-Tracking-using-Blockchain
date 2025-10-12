import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ethers } from "ethers";
import { BrowserQRCodeReader } from "@zxing/library";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { AlertTriangle, Calendar, CheckCircle, QrCode, Stethoscope, Upload, User, Video, VideoOff } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import PharmaChainABI from "../../abis/PharmaChain.json";

const apiUrl = import.meta.env.VITE_API_URL;
const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
const pharmacistId = "SINGLE_PHARMACIST";

interface InventoryItem {
  batchId: string;
  drugName: string;
  batchSize: number;
  expiryDate?: string;
  isRecalled?: boolean;
  isDispensed?: boolean;
}

interface DispensingRecord {
  patientId: string;
  batchId: string;
  drugName: string;
  quantity: number;
  date: string;
  status: "Completed" | "Recalled";
  transactionHash?: string;
}

interface VerificationResult {
  batchId: string;
  drugName: string;
  quantity: number;
  isGenuine: boolean;
  isRecalled: boolean;
  isDispensed: boolean;
}

export default function DispensingPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [dispensingHistory, setDispensingHistory] = useState<DispensingRecord[]>([]);
  const [patientId, setPatientId] = useState("P123");
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [quantity, setQuantity] = useState(10);
  const [daysSupply, setDaysSupply] = useState(5);
  const [directions, setDirections] = useState("Take 1 tablet twice daily with food");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isScannerEnabled, setIsScannerEnabled] = useState(true);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [pharmacistAddress, setPharmacistAddress] = useState<string | null>(null);
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

  // Fetch inventory and dispensing history
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const endpoint = `${apiUrl}/api/pharmacist/shipments/inventory`;
        console.log("Fetching inventory from:", endpoint);
        const response = await axios.get(endpoint);
        console.log("Inventory response:", response.data);
        const inventoryData = response.data.inventory || [];
        if (inventoryData.length === 0) {
          console.warn("Inventory is empty");
          toast({
            title: "Warning",
            description: "No inventory items found. Please accept shipments to populate inventory.",
            variant: "destructive",
          });
        } else {
          console.log("Available inventory items:", inventoryData.map((item: InventoryItem) => ({
            batchId: item.batchId,
            drugName: item.drugName,
            isDispensed: item.isDispensed,
            isRecalled: item.isRecalled
          })));
        }
        setInventory(inventoryData);
      } catch (error: any) {
        console.error("Error fetching inventory:", {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        });
        toast({
          title: "Error",
          description: `Failed to fetch inventory: ${error.response?.data?.message || error.message}`,
          variant: "destructive",
        });
      }
    };

    const fetchDispensations = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/dispensations`);
        console.log("Dispensations response:", response.data);
        setDispensingHistory(response.data.dispensations || []);
      } catch (error: any) {
        console.error("Error fetching dispensations:", error);
        toast({
          title: "Error",
          description: `Failed to fetch dispensations: ${error.response?.data?.message || error.message}`,
          variant: "destructive",
        });
      }
    };

    fetchInventory();
    fetchDispensations();
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

  // Start QR code scanner
  const startScanner = async (facingMode: "environment" | "user" = "environment") => {
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
              handleScanQR(result.getText());
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

  // Toggle scanner
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

  // Handle QR code scan with smart contract verification
  const handleScanQR = async (data: string) => {
    if (data) {
      setIsVerifying(true);
      console.log("Scanning QR code:", data);

      let ipfsHash = data;

      try {
        // Attempt smart contract verification
        let batchData;
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const contract = new ethers.Contract(contractAddress, PharmaChainABI, provider);
          
          const response = await axios.post(`${apiUrl}/api/batches/verify`, { ipfsHash: data });
          
          console.log("Verify response:", response.data);

          batchData = {
            batchId: response.data.batchId,
            drugName: response.data.drug || "Unknown Drug",
            quantity: response.data.units || 0,
            isGenuine: response.data.verified,
            isRecalled: response.data.isRecalled || false,
            isDispensed: response.data.isDispensed || false,
          };
        } catch (contractError: any) {
          console.error("Smart contract verification failed:", contractError);
          // Fallback to backend verification
          const response = await axios.post(`${apiUrl}/api/batches/verify`, { ipfsHash: data });
          console.log("Backend verify response:", response.data);
          batchData = response.data;
        }
        
        console.log(batchData);
        // Find matching inventory item
        const fetchInventoryItem = async (batchId: string) => {
          try {
            const response = await axios.get(`${apiUrl}/api/pharmacist/shipments/inventory`);
            const inventoryData = response.data.inventory || [];
            return inventoryData.find((item: InventoryItem) => item.batchId === batchId);
          } catch (error: any) {
            console.error("Error fetching inventory item:", error);
            throw new Error("Failed to fetch inventory item from backend.");
          }
        };

        const inventoryItem = await fetchInventoryItem(batchData.batchId);
        if (!inventoryItem) {
          throw new Error("Batch not found in inventory.");
        }

        const result = {
          batchId: batchData.batchId,
          drugName: batchData.drugName || inventoryItem.drugName || "Unknown Drug",
          quantity: batchData.quantity || inventoryItem.batchSize || 0,
          isGenuine: batchData.isGenuine,
          isRecalled: batchData.isRecalled || inventoryItem.isRecalled || false,
          isDispensed: batchData.isDispensed || inventoryItem.isDispensed || false,
        };
        console.log("Verification result set:", result);
        setVerificationResult(result);
        setSelectedBatchId(result.batchId);
        setCameraError(null);
        toast({
          title: result.isGenuine && !result.isRecalled && !result.isDispensed ? "Verification Successful" : "Verification Failed",
          description: `Batch ${result.batchId} is ${result.isGenuine && !result.isRecalled && !result.isDispensed ? "genuine" : "invalid"}.`,
          variant: result.isGenuine && !result.isRecalled && !result.isDispensed ? "default" : "destructive",
        });
      } catch (error: any) {
        setVerificationResult(null);
        setSelectedBatchId("");
        console.error("Scan error:", error);
        setCameraError(
          error.response
            ? `API error: ${error.response.status} - ${error.response.data?.message || "Invalid batch ID"}`
            : error.request
            ? "Network error: Unable to reach server."
            : error.message || "Error verifying batch."
        );
        toast({
          title: "Error",
          description: `Failed to verify batch: ${error.response?.data?.message || error.message}`,
          variant: "destructive",
        });
      } finally {
        setIsVerifying(false);
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!verificationResult || !verificationResult.isGenuine || verificationResult.isRecalled || verificationResult.isDispensed) {
    toast({
      title: "Error",
      description: "Cannot dispense: Batch is invalid, recalled, or already dispensed.",
      variant: "destructive",
    });
    return;
  }

  if (!pharmacistAddress) {
    toast({
      title: "Error",
      description: "Pharmacist address not available. Please connect MetaMask.",
      variant: "destructive",
    });
    return;
  }

  setFormSubmitted(true);
  try {
    // Initialize ethers provider and signer
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, PharmaChainABI, signer);

    // Generate patient hash
    const patientHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(patientId));

    // Call dispenseBatch on the smart contract
    const tx = await contract.dispenseBatch(selectedBatchId, patientHash, { gasLimit: 200000 });
    console.log("Transaction sent:", tx);
    await tx.wait();
    console.log("Transaction confirmed:", tx);

    // Send dispensing details to backend
    const response = await axios.post(`${apiUrl}/api/dispensations/dispense`, {
      batchId: selectedBatchId,
      patientId,
      quantity,
      pharmacistId: pharmacistAddress,
      transactionHash: tx.hash, // Send transaction hash to backend
    });
    console.log("Dispense response:", response.data);

    // Update dispensing history
    setDispensingHistory((prev) => [response.data.dispensingRecord, ...prev].slice(0, 5));

    // Update inventory
    if (response.data.newBatch) {
      setInventory((prev) => [
        ...prev.filter((item) => item.batchId !== selectedBatchId),
        response.data.newBatch,
        { ...prev.find((item) => item.batchId === selectedBatchId), batchSize: quantity, isDispensed: true },
      ]);
    } else {
      setInventory((prev) =>
        prev.map((item) =>
          item.batchId === selectedBatchId ? { ...item, isDispensed: true } : item
        )
      );
    }

    toast({
      title: "Success",
      description: `Dispensed ${quantity} units of batch ${selectedBatchId}. Transaction: ${tx.hash}`,
      variant: "success",
    });

    // Reset form
    setPatientId("P123");
    setSelectedBatchId("");
    setQuantity(10);
    setDaysSupply(5);
    setDirections("Take 1 tablet twice daily with food");
    setVerificationResult(null);
    if (isScannerEnabled && codeReaderRef.current) {
      codeReaderRef.current.reset();
      await startScanner(facingMode);
    }
  } catch (error: any) {
    console.error("Dispense error:", error);
    toast({
      title: "Error",
      description: `Failed to dispense: ${error.message}`,
      variant: "destructive",
    });
  } finally {
    setTimeout(() => setFormSubmitted(false), 3000);
  }
};

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Medication Dispensing</h1>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Verify Medication</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 rounded-full bg-blue-100">
                    <QrCode className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={toggleScanner}
                      className="bg-[#28A745] hover:bg-green-600"
                      disabled={isVerifying}
                    >
                      {isScannerEnabled ? (
                        <>
                          <VideoOff className="mr-2 h-4 w-4" /> Stop Scanner
                        </>
                      ) : (
                        <>
                          <Video className="mr-2 h-4 w-4" /> Start Scanner
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                <div className="text-center mb-4">
                  <h3 className="text-sm font-medium">Scan Medication Batch</h3>
                  <p className="text-xs text-muted-foreground">Place QR code in the center of the camera</p>
                </div>
                {isScannerEnabled ? (
                  <video ref={videoRef} className="w-full h-full rounded-lg bg-gray-100 transform scale-x-[-1]" />
                ) : (
                  <div className="w-full h-full border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                    <p className="text-sm text-muted-foreground">Scanner Disabled</p>
                  </div>
                )}

                {cameraError && (
                  <div className="p-3 bg-red-100 border border-red-200 rounded text-center mt-4">
                    <span className="text-red-700">{cameraError}</span>
                  </div>
                )}

                {verificationResult && (
                  <div className={`p-3 border rounded text-center mt-4 ${verificationResult.isGenuine && !verificationResult.isRecalled && !verificationResult.isDispensed ? "bg-green-100 border-green-200" : "bg-red-100 border-red-200"}`}>
                    <div className="flex items-center justify-center">
                      <span className={`font-medium ${verificationResult.isGenuine && !verificationResult.isRecalled && !verificationResult.isDispensed ? "text-green-700" : "text-red-700"} mr-1`}>
                        {verificationResult.batchId}
                      </span>
                      {verificationResult.isGenuine && !verificationResult.isRecalled && !verificationResult.isDispensed ? (
                        <CheckCircle className="h-4 w-4 text-green-700" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-700" />
                      )}
                    </div>
                    <p className={`text-xs ${verificationResult.isGenuine && !verificationResult.isRecalled && !verificationResult.isDispensed ? "text-green-700" : "text-red-700"} mt-1`}>
                      {verificationResult.drugName} - {verificationResult.quantity} units
                    </p>
                    {verificationResult.isRecalled && (
                      <div className="mt-2 text-xs text-red-600 font-medium">Warning: This batch has been recalled</div>
                    )}
                    {verificationResult.isDispensed && (
                      <div className="mt-2 text-xs text-red-600 font-medium">Warning: This batch is already dispensed</div>
                    )}
                    {!verificationResult.isGenuine && (
                      <div className="mt-2 text-xs text-red-600 font-medium">Warning: This batch is not genuine</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dispense Medication</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="patient-id">Patient ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="patient-id"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                  />
                  <Button type="button" variant="outline" className="shrink-0">
                    <User className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="medication">Medication</Label>
                <select
                  id="medication"
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                  disabled={!!verificationResult}
                >
                  <option value="">Select a batch</option>
                  {inventory.length === 0 ? (
                    <option value="" disabled>
                      No available inventory
                    </option>
                  ) : (
                    inventory
                      .filter((item) => !(item.isDispensed ?? false) && !(item.isRecalled ?? false))
                      .map((item) => (
                        <option key={item.batchId} value={item.batchId}>
                          {item.drugName || "Unknown Drug"} ({item.batchId})
                        </option>
                      ))
                  )}
                </select>
                {inventory.length === 0 && (
                  <p className="text-xs text-red-600 mt-1">
                    No inventory available. Please accept shipments in the Shipments page.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="days-supply">Days Supply</Label>
                  <Input
                    id="days-supply"
                    type="number"
                    value={daysSupply}
                    onChange={(e) => setDaysSupply(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="directions">Directions</Label>
                <Input
                  id="directions"
                  value={directions}
                  onChange={(e) => setDirections(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="prescription">Prescription</Label>
                <div className="flex items-center">
                  <Input id="prescription" type="file" className="hidden" />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full flex items-center justify-center"
                    onClick={() => document.getElementById("prescription")?.click()}
                  >
                    <Calendar className="mr-2 h-4 w-4" /> Upload Prescription
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Prescription uploaded: rx-{patientId}-{Date.now()}.pdf</p>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#007BFF] hover:bg-blue-600"
                disabled={formSubmitted || !selectedBatchId || !patientId || quantity <= 0 || isVerifying || !verificationResult}
              >
                <Stethoscope className="mr-2 h-4 w-4" /> Confirm Dispensing
              </Button>

              {formSubmitted && (
                <div className="p-3 bg-green-100 border border-green-300 text-green-700 rounded fadeIn">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span>Medication dispensed successfully! Transaction recorded on blockchain.</span>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Dispensing History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient ID</TableHead>
                <TableHead>Medication</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dispensingHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No dispensing records found.
                  </TableCell>
                </TableRow>
              ) : (
                dispensingHistory.map((record) => (
                  <TableRow key={`${record.batchId}-${record.date}`}>
                    <TableCell className="font-medium">{record.patientId}</TableCell>
                    <TableCell>{record.drugName}</TableCell>
                    <TableCell>{record.batchId}</TableCell>
                    <TableCell>{record.quantity}</TableCell>
                    <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge className={record.status === "Completed" ? "bg-green-500" : "bg-red-500"}>
                        <CheckCircle className="mr-1 h-3 w-3" /> {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <Upload className="h-3 w-3 mr-1" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}