"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

const themes = [
  { name: "light", color: "#f3f4f6" },
  { name: "dark", color: "#1f2937" },
  { name: "blue", color: "#3b82f6" },
  { name: "purple", color: "#8b5cf6" },
  { name: "pink", color: "#ec4899" },
];

// Positions for semicircle arc with radius 80px
const positions = [
  { x: 80, y: 0 },
  { x: 56.57, y: -56.57 },
  { x: 0, y: -80 },
  { x: -56.57, y: -56.57 },
  { x: -80, y: 0 },
];

export default function ThemeDrawer() {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  return (
    <>
      {/* Main Floating Button (mobile left, desktop right) */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="
          fixed bottom-6 z-50 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center
          bg-gradient-to-r from-purple-500 to-pink-500
          left-6 sm:left-auto sm:right-6
        "
        title="Change Theme"
        whileHover={{ scale: 1.1, boxShadow: "0 20px 40px rgba(168, 85, 247, 0.4)" }}
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: open ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.span
          className="text-2xl"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          🎨
        </motion.span>
      </motion.button>

      {/* Popout Palette */}
      <AnimatePresence>
        {open &&
          themes.map((t, i) => (
            <motion.button
              key={t.name}
              onClick={() => {
                setTheme(t.name as any);
                setOpen(false);
              }}
              className={`
                fixed bottom-14 w-10 h-10 rounded-full shadow-md cursor-pointer border-2 z-50
                ${theme === t.name ? "border-white" : "border-transparent"}
                left-14 sm:left-auto sm:right-14
              `}
              style={{ backgroundColor: t.color }}
              initial={{ x: 0, y: 0, opacity: 0 }}
              animate={{ x: positions[i].x, y: positions[i].y, opacity: 1 }}
              exit={{ x: 0, y: 0, opacity: 0 }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.95 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
                delay: i * 0.05,
              }}
            >
              {theme === t.name && (
                <motion.span
                  className="block w-full h-full rounded-full bg-white bg-opacity-30"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                />
              )}
            </motion.button>
          ))}
      </AnimatePresence>
    </>
  );
}
