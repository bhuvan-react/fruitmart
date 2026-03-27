const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const { getRows } = require('../services/sheets');

const router = express.Router();

// GET /api/fruits (JWT protected)
router.get('/', verifyToken, async (req, res) => {
  try {
    const rows = await getRows('Fruits');
    // Columns: [0]=Name, [1]=Price, [2]=ImageURL, [3]=Stock, [4]=Category, [5]=Unit, [6]=Availability
    const fruits = rows
      .filter((row) => row[0]) // skip empty rows
      .map((row) => ({
        name: row[0],
        price: parseFloat(row[1]) || 0,
        imageUrl: row[2] || '',
        stock: parseInt(row[3], 10) || 0,
        category: row[4] || 'Other',
        unit: row[5] || 'pcs',
        available: (row[6] || 'Yes').trim().toLowerCase() === 'yes',
      }));

    return res.json(fruits);
  } catch (err) {
    console.error('Fruits error:', err);
    return res.status(500).json({ error: 'Failed to fetch fruits' });
  }
});

module.exports = router;
