"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function BootScreen({ onComplete }: { onComplete: () => void }) {
  const [exit, setExit] = useState(false);

  useEffect(() => {
    // Ring draws for ~1.6s, then hold 300ms, then exit
    const t = setTimeout(() => {
      setExit(true);
      setTimeout(onComplete, 800);
    }, 2000);
    return () => clearTimeout(t);
  }, [onComplete]);

  const r = 44;
  const circumference = 2 * Math.PI * r;

  return (
    <AnimatePresence>
      {!exit && (
        <motion.div
          key="boot"
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-8"
          style={{ backgroundColor: "#000000" }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* Subtle radial glow matching landing page */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(59,130,246,0.06), transparent 70%)",
            }}
          />

          {/* Ring + Logo */}
          <div className="relative flex items-center justify-center" style={{ width: 120, height: 120 }}>
            {/* Outer glow ring */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ boxShadow: "0 0 0 1px rgba(59,130,246,0.12)" }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            />

            {/* SVG progress ring */}
            <svg
              width="120"
              height="120"
              viewBox="0 0 120 120"
              className="absolute inset-0 -rotate-90"
            >
              {/* Track */}
              <circle
                cx="60"
                cy="60"
                r={r}
                fill="none"
                stroke="rgba(59,130,246,0.10)"
                strokeWidth="1.5"
              />
              {/* Animated fill — blue accent matching landing page */}
              <motion.circle
                cx="60"
                cy="60"
                r={r}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 1.6, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
              />
            </svg>

            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              className="relative z-10 w-14 h-14"
            >
              <Image
                src="/logo.png"
                alt="Arca"
                fill
                className="object-contain invert"
                priority
                unoptimized
              />
            </motion.div>
          </div>

          {/* Wordmark */}
          <motion.div
            className="relative z-10 flex flex-col items-center gap-1.5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
          >
            <span className="text-lg font-semibold tracking-tight" style={{ color: "#ffffff" }}>
              Arca
            </span>
            <span
              className="text-xs tracking-widest uppercase font-medium"
              style={{ color: "rgba(59,130,246,0.6)" }}
            >
              USDC Payment Protocol
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
