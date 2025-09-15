// src/components/cart/CartWidget.tsx
"use client";

import React, { useState } from "react";
import { useCart } from "./CartProvider";
import { ShoppingCart, X } from "lucide-react";

export default function CartWidget() {
  const { items, isOpen, open, close, removeItem, clear } = useCart();
  const [loading, setLoading] = useState(false);

  const total = items.reduce((s, it) => s + it.price * (it.qty ?? 1), 0);
  const totalItems = items.reduce((s, i) => s + (i.qty ?? 1), 0);

  const checkout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payments/xendit/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create invoice");
      clear(); // Clear the local cart
      window.location.href = data.invoice_url; // Redirect to Xendit payment page
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button for the cart */}
      <button
        onClick={open}
        className="fixed right-4 bottom-4 z-40 rounded-full shadow-lg h-16 w-16 flex items-center justify-center bg-orange-600 text-white font-semibold transition-transform hover:scale-110"
        aria-label={`Buka keranjang, ${totalItems} item`}
      >
        <ShoppingCart className="w-7 h-7" />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center border-2 border-white">
            {totalItems}
          </span>
        )}
      </button>

      {/* Cart Panel */}
      {isOpen && (
        <div className="fixed right-4 bottom-24 z-40 w-80 max-h-[70vh] bg-white rounded-2xl shadow-2xl border flex flex-col transition-all duration-300 ease-in-out">
          <div className="flex justify-between items-center p-4 border-b">
            <h4 className="font-semibold text-lg">Keranjang Belanja</h4>
            <button onClick={close} className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-8 h-full">
                  <ShoppingCart className="w-12 h-12 text-gray-300 mb-4" />
                  <p className="text-sm text-gray-500">Keranjang Anda masih kosong.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {items.map(it => (
                  <li key={it.id} className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-sm">{it.name}</div>
                      <div className="text-xs text-gray-500">x{it.qty ?? 1}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">Rp {(it.price * (it.qty ?? 1)).toLocaleString("id-ID")}</div>
                      <button onClick={() => removeItem(it.id)} className="text-xs text-red-600 hover:underline">Hapus</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {items.length > 0 && (
            <div className="p-4 border-t">
              <div className="flex justify-between text-sm mb-4">
                <span className="text-gray-600">Total</span>
                <span className="font-semibold text-lg">Rp {total.toLocaleString("id-ID")}</span>
              </div>

              <button
                onClick={checkout}
                disabled={loading}
                className="w-full rounded-xl bg-gray-900 text-white py-3 font-semibold disabled:opacity-50 hover:bg-gray-800 transition-colors"
              >
                {loading ? "Membuat Invoice..." : "Lanjut ke Pembayaran"}
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
