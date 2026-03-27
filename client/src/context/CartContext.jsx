import { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

// Returns the increment step for a given unit
export function getStep(unit) {
  if (unit === 'kg') return 0.25;
  return 1;
}

// Returns the minimum quantity for a given unit
export function getMinQty(unit) {
  return getStep(unit);
}

// Returns display label for a given quantity + unit
export function getQtyDisplay(quantity, unit) {
  if (unit === 'kg') {
    if (quantity < 1) return `${quantity * 1000}g`;
    return `${quantity} kg`;
  }
  if (unit === '250gm') {
    const grams = quantity * 250;
    return grams >= 1000 ? `${grams / 1000} kg` : `${grams}gm`;
  }
  if (unit === 'pack3') {
    return `${quantity * 3} pcs`;
  }
  return `${quantity} pc${quantity !== 1 ? 's' : ''}`;
}

// Returns the price-per label shown on the product card
export function getPriceLabel(unit) {
  if (unit === 'kg') return '/kg';
  if (unit === '250gm') return '/250gm';
  if (unit === 'pack3') return '/3 pcs';
  return '/pc';
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  // items: [{ name, unitPrice, unit, category, imageUrl, stock, quantity }]

  function addToCart(fruit) {
    const initialQty = getMinQty(fruit.unit || 'pcs');
    setItems((prev) => {
      const existing = prev.find((i) => i.name === fruit.name);
      if (existing) {
        const newQty = parseFloat((existing.quantity + getStep(existing.unit)).toFixed(2));
        return prev.map((i) => i.name === fruit.name ? { ...i, quantity: newQty } : i);
      }
      return [...prev, {
        name: fruit.name,
        unitPrice: fruit.price,
        unit: fruit.unit || 'pcs',
        category: fruit.category || 'Other',
        imageUrl: fruit.imageUrl || '',
        stock: fruit.stock,
        quantity: initialQty,
      }];
    });
  }

  function removeFromCart(name) {
    setItems((prev) => prev.filter((i) => i.name !== name));
  }

  function incrementItem(name) {
    setItems((prev) =>
      prev.map((i) => {
        if (i.name !== name) return i;
        return { ...i, quantity: parseFloat((i.quantity + getStep(i.unit)).toFixed(2)) };
      })
    );
  }

  function decrementItem(name) {
    setItems((prev) => {
      const item = prev.find((i) => i.name === name);
      if (!item) return prev;
      const newQty = parseFloat((item.quantity - getStep(item.unit)).toFixed(2));
      if (newQty < getMinQty(item.unit) - 0.001) {
        return prev.filter((i) => i.name !== name);
      }
      return prev.map((i) => i.name === name ? { ...i, quantity: newQty } : i);
    });
  }

  function clearCart() {
    setItems([]);
  }

  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const itemCount = items.length; // number of distinct products

  return (
    <CartContext.Provider value={{
      items, addToCart, removeFromCart, incrementItem, decrementItem, clearCart,
      subtotal, itemCount, getQtyDisplay, getPriceLabel,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
