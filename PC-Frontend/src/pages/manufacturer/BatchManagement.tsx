import React, { useState, useEffect, useRef } from "react";
import { QrCode, Truck, AlertTriangle, X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import axios from "axios";
import { ethers } from "ethers";
import PharmaChainABI from "../../abis/PharmaChain.json";
import { manufacturingPlants, getRandomLocation } from "./utils/location";

interface Batch {
  batchId: string;
  drugName: string;
  status: string;
  currentOwner: string;
  qrCodeHash?: string;
}

interface Transfer {
  batchId: string;
  distributorId: string;
  quantity: string;
  transferDate: string;
  status: string;
  manufacturerId?: string;
}

interface BatchForm {
  batchId: string;
  drugName: string;
  ingredients: string;
  strength: string;
  manufacturingDate: string;
  expiryDate: string;
  quantity: string;
}

interface TransferForm {
  batchId: string;
  distributorWallet: string;
  quantity: string;
  transferDate: string;
}

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

export default function BatchManagement() {
  const [batches, setBatches] = useState<Batch[]>([
    {
      batchId: `BATCH-${uuidv4().slice(0, 8)}`,
      drugName: "Ibuprofen",
      status: "New",
      currentOwner: "Manufacturer",
    },
    {
      batchId: `BATCH-${uuidv4().slice(0, 8)}`,
      drugName: "Paracetamol",
      status: "In Transit",
      currentOwner: "Distributor A",
    },
  ]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [batchForm, setBatchForm] = useState<BatchForm>({
    batchId: `BATCH-${uuidv4().slice(0, 8)}`,
    drugName: "Ibuprofen",
    ingredients: "Ibuprofen, Starch",
    strength: "200mg",
    manufacturingDate: "2025-01-01",
    expiryDate: "2026-01-01",
    quantity: "1000",
  });
  const [transferForm, setTransferForm] = useState<TransferForm>({
    batchId: "",
    distributorWallet: "",
    quantity: "",
    transferDate: "",
  });
  const [equipmentList, setEquipmentList] = useState<string[]>(["EQP-789"]);
  const [newEquipment, setNewEquipment] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("batches");
  const transferTabRef = useRef<HTMLButtonElement | null>(null);

  // Fetch batches from backend API
  useEffect(() => {
    const fetchBatches = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/batches`);
        setBatches(response.data.reverse());
      } catch (error: any) {
        toast.error(`Error fetching batches: ${error.response?.data?.error || error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchBatches();
  }, []);

  // Fetch transfer records from backend API
  useEffect(() => {
    const fetchTransfers = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/manufacturerTransfers`);

        setTransfers(response.data.reverse());
      } catch (error: any) {
        console.error("Error fetching transfers:", error);
        toast.error(`Error fetching transfer records: ${error.response?.data?.message || error.message}`);
      }
    };

    fetchTransfers();
  }, []);

  // Polling mechanism to fetch transfer history periodically
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/manufacturerTransfers`);
        setTransfers(response.data.reverse());
      } catch (error: any) {
        console.error("Error fetching transfers during polling:", error);
      }
    }, 60000); // Poll every 10 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  // Handle batch creation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const quantity = parseInt(batchForm.quantity, 10);
      if (isNaN(quantity) || quantity <= 0) {
        throw new Error("Quantity must be a positive number");
      }

      if (!batchForm.batchId || !batchForm.drugName || !batchForm.expiryDate || !quantity) {
        throw new Error("Missing required fields: batchId, drugName, expiryDate, or quantity");
      }

      const batchData = {
        batchId: batchForm.batchId,
        drugName: batchForm.drugName,
        ingredients: batchForm.ingredients,
        strength: batchForm.strength,
        manufacturingDate: batchForm.manufacturingDate,
        expiryDate: batchForm.expiryDate,
        equipmentIds: equipmentList,
        quantity,
        qrCodeHash: "placeholder-hash",
      };

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/batches/register`, batchData);
      const { batch, tx } = response.data;

      const newBatch: Batch = {
        batchId: batch.batchId,
        drugName: batch.drugName,
        status: batch.status,
        currentOwner: batch.currentOwner,
        qrCodeHash: batch.qrCodeHash,
      };

      setBatches((prev) => [newBatch, ...prev]);
      setFormSubmitted(true);
      toast.success(`Batch ${batchForm.batchId} registered successfully!`);
      setTimeout(() => setFormSubmitted(false), 3000);

      setBatchForm({
        batchId: `BATCH-${uuidv4().slice(0, 8)}`,
        drugName: "Ibuprofen",
        ingredients: "Ibuprofen, Starch",
        strength: "200mg",
        manufacturingDate: "2025-01-01",
        expiryDate: "2026-01-01",
        quantity: "1000",
      });
      setEquipmentList(["EQP-789"]);
    } catch (error: any) {
      toast.error(`Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle transfer submission
  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const quantity = parseInt(transferForm.quantity, 10);
      if (isNaN(quantity) || quantity <= 0) {
        throw new Error("Quantity must be a positive number");
      }
      if (!transferForm.batchId) {
        throw new Error("Please select a batch");
      }
      if (!transferForm.distributorWallet) {
        throw new Error("Distributor wallet address is required");
      }

      if (!window.ethereum) {
        throw new Error("MetaMask is not installed. Please install it to proceed.");
      }

      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const manufacturerAddress = await signer.getAddress();

      const accounts = await provider.listAccounts();
      if (accounts.length === 0) {
        throw new Error("No accounts found. Please connect your wallet.");
      }

      const contract = new ethers.Contract(contractAddress, PharmaChainABI, signer);

      console.log("Sending this batchID",transferForm.batchId);

      const batch = await contract.batches("BATCH-afe8c8db");
      console.log(batch);

      const tx = await contract.transferBatch(
        transferForm.batchId,
        transferForm.distributorWallet,
        quantity,
  { gasLimit: 500000 }
      );
      await tx.wait();

      const newTransfer: Transfer = { 
        batchId: transferForm.batchId,
        distributorId: transferForm.distributorWallet,
        quantity: quantity.toString(),
        transferDate: transferForm.transferDate || new Date().toISOString().split("T")[0],
        status: "Pending",
        manufacturerId: manufacturerAddress,
      };

      setTransfers((prev) => [...prev, newTransfer]);
      setBatches((prev) =>
        prev.map((batch) =>
          batch.batchId === transferForm.batchId
            ? { ...batch, status: "In Transit", currentOwner: transferForm.distributorWallet }
            : batch
        )
      );

      setFormSubmitted(true);
      toast.success(`Transfer initiated for batch ${transferForm.batchId}`);
      setTimeout(() => setFormSubmitted(false), 3000);

      setTransferForm({
        batchId: "",
        distributorWallet: "",
        quantity: "",
        transferDate: "",
      });

      // Record transfer details in the database
      const transferDetails = {
        manufacturerId: manufacturerAddress,
        batchId: transferForm.batchId,
        distributorId: transferForm.distributorWallet,
        quantity: quantity.toString(),
        status: "Pending",
        transferDate: transferForm.transferDate || new Date().toISOString(),
      };

      console.log("API URL:", import.meta.env.VITE_API_URL);
      console.log("Sending transfer details:", transferDetails);

      const transferResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/manufacturerTransfers/record-transfer`,
        transferDetails
      );
      console.log("Transfer record response:", transferResponse.data);
      if (transferResponse.status === 201) {
        toast.success(`Transfer details recorded successfully for batch ${transferForm.batchId}`);
      } else {
        throw new Error("Unexpected response from the server");
      }

      // Update batch status in the database
      const statusResponse = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/batches/${transferForm.batchId}/status`,
        { status: "In Transit" }
      );
      console.log("Batch status updated:", statusResponse.data);
      if (statusResponse.status === 200) {
        toast.success(`Batch ${transferForm.batchId} status updated to In Transit`);
      } else {
        throw new Error("Unexpected response from status update");
      }

      // Create shipment record
      const shipmentDetails = {
        shipmentId: `SHIP-${uuidv4().slice(0, 8)}`,
        batchId: transferForm.batchId,
        origin: getRandomLocation(manufacturingPlants),
        destination: "Main Distributor Warehouse",
        products: [{ batchId: transferForm.batchId, quantity }],
        departureDate: new Date().toISOString(),
        eta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        status: "In Transit",
        temperature: 20, // Example value in Celsius
        carrier: "Default Carrier", // Example carrier
        trackingDetails: `Tracking for batch ${transferForm.batchId}`,
      };

      try {
        const shipmentResponse = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/shipments`,
          shipmentDetails
        );
        console.log("Shipment created:", shipmentResponse.data);
        toast.success(`Shipment created for batch ${transferForm.batchId}`);
      } catch (shipmentError: any) {
        console.error("Shipment creation error:", shipmentError);
        toast.error(
          `Failed to create shipment: ${shipmentError.response?.data?.message || shipmentError.message}`
        );
      }
    } catch (error: any) {
      console.error("Transfer error:", error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Add equipment to list
  const addEquipment = () => {
    if (newEquipment.trim() && !equipmentList.includes(newEquipment.trim())) {
      setEquipmentList([...equipmentList, newEquipment.trim()]);
      setNewEquipment("");
    }
  };

  // Remove equipment from list
  const removeEquipment = (equipment: string) => {
    setEquipmentList(equipmentList.filter((e) => e !== equipment));
  };

  // Handle batch form changes
  const handleBatchFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBatchForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle transfer form changes
  const handleTransferFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTransferForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle equipment input change
  const handleEquipmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewEquipment(e.target.value);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Batch Management</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex justify-between">
          <div className="flex">
            <TabsTrigger value="batches">Batches</TabsTrigger>
            <TabsTrigger value="transfers" ref={transferTabRef}>Transfers</TabsTrigger>
          </div>
          <div style={{ visibility: activeTab === "transfers" ? "hidden" : "visible" }}>
            <Button
              className="bg-[#007BFF] hover:bg-blue-600 flex items-center gap-2"
              onClick={() => {
                const registerForm = document.getElementById("register-batch-form");
                if (registerForm) {
                  registerForm.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              <QrCode className="h-4 w-4" /> Register Batch
            </Button>
          </div>
        </TabsList>

        <TabsContent value="batches">
          <div className="grid gap-6 mb-6">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Active Batches</CardTitle>
              </CardHeader>
              <CardContent style={{ maxHeight: "400px", overflowY: "auto" }}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Batch ID</TableHead>
                      <TableHead>Drug Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>QR Code</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {batches.map((batch) => (
                      <TableRow key={batch.batchId}>
                        <TableCell className="font-medium">{batch.batchId}</TableCell>
                        <TableCell>{batch.drugName}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              batch.status === "In Transit"
                                ? "bg-yellow-500"
                                : batch.status === "Recalled"
                                ? "bg-red-500"
                                : batch.status === "New"
                                ? "bg-blue-500"
                                : "bg-green-500"
                            }
                          >
                            {batch.status === "In Transit" && (
                              <Truck className="mr-1 h-3 w-3" />
                            )}
                            {batch.status === "Recalled" && (
                              <AlertTriangle className="mr-1 h-3 w-3" />
                            )}
                            {batch.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{batch.currentOwner}</TableCell>
                        <TableCell>
                          <QRCodeSVG value={batch.qrCodeHash || batch.batchId} size={100} />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setTransferForm((prev) => ({ ...prev, batchId: batch.batchId }));
                              setActiveTab("transfers");
                            }}
                          >
                            Transfer
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="w-full" id="register-batch-form">
              <CardHeader>
                <CardTitle>Register New Batch</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="batchId">Batch ID</Label>
                    <Input
                      id="batchId"
                      name="batchId"
                      value={batchForm.batchId}
                      onChange={handleBatchFormChange}
                      placeholder="Enter batch ID"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="drugName">Drug Name</Label>
                    <Input
                      id="drugName"
                      name="drugName"
                      value={batchForm.drugName}
                      onChange={handleBatchFormChange}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="ingredients">Ingredients</Label>
                    <Input
                      id="ingredients"
                      name="ingredients"
                      value={batchForm.ingredients}
                      onChange={handleBatchFormChange}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="strength">Strength</Label>
                    <Input
                      id="strength"
                      name="strength"
                      value={batchForm.strength}
                      onChange={handleBatchFormChange}
                      placeholder="e.g., 200mg"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        name="expiryDate"
                        type="date"
                        value={batchForm.expiryDate}
                        onChange={handleBatchFormChange}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="manufacturingDate">Manufacturing Date</Label>
                      <Input
                        id="manufacturingDate"
                        name="manufacturingDate"
                        type="date"
                        value={batchForm.manufacturingDate}
                        onChange={handleBatchFormChange}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="equipment">Equipment Used</Label>
                    <div className="flex gap-2">
                      <Input
                        id="equipment"
                        value={newEquipment}
                        onChange={handleEquipmentChange}
                        placeholder="Enter equipment ID"
                      />
                      <Button
                        type="button"
                        onClick={addEquipment}
                        className="bg-[#007BFF] hover:bg-blue-600"
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {equipmentList.map((equipment, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {equipment}
                          <button
                            type="button"
                            onClick={() => removeEquipment(equipment)}
                            className="ml-1 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      value={batchForm.quantity}
                      onChange={handleBatchFormChange}
                      min="1"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#007BFF] hover:bg-blue-600 flex items-center justify-center"
                    disabled={loading}
                  >
                    <QrCode className="mr-2 h-4 w-4" />
                    {loading ? "Creating Batch..." : "Generate QR Code"}
                  </Button>

                  {formSubmitted && (
                    <div className="p-3 bg-green-100 border border-green-300 text-green-700 rounded fadeIn">
                      Batch registered successfully! QR code generated for {batchForm.batchId}.
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transfers">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Initiate Transfer</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTransferSubmit} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="batchId">Select Batch</Label>
                    <select
                      id="batchId"
                      name="batchId"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                      value={transferForm.batchId}
                      onChange={handleTransferFormChange}
                    >
                      <option value="">Select a batch</option>
                      {batches.map((batch) => (
                        <option key={batch.batchId} value={batch.batchId}>
                          {batch.batchId} ({batch.drugName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="distributorWallet">Distributor Wallet Address</Label>
                    <Input
                      id="distributorWallet"
                      name="distributorWallet"
                      placeholder="Enter distributor wallet address"
                      value={transferForm.distributorWallet}
                      onChange={handleTransferFormChange}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="quantity">Transfer Quantity</Label>
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      placeholder="Enter quantity to transfer"
                      value={transferForm.quantity}
                      onChange={handleTransferFormChange}
                      min="1"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="transferDate">Transfer Date</Label>
                    <Input
                      id="transferDate"
                      name="transferDate"
                      type="date"
                      value={transferForm.transferDate}
                      onChange={handleTransferFormChange}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#007BFF] hover:bg-blue-600"
                    disabled={loading}
                  >
                    <Truck className="mr-2 h-4 w-4" />
                    {loading ? "Initiating Transfer..." : "Initiate Transfer"}
                  </Button>

                  {formSubmitted && (
                    <div className="p-3 bg-green-100 border border-green-300 text-green-700 rounded fadeIn">
                      Transfer initiated successfully!
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transfer History</CardTitle>
              </CardHeader>
              <CardContent style={{ maxHeight: "400px", overflowY: "auto" }}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Batch ID</TableHead>
                      <TableHead>Manufacturer</TableHead>
                      <TableHead>Distributor</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...transfers].reverse().map((transfer, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{transfer.batchId}</TableCell>
                        <TableCell>{transfer.manufacturerId}</TableCell>
                        <TableCell>{transfer.distributorId}</TableCell>
                        <TableCell>{transfer.quantity}</TableCell>
                        <TableCell>{new Date(transfer.transferDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              transfer.status === "Completed" ? "bg-green-500" : "bg-yellow-500"
                            }
                          >
                            {transfer.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}