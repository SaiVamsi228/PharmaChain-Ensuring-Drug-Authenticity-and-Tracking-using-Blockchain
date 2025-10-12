"use client";

import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import { BrowserQRCodeReader } from "@zxing/library";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import {
  QrCode,
  Factory,
  Truck,
  Stethoscope,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle,
  Bell,
  Thermometer,
  Video,
  VideoOff,
} from "lucide-react";
import { Badge } from "../../components/ui/badge";
import axios from "axios";
import { useToast } from "../../hooks/use-toast";
import PharmaChainABI from "../../abis/PharmaChain.json";

const apiUrl = import.meta.env.VITE_API_URL;
const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

interface BatchInfo {
  batchId: string;
  drugName: string;
  quantity: number;
  expiryDate: string;
  isGenuine: boolean;
  isRecalled: boolean;
  isDispensed: boolean;
  manufacturer: string;
  transactionHash?: string;
}

interface Transfer {
  from: string;
  to: string;
  timestamp: number;
  transactionHash?: string; // Optional for transfer transactions
}

interface TimelineItemProps {
  icon: React.ReactNode;
  title: string;
  date: string;
  details: string;
  status: string;
  transactionHash?: string;
}

function TimelineItem({ icon, title, date, details, status, transactionHash }: TimelineItemProps) {
  return (
    <li className="pl-10">
      <div className="absolute left-0 flex items-center justify-center w-12 h-12 rounded-full bg-white border">
        {icon}
      </div>
      <div>
        <h3 className="font-medium">{title}</h3>
        <time className="text-xs text-muted-foreground">{date}</time>
        <p className="text-sm mt-1">{details}</p>
        {transactionHash && (
          <p className="text-sm mt-1">
            <a
              href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              View Transaction
            </a>
          </p>
        )}
        <Badge className={status === "Completed" ? "bg-green-500" : "bg-red-500"}>{status}</Badge>
      </div>
    </li>
  );
}

export default function PatientVerification() {
  const [batchInfo, setBatchInfo] = useState<BatchInfo | null>(null);
  const [transferHistory, setTransferHistory] = useState<Transfer[]>([]);
  const [isScannerEnabled, setIsScannerEnabled] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserQRCodeReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  // Initialize scanner
  useEffect(() => {
    if (isScannerEnabled && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      startScanner();
    }
    return () => {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
        codeReaderRef.current = null;
      }
      stopStream();
    };
  }, [isScannerEnabled]);

  const startScanner = async () => {
    if (videoRef.current) {
      try {
        const codeReader = new BrowserQRCodeReader();
        codeReaderRef.current = codeReader;
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        codeReader.decodeFromVideoDevice(undefined, videoRef.current, (result, error) => {
          if (result) {
            handleScanQR(result.getText());
          }
          if (error && error.name !== "NotFoundError") {
            setCameraError(`Error scanning QR code: ${error.message}`);
          }
        });
      } catch (err: any) {
        setCameraError(`Error accessing camera: ${err.message}`);
        setIsScannerEnabled(false);
      }
    }
  };

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
  };

  const toggleScanner = () => {
    if (isScannerEnabled) {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
        codeReaderRef.current = null;
      }
      stopStream();
      setCameraError(null);
    } else {
      startScanner();
    }
    setIsScannerEnabled(!isScannerEnabled);
  };

  const handleScanQR = async (data: string) => {
    setIsVerifying(true);
    try {
      // Initialize ethers provider
      const provider = new ethers.providers.JsonRpcProvider("https://rpc.sepolia.org");
      const contract = new ethers.Contract(contractAddress, PharmaChainABI, provider);

      // Assume QR code contains ipfsHash or batchId
      const identifier = data;
      let batchId = identifier;

      // Check if identifier is an ipfsHash and map to batchId
      const inventoryResponse = await axios.post(`${apiUrl}/api/batches/verify`, { ipfsHash: identifier });
      if (inventoryResponse.data.batchId) {
        batchId = inventoryResponse.data.batchId;
      }

      // Verify batch on blockchain
      const [isGenuine, isRecalled, isDispensed] = await contract.verifyBatch(batchId);

      // Fetch dispensing record
      const dispensingResponse = await axios.get(`${apiUrl}/api/patient/${batchId}`);
      const dispensingRecord = dispensingResponse.data;

      // Fetch transfer history
      const transfers = await contract.getTransferHistory(batchId); // Requires getTransferHistory in contract
      const transferHistory = transfers.map((t: any) => ({
        from: t.from,
        to: t.to,
        timestamp: Number(t.timestamp),
        transactionHash: undefined, // Add transaction hash if stored in backend
      }));

      // Set batch info
      setBatchInfo({
        batchId,
        drugName: dispensingRecord.drugName || inventoryResponse.data.drugName || "Unknown Drug",
        quantity: dispensingRecord.quantity || inventoryResponse.data.quantity || 0,
        expiryDate: dispensingRecord.expiryDate || inventoryResponse.data.expiryDate || "N/A",
        isGenuine,
        isRecalled,
        isDispensed,
        manufacturer: inventoryResponse.data.manufacturer || "Unknown",
        transactionHash: dispensingRecord.transactionHash,
      });
      setTransferHistory(transferHistory);

      toast({
        title: isGenuine && !isRecalled && isDispensed ? "Batch Verified" : "Batch Invalid",
        description: `Batch ${batchId} is ${isGenuine && !isRecalled && isDispensed ? "valid and dispensed" : "invalid or not dispensed"}.`,
        variant: isGenuine && !isRecalled && isDispensed ? "success" : "destructive",
      });
    } catch (error: any) {
      console.error("Scan error:", error);
      setCameraError(`Failed to verify batch: ${error.message}`);
      toast({
        title: "Error",
        description: `Failed to verify batch: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Medication Verification</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-center">Scan Medication QR Code</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex justify-center">
              <Button onClick={toggleScanner} disabled={isVerifying}>
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
            {isScannerEnabled ? (
              <video ref={videoRef} className="w-full h-48 rounded-lg bg-gray-100" />
            ) : (
              <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <QrCode className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-muted-foreground">Click to start QR code scanner</p>
                </div>
              </div>
            )}
            {cameraError && (
              <div className="p-3 bg-red-100 border border-red-200 rounded-lg text-center">
                <span className="text-red-700">{cameraError}</span>
              </div>
            )}
            {batchInfo && (
              <div
                className={`p-6 border rounded-lg text-center fadeIn ${
                  batchInfo.isGenuine && !batchInfo.isRecalled && batchInfo.isDispensed
                    ? "border-green-200 bg-green-50"
                    : "border-red-200 bg-red-50"
                }`}
              >
                <div className="flex items-center justify-center">
                  {batchInfo.isGenuine && !batchInfo.isRecalled && batchInfo.isDispensed ? (
                    <>
                      <CheckCircle className="h-8 w-8 text-green-500 mr-2" />
                      <span className="text-xl font-bold text-green-700">Genuine</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-8 w-8 text-red-500 mr-2" />
                      <span className="text-xl font-bold text-red-700">Invalid Product</span>
                    </>
                  )}
                </div>
                <div className="mt-4 text-left">
                  <h3 className="font-medium">{batchInfo.drugName}</h3>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="text-sm">
                      <span className="font-medium">Batch ID:</span> {batchInfo.batchId}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Expiry:</span> {batchInfo.expiryDate}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Manufacturer:</span> {batchInfo.manufacturer}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Status:</span>{" "}
                      {batchInfo.isRecalled ? "Recalled" : batchInfo.isDispensed ? "Dispensed" : "Not Dispensed"}
                    </div>
                    {batchInfo.transactionHash && (
                      <div className="text-sm col-span-2">
                        <span className="font-medium">Transaction:</span>{" "}
                        <a
                          href={`https://sepolia.etherscan.io/tx/${batchInfo.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View on Etherscan
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {batchInfo && (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Supply Chain Journey</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute top-0 bottom-0 left-6 w-0.5 bg-gray-200"></div>
                <ol className="space-y-6 relative">
                  {transferHistory.map((transfer, index) => (
                    <TimelineItem
                      key={index}
                      icon={
                        index === 0 ? (
                          <Factory className="h-5 w-5 text-blue-600" />
                        ) : index === transferHistory.length - 1 ? (
                          <Stethoscope className="h-5 w-5 text-red-600" />
                        ) : (
                          <Truck className="h-5 w-5 text-yellow-600" />
                        )
                      }
                      title={
                        index === 0
                          ? `Manufactured by ${batchInfo.manufacturer}`
                          : index === transferHistory.length - 1
                          ? "Dispensed by Pharmacist"
                          : "Transferred to Distributor"
                      }
                      date={new Date(transfer.timestamp * 1000).toLocaleString()}
                      details={`From ${transfer.from} to ${transfer.to}`}
                      status="Completed"
                      transactionHash={index === transferHistory.length - 1 ? batchInfo.transactionHash : undefined}
                    />
                  ))}
                </ol>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Safety Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start">
                  <div className="p-2 bg-blue-100 rounded-full mr-3">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Expiry Date</h3>
                    <p className="text-sm text-muted-foreground">{batchInfo.expiryDate}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="p-2 bg-red-100 rounded-full mr-3">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Recall Status</h3>
                    <p className="text-sm text-red-600 font-medium">
                      {batchInfo.isRecalled ? "Recalled" : "No Recall"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="p-2 bg-green-100 rounded-full mr-3">
                    <ShieldCheck className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Authentication</h3>
                    <p className="text-sm text-muted-foreground">
                      {batchInfo.isGenuine ? "Blockchain Verified" : "Not Verified"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="p-2 bg-yellow-100 rounded-full mr-3">
                    <Thermometer className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Storage</h3>
                    <p className="text-sm text-muted-foreground">Store at room temperature (20°C)</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Patient Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  className="flex flex-col h-auto py-3 bg-blue-100 hover:bg-blue-200 text-blue-700"
                  onClick={() => toast({ title: "Feature Not Implemented", description: "Drug interaction checker coming soon." })}
                >
                  <ShieldCheck className="mb-1 h-5 w-5" />
                  <span className="text-xs font-medium">Check Interactions</span>
                </Button>
                <Button
                  className="flex flex-col h-auto py-3 bg-green-100 hover:bg-green-200 text-green-700"
                  onClick={() => toast({ title: "Feature Not Implemented", description: "Reminder setup coming soon." })}
                >
                  <Bell className="mb-1 h-5 w-5" />
                  <span className="text-xs font-medium">Set Reminder</span>
                </Button>
                <Button
                  className="flex flex-col h-auto py-3 bg-amber-100 hover:bg-amber-200 text-amber-700"
                  onClick={() => toast({ title: "Feature Not Implemented", description: "Usage guide coming soon." })}
                >
                  <Stethoscope className="mb-1 h-5 w-5" />
                  <span className="text-xs font-medium">Usage Guide</span>
                </Button>
                <Button
                  className="flex flex-col h-auto py-3 bg-red-100 hover:bg-red-200 text-red-700"
                  onClick={async () => {
                    if (!batchInfo) return;
                    try {
                      const provider = new ethers.providers.JsonRpcProvider("https://rpc.sepolia.org");
                      const contract = new ethers.Contract(contractAddress, PharmaChainABI, provider);
                      const sideEffectHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Patient reported side effect"));
                      await contract.reportSideEffect(batchInfo.batchId, sideEffectHash);
                      toast({
                        title: "Side Effect Reported",
                        description: "Side effect reported successfully.",
                        variant: "success",
                      });
                    } catch (error: any) {
                      toast({
                        title: "Error",
                        description: `Failed to report side effect: ${error.message}`,
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  <AlertTriangle className="mb-1 h-5 w-5" />  
                  <span className="text-xs font-medium">Report Side Effect</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}