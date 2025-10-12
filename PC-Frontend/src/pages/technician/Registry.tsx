import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Search, Filter, Plus, Download, CalendarIcon } from "lucide-react";
import { toast } from 'react-toastify';
import { createEquipment, getEquipment, updateEquipmentStatus, recordMaintenance } from '../../services/api';
import { registerEquipment, updateEquipmentStatus as contractUpdateStatus, recordMaintenance as contractRecordMaintenance } from '../../services/contract';
import { connectSocket, subscribeToEvents } from '../../services/socket';
import { Equipment } from '../../types/equipment';

export default function EquipmentRegistry() {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [formData, setFormData] = useState({
    equipmentId: '',
    name: '',
    type: '',
    location: '',
    lastCalibrationDate: '',
    description: '',
    model: ''
  });
  const [statusForm, setStatusForm] = useState({ equipmentId: '', status: '' });
  const [maintenanceForm, setMaintenanceForm] = useState({
    equipmentId: '',
    serviceDate: '',
    technician: ''
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    connectSocket();
    fetchEquipment();
    subscribeToEvents((event, data) => {
      console.log('Socket event:', event, data);
      if (event === 'equipmentRegistered' || event === 'equipmentStatusUpdated' || event === 'maintenanceRecorded') {
        toast.info(`${event}: ${data.equipmentId}`);
        fetchEquipment();
      }
    });
  }, []);

  const fetchEquipment = async () => {
    try {
      const response = await getEquipment();
      setEquipmentList(response.data);
    } catch (error: any) {
      console.error('Error fetching equipment:', error);
      toast.error(`Error fetching equipment: ${error.message}`);
    }
  };

  const handleRegisterEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Upload to IPFS and MongoDB via backend
      const response = await createEquipment({
        equipmentId: formData.equipmentId,
        name: formData.name,
        model: formData.type, // Map type to model
        lastCalibrationDate: formData.lastCalibrationDate,
        status: 'Operational',
        location: formData.location,
        description: formData.description
      });

      const { certificationHash } = response.data;

      // Register on blockchain
      await registerEquipment(
        formData.equipmentId,
        formData.lastCalibrationDate,
        certificationHash
      );

      toast.success(`Equipment ${formData.equipmentId} registered successfully`);
      setFormData({
        equipmentId: '',
        name: '',
        type: '',
        location: '',
        lastCalibrationDate: '',
        description: '',
        model: ''
      });
      fetchEquipment();
    } catch (error: any) {
      console.error('Error registering equipment:', error);
      toast.error(`Error registering equipment: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (equipmentId: string, status: string) => {
    setLoading(true);
    try {
      await contractUpdateStatus(equipmentId, status);
      await updateEquipmentStatus(equipmentId, { status });
      toast.success(`Status updated for ${equipmentId}`);
      fetchEquipment();
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error(`Error updating status: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await contractRecordMaintenance(
        maintenanceForm.equipmentId,
        maintenanceForm.serviceDate,
        maintenanceForm.technician
      );
      await recordMaintenance(maintenanceForm.equipmentId, {
        serviceDate: maintenanceForm.serviceDate,
        technician: maintenanceForm.technician
      });
      toast.success(`Maintenance recorded for ${maintenanceForm.equipmentId}`);
      setMaintenanceForm({ equipmentId: '', serviceDate: '', technician: '' });
      fetchEquipment();
    } catch (error: any) {
      console.error('Error recording maintenance:', error);
      toast.error(`Error recording maintenance: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredEquipment = equipmentList.filter(eq =>
    eq.equipmentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    eq.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-bold">Equipment Registry</h1>
        <div className="flex items-center mt-4 md:mt-0 space-x-2">
          <Button className="bg-[#007BFF] hover:bg-blue-600" disabled={loading}>
            <Plus className="mr-2 h-4 w-4" /> Add Equipment
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Equipment Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search equipment..."
                className="pl-8 bg-white"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
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
          <CardTitle>Equipment List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipment ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Last Maintenance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEquipment.map(eq => (
                <TableRow key={eq.equipmentId}>
                  <TableCell className="font-medium">{eq.equipmentId}</TableCell>
                  <TableCell>{eq.name}</TableCell>
                  <TableCell>{eq.model}</TableCell>
                  <TableCell>{eq.location}</TableCell>
                  <TableCell>{new Date(eq.lastCalibrationDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge className={
                      eq.status === 'Operational' ? 'bg-green-500' :
                      eq.status === 'Needs Maintenance' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }>
                      {eq.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setStatusForm({ equipmentId: eq.equipmentId, status: eq.status })}
                    >
                      Update Status
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button variant="outline" size="sm">Previous</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Register New Equipment</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleRegisterEquipment}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Equipment ID</label>
                <Input
                  placeholder="Enter Equipment ID"
                  value={formData.equipmentId}
                  onChange={e => setFormData({ ...formData, equipmentId: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  placeholder="Enter Equipment Name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Input
                  placeholder="Enter Equipment Type"
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input
                  placeholder="Enter Location"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Last Calibration Date</label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  type="date"
                  className="pl-10"
                  value={formData.lastCalibrationDate}
                  onChange={e => setFormData({ ...formData, lastCalibrationDate: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Enter a brief description of the equipment"
                rows={3}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="flex justify-between">
              <Button variant="outline" type="button" onClick={() => setFormData({
                equipmentId: '',
                name: '',
                type: '',
                location: '',
                lastCalibrationDate: '',
                description: '',
                model: ''
              })}>
                Cancel
              </Button>
              <Button className="bg-[#007BFF] hover:bg-blue-600" type="submit" disabled={loading}>
                <Plus className="mr-2 h-4 w-4" /> {loading ? 'Registering...' : 'Register Equipment'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      
    </div>
  );
}
