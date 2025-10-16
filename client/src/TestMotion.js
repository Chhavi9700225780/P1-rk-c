// src/TestMotion.js
import React from "react";
import { motion } from "framer-motion";

export default function TestMotion() {
  return (
    <div style={{ padding: 40 }}>
      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ fontSize: 28, color: "#222", marginBottom: 24 }}
      >
        TEST — framer-motion animate() (should slide up & fade in)
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{ background: "#ffedd5", padding: 16, borderRadius: 8 }}
      >
        Animated box
      </motion.div>
    </div>
  );
}
