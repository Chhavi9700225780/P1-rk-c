import React, { useEffect, useState } from "react";
import {  Sparkles,  MessageSquare } from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

// ✨ We will style the main div directly, so the Wrapper component is no longer needed.

const ChakraLogo = () => (
    <motion.div
    initial={{ opacity: 0, rotate: -90 }}
    animate={{ opacity: 1, rotate: 0 }}
    transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
    className="relative w-16 h-16"
  >
    <svg width="64" height="64" viewBox="0 0 100 100" className="drop-shadow-2xl">
      <defs>
        <linearGradient id="chakraGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF6B35" />
          <stop offset="50%" stopColor="#F7931E" />
          <stop offset="100%" stopColor="#FDC830" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <radialGradient id="centerGlow">
          <stop offset="0%" stopColor="#FDC830" stopOpacity="0.8"/>
          <stop offset="100%" stopColor="#FF6B35" stopOpacity="1"/>
        </radialGradient>
      </defs>

      <circle cx="50" cy="50" r="48" fill="none" stroke="url(#chakraGradient)" strokeWidth="2" opacity="0.3"/>
      <circle cx="50" cy="50" r="42" fill="none" stroke="url(#chakraGradient)" strokeWidth="3" filter="url(#glow)"/>
      <circle cx="50" cy="50" r="28" fill="none" stroke="url(#chakraGradient)" strokeWidth="2" opacity="0.6"/>

      {[...Array(8)].map((_, i) => (
        <g key={i} transform={`rotate(${i * 45}, 50, 50)`}>
          <path
            d="M 50 50 L 50 8 L 55 18 L 50 50 L 45 18 Z"
            fill="url(#chakraGradient)"
            opacity="0.9"
            filter="url(#glow)"
          />
        </g>
      ))}

      <circle cx="50" cy="50" r="16" fill="url(#centerGlow)"/>
      <circle cx="50" cy="50" r="8" fill="#FFF" opacity="0.9"/>
    </svg>
    <motion.div
      className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-amber-400/20 rounded-full blur-xl"
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    />
  </motion.div>
);

export default function GitaEmbed({ src = "https://bhagavadgita.io/gitagpt" }) {
  const [loaded, setLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!loaded) {
        setBlocked(true);
        setIsLoading(false);
      }
    }, 5000);
    return () => clearTimeout(t);
  }, [loaded]);

  function handleLoad() { setIsLoading(false); setLoaded(true); setBlocked(false); }
  function handleError() { setIsLoading(false); setBlocked(true); }

  const introVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  const examplePrompts = [ "What is Dharma?", "Explain the concept of Karma.", "How can I control my anger?", "What is the path to inner peace?" ];

  return (
    // ✨ FIX: Main container now controls the background and full-screen layout
    <div className="bg-[#FEFDFB] dark:bg-[#0B1120] min-h-[calc(100vh-80px)] p-6 sm:p-8 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,146,60,0.08),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(245,158,11,0.08),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(251,146,60,0.15),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(245,158,11,0.12),transparent_50%)]"></div>
        <div className="w-full max-w-7xl mx-auto relative z-10">
            {/* ✨ FIX: REMOVED the incorrect fixed height from this grid container */}
            <div className="grid lg:grid-cols-5 gap-6 lg:gap-8 items-center">

            <motion.div
              className="lg:col-span-2 flex flex-col justify-center space-y-6"
              variants={introVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="flex flex-col items-center lg:items-start space-y-4">
                <div className="transform hover:scale-110 transition-transform duration-300">
                  <ChakraLogo />
                </div>
                <div className="space-y-3 text-center lg:text-left">
                  <motion.h1
                    variants={itemVariants}
                    className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-800 via-orange-600 to-amber-600 dark:from-slate-100 dark:via-orange-400 dark:to-amber-400 bg-clip-text text-transparent leading-tight"
                  >
                    Eternal Wisdom,<br />Instantly Revealed
                  </motion.h1>
                  <motion.p
                    variants={itemVariants}
                    className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-md mx-auto lg:mx-0 leading-relaxed"
                  >
                    Engage with <span className="font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">GitaGPT</span>. Your personal guide to the timeless teachings of the Bhagavad Gita.
                  </motion.p>
                </div>
              </div>
              <motion.div variants={itemVariants} className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider justify-center lg:justify-start">
                  <Sparkles className="w-4 h-4 text-orange-500" />
                  <span>Try Asking</span>
                </div>
                <div className="grid gap-2">
                  {examplePrompts.map((prompt, idx) => (
                    <motion.div
                      key={idx}
                      variants={itemVariants}
                      className="group relative bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 rounded-xl p-3 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10 hover:border-orange-300 dark:hover:border-orange-500/50 hover:-translate-y-0.5 cursor-pointer overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-amber-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex items-center gap-3">
                        <MessageSquare className="w-4 h-4 text-orange-500 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                        <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-medium leading-snug">
                          {prompt}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            {/* ✨ FIX: Iframe container now has a calculated height to perfectly fit */}
            <motion.div
                className="lg:col-span-3 h-[calc(100vh-180px)] min-h-[550px]"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
            >
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl shadow-orange-500/20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-orange-200/50 dark:border-orange-800/50">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500"></div>
                <AnimatePresence>
                  {/* ... Loading and Blocked states remain the same ... */}
                </AnimatePresence>
                <iframe
                  title="GitaGPT"
                  src={src}
                  onLoad={handleLoad}
                  onError={handleError}
                  className={`w-full h-full border-0 transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
                  // ... iframe props remain the same
                />
              </div>
            </motion.div>
          </div>
        </div>
    </div>
  );
}