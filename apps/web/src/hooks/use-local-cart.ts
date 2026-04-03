"use client";

import { useState, useEffect, useCallback } from "react";

export interface LocalCartItem {
  productId: string;
  quantity: number;
}

const STORAGE_KEY = "care-sync-cart";
const CART_EVENT = "care-sync-cart-update";

function readCart(): LocalCartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeCart(items: LocalCartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_EVENT));
}

export function useLocalCart() {
  const [items, setItems] = useState<LocalCartItem[]>([]);

  useEffect(() => {
    setItems(readCart());

    const handler = () => setItems(readCart());
    window.addEventListener(CART_EVENT, handler);
    return () => window.removeEventListener(CART_EVENT, handler);
  }, []);

  const addItem = useCallback((productId: string, quantity: number) => {
    const current = readCart();
    const existing = current.find((i) => i.productId === productId);
    const updated = existing
      ? current.map((i) =>
          i.productId === productId
            ? { ...i, quantity: i.quantity + quantity }
            : i,
        )
      : [...current, { productId, quantity }];
    writeCart(updated);
    setItems(updated);
  }, []);

  const setItem = useCallback((productId: string, quantity: number) => {
    const current = readCart();
    const exists = current.some((i) => i.productId === productId);
    const updated = exists
      ? current.map((i) =>
          i.productId === productId ? { ...i, quantity } : i,
        )
      : [...current, { productId, quantity }];
    writeCart(updated);
    setItems(updated);
  }, []);

  const removeItem = useCallback((productId: string) => {
    const updated = readCart().filter((i) => i.productId !== productId);
    writeCart(updated);
    setItems(updated);
  }, []);

  const clearCart = useCallback(() => {
    writeCart([]);
    setItems([]);
  }, []);

  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return { items, count, addItem, setItem, removeItem, clearCart };
}

export function getLocalCart(): LocalCartItem[] {
  return readCart();
}

export function clearLocalCart() {
  if (typeof window !== "undefined") writeCart([]);
}
