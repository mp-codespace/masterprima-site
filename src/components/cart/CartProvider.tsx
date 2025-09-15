// src/components/cart/CartProvider.tsx
"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = { id: string; name: string; price: number; qty?: number };
type Ctx = {
  items: CartItem[];
  isOpen: boolean;
  addItem: (it: CartItem) => void;
  removeItem: (id: string) => void;
  open: () => void;
  close: () => void;
  clear: () => void;
};
const CartCtx = createContext<Ctx | null>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setOpen] = useState(false);

  // persist sederhana
  useEffect(() => {
    const raw = localStorage.getItem("mp-cart");
    if (raw) setItems(JSON.parse(raw));
  }, []);
  useEffect(() => {
    localStorage.setItem("mp-cart", JSON.stringify(items));
  }, [items]);

  const ctx = useMemo<Ctx>(() => ({
    items,
    isOpen,
    addItem: (it) => {
      setItems((prev) => {
        const exists = prev.find(p => p.id === it.id);
        if (exists) {
          return prev.map(p => p.id === it.id ? { ...p, qty: (p.qty ?? 1) + (it.qty ?? 1) } : p);
        }
        return [...prev, { ...it, qty: it.qty ?? 1 }];
      });
      setOpen(true);
    },
    removeItem: (id) => setItems(prev => prev.filter(p => p.id !== id)),
    open: () => setOpen(true),
    close: () => setOpen(false),
    clear: () => setItems([]),
  }), [items, isOpen]);

  return <CartCtx.Provider value={ctx}>{children}</CartCtx.Provider>;
};

export const useCart = () => {
  const v = useContext(CartCtx);
  if (!v) throw new Error("useCart must be used within CartProvider");
  return v;
};
