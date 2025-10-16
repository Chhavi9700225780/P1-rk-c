// src/Pages/GitaEmbedPage.js
import React, { useEffect, useState } from "react";
import { ExternalLink, Sparkles, Loader2, AlertCircle, MessageSquare } from "lucide-react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";


const ChakraLogo = () => (
  <motion.div
    initial={{ opacity: 0, rotate: -90 }}
    animate={{ opacity: 1, rotate: 0 }}
    transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
    className="relative w-16 h-16"
  >
    {/* Wrap the SVG in another motion.div for continuous rotation */}
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 10, repeat: Infinity, ease: "linear" }} // slow continuous spin
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

        <circle
          cx="50"
          cy="50"
          r="48"
          fill="none"
          stroke="url(#chakraGradient)"
          strokeWidth="2"
          opacity="0.3"
        />
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="url(#chakraGradient)"
          strokeWidth="3"
          filter="url(#glow)"
        />
        <circle
          cx="50"
          cy="50"
          r="28"
          fill="none"
          stroke="url(#chakraGradient)"
          strokeWidth="2"
          opacity="0.6"
        />

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

        <circle cx="50" cy="50" r="16" fill="url(#centerGlow)" />
        <circle cx="50" cy="50" r="8" fill="#FFF" opacity="0.9" />
      </svg>
    </motion.div>

    {/* glowing aura pulse stays as before */}
    <motion.div
      className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-amber-400/20 rounded-full blur-xl"
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    />
  </motion.div>
);


export default function GitaEmbedPage({ src = "https://bhagavadgita.io/gitagpt" }) {
  const [loaded, setLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => { if (!loaded) { setBlocked(true); setIsLoading(false); } }, 5000);
    return () => clearTimeout(t);
  }, [loaded]);

  function handleLoad() { setIsLoading(false); setLoaded(true); setBlocked(false); }
  function handleError() { setIsLoading(false); setBlocked(true); }

  const introVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } };
  const examplePrompts = [ "What is Dharma?", "Explain the concept of Karma.", "How can I control my anger?", "What is the path to inner peace?" ];
// robust navbar-height setter — paste inside GitaEmbedPage near other useEffect calls
useEffect(() => {
  try {
    // try a bunch of common header selectors used in your app
    const selectors = ['header', '.navbar', '.topbar', '.site-header', '#navbar', '.app-header'];
    function findNav() {
      for (const s of selectors) {
        const el = document.querySelector(s);
        if (el) return el;
      }
      return null;
    }

    let nav = findNav();
    // if header is inside a shadow DOM or later-rendered, wait a tick and try again
    if (!nav) {
      const t = setTimeout(() => { nav = findNav(); if (nav) setVar(nav.offsetHeight); }, 120);
      // keep reference so we can clear if component unmounts
      return () => clearTimeout(t);
    }

    function setVar(h) {
      const px = Math.max(56, Math.round(h || 64)); // never smaller than 56px
      // add a tiny buffer so content never touches header
      const buffered = px + 8;
      document.documentElement.style.setProperty('--navbar-height', `${buffered}px`);
      // optional: also expose for quick debugging in devtools
      document.documentElement.style.setProperty('--navbar-height-raw', `${px}px`);
    }

    setVar(nav ? nav.offsetHeight : 80);

    // update on resize and on mutate (in case header changes height)
    let resizeTimer;
    function handleResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const n = findNav();
        setVar(n ? n.offsetHeight : 80);
      }, 120);
    }
    window.addEventListener('resize', handleResize);

    // observe header size changes (e.g., when mobile menu opens)
    const observer = new MutationObserver(() => {
      const n = findNav();
      if (n) setVar(n.offsetHeight);
    });
    if (nav) observer.observe(nav, { attributes: true, childList: true, subtree: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  } catch (e) {
    // silent fallback; CSS has fallbacks too
  }
}, []);

  return (
    <Wrapper>
      <div className="w-full max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-5 gap-6 lg:gap-8 items-stretch">

          <motion.div className="intro-column lg:col-span-2 flex flex-col justify-center space-y-6" variants={introVariants} initial="hidden" animate="visible">
            <div className="flex flex-col items-center lg:items-start space-y-4">
              <div className="transform hover:scale-110 transition-transform duration-300"> <ChakraLogo /> </div>
              <div className="space-y-3 text-center lg:text-left">
                <motion.h1 variants={itemVariants} className="main-heading text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent leading-tight">
                  Eternal Wisdom,<br />Instantly Revealed
                </motion.h1>
                <motion.p variants={itemVariants} className="sub-heading text-sm sm:text-base max-w-md mx-auto lg:mx-0 leading-relaxed">
                  Engage with <span className="font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">GitaGPT</span>. Your personal guide to the timeless teachings of the Bhagavad Gita.
                </motion.p>
              </div>
            </div>
            <motion.div variants={itemVariants} className="prompts-container space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider justify-center lg:justify-start">
                <Sparkles className="w-4 h-4 text-orange-500" /> <span>Try Asking</span>
              </div>
              <div className="grid gap-2">
                {examplePrompts.map((prompt, idx) => (
                  <motion.div key={idx} variants={itemVariants} className="prompt-item group relative backdrop-blur-sm border rounded-xl p-3 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10 hover:-translate-y-0.5 cursor-pointer overflow-hidden">
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

          <motion.div className="lg:col-span-3 flex items-stretch" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}>
            <div className="iframe-container relative w-full rounded-2xl overflow-hidden shadow-2xl shadow-orange-500/20 backdrop-blur-sm">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500"></div>
              <AnimatePresence>
                {(isLoading && !blocked) && ( <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center custom  backdrop-blur-sm z-10"> <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-4" /> <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Loading GitaGPT...</p> </motion.div> )}
                {blocked && ( <motion.div key="fallback" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center p-8 custom  backdrop-blur-sm z-10"> <div className="text-center space-y-4 max-w-md"> <AlertCircle className="w-12 h-12 text-orange-500 mx-auto" /> <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Content Unavailable</h3> <p className="text-sm text-slate-600 dark:text-slate-400">The GitaGPT interface couldn't load. Please visit directly:</p> <a href={src} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300 hover:-translate-y-0.5"> Open GitaGPT <ExternalLink className="w-4 h-4" /> </a> </div> </motion.div> )}
              </AnimatePresence>
              <iframe title="GitaGPT" src={src} onLoad={handleLoad} onError={handleError} className={`w-full h-full border-0 transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`} loading="lazy" allow="clipboard-write" sandbox="allow-same-origin allow-scripts allow-popups allow-forms" />
            </div>
          </motion.div>
        </div>
      </div>
    </Wrapper>
  );
}

// ✨ FIX: All theme logic is now using the correct theme variables from your project.
const Wrapper = styled.div`
 position: fixed;
  top: 80px;      /* The height of your navbar */
  bottom: 0;
  left: 0;
  right: 0;
  
   padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  @media (min-width: 640px) {
    padding: 2rem;
  }
  /* Dynamically set background using a known theme variable */
  background: ${({ theme }) => theme.colors.bg.primary || '#FFFBF5'};

  .intro-column {
    .main-heading {
        /* This is a gradient, so it doesn't need a theme color */
    }
    .sub-heading {
      color: ${({ theme }) => theme.colors.heading.secondary || '#575757'};
    }
    .prompts-container {
      color: ${({ theme }) => theme.colors.heading.secondary || '#575757'};
    }
    .prompt-item {
       background-color: ${({ theme }) => 
        theme.name === 'dark' 
          ? '#545454' // This is your desired color for DARK mode
          : (theme.colors.bg.secondary || 'rgba(255, 255, 255, 0.7)') // This is the default for LIGHT mode
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
  }
    .custom{
     background-color: ${({ theme }) =>
      theme.name === 'dark' ?
       theme.colors.bg.secondary || 'rgb(15 23 42 / 0.9)'
       : theme.colors.bg.secondary || ' rgb(255 255 255 / 0.9)'
      };
    }/* ensure wrapper is pushed well below navbar and never overlaps */
@media (max-width: 1023px) {
  /* small extra buffer to avoid overlap even if navbar changes */
  --navbar-buffer: 8px;

  padding-top: calc(var(--navbar-height, 72px) + env(safe-area-inset-top, 0px) + var(--navbar-buffer));
  /* keep wrapper in normal flow and visible */
  position: relative;
  z-index: 1;

  /* if the header is fixed and has lower z-index, ensure it stays above page */
  /* This is safe — it only raises header stacking if header exists and is lower */
  header, .navbar, .topbar, .site-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 9999; /* ensure header is above wrapper content */
  }

  /* make iframe area smaller a bit to respect larger top padding */
  .iframe-container iframe {
    height: calc(100vh - (var(--navbar-height, 72px) + 160px)); /* keeps it inside viewport */
    min-height: 40vh;
  }



  /* ---------- Mobile niceties: prevent overlap & ensure clean vertical flow ---------- */
/* Add inside your existing @media (max-width: 1023px) block or at its end */

.intro-column {
  /* enforce vertical stacking, center content and add consistent gaps */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 0.6rem;
  width: 100%;
  box-sizing: border-box;
  padding: 0 0.4rem;
}

/* Make the logo sit above heading and not overlap with gradient blur */
.relative.w-16.h-16 {
  margin: 0 auto 0.45rem;
  z-index: 2; /* above other intro elements */
  pointer-events: none;
  overflow: visible; /* allow glow but keep spacing below */
  margin-top: -20px;
}
/* constrain SVG size and avoid overflow pushing layout */
.relative.w-16.h-16 svg {
  display: block;
  width: min(64px, 12vw);
  height: auto;
  max-height: 64px;
}

/* Heading spacing - force clear separation from logo and prompts */
.main-heading {
  margin-top: 2px;
  margin-bottom: 0.15rem;
  text-align: center;
  line-height: 1.05;
  z-index: 1;
  padding: 0 0.25rem;
}

/* Subheading sizing and centering */
.sub-heading {
  margin: 0 auto 0.45rem;
  text-align: center;
  max-width: 92%;
  padding: 0 6px;
  color: ${({ theme }) => theme.colors.heading.secondary || '#575757'};
}

/* Prompts container stretch and limits */
.prompts-container {
  width: 100%;
  max-width: 760px; /* prevents crazy wide containers on large small-screen sizes */
  box-sizing: border-box;
  padding: 0 4px;
}

/* Make the grid of prompts behave like a single vertical list on mobile */
.prompts-container .grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
}

/* Prompt item rules: full-width, wrap text, comfortable padding */
.prompt-item {
  width: 100% !important;
  min-height: 44px;
  box-sizing: border-box;
  white-space: normal; /* allow multi-line prompts */
  overflow-wrap: anywhere;
  padding: 0.55rem 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

/* Prompt text should wrap and not overflow */
.prompt-text {
  display: block;
  width: 100%;
  white-space: normal;
  font-size: 0.92rem;
  line-height: 1.3;
  color: ${({ theme }) => theme.colors.heading.primary || '#333'};
}

/* Ensure the orange top/border of iframe doesn't overlap intro area */
.iframe-container {
  margin-top: 0.9rem;
  z-index: 0;
}

/* Give the intro a clean separation line (visual), optional */
.intro-column::after {
  content: "";
  display: block;
  height: 1px;
  width: 96%;
  margin: 0.8rem auto 0;
  background: linear-gradient(90deg, rgba(249,115,22,0.06), rgba(249,115,22,0.02));
  border-radius: 4px;
  z-index: 0;
}

/* Smooth and performant scrolling helpers */
html, body {
  scroll-behavior: smooth;                /* smooth anchor jumps (optional) */
  -webkit-font-smoothing: antialiased;
  -webkit-overflow-scrolling: touch;      /* smoother momentum scrolling on iOS */
  touch-action: pan-y pinch-zoom;         /* let browser handle vertical scroll and pinch */
}

/* Make main wrapper and iframe-container promote to their own compositing layer */
${'' /* if inside styled-components, keep selector context */} &,
.iframe-container,
.intro-column,
.prompt-item,
.relative.w-16.h-16 {
  will-change: transform, opacity;        /* hint for smoother transforms */
  backface-visibility: hidden;
  transform: translateZ(0);               /* force GPU compositing (cheap) */
}

/* Reduce paint-heavy filters while user is actively scrolling (see JS below) */
.is-scrolling .intro-column,
.is-scrolling .iframe-container,
.is-scrolling .prompt-item {
  /* lessen heavy effects during scroll */
  filter: none !important;                /* remove blur/glow temporarily */
  box-shadow: 0 4px 12px rgba(0,0,0,0.06) !important; /* lighter shadow */
  transition: none !important;            /* avoid expensive transitions */
}

/* If you use backdrop-blur anywhere, hide it when scrolling */
.is-scrolling .prompt-item::before,
.is-scrolling .iframe-container::before {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

/* Keep overscroll behavior smooth & contained */
.wrapper-scrollable, .w-full.max-w-7xl.mx-auto {
  overscroll-behavior: contain;
}

/* Tweak to avoid large repaints from high shadow values */
.iframe-container, .prompt-item {
  /* use small, subtle shadows — avoids big repaints */
  box-shadow: 0 8px 24px rgba(249,115,22,0.06);
  transition: box-shadow 200ms ease, transform 220ms ease;
}


}

/* Slight tweak for very small phones to avoid crowding */
@media (max-width: 380px) {
  .main-heading { font-size: 1.25rem !important; }
  .prompt-item { padding: 0.5rem 0.6rem; min-height: 40px; }
  .relative.w-16.h-16 { margin-bottom: 0.36rem; }

  /* Smooth and performant scrolling helpers */
html, body {
  scroll-behavior: smooth;                /* smooth anchor jumps (optional) */
  -webkit-font-smoothing: antialiased;
  -webkit-overflow-scrolling: touch;      /* smoother momentum scrolling on iOS */
  touch-action: pan-y pinch-zoom;         /* let browser handle vertical scroll and pinch */
}

/* Make main wrapper and iframe-container promote to their own compositing layer */
${'' /* if inside styled-components, keep selector context */} &,
.iframe-container,
.intro-column,
.prompt-item,
.relative.w-16.h-16 {
  will-change: transform, opacity;        /* hint for smoother transforms */
  backface-visibility: hidden;
  transform: translateZ(0);               /* force GPU compositing (cheap) */
}

/* Reduce paint-heavy filters while user is actively scrolling (see JS below) */
.is-scrolling .intro-column,
.is-scrolling .iframe-container,
.is-scrolling .prompt-item {
  /* lessen heavy effects during scroll */
  filter: none !important;                /* remove blur/glow temporarily */
  box-shadow: 0 4px 12px rgba(0,0,0,0.06) !important; /* lighter shadow */
  transition: none !important;            /* avoid expensive transitions */
}

/* If you use backdrop-blur anywhere, hide it when scrolling */
.is-scrolling .prompt-item::before,
.is-scrolling .iframe-container::before {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

/* Keep overscroll behavior smooth & contained */
.wrapper-scrollable, .w-full.max-w-7xl.mx-auto {
  overscroll-behavior: contain;
}

/* Tweak to avoid large repaints from high shadow values */
.iframe-container, .prompt-item {
  /* use small, subtle shadows — avoids big repaints */
  box-shadow: 0 8px 24px rgba(249,115,22,0.06);
  transition: box-shadow 200ms ease, transform 220ms ease;
}

}

`;