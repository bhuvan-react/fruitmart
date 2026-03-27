const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const { appendRow } = require('../services/sheets');

const router = express.Router();

function formatBillNo() {
  const now = new Date();
  const d = now.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: '2-digit' }).replace(/\//g, '');
  const t = now.toTimeString().slice(0, 5).replace(':', '');
  return `FM-${d}-${t}`;
}

// GST rates by category (fresh fruits/vegetables = 0%, processed = 5%)
const GST_RATES = {
  'Dry Fruits': 5,
  'Cut Fruit & Juices': 5,
};

// POST /api/order (JWT protected)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { items, cashReceived } = req.body;
    const { name, phone } = req.user;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const billNo = formatBillNo();
    const now = new Date();
    const date = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const time = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    // Compute per-item and bill totals
    let subtotal = 0;
    let totalGST = 0;

    const itemRows = items.map((item) => {
      const itemTotal = parseFloat((item.unitPrice * item.quantity).toFixed(2));
      const gstRate = GST_RATES[item.category] || 0;
      const gstAmt = parseFloat(((itemTotal * gstRate) / 100).toFixed(2));
      subtotal += itemTotal;
      totalGST += gstAmt;
      return { ...item, itemTotal, gstRate, gstAmt };
    });

    const grandTotal = parseFloat((subtotal + totalGST).toFixed(2));
    const cash = typeof cashReceived === 'number' && cashReceived > 0 ? cashReceived : '';
    const change = cash !== '' ? parseFloat((cash - grandTotal).toFixed(2)) : '';

    // Write rows: first row has full bill info, subsequent rows only have item details
    for (let i = 0; i < itemRows.length; i++) {
      const item = itemRows[i];
      const isFirst = i === 0;
      await appendRow('Orders', [
        isFirst ? billNo        : '',
        isFirst ? date          : '',
        isFirst ? time          : '',
        isFirst ? name          : '',
        isFirst ? phone         : '',
        item.category,
        item.name,
        item.qtyDisplay,
        item.unitPrice.toFixed(2),
        item.itemTotal.toFixed(2),
        isFirst ? subtotal.toFixed(2)                        : '',
        isFirst ? ''                                          : '',   // GST% — blank on non-first
        isFirst ? totalGST.toFixed(2)                        : '',
        isFirst ? grandTotal.toFixed(2)                      : '',
        isFirst ? (cash !== '' ? cash.toFixed(2) : 'Cash')   : '',
        isFirst ? (change !== '' ? change.toFixed(2) : '-')  : '',
      ]);
    }

    return res.status(201).json({
      message: 'Order placed successfully',
      billNo,
      grandTotal,
      change: change !== '' ? change : null,
    });
  } catch (err) {
    console.error('Order error:', err);
    return res.status(500).json({ error: 'Failed to place order' });
  }
});

module.exports = router;
