"use client";

import { motion } from "framer-motion";

export default function Overlay() {
  return (
    <motion.div
      className="fixed inset-0 z-50 bg-white opacity-80"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    />
  );
}