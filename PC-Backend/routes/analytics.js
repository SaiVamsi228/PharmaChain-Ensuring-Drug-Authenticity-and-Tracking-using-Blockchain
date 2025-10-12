const express = require('express');
const Batch = require('../models/Batch');
const Equipment = require('../models/Equipment');
const Recall = require('../models/Recall');

const router = express.Router();

router.get('/analytics', async (req, res) => {
  try {
    const { period } = req.query;
    let dateFilter;
    switch (period) {
      case '7days':
        dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '90days':
        dateFilter = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        dateFilter = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        break;
      default: // 30days
        dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    const batches = await Batch.find({ manufacturingDate: { $gte: dateFilter } });
    const equipment = await Equipment.find();
    const recalls = await Recall.find({ initiatedDate: { $gte: dateFilter } });

    const analytics = {
      production: {
        totalBatches: batches.length,
        unitsProduced: batches.reduce((sum, b) => sum + b.batchSize, 0),
        activeRecalls: recalls.filter(r => r.status === 'Active').length,
        avgProductionTime: '3.2 days', // Calculate based on batch data
        volumeByEquipment: equipment.map(e => ({
          equipmentId: e.equipmentId,
          units: batches.filter(b => b.equipmentIds.includes(e.equipmentId)).reduce((sum, b) => sum + b.batchSize, 0),
        })),
      },
      equipment: {
        totalEquipment: equipment.length,
        operationalPercentage: `${((equipment.filter(e => e.status === 'Operational').length / equipment.length) * 100).toFixed(1)}%`,
        avgUptime: '92.7%', // Calculate based on maintenance logs
        maintenanceCost: '$45,200', // Aggregate from maintenance records
        efficiency: equipment.map(e => ({
          equipmentId: e.equipmentId,
          efficiency: e.status === 'Operational' ? 90 : e.status === 'Needs Maintenance' ? 50 : 10,
        })),
      },
      quality: {
        qualityScore: '94.6%', // Calculate from QA checks
        failedBatches: batches.filter(b => b.status === 'Recalled').length,
        qaPassRate: '97.2%', // Calculate from QA logs
        avgQaTime: '6.5 hrs', // Calculate from QA logs
        metricsByDrugType: [
          { drugType: 'Paracetamol', score: 95 },
          { drugType: 'Ibuprofen', score: 90 },
          { drugType: 'Aspirin', score: 92 },
        ],
      },
      recalls: {
        totalRecalls: recalls.length,
        recoveryRate: recalls.length ? `${(recalls.reduce((sum, r) => sum + r.recovery.percentage, 0) / recalls.length).toFixed(1)}%` : '0%',
        avgResponseTime: '4.2 hrs', // Calculate from recall logs
        recallCost: '$78,500', // Aggregate from recall costs
        history: [
          { quarter: '2023-Q1', recalls: 1 },
          { quarter: '2023-Q3', recalls: 0 },
          { quarter: '2024-Q1', recalls: 1 },
          { quarter: '2024-Q3', recalls: 2 },
        ],
      },
    };

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
