import React from "react";
import styled from "styled-components";
import { useGlobalContext } from "../Context/Context";
import VerseOfTheDay from "./VerseOfTheDay";
import {  useNavigate } from "react-router-dom";

import { motion, useReducedMotion } from "framer-motion";
import { fadeUp, staggerContainer } from "../utils/animations";

const HeroSection = () => {
  const { slok } = useGlobalContext();
  const reduceMotion = useReducedMotion();
const navigate = useNavigate();
  // If user prefers reduced motion, use empty variants (no animation)
  const containerVariants = reduceMotion ? { hidden: {}, visible: {} } : staggerContainer;
  const itemVariant = reduceMotion ? { hidden: {}, visible: {} } : fadeUp;

  return (
    <>
      <Wrapper className="relative hero-section hero" id="hero">
        <motion.section
          id="hero"
          className="relative hero-section hero"
          variants={containerVariants}
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
                  variants={itemVariant} className="text-white">
                    Experience the Gita
                  </motion.h1>
                  <motion.h2 
                  variants={itemVariant} className="text-amber-400">
                    Anywhere, Anytime.
                  </motion.h2>

                  
                    {/*
                    <Button className="btn">
                      {/* If you prefer react-scroll Link: keep it (it will still work) 
                      <a href="/#chapters" style={{ color: "inherit", textDecoration: "none" }}>
                        Begin Chanting
                      </a></Button>
                    */} 
                    
                    
                  
                  <button
  onClick={() => navigate("/japa")}
  className="relative overflow-hidden px-8 py-3 text-lg font-semibold text-white rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 shadow-lg shadow-amber-700/30 transition-all duration-300 ease-out hover:scale-105 hover:shadow-amber-500/50 hover:from-yellow-400 hover:to-orange-500 active:scale-95"
>
  <span className="relative z-10">Begin Chanting</span>
  <span className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-500 opacity-0 group-hover:opacity-100 blur-lg transition duration-500"></span>
</button>

                    
                  
                </div>
              </div>
            </div>
          </div>

          <motion.div
            className="hero-section-image absolute w-screen h-screen"
            variants={itemVariant}
            aria-hidden="true"
          >
            <div className="hero-container">
              <div className="wrapper"></div>
            </div>
          </motion.div>
        </motion.section>
      </Wrapper>

      <VerseOfTheDay
        id={slok.length !== 0 ? slok[0].id : ""}
        desc={slok.length !== 0 ? slok[0].translations : ""}
        chapter={slok.length !== 0 ? slok[0].chapter_number : ""}
        verse={slok.length !== 0 ? slok[0].verse_number : ""}
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

/* Container for the buttons to sit side-by-side */
.button-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem; /* The space between the buttons */
  margin-top: 1rem;
}

/* Base style for both buttons */
.btn {
  padding: 0.8rem 2rem;
  border-radius: 50px; /* This creates the pill shape */
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none; /* Removes underline from the 'Explore' link */
  transition: all 0.3s ease-in-out;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

/* Hover effect for both buttons */
.btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

/* Primary button style (filled) */
.btn-explore {
  background-color: #F97316; /* Your theme's orange color */
  color: white;
  border: 2px solid #F97316;
}

/* Secondary button style (outline) */
.btn-japa {
  background-color: transparent;
  color: white;
  border: 2px solid white;
}

/* Hover effect specific to the outline button */
.btn-japa:hover {
  background-color: white;
  color: #212529; /* A dark color for the text */
}

/* --- For Mobile Responsiveness --- */
@media (max-width: 768px) {
  .button-container {
    flex-direction: column; /* Stack buttons vertically */
    gap: 1rem;
  }
  .btn {
    width: 200px; /* Give them a consistent width on mobile */
    text-align: center;
    padding: 1rem 2rem;
  }
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
      .btn {
        background-color: ${({ theme }) => theme.colors.orange};
        width: 120px;
        border-radius: 20px;
        color: white;
        display: flex;
        justify-content: center;
        align-items: center;
        &:hover {
          transform: scale(1.1);
        }
        a {
          font-size: 1rem;
        }
      }
    }
  }

  .hero-section-image {
    position: absolute;
    height: 100vh;
    top: 0%;
    left: 0;
    overflow: hidden;
    /* background-color: rgba(255, 250, 236, 0.5); */
    .hero-container {
      position: relative;
      width: 110vw;
      height: 100vh;
      background: url("/images/bg5.jpg");
      transform-origin: 0% 0%;
      transform: translate3d(-42.7px, -32.1204px, 0px) scale(1.1, 1.1);
      background-repeat: no-repeat;
      background-size: cover;
      animation: zoom-in linear 12s;
      .wrapper {
        width: 100vw;
        height: 100vh;
        /* background-color: rgba(0, 0, 0, 0.3); */
      }
    }
  }

  @keyframes zoom-in {
    0% {
      transform: translate3d(0, 0, 0) scale(1, 1);
    }
    100% {
      transform: translate3d(-42.7px, -32.1204px, 0px) scale(1.1, 1.1);
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
      background-position: 80% 0%;
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
    .hero-section-bg .hero-section-data .btn a {
      font-size: 1.5rem;
    }
  }
`;
