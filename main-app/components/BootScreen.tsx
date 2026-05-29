"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function BootScreen({ onComplete }: { onComplete: () => void }) {
  const [exit, setExit] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Smooth progress loading animation over 1.2s
    const duration = 1200;
    const intervalTime = 20;
    const steps = duration / intervalTime;
    const stepSize = 100 / steps;
    
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += stepSize;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        
        // Short delay after progress completion before exit transition
        setTimeout(() => {
          setExit(true);
          setTimeout(onComplete, 400); // Wait for exit fade animation to finish
        }, 150);
      }
      setProgress(currentProgress);
    }, intervalTime);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!exit && (
        <motion.div
          key="boot"
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#000000]"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex flex-col items-center gap-6">
            {/* Logo and Brand */}
            <motion.div
              className="flex flex-col items-center gap-3.5"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="relative w-12 h-12">
                <Image
                  src="/logo.png"
                  alt="Arca Logo"
                  fill
                  className="object-contain invert"
                  priority
                  unoptimized
                />
              </div>
              <span className="text-lg font-semibold tracking-[0.25em] text-white">
                ARCA
              </span>
            </motion.div>

            {/* Minimal Progress Bar */}
            <motion.div
              className="w-24 h-[1.5px] bg-white/10 rounded-full overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
            >
              <motion.div
                className="h-full bg-[#3b82f6]"
                style={{ width: `${progress}%` }}
                transition={{ ease: "easeOut" }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
