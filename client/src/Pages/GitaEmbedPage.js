import React, { useEffect, useState, useMemo } from "react";
import { ExternalLink, Sparkles, Loader2, AlertCircle, MessageSquare } from "lucide-react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";

// --- 1. OPTIMIZED LOGO (Prevents Re-renders) ---
const ChakraLogo = React.memo(() => (
  <motion.div
    initial={{ opacity: 0, rotate: -90 }}
    animate={{ opacity: 1, rotate: 0 }}
    transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
    className="relative w-16 h-16"
  >
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      style={{ width: "100%", height: "100%" }}
    >
      <svg
        width="64"
        height="64"
        viewBox="0 0 100 100"
        className="drop-shadow-2xl"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="chakraGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B35" />
            <stop offset="50%" stopColor="#F7931E" />
            <stop offset="100%" stopColor="#FDC830" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="centerGlow">
            <stop offset="0%" stopColor="#FDC830" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FF6B35" stopOpacity="1" />
          </radialGradient>
        </defs>

        <circle cx="50" cy="50" r="48" fill="none" stroke="url(#chakraGradient)" strokeWidth="2" opacity="0.3" />
        <circle cx="50" cy="50" r="42" fill="none" stroke="url(#chakraGradient)" strokeWidth="3" filter="url(#glow)" />
        <circle cx="50" cy="50" r="28" fill="none" stroke="url(#chakraGradient)" strokeWidth="2" opacity="0.6" />

        {[...Array(8)].map((_, i) => (
          <g key={i} transform={`rotate(${i * 45}, 50, 50)`}>
            <path d="M 50 50 L 50 8 L 55 18 L 50 50 L 45 18 Z" fill="url(#chakraGradient)" opacity="0.9" filter="url(#glow)" />
          </g>
        ))}

        <circle cx="50" cy="50" r="16" fill="url(#centerGlow)" />
        <circle cx="50" cy="50" r="8" fill="#FFF" opacity="0.9" />
      </svg>
    </motion.div>

    <motion.div
      className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-amber-400/20 rounded-full blur-xl"
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    />
  </motion.div>
));

export default function GitaEmbedPage({ src = "https://my-gg-ffn6.vercel.app/?embed=true" }) {
  const [loaded, setLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);

  // --- 2. TIMEOUT HANDLER ---
  useEffect(() => {
    if (loaded) return;
    const t = setTimeout(() => {
      if (!loaded) {
        setBlocked(true);
        setIsLoading(false);
      }
    }, 8000); 
    return () => clearTimeout(t);
  }, [loaded]);

  const handleLoad = () => {
    setIsLoading(false);
    setLoaded(true);
    setBlocked(false);
  };
  
  const handleError = () => {
    setIsLoading(false);
    setBlocked(true);
  };

  // --- 3. STATIC ANIMATION VARIANTS ---
  const variants = useMemo(() => ({
    intro: { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } } },
    item: { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } }
  }), []);

  const examplePrompts = [ "What is Dharma?", "Explain the concept of Karma.", "How can I control my anger?" ];

  // --- 4. ROBUST NAVBAR HEIGHT CALCULATION ---
  useEffect(() => {
    let observer;
    let resizeTimer;

    const setVar = (h) => {
      if (!h) return;
      const px = Math.max(56, Math.round(h));
      const buffered = px + 8;
      document.documentElement.style.setProperty('--navbar-height', `${buffered}px`);
      document.documentElement.style.setProperty('--navbar-height-raw', `${px}px`);
    };

    const updateHeight = () => {
      const nav = document.querySelector('nav') || document.querySelector('header') || document.querySelector('.navbar');
      if (nav) setVar(nav.offsetHeight);
    };

    updateHeight();
    setTimeout(updateHeight, 100); // Double check

    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateHeight, 100);
    };
    window.addEventListener('resize', handleResize);

    const navElement = document.querySelector('nav') || document.querySelector('.navbar');
    if (navElement) {
      observer = new MutationObserver(updateHeight);
      observer.observe(navElement, { attributes: true, childList: true, subtree: true });
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (observer) observer.disconnect();
      clearTimeout(resizeTimer);
    };
  }, []);

  return (
    <Wrapper>
      <div className="w-full max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-5 gap-6 lg:gap-8 items-stretch">

          {/* Left Column: Intro */}
          <motion.div className="intro-column lg:col-span-2 flex flex-col justify-center space-y-6" variants={variants.intro} initial="hidden" animate="visible">
            <div className="flex flex-col items-center lg:items-start space-y-4">
              <div className="transform hover:scale-110 transition-transform duration-300"> 
                 <ChakraLogo /> 
              </div>
              <div className="space-y-3 text-center lg:text-left">
                <motion.h1 variants={variants.item} className="main-heading text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent leading-tight">
                  Eternal Wisdom,<br />Instantly Revealed
                </motion.h1>
                <motion.p variants={variants.item} className="sub-heading text-sm sm:text-base max-w-md mx-auto lg:mx-0 leading-relaxed">
                  Engage with <span className="font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">GitaGPT</span>. Your personal guide to the timeless teachings of the Bhagavad Gita.
                </motion.p>
              </div>
            </div>
            
            <motion.div variants={variants.item} className="prompts-container space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider justify-center lg:justify-start">
                <Sparkles className="w-4 h-4 text-orange-500" /> <span>Try Asking</span>
              </div>
              <div className="grid gap-2">
                {examplePrompts.map((prompt, idx) => (
                  <motion.div key={idx} variants={variants.item} className="prompt-item group relative backdrop-blur-sm border rounded-xl p-3 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10 hover:-translate-y-0.5 cursor-pointer overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-amber-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center gap-3">
                      <MessageSquare className="w-4 h-4 text-orange-500 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                      <span className="prompt-text text-xs sm:text-sm font-medium leading-snug">{prompt}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column: Iframe */}
          <motion.div className="lg:col-span-3 flex items-stretch" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}>
            <div className="iframe-container relative w-full rounded-2xl overflow-hidden shadow-2xl shadow-orange-500/20 backdrop-blur-sm">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500"></div>
              
              <AnimatePresence>
                {(isLoading && !blocked) && ( 
                  <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center custom backdrop-blur-sm z-10"> 
                    <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-4" /> 
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Loading GitaGPT...</p> 
                  </motion.div> 
                )}
                {blocked && ( 
                  <motion.div key="fallback" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center p-8 custom backdrop-blur-sm z-10"> 
                    <div className="text-center space-y-4 max-w-md"> 
                      <AlertCircle className="w-12 h-12 text-orange-500 mx-auto" /> 
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Content Unavailable</h3> 
                      <p className="text-sm text-slate-600 dark:text-slate-400">The GitaGPT interface couldn't load. Please visit directly:</p> 
                      <a href={src} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300 hover:-translate-y-0.5"> Open GitaGPT <ExternalLink className="w-4 h-4" /> </a> 
                    </div> 
                  </motion.div> 
                )}
              </AnimatePresence>

              <iframe 
                title="GitaGPT" 
                src={src} 
                onLoad={handleLoad} 
                onError={handleError} 
                className={`w-full h-full border-0 transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`} 
                loading="lazy" 
                allow="clipboard-write" 
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms" 
              />
            </div>
          </motion.div>

        </div>
      </div>
    </Wrapper>
  );
}

// ✅ FIXED WRAPPER CSS (Maintains style but fixes mobile overlap)
const Wrapper = styled.div`
  /* --- DESKTOP (Default) --- */
  position: fixed;
  top: 80px; 
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  /* Background color logic */
  background: ${({ theme }) => theme.colors.bg.primary || '#FFFBF5'};

  @media (min-width: 640px) {
    padding: 2rem;
  }

  /* --- MOBILE FIX (< 1023px) --- */
  @media (max-width: 1023px) {
    position: relative; /* Change to relative to allow scrolling */
    top: 0; /* Reset top so it doesn't push down extra */
    height: auto;
    min-height: 100vh;
    padding-top: 100px; /* Add padding to clear the fixed navbar */
    padding-bottom: 2rem;
    overflow-y: auto;
    display: block;
  }

  /* --- COMPONENT STYLES --- */
  .intro-column {
     top:50px;
    .sub-heading {
      color: ${({ theme }) => theme.colors.heading.secondary || '#575757'};
    }
    .prompts-container {
      color: ${({ theme }) => theme.colors.heading.secondary || '#575757'};
    }
    .prompt-item {
       background-color: ${({ theme }) => 
        theme.name === 'dark' 
          ? '#545454' 
          : (theme.colors.bg.secondary || 'rgba(255, 255, 255, 0.7)')
      };
      border: 1px solid ${({ theme }) => theme.colors.border.primary || 'rgba(0, 0, 0, 0.08)'};
      
      .prompt-text {
        color: ${({ theme }) => theme.colors.heading.primary || '#333'};
      }
    }
  }

  .iframe-container {
    background-color: ${({ theme }) =>
      theme.name === 'dark' ?
       theme.colors.bg.secondary || 'rgba(255, 255, 255, 0.8)'
       : theme.colors.bg.secondary || 'rgba(255, 255, 255)'
      };
    border: 1px solid ${({ theme }) => theme.colors.orange || 'rgba(249, 115, 22, 0.2)'};

    iframe {
       min-height: 60vh; /* Ensure iframe is tall enough on mobile */
    }
  }
  
  .custom {
     background-color: ${({ theme }) =>
      theme.name === 'dark' ?
       theme.colors.bg.secondary || 'rgb(15 23 42 / 0.9)'
       : theme.colors.bg.secondary || ' rgb(255 255 255 / 0.9)'
      };
  }

  /* --- MOBILE TWEAKS --- */
  @media (max-width: 1023px) {
    .iframe-container iframe {
      height: 600px; 
    }
    .intro-column {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      gap: 0.6rem;
      width: 100%;
      padding: 0 0.4rem;
    }
    .relative.w-16.h-16 {
      margin-top: 0;
    }
    .main-heading {
      text-align: center;
      margin-top: 20px;
    }
    .prompts-container .grid {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .prompt-item {
      width: 100% !important;
    }
    .iframe-container {
      margin-top: 1.5rem;
      margin-bottom: 2rem;
    }
  }

  @media (max-width: 380px) {
    .main-heading { font-size: 1.25rem !important; }
  }
`;  