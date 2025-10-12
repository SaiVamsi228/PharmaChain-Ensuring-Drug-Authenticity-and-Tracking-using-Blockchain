import { Routes, Route } from "react-router-dom"; // Removed BrowserRouter import
import { Toaster } from "./components/ui/toaster";
import { ThemeProvider } from "./components/theme-provider";
import { ToastContainer } from "react-toastify";

// Home page
import Home from "./pages/Home";

// Manufacturer routes
import ManufacturerLayout from "./layouts/ManufacturerLayout";
import ManufacturerDashboard from "./pages/manufacturer/Dashboard";
import BatchManagement from "./pages/manufacturer/BatchManagement"; // Already present
import EquipmentManagement from "./pages/manufacturer/EquipmentManagement";
import RecallManagement from "./pages/manufacturer/RecallManagement";
import AffectedBatches from "./pages/manufacturer/AffectedBatches";
import ManufacturerAnalytics from "./pages/manufacturer/Analytics";

// Technician routes
import TechnicianLayout from "./layouts/TechnicianLayout";
import TechnicianDashboard from "./pages/technician/Dashboard";
import EquipmentRegistry from "./pages/technician/Registry";
import MaintenancePage from "./pages/technician/Maintenance";
import DefectsPage from "./pages/technician/Defects";
import TechnicianAnalytics from "./pages/technician/Analytics";

// Distributor routes
import DistributorLayout from "./layouts/DistributorLayout";
import DistributorDashboard from "./pages/distributor/Dashboard";
import ShipmentsPage from "./pages/distributor/Shipments";
import InventoryPage from "./pages/distributor/Inventory";
import TransfersPage from "./pages/distributor/Transfers";
import SplitBatchesPage from "./pages/distributor/SplitBatches"; 
import DistributorAnalytics from "./pages/distributor/Analytics";

// Pharmacist routes
import PharmacistLayout from "./layouts/PharmacistLayout";
import PharmacistDashboard from "./pages/pharmacist/Dashboard";
import PharmacistShipments from "./pages/pharmacist/PharmacistShipments";
import PharmacistInventory from "./pages/pharmacist/Inventory";
import DispensingPage from "./pages/pharmacist/Dispensing";
import PharmacistRecalls from "./pages/pharmacist/Recalls";
import PharmacistAnalytics from "./pages/pharmacist/Analytics";

// Patient routes
import PatientLayout from "./layouts/PatientLayout";
import PatientVerification from "./pages/patient/Verification";
import PatientHistory from "./pages/patient/History";
import PatientReminders from "./pages/patient/Reminders";
import PatientReport from "./pages/patient/Report";
import PatientInfo from "./pages/patient/Info";

// === ADDITIONS START ===
import AdminDashboard from "./pages/admin/AdminDashboard";
import Login from "./pages/auth/Login";
// === ADDITIONS END ===

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        {/* Home route */}
        <Route path="/" element={<Home />} /> 

        {/* Auth route */}
        <Route path="/login" element={<Login />} />

        {/* Admin route */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Manufacturer routes */}
        <Route path="/manufacturer" element={<ManufacturerLayout />}>
          <Route index element={<ManufacturerDashboard />} />
          <Route path="batch" element={<BatchManagement />} />
          <Route path="equipment" element={<EquipmentManagement />} />
          <Route path="recalls" element={<RecallManagement />} />
          <Route path="affected-batches" element={<AffectedBatches />} />
          <Route path="analytics" element={<ManufacturerAnalytics />} />
        </Route>

        {/* Technician routes */}
        <Route path="/technician" element={<TechnicianLayout />}>
          <Route index element={<TechnicianDashboard />} />
          <Route path="registry" element={<EquipmentRegistry />} />
          <Route path="maintenance" element={<MaintenancePage />} />
          <Route path="defects" element={<DefectsPage />} />
          <Route path="analytics" element={<TechnicianAnalytics />} />
        </Route>

        {/* Distributor routes */}
        <Route path="/distributor" element={<DistributorLayout />}>
          <Route index element={<DistributorDashboard />} />
          <Route path="shipments" element={<ShipmentsPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="transfers" element={<TransfersPage />} />
          <Route path="split-batches" element={<SplitBatchesPage />} />
          <Route path="analytics" element={<DistributorAnalytics />} />
        </Route>

        {/* Pharmacist routes */}
        <Route path="/pharmacist" element={<PharmacistLayout />}>
          <Route index element={<PharmacistDashboard />} />
          <Route path="shipments" element={<PharmacistShipments />} />
          <Route path="inventory" element={<PharmacistInventory />} />
          <Route path="dispensing" element={<DispensingPage />} />
          <Route path="recalls" element={<PharmacistRecalls />} />
          <Route path="analytics" element={<PharmacistAnalytics />} />
        </Route>

        {/* Patient routes */}
        <Route path="/patient" element={<PatientLayout />}>
          <Route index element={<PatientVerification />} />
          <Route path="history" element={<PatientHistory />} />
          <Route path="reminders" element={<PatientReminders />} />
          <Route path="report" element={<PatientReport />} />
          <Route path="info" element={<PatientInfo />} />
        </Route>
      </Routes>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
