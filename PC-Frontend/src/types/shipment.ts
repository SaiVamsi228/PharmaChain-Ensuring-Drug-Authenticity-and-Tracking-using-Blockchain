// src/types/shipment.ts
export interface Product {
  batchId: string;
  quantity: number;
}

export interface Shipment {
  shipmentId: string;
  origin: string;
  destination: string;
  products: Product[];
  departureDate: string;
  eta: string;
  status: "In Transit" | "Received" | "Issue" | "Pending";
  temperature?: string;
  carrier?: string;
  trackingDetails?: string;
}

export interface ShipmentFormData {
    shipmentId: string;
    batchId: string;
    origin: string;
    destination: string;
    products: { batchId: string; quantity: number }[];
    departureDate: string;
    eta: string;
    temperature?: number;
    carrier: string;
    trackingDetails: string;
}