const mongoose = require('mongoose');
const Batch = require('./Batch');
const Equipment = require('./Equipment');
const ServiceHistory = require('./ServiceHistory');
const Recall = require('./Recall');
const RecallDistribution = require('./RecallDistribution');
const Defect = require('./Defect');
const Shipment = require('./Shipment');
const Transfer = require('./Transfer');
const Dispensation = require('./Dispensation');
const Patient = require('./Patient');
const AdherenceReport = require('./AdherenceReport');
const dotenv = require('dotenv');

dotenv.config();

// Log the MongoDB URI (without credentials for security)
console.log('Attempting to connect to MongoDB at:', process.env.MONGODB_URI.split('@')[1]);

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
})
    .then(async () => {
        console.log('MongoDB connected successfully');
        
        // Verify connection by listing collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Existing collections:', collections.map(c => c.name));

        try {
            // Clear all existing data
            await Batch.deleteMany({});
            await Equipment.deleteMany({});
            await ServiceHistory.deleteMany({});
            await Recall.deleteMany({});
            await RecallDistribution.deleteMany({});
            await Defect.deleteMany({});
            await Shipment.deleteMany({});
            await Transfer.deleteMany({});
            await Dispensation.deleteMany({});
            await Patient.deleteMany({});
            await AdherenceReport.deleteMany({});
            console.log('Cleared existing data');

            // Seed Batches
            const batch = await Batch.create({
                batchId: 'PA-2024',
                drugName: 'Paracetamol',
                drugDetails: { ingredients: 'Paracetamol, Starch', strength: '500mg' },
                manufacturingDate: new Date('2025-01-01'),
                expiryDate: new Date('2026-01-01'),
                batchSize: 1000,
                status: 'New',
                currentOwner: '0xManufacturerAddress',
                qrCodeHash: 'QmTestHash1',
                createdAt: new Date()
            });
            console.log('Created batch:', batch.batchId);

            // Seed Equipment
            const equipment = await Equipment.create({
                equipmentId: 'EQP-789',
                name: 'Tablet Press',
                model: 'T-200',
                lastServiceDate: new Date('2025-02-01'),
                nextServiceDate: new Date('2025-08-01'),
                status: 'Operational',
                uptimePercentage: 94.3,
                productionVolume: 5000,
                efficiencyScore: 87.2,
                lastCalibrationDate: new Date('2025-02-01'),
                createdAt: new Date()
            });
            console.log('Created equipment:', equipment.equipmentId);

            // Seed Service History
            const serviceHistory = await ServiceHistory.create({
                equipmentId: equipment.equipmentId,
                serviceDate: new Date('2025-02-01'),
                serviceType: 'Routine Maintenance',
                technician: 'John Doe',
                notes: 'Regular calibration and cleaning performed'
            });
            console.log('Created service history for equipment:', serviceHistory.equipmentId);

            // Seed Recall
            const recall = await Recall.create({
                recallId: 'RC-2024-001',
                batchId: batch.batchId,
                reason: 'Potential contamination',
                riskLevel: 'High',
                notificationType: 'Public',
                initiatedDate: new Date('2025-03-01'),
                status: 'Active',
                recovery: {
                    percentage: 75,
                    recoveredUnits: 750,
                    pendingUnits: 250,
                    lastUpdate: new Date()
                }
            });
            console.log('Created recall:', recall.recallId);

            // Seed Recall Distribution
            const recallDistribution = await RecallDistribution.create({
                recallId: recall.recallId,
                name: 'City Hospital',
                walletAddress: '0xHospitalAddress',
                units: 50
            });
            console.log('Created recall distribution for:', recallDistribution.name);

            // Seed Defect
            const defect = await Defect.create({
                defectId: 'DF-2024-001',
                equipmentId: equipment.equipmentId,
                severity: 'Medium',
                status: 'Open',
                description: 'Temperature fluctuation detected',
                impact: 'Potential quality issues',
                photoHash: 'QmDefectPhoto1'
            });
            console.log('Created defect:', defect.defectId);

            // Seed Shipment
            const shipment = await Shipment.create({
                shipmentId: 'SH-2024-001',
                batchId: batch.batchId,
                origin: 'Manufacturing Facility',
                destination: 'Distribution Center',
                products: [{
                    batchId: batch.batchId,
                    quantity: 500
                }],
                departureDate: new Date('2025-02-15'),
                eta: new Date('2025-02-16'),
                status: 'In Transit',
                temperature: 25,
                carrier: 'Secure Pharma Logistics',
                trackingDetails: 'In transit to distribution center'
            });
            console.log('Created shipment:', shipment.shipmentId);

            // Seed Transfer
            const transfer = await Transfer.create({
                transferId: 'TR-2024-001',
                source: 'Warehouse A',
                destination: 'Pharmacy B',
                products: [{
                    batchId: batch.batchId,
                    quantity: 100
                }],
                initiationDate: new Date('2025-02-20'),
                status: 'In Progress',
                verificationStatus: 'Pending',
                transferMethod: 'Secure Transport',
                expectedCompletion: new Date('2025-02-21')
            });
            console.log('Created transfer:', transfer.transferId);

            // Seed Patient
            const patient = await Patient.create({
                patientId: 'PAT-2024-001',
                name: 'John Smith',
                age: 45,
                gender: 'Male',
                contact: {
                    phone: '1234567890',
                    email: 'john.smith@example.com',
                    address: '123 Main St'
                },
                medicalDetails: {
                    bloodGroup: 'O+',
                    allergies: ['Penicillin'],
                    conditions: ['Hypertension']
                },
                medications: [{
                    batchId: batch.batchId,
                    adherence: 95
                }]
            });
            console.log('Created patient:', patient.patientId);

            // Seed Dispensation
            const dispensation = await Dispensation.create({
                batchId: batch.batchId,
                patientId: patient.patientId,
                prescriptionHash: 'QmPrescription1',
                date: new Date('2025-02-25'),
                quantity: 30,
                status: 'Completed'
            });
            console.log('Created dispensation for patient:', dispensation.patientId);

            // Seed Adherence Report
            const adherenceReport = await AdherenceReport.create({
                patientId: patient.patientId,
                date: new Date('2025-03-01'),
                adherenceRate: 95,
                sideEffects: ['None reported'],
                recommendations: 'Continue current dosage'
            });
            console.log('Created adherence report for patient:', adherenceReport.patientId);

            // Verify all collections
            const allCollections = await mongoose.connection.db.listCollections().toArray();
            console.log('\nAll collections after seeding:', allCollections.map(c => c.name));

            console.log('\nData seeded successfully');
        } catch (error) {
            console.error('Error during seeding:', error);
            throw error; // Re-throw to be caught by the outer catch
        } finally {
            await mongoose.disconnect();
            console.log('MongoDB disconnected');
        }
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1); // Exit with error code
    }); 