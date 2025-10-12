const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Routes
const batchRoutes = require("./routes/batches");
const equipmentRoutes = require("./routes/equipment");
const recallRoutes = require("./routes/recalls");
const defectRoutes = require("./routes/defects");
const shipmentRoutes = require("./routes/distributorShipments");
const transferRoutes = require("./routes/transfers");
const dispensationRoutes = require("./routes/pharmacistDispensations");
const patientRoutes = require("./routes/patients");
const authRoutes = require("./routes/auth");
const manufacturerTransfersRoutes = require("./routes/manufacturerTransfers");
const inventoryRoutes = require("./routes/inventory");
const distributorTransfersRoutes = require("./routes/distributorTransfers"); // New distributor transfers route
const pharmacistShipmentsRoutes = require("./routes/pharmacistShipments");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Mount routes
app.use("/api/batches", batchRoutes);
app.use("/api/equipment", equipmentRoutes);
app.use("/api/recalls", recallRoutes);
app.use("/api/defects", defectRoutes);
app.use("/api/shipments", shipmentRoutes);
app.use("/api/transfers", transferRoutes);
app.use("/api/dispensations", dispensationRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/manufacturerTransfers", manufacturerTransfersRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/distributorTransfers", distributorTransfersRoutes); // Mount the new route
app.use("/api/pharmacist/shipments", pharmacistShipmentsRoutes);
app.get("/api/health", (req, res) => {
  res.json({ status: "Backend running" });
});

// Add a custom JSON serializer for BigInt
const originalJsonStringify = JSON.stringify;
JSON.stringify = (value, replacer, space) => {
  return originalJsonStringify(
    value,
    (key, val) => {
      if (typeof val === "bigint") {
        return val.toString(); // Convert BigInt to string
      }
      return replacer ? replacer(key, val) : val;
    },
    space
  );
};

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));