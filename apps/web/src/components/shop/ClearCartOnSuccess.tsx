"use client";

import { useEffect, useRef } from "react";
import { useCart } from "@/hooks/use-cart";

export default function ClearCartOnSuccess() {
  const { clearCart } = useCart();
  const clearedRef = useRef(false);

  useEffect(() => {
    if (clearedRef.current) return;
    clearedRef.current = true;
    void clearCart();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
