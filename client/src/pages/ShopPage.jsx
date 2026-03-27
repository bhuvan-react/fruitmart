import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCart, getQtyDisplay, getPriceLabel } from '../context/CartContext';

const CATEGORIES = ['All', 'Exotic Fruits', 'Exotic Vegetables', 'Dry Fruits', 'Local Fruits', 'Cut Fruit & Juices'];

const FRUIT_EMOJIS = {
  apple: '🍎', mango: '🥭', banana: '🍌', orange: '🍊', grape: '🍇',
  strawberry: '🍓', watermelon: '🍉', pineapple: '🍍', peach: '🍑',
  cherry: '🍒', lemon: '🍋', coconut: '🥥', pear: '🍐', kiwi: '🥝',
  blueberry: '🫐', melon: '🍈', pomegranate: '🍷', avocado: '🥑',
  dragon: '🐉', litchi: '🍒', dates: '🌴', salad: '🥗',
  juice: '🧃', brocolli: '🥦', lettuce: '🥬', pepper: '🫑',
  mushroom: '🍄', corn: '🌽', onion: '🧅', tomato: '🍅',
  parsley: '🌿', basil: '🌿', cashew: '🥜', almond: '🌰',
  pista: '🌰', walnut: '🌰', raisin: '🍇', seed: '🌱',
  fig: '🍐', longan: '🍒', papaya: '🍈', guava: '🍏',
};

function getFruitEmoji(name = '') {
  const lower = name.toLowerCase();
  for (const [key, emoji] of Object.entries(FRUIT_EMOJIS)) {
    if (lower.includes(key)) return emoji;
  }
  return '🛒';
}

function AvailabilityBadge({ available, stock }) {
  if (!available) return <span className="stock out">Out of Stock</span>;
  if (stock <= 5) return <span className="stock low">Only {stock} left!</span>;
  return null;
}

function CartStepper({ item, onIncrement, onDecrement }) {
  return (
    <div className="cart-stepper">
      <button className="stepper-btn" onClick={onDecrement}>−</button>
      <span className="stepper-qty">{getQtyDisplay(item.quantity, item.unit)}</span>
      <button className="stepper-btn" onClick={onIncrement}>+</button>
    </div>
  );
}

export default function ShopPage() {
  const { addToCart, incrementItem, decrementItem, items, subtotal } = useCart();
  const navigate = useNavigate();
  const [fruits, setFruits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    api.get('/fruits')
      .then(({ data }) => setFruits(data))
      .catch(() => setError('Failed to load products. Please refresh.'))
      .finally(() => setLoading(false));
  }, []);

  const cartMap = Object.fromEntries(items.map((i) => [i.name, i]));

  const filtered = fruits.filter((f) => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'All' || f.category === activeCategory;
    return matchSearch && matchCat;
  });

  // Count of cart items per category
  function cartCountForCategory(cat) {
    if (cat === 'All') return items.length;
    return items.filter((i) => i.category === cat).length;
  }

  if (loading) return (
    <div className="spinner-wrap"><div className="spinner" /></div>
  );

  return (
    <div className="shop-wrap">
      <div className="shop-header">
        <h2>🛍️ Fresh Produce</h2>
        <input
          className="search-bar"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Category Tabs */}
      <div className="category-tabs">
        {CATEGORIES.map((cat) => {
          const count = cartCountForCategory(cat);
          return (
            <button
              key={cat}
              className={`cat-tab${activeCategory === cat ? ' active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
              {count > 0 && <span className="tab-count">{count}</span>}
            </button>
          );
        })}
      </div>

      {error && <div className="form-error">{error}</div>}

      {filtered.length === 0 && !error && (
        <p style={{ color: '#9e9e9e', textAlign: 'center', padding: '3rem 0' }}>
          No products found{search ? ` for "${search}"` : ''} in {activeCategory}
        </p>
      )}

      {items.length > 0 && (
        <button className="go-to-cart-btn" onClick={() => navigate('/cart')}>
          🛒 Go to Cart — {items.length} item{items.length !== 1 ? 's' : ''} &nbsp;|&nbsp; ₹{subtotal.toFixed(2)}
        </button>
      )}

      <div className="fruits-grid">
        {filtered.map((fruit) => {
          const inCart = cartMap[fruit.name];
          return (
            <div className="fruit-card" key={fruit.name}>
              {fruit.imageUrl ? (
                <img
                  src={fruit.imageUrl}
                  alt={fruit.name}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className="img-placeholder"
                style={{ display: fruit.imageUrl ? 'none' : 'flex' }}
              >
                {getFruitEmoji(fruit.name)}
              </div>

              <div className="fruit-info">
                {activeCategory === 'All' && <span className="cat-badge">{fruit.category}</span>}
                <h3>{fruit.name}</h3>
                <div className="price">
                  ₹{fruit.price.toFixed(2)}
                  <span className="price-unit">{getPriceLabel(fruit.unit)}</span>
                </div>
                <AvailabilityBadge available={fruit.available} stock={fruit.stock} />

                {!fruit.available ? (
                  <button className="btn btn-full add-btn" disabled style={{ background: '#e0e0e0', color: '#9e9e9e', cursor: 'not-allowed' }}>
                    Out of Stock
                  </button>
                ) : inCart ? (
                  <CartStepper
                    item={inCart}
                    onIncrement={() => incrementItem(fruit.name)}
                    onDecrement={() => decrementItem(fruit.name)}
                  />
                ) : (
                  <button
                    className="btn btn-primary btn-full add-btn"
                    onClick={() => addToCart(fruit)}
                  >
                    + Add to Cart
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
