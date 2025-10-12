import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { AlertTriangle, ArrowDownToLine, CheckCircle, Package, Search, ShieldAlert } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { Link } from "react-router-dom";

const apiUrl = import.meta.env.VITE_API_URL;

interface InventoryItem {
  batchId: string;
  drugName: string;
  batchSize: number;
  expiryDate?: string;
  distributorId: string;
  manufacturer?: string;
  status: string;
  ipfsHash?: string;
  isRecalled?: boolean;
}

export default function PharmacistInventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBatch, setSelectedBatch] = useState<InventoryItem | null>(null);
  const { toast } = useToast();

  // Fetch inventory data
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        console.log("Fetching inventory from:", `${apiUrl}/api/pharmacist/inventory`);
        const response = await axios.get(`${apiUrl}/api/pharmacist/shipments/inventory`);
        console.log("Inventory response:", response.data);
        if (!response.data.inventory) {
          console.warn("No inventory field in response");
          toast({
            title: "Warning",
            description: "No inventory data returned from server.",
            variant: "destructive",
          });
        }
        setInventory(response.data.inventory || []);
      } catch (error: any) {
        console.error("Fetch inventory error:", error);
        toast({
          title: "Error",
          description: `Failed to fetch inventory: ${error.response?.data?.message || error.message}`,
          variant: "destructive",
        });
      }
    };
    fetchInventory();
  }, []);

  // Filter inventory based on search query
  const filteredInventory = inventory.filter((item) =>
    item.batchId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.drugName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Define controlled substances
  const controlledSubstances = ["Diazepam", "Lorazepam", "Alprazolam"];

  // Determine inventory status
  const getStatus = (item: InventoryItem) => {
    if (item.isRecalled) {
      return { label: "Recalled", color: "bg-red-500", icon: AlertTriangle };
    }
    if (item.batchSize < 500) {
      return { label: "Low Stock", color: "bg-yellow-500", icon: AlertTriangle };
    }
    if (controlledSubstances.includes(item.drugName)) {
      return { label: "Controlled", color: "bg-purple-500", icon: ShieldAlert };
    }
    return { label: "Active", color: "bg-green-500", icon: CheckCircle };
  };

  // Handle View button click
  const handleViewBatch = (item: InventoryItem) => {
    setSelectedBatch(item);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Pharmacy Inventory</h1>

      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <div className="relative w-full md:w-auto flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search medications..."
            className="w-full md:w-[300px] pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button asChild className="bg-[#007BFF] hover:bg-blue-600 flex-1 md:flex-none">
            <Link to="/pharmacist/shipments">
              <ArrowDownToLine className="mr-2 h-4 w-4" /> Receive
            </Link>
          </Button>
          <Button variant="outline" className="flex-1 md:flex-none">
            <Package className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Current Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch ID</TableHead>
                <TableHead>Medication</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Manufacturer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No inventory items found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredInventory.map((item) => {
                  const status = getStatus(item);
                  return (
                    <TableRow key={item.batchId}>
                      <TableCell className="font-medium">{item.batchId}</TableCell>
                      <TableCell>{item.drugName}</TableCell>
                      <TableCell>{item.batchSize}</TableCell>
                      <TableCell>{item.expiryDate || "N/A"}</TableCell>
                      <TableCell>{item.manufacturer || "PharmaChain Manufacturer"}</TableCell>
                      <TableCell>
                        <Badge className={status.color}>
                          <status.icon className="mr-1 h-3 w-3" /> {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewBatch(item)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Inventory Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredInventory.some((item) => item.isRecalled) && (
                <div className="p-4 border rounded-lg flex items-start">
                  <div className="p-2 bg-red-100 rounded-full mr-3">
                    <ShieldAlert className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Recall Alert</h3>
                    <p className="text-sm text-muted-foreground">
                      {filteredInventory.find((item) => item.isRecalled)?.drugName} (
                      {filteredInventory.find((item) => item.isRecalled)?.batchId}) has been recalled.
                    </p>
                    <Button size="sm" className="mt-2 bg-[#DC3545] hover:bg-red-600">
                      View Recall Details
                    </Button>
                  </div>
                </div>
              )}
              {filteredInventory.some((item) => item.batchSize < 500) && (
                <div className="p-4 border rounded-lg flex items-start">
                  <div className="p-2 bg-yellow-100 rounded-full mr-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Low Stock Alert</h3>
                    <p className="text-sm text-muted-foreground">
                      {filteredInventory.find((item) => item.batchSize < 500)?.drugName} (
                      {filteredInventory.find((item) => item.batchSize < 500)?.batchId}) is below 500 units.
                    </p>
                    <Button size="sm" className="mt-2 bg-[#007BFF] hover:bg-blue-600">
                      Order More
                    </Button>
                  </div>
                </div>
              )}
              {filteredInventory.some((item) => controlledSubstances.includes(item.drugName)) && (
                <div className="p-4 border rounded-lg flex items-start">
                  <div className="p-2 bg-blue-100 rounded-full mr-3">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Controlled Substance Check</h3>
                    <p className="text-sm text-muted-foreground">
                      Verification for {filteredInventory.find((item) => controlledSubstances.includes(item.drugName))?.drugName} (
                      {filteredInventory.find((item) => controlledSubstances.includes(item.drugName))?.batchId}) due soon.
                    </p>
                    <Button size="sm" variant="outline" className="mt-2">
                      Schedule Check
                    </Button>
                  </div>
                </div>
              )}
              {filteredInventory.every((item) => !item.isRecalled && item.batchSize >= 500 && !controlledSubstances.includes(item.drugName)) && (
                <div className="text-center text-sm text-muted-foreground">
                  No alerts at this time.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Batch Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedBatch ? (
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">{selectedBatch.batchId} ({selectedBatch.drugName})</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Manufacturer:</span>
                      <p>{selectedBatch.manufacturer || "PharmaChain Manufacturer"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Distributor:</span>
                      <p>{selectedBatch.distributorId}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Quantity:</span>
                      <p>{selectedBatch.batchSize}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Expiry Date:</span>
                      <p>{selectedBatch.expiryDate || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Storage:</span>
                      <p>Room Temperature</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <p className={selectedBatch.isRecalled ? "text-red-600" : "text-green-600"}>
                        {selectedBatch.isRecalled ? "Recalled" : "Active"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline">
                      Full History
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">Batch Details</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Select a batch from the inventory table to view its details.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}