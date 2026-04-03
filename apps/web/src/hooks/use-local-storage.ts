"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";

const storageEventName = (key: string) => `care-sync-storage:${key}`;

function readRawStorageValue(key: string): string | null {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function parseStorageValue<T>(raw: string | null, fallback: T): T {
  if (raw == null) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function useLocalStorage<T>(key: string, fallback: T) {
  const cacheRef = useRef<{
    raw: string | null;
    value: T;
  }>({
    raw: null,
    value: fallback,
  });

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (typeof window === "undefined") return () => {};

      const customEvent = storageEventName(key);

      const handleChange = (event: Event) => {
        if (event instanceof StorageEvent) {
          if (event.key !== null && event.key !== key) return;
        }

        onStoreChange();
      };

      window.addEventListener("storage", handleChange);
      window.addEventListener(customEvent, handleChange);

      return () => {
        window.removeEventListener("storage", handleChange);
        window.removeEventListener(customEvent, handleChange);
      };
    },
    [key],
  );

  const getSnapshot = useCallback(() => {
    const raw = readRawStorageValue(key);

    if (cacheRef.current.raw === raw) {
      return cacheRef.current.value;
    }

    const nextValue = parseStorageValue(raw, fallback);

    cacheRef.current = {
      raw,
      value: nextValue,
    };

    return nextValue;
  }, [key, fallback]);

  const getServerSnapshot = useCallback(() => fallback, [fallback]);

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setValue = useCallback(
    (nextValue: T | ((current: T) => T)) => {
      const currentRaw = readRawStorageValue(key);
      const currentValue =
        cacheRef.current.raw === currentRaw
          ? cacheRef.current.value
          : parseStorageValue(currentRaw, fallback);

      const resolvedValue =
        typeof nextValue === "function"
          ? (nextValue as (current: T) => T)(currentValue)
          : nextValue;

      const nextRaw = JSON.stringify(resolvedValue);

      window.localStorage.setItem(key, nextRaw);

      cacheRef.current = {
        raw: nextRaw,
        value: resolvedValue,
      };

      window.dispatchEvent(new Event(storageEventName(key)));
    },
    [key, fallback],
  );

  return [value, setValue] as const;
}
