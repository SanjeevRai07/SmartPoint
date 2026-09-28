"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type CartLine = { productId: number; qty: number };

type CartContextValue = {
  lines: CartLine[];
  itemCount: number;
  addToCart: (productId: number, qty?: number) => void;
  updateQty: (productId: number, qty: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "smartbuy-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as CartLine[];
        if (Array.isArray(parsed)) setLines(parsed.filter((x) => x && x.productId && x.qty > 0));
      }
    } catch {
      // Ignore broken local cart data and start clean.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines]);

  const value = useMemo<CartContextValue>(() => ({
    lines,
    itemCount: lines.reduce((sum, item) => sum + item.qty, 0),
    addToCart: (productId, qty = 1) => setLines((current) => {
      const existing = current.find((item) => item.productId === productId);
      if (existing) return current.map((item) => item.productId === productId ? { ...item, qty: item.qty + qty } : item);
      return [...current, { productId, qty }];
    }),
    updateQty: (productId, qty) => setLines((current) => qty <= 0
      ? current.filter((item) => item.productId !== productId)
      : current.map((item) => item.productId === productId ? { ...item, qty } : item)),
    removeFromCart: (productId) => setLines((current) => current.filter((item) => item.productId !== productId)),
    clearCart: () => setLines([]),
  }), [lines]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
