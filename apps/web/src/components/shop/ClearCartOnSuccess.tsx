"use client";

import { useEffect } from "react";
import { useCart } from "@/hooks/use-cart";

export default function ClearCartOnSuccess() {
  const { clearCart } = useCart();

  useEffect(() => {
    void clearCart();
  }, [clearCart]);

  return null;
}
