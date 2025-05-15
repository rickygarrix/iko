"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};

export default function SlideDownModal({ isOpen, onClose, children }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景オーバーレイ（暗めに） */}
          <motion.div
            className="fixed top-[48px] left-0 right-0 bottom-0 bg-black/30 backdrop-blur-sm z-[900]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            onClick={onClose}
          />

          {/* モーダル本体（上からスライドイン） */}
          <motion.div
            className="fixed top-[48px] left-0 right-0 z-[950] bg-[#F7F5EF] shadow-xl rounded-b-xl overflow-y-auto max-h-[90vh] pb-10"
            onClick={(e) => e.stopPropagation()}
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <div className="overflow-hidden px-4 pt-4">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}