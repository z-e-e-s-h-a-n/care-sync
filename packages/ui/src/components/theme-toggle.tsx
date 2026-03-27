"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Button, type ButtonProps } from "@workspace/ui/components/button";
import { useTheme } from "@workspace/ui/hooks/theme";
import { cn } from "../lib/utils";

type ThemeSwitchProps = {
  variant?: "default" | "classic";
  className?: string;
};

const moonPaths = {
  main: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
  sparkles: "M9 9l1 1m4-4l1 1M9 15l1 1m4-4l1 1",
};

const sunPaths = [
  "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z",
  "M12 8v2m0 4v2m4-4h-2m-4 0H8",
];

const ClassicIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4.5"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
      <path d="M12 3l0 18" />
      <path d="M12 9l4.65 -4.65" />
      <path d="M12 14.3l7.37 -7.37" />
      <path d="M12 19.6l8.85 -8.85" />
    </svg>
  );
};

const DefaultIcon = ({ isDark }: { isDark: boolean }) => {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {isDark ? (
        <motion.svg
          key="moon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="size-4 2xl:size-5"
        >
          <motion.path
            d={moonPaths.main}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.path
            d={moonPaths.sparkles}
            animate={{
              opacity: [0, 1, 0],
              scale: [0.8, 1.2, 0.8],
              rotate: [0, 180, 360],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        </motion.svg>
      ) : (
        <motion.svg
          key="sun"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="size-4 2xl:size-5"
        >
          <motion.circle
            cx={12}
            cy={12}
            initial={{ r: 4 }}
            animate={{ r: [4, 4.3, 4] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          {sunPaths.map((path, index) => (
            <motion.path
              key={index}
              d={path}
              animate={{
                rotate: [0, 5, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: index * 0.05,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.svg>
      )}
    </AnimatePresence>
  );
};

function ThemeSwitch({ variant = "default", className }: ThemeSwitchProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const buttonProps: ButtonProps = {
    size: "icon",
    variant: "ghost",
    onClick: toggleTheme,
    className: cn("bg-accent text-accent-foreground", className),
  };

  if (variant === "classic") {
    return (
      <Button {...buttonProps}>
        <ClassicIcon />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <Button {...buttonProps}>
      <DefaultIcon isDark={isDark} />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

export default ThemeSwitch;
