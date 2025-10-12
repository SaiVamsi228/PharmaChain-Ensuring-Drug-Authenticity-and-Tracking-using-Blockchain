import type React from "react";

import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Progress } from "../../components/ui/progress";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { AlertCircle, CheckCircle, Search } from "lucide-react";
import { useState } from "react";

interface Recall {
  batchId: string;
  drug: string;
  initiated: string;
  recovery: number;
  drugName: string;
  batchSize: string;
  recallReason: string;
  riskLevel: string;
  distribution: { name: string; units: number }[];
}

export default function RecallManagement() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecall, setSelectedRecall] = useState<Recall | null>(null);

  const recalls: Recall[] = [
    {
      batchId: "PA-2024",
      drug: "Paracetamol",
      initiated: "08/15/2024",
      recovery: 45,
      drugName: "Paracetamol 500mg",
      batchSize: "2,000 units",
      recallReason: "Packaging Defect",
      riskLevel: "Medium",
      distribution: [
        { name: "Distributor A", units: 1200 },
        { name: "Pharmacist B", units: 800 }
      ]
    },
    {
      batchId: "IB-2023",
      drug: "Ibuprofen",
      initiated: "07/30/2024",
      recovery: 78,
      drugName: "Ibuprofen 400mg",
      batchSize: "1,500 units",
      recallReason: "Quality Control Issue",
      riskLevel: "High",
      distribution: [
        { name: "Distributor C", units: 1000 },
        { name: "Pharmacist D", units: 500 }
      ]
    }
  ];

  const handleSearch = () => {
    const foundRecall = recalls.find(recall => 
      recall.batchId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recall.drug.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSelectedRecall(foundRecall || null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 3000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Recall Management</h1>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card className="min-h-[62vh] flex flex-col">
          <CardHeader>
            <CardTitle>Active Recalls</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            <div className="flex gap-2 mb-4">
              <Input 
                placeholder="Search by Batch ID or Drug Name" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead>Batch ID</TableHead>
                  <TableHead>Drug</TableHead>
                  <TableHead>Initiated</TableHead>
                  <TableHead>Recovery</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recalls.map((recall) => (
                  <TableRow 
                    key={recall.batchId}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => setSelectedRecall(recall)}
                  >
                    <TableCell className="font-medium">{recall.batchId}</TableCell>
                    <TableCell>{recall.drug}</TableCell>
                    <TableCell>{recall.initiated}</TableCell>
                    <TableCell className="w-[180px]">
                      <div className="flex items-center space-x-2">
                        <Progress value={recall.recovery} className="h-2" />
                        <span className="text-sm text-muted-foreground">{recall.recovery}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="min-h-[62vh] flex flex-col">
          <CardHeader>
            <CardTitle>Recall Details - {selectedRecall?.batchId || 'Select a Recall'}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            {selectedRecall ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium">Drug Name</h3>
                    <p>{selectedRecall.drugName}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Batch Size</h3>
                    <p>{selectedRecall.batchSize}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium">Recall Reason</h3>
                    <p>{selectedRecall.recallReason}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Risk Level</h3>
                    <p className={`font-medium ${
                      selectedRecall.riskLevel === 'High' ? 'text-red-600' : 
                      selectedRecall.riskLevel === 'Medium' ? 'text-amber-600' : 
                      'text-green-600'
                    }`}>
                      {selectedRecall.riskLevel}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium">Distribution</h3>
                  <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                    {selectedRecall.distribution.map((dist, index) => (
                      <li key={index}>{dist.name}: {dist.units} units</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-medium">Recovery Status</h3>
                  <div className="flex items-center mt-2">
                    <div className="grow">
                      <Progress value={selectedRecall.recovery} className="h-2" />
                    </div>
                    <span className="ml-2 text-sm font-medium">{selectedRecall.recovery}%</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {Math.round(parseInt(selectedRecall.batchSize) * (selectedRecall.recovery / 100))} units recovered, 
                    {Math.round(parseInt(selectedRecall.batchSize) * ((100 - selectedRecall.recovery) / 100))} units pending
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button className="bg-[#007BFF] hover:bg-blue-600">Send Reminder</Button>
                  <Button variant="outline">View Report</Button>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Select a recall from the list or use the search to view details
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Initiate New Recall</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="batch-id">Batch ID</Label>
                <Input id="batch-id" placeholder="Enter batch ID" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="risk-level">Risk Level</Label>
                <select
                  id="risk-level"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="reason">Recall Reason</Label>
              <Textarea id="reason" placeholder="Describe the issue requiring a recall" rows={3} />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="notification-type">Notification Type</Label>
                <select
                  id="notification-type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="silent">Silent (Distributors Only)</option>
                  <option value="standard">Standard (Supply Chain)</option>
                  <option value="public">Public (Including Customers)</option>
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="effective-date">Effective Date</Label>
                <Input id="effective-date" type="date" />
              </div>
            </div>

            <Button type="submit" className="bg-[#DC3545] hover:bg-red-600 w-full md:w-auto">
              <AlertCircle className="mr-2 h-4 w-4" />
              Initiate Recall
            </Button>

            {formSubmitted && (
              <div className="p-4 border border-green-200 bg-green-50 rounded-md flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <div>
                  <h3 className="font-medium text-green-800">Recall Initiated</h3>
                  <p className="text-sm text-green-700">
                    The recall process has been initiated for the specified batch. Notifications will be sent to all
                    affected parties according to your selected preferences.
                  </p>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}