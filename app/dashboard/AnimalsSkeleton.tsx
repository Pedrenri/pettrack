"use client";

import { motion } from "motion/react";

function Shimmer({ className }: { className: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-0"
        style={{ background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)" }}
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

export default function AnimalsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
          className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
        >
          <Shimmer className="aspect-[4/3] bg-gray-100 rounded-none" />
          <div className="px-4 py-3 space-y-2">
            <Shimmer className="h-4 w-24 rounded-lg bg-gray-100" />
            <Shimmer className="h-3 w-32 rounded-lg bg-gray-50" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
