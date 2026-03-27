import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart, getQtyDisplay, getPriceLabel } from '../context/CartContext';
import api from '../api/axios';

const GST_RATES = { 'Dry Fruits': 5, 'Cut Fruit & Juices': 5 };

function getFruitEmoji(name = '') {
  const map = {
    apple: '🍎', mango: '🥭', banana: '🍌', orange: '🍊', grape: '🍇',
    watermelon: '🍉', pineapple: '🍍', kiwi: '🥝', blueberry: '🫐',
    avocado: '🥑', pomegranate: '🍷', pear: '🍐', dragon: '🐉',
    juice: '🧃', salad: '🥗', cashew: '🥜', dates: '🌴',
  };
  const lower = name.toLowerCase();
  for (const [key, emoji] of Object.entries(map)) {
    if (lower.includes(key)) return emoji;
  }
  return '🛒';
}

export default function CartPage() {
  const { items, incrementItem, decrementItem, removeFromCart, clearCart, subtotal, itemCount } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cashReceived, setCashReceived] = useState('');

  // Compute GST per item and totals
  const itemsWithGST = items.map((item) => {
    const itemTotal = item.unitPrice * item.quantity;
    const gstRate = GST_RATES[item.category] || 0;
    const gstAmt = (itemTotal * gstRate) / 100;
    return { ...item, itemTotal, gstRate, gstAmt };
  });
  const totalGST = itemsWithGST.reduce((s, i) => s + i.gstAmt, 0);
  const grandTotal = subtotal + totalGST;
  const cashNum = parseFloat(cashReceived) || 0;
  const change = cashNum > 0 ? cashNum - grandTotal : null;

  async function handleCheckout() {
    if (cashNum > 0 && cashNum < grandTotal) {
      setError(`Cash received (₹${cashNum}) is less than total (₹${grandTotal.toFixed(2)})`);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const payload = {
        items: itemsWithGST.map((i) => ({
          name: i.name,
          unitPrice: i.unitPrice,
          unit: i.unit,
          category: i.category,
          quantity: i.quantity,
          qtyDisplay: getQtyDisplay(i.quantity, i.unit),
          itemTotal: i.itemTotal,
        })),
        cashReceived: cashNum > 0 ? cashNum : null,
      };
      const { data } = await api.post('/order', payload);
      const snapshot = {
        items: itemsWithGST,
        subtotal,
        totalGST,
        grandTotal,
        cashReceived: cashNum > 0 ? cashNum : null,
        change,
        billNo: data.billNo,
      };
      clearCart();
      navigate('/confirmation', { state: snapshot });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to place order. Try again.');
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="cart-wrap">
        <h2>Your Cart</h2>
        <div className="cart-empty">
          <div className="icon">🛒</div>
          <p>Your cart is empty</p>
          <Link to="/" className="btn btn-primary">Browse Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-wrap">
      <h2>Your Cart ({itemCount} item{itemCount !== 1 ? 's' : ''})</h2>

      {items.map((item) => (
        <div className="cart-item" key={item.name}>
          <div className="item-emoji">{getFruitEmoji(item.name)}</div>
          <div className="item-info">
            <h4>{item.name}</h4>
            <div className="item-price">₹{item.unitPrice.toFixed(2)}{getPriceLabel(item.unit)}</div>
            {GST_RATES[item.category] ? <div className="item-gst">GST {GST_RATES[item.category]}%</div> : null}
          </div>

          <div className="qty-ctrl">
            <button onClick={() => decrementItem(item.name)}>−</button>
            <span>{getQtyDisplay(item.quantity, item.unit)}</span>
            <button onClick={() => incrementItem(item.name)}>+</button>
          </div>

          <div className="item-total">₹{(item.unitPrice * item.quantity).toFixed(2)}</div>

          <button className="btn btn-danger btn-sm" onClick={() => removeFromCart(item.name)} title="Remove">✕</button>
        </div>
      ))}

      <div className="cart-summary">
        <div className="summary-row"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
        {totalGST > 0 && (
          <div className="summary-row"><span>GST</span><span>₹{totalGST.toFixed(2)}</span></div>
        )}
        {totalGST === 0 && (
          <div className="summary-row gst-exempt"><span>GST</span><span>Exempt (0%)</span></div>
        )}
        <div className="total-row"><span>Grand Total</span><span>₹{grandTotal.toFixed(2)}</span></div>

        {/* Cash Payment */}
        <div className="cash-section">
          <label className="cash-label">Cash Received (₹)</label>
          <input
            type="number"
            className="cash-input"
            placeholder={`Enter amount (min ₹${grandTotal.toFixed(2)})`}
            value={cashReceived}
            onChange={(e) => { setCashReceived(e.target.value); setError(''); }}
            min={grandTotal}
          />
          {change !== null && change >= 0 && (
            <div className="change-display">
              💵 Return Change: <strong>₹{change.toFixed(2)}</strong>
            </div>
          )}
          {change !== null && change < 0 && (
            <div className="change-insufficient">
              ⚠️ Amount short by ₹{Math.abs(change).toFixed(2)}
            </div>
          )}
        </div>

        {error && <div className="form-error mt-1">{error}</div>}

        <button
          className="btn btn-orange btn-full checkout-btn"
          onClick={handleCheckout}
          disabled={loading}
        >
          {loading ? 'Placing Order…' : '🧾 Place Order & Generate Bill'}
        </button>
        <Link to="/" className="btn btn-outline btn-full mt-1">← Continue Shopping</Link>
      </div>
    </div>
  );
}
