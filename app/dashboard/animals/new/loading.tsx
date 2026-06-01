"use client";

import { motion } from "motion/react";

const reptiles = ["🦎", "🐍", "🐊", "🐢"];

export default function NewAnimalLoading() {
  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-28 h-28 flex items-center justify-center">
          {reptiles.map((emoji, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 flex items-start justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              initial={{ rotate: i * 90 }}
            >
              <motion.span
                className="text-2xl block"
                style={{ marginTop: "2px" }}
                animate={{ rotate: -360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                {emoji}
              </motion.span>
            </motion.div>
          ))}
          <motion.div
            animate={{ scale: [1, 1.25, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="w-10 h-10 rounded-full bg-emerald-500 shadow-lg shadow-emerald-300/60 z-10"
          />
        </div>

        <motion.p
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="text-sm font-medium text-emerald-700 tracking-wide"
        >
          Loading...
        </motion.p>
      </div>
    </div>
  );
}
