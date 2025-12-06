import React from "react";
import styled from "styled-components";
import { useGlobalContext } from "../../Context/Context";
import VerseOfTheDay from "../Chapters/VerseOfTheDay";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { fadeUp, staggerContainer } from "../../utils/animations";

// 1. Text Variant (Slides up - keep this for text)
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

// 2. New Background Variant (Only fades opacity, NO movement)
const bgImageVariant = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 1.2, ease: "easeOut" }
  }
};

const HeroSection = () => {
  const { slok } = useGlobalContext();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  const activeContainerVariants = reduceMotion ? { hidden: {}, visible: {} } : staggerContainer;
  const activeItemVariant = reduceMotion ? { hidden: {}, visible: {} } : fadeUp;

  return (
    <>
      <Wrapper className="relative hero-section hero" id="hero">
        <motion.section
          id="hero"
          className="relative hero-section hero"
          variants={activeContainerVariants}
          initial="hidden"
          whileInView="visible"
          animate="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          <div className="custom-container">
            <div className="flex justify-center items-center">
              <div className="relative hero-section-bg flex flex-col justify-center items-center">
                <div className="hero-section-data flex flex-col justify-center items-center">
                  <motion.h1 
                    variants={activeItemVariant} 
                    className="text-white"
                  >
                    Experience the Gita
                  </motion.h1>
                  <motion.h2 
                    variants={activeItemVariant} 
                    className="text-amber-400"
                  >
                    Anywhere, Anytime.
                  </motion.h2>

                  <motion.button
                    variants={activeItemVariant}
                    onClick={() => navigate("/japa")}
                    className="relative overflow-hidden px-8 py-3 text-lg font-semibold text-white rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 shadow-lg shadow-amber-700/30 transition-all duration-300 ease-out hover:scale-105 hover:shadow-amber-500/50 hover:from-yellow-400 hover:to-orange-500 active:scale-95"
                  >
                    <span className="relative z-10">Begin Chanting</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-500 opacity-0 group-hover:opacity-100 blur-lg transition duration-500"></span>
                  </motion.button>
                  
                </div>
              </div>
            </div>
          </div>

          {/* 3. Applied bgImageVariant here to stop the entrance slide */}
          <motion.div
            className="hero-section-image absolute w-screen h-screen"
            variants={bgImageVariant}
            aria-hidden="true"
          >
            <div className="hero-container">
              <div className="wrapper"></div>
            </div>
          </motion.div>
        </motion.section>
      </Wrapper>

      <VerseOfTheDay
        id={slok && slok.length !== 0 ? slok[0].id : ""}
        desc={slok && slok.length !== 0 ? slok[0].translations : ""}
        chapter={slok && slok.length !== 0 ? slok[0].chapter_number : ""}
        verse={slok && slok.length !== 0 ? slok[0].verse_number : ""}
      />
    </>
  );
};

export default HeroSection;

const Wrapper = styled.section`
  position: relative;
  width: 100vw;
  height: 100vh;
  background: transparent;
  background-color: rgb(250, 247, 237);
  img {
    width: 100%;
    height: 100%;
  }
  .custom-container {
    width: auto;
    max-height: 100%;
    z-index: 2;
  }

  .button-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1.5rem; 
    margin-top: 1rem;
  }

  .hero-section-bg {
    position: relative;
    width: 100%;
    height: 90vh;
    border-radius: 10px;
    overflow: hidden;
    .hero-section-data {
      z-index: 2;
      width: 100%;
      h1 {
        margin-bottom: 3rem;
        font-family: "Birthstone Bounce", cursive;
        font-weight: 500;
      }
      h2 {
        margin-bottom: 30px;
        font-weight: 500;
      }
    }
  }

  .hero-section-image {
    position: absolute;
    height: 100vh;
    top: 0%;
    left: 0;
    overflow: hidden;
    
    .hero-container {
      position: relative;
      width: 100vw; 
      height: 100vh;
      background: url("/images/bg5.jpg");
      background-repeat: no-repeat;
      background-size: cover;
      
      /* --- 4. OPTIMIZED ZOOM ANIMATION --- */
      transform-origin: center center; /* Zoom from middle, not top */
      transform: scale(1.1); /* Match end state of animation */
      animation: zoom-in linear 20s infinite alternate; /* Slower, smoother loop */

      .wrapper {
        width: 100vw;
        height: 100vh;
      }
    }
  }

  /* --- 5. Pure Zoom Keyframes (Removed Translate) --- */
  @keyframes zoom-in {
    0% {
      transform: scale(1);
    }
    100% {
      transform: scale(1.1);
    }
  }

  @media (min-width: 900px) {
    .custom-container {
      margin: 0px 80px;
    }
    h1 {
      font-size: 7rem;
    }
    h2 {
      font-size: 4rem;
    }
  }
  @media (max-width: 900px) {
    .custom-container {
      margin: 0px 20px;
    }
    .hero-section-image .hero-container {
      background-position: center; /* Ensure bg is centered on mobile */
    }
    h1 {
      font-size: 5rem;
    }
    h2 {
      font-size: 3rem;
    }
    .hero-section-bg {
      background-position: 75% 50%;
    }
  }
  @media (max-width: 768px) {
    .hero-section-bg {
      height: 100vh;
    }
  }
`;