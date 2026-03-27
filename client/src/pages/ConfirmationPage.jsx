import { useLocation, Link, Navigate } from 'react-router-dom';
import { getQtyDisplay, getPriceLabel } from '../context/CartContext';

const GST_RATES = { 'Dry Fruits': 5, 'Cut Fruit & Juices': 5 };

function formatDate() {
  return new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
function formatTime() {
  return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export default function ConfirmationPage() {
  const { state } = useLocation();
  if (!state?.items) return <Navigate to="/" replace />;

  const { items, subtotal, totalGST, grandTotal, cashReceived, change, billNo } = state;

  // Group items by GST rate for display
  const exemptItems = items.filter((i) => !GST_RATES[i.category]);
  const taxableItems = items.filter((i) => GST_RATES[i.category]);

  return (
    <div className="bill-page">
      {/* ── Print Button (hidden in print) ── */}
      <div className="bill-actions no-print">
        <div className="bill-success">
          <span className="check-icon">✅</span>
          <h2>Order Placed Successfully!</h2>
          <p>Your bill is ready. Print or save for records.</p>
        </div>
        <button className="btn btn-primary" onClick={() => window.print()}>
          🖨️ Print Bill
        </button>
        <Link to="/" className="btn btn-outline">🛒 New Order</Link>
      </div>

      {/* ── BILL ── */}
      <div className="bill-wrap" id="bill">
        {/* Header */}
        <div className="bill-header">
          <div className="bill-logo">🍊</div>
          <h1 className="bill-title">FRUIT MART</h1>
          <p className="bill-subtitle">Fresh Fruits & Exotic Produce</p>
          <p className="bill-tagline">Quality You Can Taste</p>
        </div>

        <div className="bill-divider">{'─'.repeat(40)}</div>

        {/* Bill Info */}
        <div className="bill-meta">
          <div className="bill-meta-row">
            <span>Bill No:</span><strong>{billNo || 'FM-DEMO'}</strong>
          </div>
          <div className="bill-meta-row">
            <span>Date:</span><span>{formatDate()}</span>
          </div>
          <div className="bill-meta-row">
            <span>Time:</span><span>{formatTime()}</span>
          </div>
          <div className="bill-meta-row">
            <span>Payment:</span><span>Cash</span>
          </div>
        </div>

        <div className="bill-divider">{'─'.repeat(40)}</div>

        {/* Items Table */}
        <table className="bill-table">
          <thead>
            <tr>
              <th className="col-item">Item</th>
              <th className="col-qty">Qty</th>
              <th className="col-rate">Rate</th>
              <th className="col-amt">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx}>
                <td className="col-item">
                  {item.name}
                  {GST_RATES[item.category] ? <span className="gst-tag"> *</span> : ''}
                </td>
                <td className="col-qty">{getQtyDisplay(item.quantity, item.unit)}</td>
                <td className="col-rate">₹{item.unitPrice.toFixed(2)}{getPriceLabel(item.unit)}</td>
                <td className="col-amt">₹{(item.unitPrice * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="bill-divider">{'─'.repeat(40)}</div>

        {/* Totals */}
        <div className="bill-totals">
          <div className="bill-total-row">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>

          {exemptItems.length > 0 && (
            <div className="bill-total-row gst-row">
              <span>GST (Fresh Produce — Exempt)</span>
              <span>₹0.00</span>
            </div>
          )}

          {taxableItems.length > 0 && (
            <div className="bill-total-row gst-row">
              <span>GST @ 5% (Dry Fruits / Juices *)</span>
              <span>₹{totalGST.toFixed(2)}</span>
            </div>
          )}

          <div className="bill-divider-thin" />

          <div className="bill-total-row grand">
            <span>GRAND TOTAL</span>
            <span>₹{grandTotal.toFixed(2)}</span>
          </div>

          {cashReceived != null && (
            <>
              <div className="bill-total-row cash-row">
                <span>Cash Received</span>
                <span>₹{cashReceived.toFixed(2)}</span>
              </div>
              <div className="bill-total-row change-row">
                <span>Change Returned</span>
                <span>₹{(change ?? 0).toFixed(2)}</span>
              </div>
            </>
          )}
        </div>

        <div className="bill-divider">{'─'.repeat(40)}</div>

        {/* Footer */}
        <div className="bill-footer">
          {taxableItems.length > 0 && (
            <p className="gst-note">* GST included in item price</p>
          )}
          <p>Fresh fruits are GST Exempt under Indian GST Law</p>
          <p className="bill-thankyou">Thank you for shopping with us! 🙏</p>
          <p>Visit us again for fresh daily produce</p>
        </div>
      </div>
    </div>
  );
}
