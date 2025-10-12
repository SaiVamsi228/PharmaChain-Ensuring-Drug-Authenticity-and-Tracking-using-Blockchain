export interface Equipment {
  equipmentId: string;
  name: string;
  model: string;
  lastCalibrationDate: string;
  status: 'Operational' | 'Needs Maintenance' | 'Needs Immediate Service';
  location?: string;
  description?: string;
  createdAt?: string;
}
