import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { AlertTriangle, CheckCircle, Package, Search } from "lucide-react";
import { useToast } from "../../hooks/use-toast";

interface InventoryItem {
  batchId: string;
  drugName: string;
  manufacturerName: string;
  batchSize: number;
  expiry: string; // ISO date string
  status: string;
}

const Inventory: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const { toast } = useToast();

  const fetchInventory = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/inventory`);
      console.log("Fetched inventory:", response.data.inventory);
      setInventory(response.data.inventory);
    } catch (error: any) {
      console.error("Fetch inventory error:", error);
      toast({
        title: "Error",
        description: "Failed to fetch inventory. Please try again later.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const filteredInventory = inventory.filter(
    (item) =>
      item.batchId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.drugName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.manufacturerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date to a readable format (e.g., "May 25, 2027")
  const formatDate = (isoDate: string) => {
    if (!isoDate) return "N/A";
    return new Date(isoDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Inventory Management</h1>

      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <div className="relative w-full md:w-auto flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search inventory or verify batch..."
            className="w-full md:w-[300px] pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button className="bg-[#007BFF] hover:bg-blue-600 flex-1 md:flex-none">
            <CheckCircle className="mr-2 h-4 w-4" /> Verify Batch
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
                <TableHead>Drug</TableHead>
                <TableHead>Manufacturer</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((item) => (
                <TableRow key={item.batchId}>
                  <TableCell className="font-medium">{item.batchId}</TableCell>
                  <TableCell>{item.drugName}</TableCell>
                  <TableCell>{item.manufacturerName || "PharmaChain Manufacturer"}</TableCell>
                  <TableCell>{item.batchSize}</TableCell>
                  <TableCell>{formatDate(item.expiry)}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        item.status === "Active"
                          ? "bg-green-500"
                          : item.status === "Recalled"
                          ? "bg-red-500"
                          : item.status === "Dispensed"
                          ? "bg-blue-500"
                          : "bg-yellow-500"
                      }
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredInventory.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No inventory items found.
                  </TableCell>
                </TableRow>
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
              {filteredInventory.some((item) => item.batchSize < 1000) && (
                <div className="p-4 border rounded-lg flex items-start">
                  <div className="p-2 bg-yellow-100 rounded-full mr-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Low Stock Alert</h3>
                    <p className="text-sm text-muted-foreground">
                      {filteredInventory
                        .filter((item) => item.batchSize < 1000)
                        .map((item) => `${item.drugName} (${item.batchId})`)
                        .join(", ")}{" "}
                      is below the minimum threshold of 1000 units.
                    </p>
                    <Button size="sm" className="mt-2 bg-[#007BFF] hover:bg-blue-600">
                      Order More
                    </Button>
                  </div>
                </div>
              )}
              {filteredInventory.some((item) => item.status === "Recalled") && (
                <div className="p-4 border rounded-lg flex items-start">
                  <div className="p-2 bg-red-100 rounded-full mr-3">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Recalled Batch Alert</h3>
                    <p className="text-sm text-muted-foreground">
                      {filteredInventory
                        .filter((item) => item.status === "Recalled")
                        .map((item) => `${item.drugName} (${item.batchId})`)
                        .join(", ")}{" "}
                      has been recalled.
                    </p>
                    <Button size="sm" className="mt-2 bg-[#28A745] hover:bg-green-600">
                      Handle Recall
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredInventory.map((item) => (
                <div key={item.batchId}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{item.drugName}</span>
                    <span className="text-sm font-medium">{item.batchSize} units</span>
                  </div>
                  <div className="w-full bg-blue-100 rounded-full h-4">
                    <div
                      className="bg-blue-500 h-4 rounded-full"
                      style={{ width: `${Math.min((item.batchSize / 2000) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              <div className="text-sm text-muted-foreground mt-4">
                Total inventory value: $
                {filteredInventory.reduce((sum, item) => sum + item.batchSize * 100, 0).toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Inventory;