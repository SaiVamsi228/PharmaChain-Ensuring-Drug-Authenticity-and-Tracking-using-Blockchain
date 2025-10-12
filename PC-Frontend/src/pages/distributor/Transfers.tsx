import { Buffer } from 'buffer';
window.Buffer = window.Buffer || Buffer; // Polyfill Buffer

import { useState, useEffect } from "react";
import axios from "axios";
import { ethers } from "ethers";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "../../hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Search, Filter, Plus, Download, ArrowLeftRight, CheckCircle, Clock, AlertTriangle, AlertCircle } from "lucide-react";
import PharmaChainABI from "../../abis/PharmaChain.json";

interface InventoryItem {
  batchId: string;
  drugName: string;
  batchSize: number;
}

interface Transfer {
  _id: string;
  transferId: string;
  batchId: string;
  distributorId: string;
  pharmacistId: string;
  quantity: string;
  transferDate: string;
  status: string;
}

interface TransferStats {
  totalTransfers: number;
  completedTransfers: number;
  pendingTransfers: number;
  issuesDetected: number;
}

interface TransferForm {
  batchId: string;
  pharmacistId: string;
  quantity: string;
  transferDate: string;
}

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

export default function TransfersPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [stats, setStats] = useState<TransferStats>({
    totalTransfers: 0,
    completedTransfers: 0,
    pendingTransfers: 0,
    issuesDetected: 0,
  });
  const [transferForm, setTransferForm] = useState<TransferForm>({
    batchId: "",
    pharmacistId: "",
    quantity: "",
    transferDate: new Date().toISOString().split("T")[0],
  });
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [pharmacistIdError, setPharmacistIdError] = useState<string>("");
  const { toast } = useToast();

  // Fetch inventory
  const fetchInventory = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/inventory`);
      setInventory(response.data.inventory);
      toast({
        title: "Success",
        description: "Inventory fetched successfully.",
        variant: "success",
      });
    } catch (error: any) {
      console.error("Error fetching inventory:", error);
      toast({
        title: "Error",
        description: `Failed to fetch inventory: ${error.response?.data?.message || error.message}`,
        variant: "destructive",
      });
    }
  };

  // Fetch transfers
  const fetchTransfers = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/distributorTransfers`);
      setTransfers(response.data.map((t: any) => ({
        ...t,
        transferId: `TR-${uuidv4().slice(0, 8)}`,
      })));
      toast({
        title: "Success",
        description: "Transfers fetched successfully.",
        variant: "success",
      });
    } catch (error: any) {
      console.error("Error fetching transfers:", error);
      toast({
        title: "Error",
        description: `Failed to fetch transfers: ${error.response?.data?.message || error.message}`,
        variant: "destructive",
      });
    }
  };

  // Fetch transfer stats
  const fetchStats = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/distributorTransfers/stats`);
      setStats(response.data);
      toast({
        title: "Success",
        description: "Transfer statistics fetched successfully.",
        variant: "success",
      });
    } catch (error: any) {
      console.error("Error fetching stats:", error);
      toast({
        title: "Error",
        description: `Failed to fetch transfer statistics: ${error.response?.data?.message || error.message}`,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchTransfers();
    fetchStats();

    // Polling for transfers
    const interval = setInterval(() => {
      fetchTransfers();
      fetchStats();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Re-fetch transfers and stats after initiating a transfer
  useEffect(() => {
    if (!loading) {
      fetchTransfers();
      fetchStats();
    }
  }, [loading]);

  // Handle form changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTransferForm((prev) => ({ ...prev, [name]: value }));

    // Real-time validation for pharmacistId
    if (name === "pharmacistId") {
      if (value && !ethers.utils.isAddress(value)) {
        setPharmacistIdError("Invalid Ethereum wallet address");
      } else {
        setPharmacistIdError("");
      }
    }
  };

  // Handle transfer submission
  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    toast({
      title: "Initiating Transfer",
      description: "Processing your transfer request...",
      variant: "default",
    });

    try {
      const quantity = parseInt(transferForm.quantity, 10);
      if (isNaN(quantity) || quantity <= 0) {
        throw new Error("Quantity must be a positive number");
      }
      if (!transferForm.batchId) {
        throw new Error("Please select a batch");
      }
      if (!transferForm.pharmacistId) {
        throw new Error("Pharmacist wallet address is required");
      }
      if (!ethers.utils.isAddress(transferForm.pharmacistId)) {
        throw new Error("Invalid pharmacist wallet address");
      }

      // Verify sufficient quantity in inventory
      const inventoryItem = inventory.find((item) => item.batchId === transferForm.batchId);
      if (!inventoryItem || inventoryItem.batchSize < quantity) {
        throw new Error("Insufficient quantity in inventory or batch not found");
      }

      if (!window.ethereum) {
        throw new Error("MetaMask is not installed. Please install it to proceed.");
      }

      // Connect to MetaMask
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const distributorAddress = "Main Distributor Warehouse"

      // Blockchain transfer
      const contract = new ethers.Contract(contractAddress, PharmaChainABI, signer);

      const tx = await contract.transferBatch(
        transferForm.batchId,
        transferForm.pharmacistId,
        quantity,
        { gasLimit: 500000 } // Increased gas limit
      );

      const receipt = await tx.wait();
      if (receipt.status === 0) {
        try {
          await provider.call({
            to: contractAddress,
            data: tx.data,
            from: distributorAddress,
            gasLimit: 500000,
          }, receipt.blockNumber);
        } catch (error: any) {
          throw new Error(`Transaction reverted: ${error.reason || error.message || "Unknown reason"}`);
        }
      }

      toast({
        title: "Blockchain Transaction",
        description: "Blockchain transfer completed successfully.",
        variant: "success",
      });

      // Ensure transferDetails includes all required fields
      const transferDetails = {
        distributorId: distributorAddress, // Use actual MetaMask address
        batchId: transferForm.batchId,
        pharmacistId: transferForm.pharmacistId,
        quantity: quantity.toString(),
        status: "Pending",
        transferDate: transferForm.transferDate || new Date().toISOString(),
      };

      // Record transfer in backend
      const transferResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/distributorTransfers/record-transfer`,
        transferDetails
      );

      console.log("Transfer Response:", transferResponse.data); // Debug log

      if (transferResponse.status !== 201) {
        throw new Error(`Unexpected response from server: ${transferResponse.status}`);
      }

      toast({
        title: "Transfer Recorded",
        description: `Transfer details for batch ${transferForm.batchId} recorded successfully.`,
        variant: "success",
      });

      // Update batch status
      const statusResponse = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/batches/${transferForm.batchId}/status`,
        { status: "In Transit" }
      );

      if (statusResponse.status !== 200) {
        throw new Error(`Failed to update batch status: ${statusResponse.status}`);
      }

      toast({
        title: "Batch Status Updated",
        description: `Batch ${transferForm.batchId} status updated to In Transit.`,
        variant: "success",
      });

      // Create shipment record for pharmacist
      const shipmentDetails = {
        shipmentId: `SHIP-${uuidv4().slice(0, 8)}`,
        batchId: transferForm.batchId,
        origin: distributorAddress,
        destination: transferForm.pharmacistId, // Use pharmacistId as destination
        products: [{ batchId: transferForm.batchId, quantity }],
        departureDate: new Date().toISOString(),
        eta: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: "In Transit",
        temperature: 20,
        carrier: "Pharma Logistics",
        trackingDetails: `Tracking for batch ${transferForm.batchId}`,
      };

      const shipmentResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/pharmacist/shipments`,
        shipmentDetails
      );

      if (![200, 201].includes(shipmentResponse.status)) {
        throw new Error(`Failed to create shipment: ${shipmentResponse.status}`);
      }

      toast({
        title: "Shipment Created",
        description: `Shipment created for batch ${transferForm.batchId}.`,
        variant: "success",
      });

      // Update local state
      setTransfers((prev) => [
        { ...transferResponse.data.transferRecord, transferId: `TR-${uuidv4().slice(0, 8)}` },
        ...prev,
      ]);
      setInventory((prev) =>
        prev.map((item) =>
          item.batchId === transferForm.batchId
            ? { ...item, batchSize: item.batchSize - quantity }
            : item
        ).filter((item) => item.batchSize > 0)
      );

      setTransferForm({
        batchId: "",
        pharmacistId: "",
        quantity: "",
        transferDate: new Date().toISOString().split("T")[0],
      });
      setPharmacistIdError("");

      toast({
        title: "Success",
        description: "Transfer initiated successfully!",
        variant: "success",
      });

      fetchStats();
    } catch (error: any) {
      console.error("Transfer error:", error);
      let message = "Failed to initiate transfer";
      if (error.response?.data?.message) {
        message = `Server error: ${error.response.data.message}`;
      } else if (error.reason) {
        message = `Transaction failed: ${error.reason}`;
      } else if (error.code === "CALL_EXCEPTION") {
        message = `Transaction reverted: ${error.message || "Check batch ID, quantity, ownership, or role"}`;
      } else if (error.code === "UNPREDICTABLE_GAS_LIMIT") {
        message = "Unable to estimate gas. Transaction may fail or require manual gas limit.";
      }
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter transfers
  const filteredTransfers = transfers.filter(
    (transfer) =>
      transfer.transferId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.batchId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.pharmacistId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-bold">Transfer Management</h1>
        <div className="flex items-center mt-4 md:mt-0 space-x-2">
          <Button
            className="bg-[#007BFF] hover:bg-blue-600"
            onClick={() => document.getElementById("new-transfer-form")?.scrollIntoView({ behavior: "smooth" })}
          >
            <Plus className="mr-2 h-4 w-4" /> New Transfer
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">In Progress</p>
              <ArrowLeftRight className="h-5 w-5 text-[#007BFF]" />
            </div>
            <h3 className="text-3xl font-bold">{stats.totalTransfers - stats.completedTransfers - stats.pendingTransfers - stats.issuesDetected}</h3>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Completed</p>
              <CheckCircle className="h-5 w-5 text-[#28A745]" />
            </div>
            <h3 className="text-3xl font-bold">{stats.completedTransfers}</h3>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Pending</p>
              <Clock className="h-5 w-5 text-[#FFC107]" />
            </div>
            <h3 className="text-3xl font-bold">{stats.pendingTransfers}</h3>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Issues</p>
              <AlertTriangle className="h-5 w-5 text-[#DC3545]" />
            </div>
            <h3 className="text-3xl font-bold">{stats.issuesDetected}</h3>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Transfer Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search by transfer ID, batch ID, or pharmacist address..."
                className="pl-8 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
          <CardTitle>Recent Transfers</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transfer ID</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Initiated</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransfers.map((transfer) => (
                <TableRow key={transfer._id}>
                  <TableCell className="font-medium">{transfer.transferId}</TableCell>
                  <TableCell>Main Distributor Warehouse</TableCell>
                  <TableCell>{transfer.pharmacistId.slice(0, 6)}...{transfer.pharmacistId.slice(-4)}</TableCell>
                  <TableCell>
                    {inventory.find((item) => item.batchId === transfer.batchId)?.drugName || transfer.batchId} ({transfer.quantity} units)
                  </TableCell>
                  <TableCell>{new Date(transfer.transferDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        transfer.status === "Completed" ? "bg-green-500" :
                        transfer.status === "Pending" ? "bg-yellow-500" :
                        transfer.status === "Failed" ? "bg-red-500" :
                        "bg-blue-500"
                      }
                    >
                      {transfer.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredTransfers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No transfers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button variant="outline" size="sm">Previous</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Transfer Details</CardTitle>
          </CardHeader>
          <CardContent>
            {transfers.length > 0 ? (
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium">{transfers[0].transferId}</h3>
                    <p className="text-sm text-muted-foreground">
                      {inventory.find((item) => item.batchId === transfers[0].batchId)?.drugName || transfers[0].batchId} ({transfers[0].quantity} units)
                    </p>
                  </div>
                  <Badge
                    className={
                      transfers[0].status === "Completed" ? "bg-green-500" :
                      transfers[0].status === "Pending" ? "bg-yellow-500" :
                      transfers[0].status === "Failed" ? "bg-red-500" :
                      "bg-blue-500"
                    }
                  >
                    {transfers[0].status}
                  </Badge>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs font-medium">Source:</p>
                      <p className="text-sm">Main Distributor Warehouse</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium">Destination:</p>
                      <p className="text-sm">{transfers[0].pharmacistId.slice(0, 6)}...{transfers[0].pharmacistId.slice(-4)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs font-medium">Initiated:</p>
                      <p className="text-sm">{new Date(transfers[0].transferDate).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium">Estimated Arrival:</p>
                      <p className="text-sm">{new Date(new Date(transfers[0].transferDate).getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleString()}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium">Products:</p>
                    <p className="text-sm">
                      {inventory.find((item) => item.batchId === transfers[0].batchId)?.drugName || transfers[0].batchId} ({transfers[0].quantity} units, Batch ID: {transfers[0].batchId})
                    </p>
                  </div>
                  <div className="pt-2">
                    <Button className="w-full bg-[#007BFF] hover:bg-blue-600">
                      <ArrowLeftRight className="mr-2 h-4 w-4" /> Track Transfer
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center">No transfers available.</p>
            )}
          </CardContent>
        </Card>

        <Card id="new-transfer-form">
          <CardHeader>
            <CardTitle>Initiate Transfer to Pharmacist</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTransferSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="batchId" className="text-sm font-medium">
                  Select Batch <span className="text-red-500">*</span>
                </Label>
                <select
                  id="batchId"
                  name="batchId"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={transferForm.batchId}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">Select a batch</option>
                  {inventory.map((item) => (
                    <option key={item.batchId} value={item.batchId}>
                      {item.drugName} ({item.batchId}, {item.batchSize} units)
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pharmacistId" className="text-sm font-medium">
                  Pharmacist Wallet Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="pharmacistId"
                  name="pharmacistId"
                  placeholder="Enter pharmacist's Ethereum wallet address (e.g., 0x123...)"
                  value={transferForm.pharmacistId}
                  onChange={handleFormChange}
                  required
                  className={pharmacistIdError ? "border-red-500" : ""}
                />
                {pharmacistIdError && (
                  <p className="text-sm text-red-500 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" /> {pharmacistIdError}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity" className="text-sm font-medium">
                    Quantity <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    id="quantity"
                    name="quantity"
                    placeholder="Enter quantity"
                    value={transferForm.quantity}
                    onChange={handleFormChange}
                    min="1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transferDate" className="text-sm font-medium">
                    Transfer Date
                  </Label>
                  <Input
                    type="date"
                    id="transferDate"
                    name="transferDate"
                    value={transferForm.transferDate}
                    onChange={handleFormChange}
                  />
                </div>
              </div>
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setTransferForm({
                      batchId: "",
                      pharmacistId: "",
                      quantity: "",
                      transferDate: new Date().toISOString().split("T")[0],
                    });
                    setPharmacistIdError("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#007BFF] hover:bg-blue-600"
                  disabled={loading || !!pharmacistIdError}
                >
                  {loading ? "Initiating..." : "Initiate Transfer"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}