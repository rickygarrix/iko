// components/Overlay.tsx
"use client";
import { motion } from "framer-motion";

export default function Overlay() {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-white/80 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    />
  );
}