import React, { useRef } from "react";
import styled from "styled-components";
import { motion, useInView } from "framer-motion";

// ✅ OPTIMIZATION: Move Variants OUTSIDE the component
// This prevents React from re-creating these objects on every render.
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.2,
    },
  },
};

const slideUpVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.25, 0.25, 0.75],
    },
  },
};

const slideInLeftVariants = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.25, 0.25, 0.75],
    },
  },
};

const slideInRightVariants = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.25, 0.25, 0.75],
    },
  },
};

const scaleVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 1,
      ease: [0.25, 0.25, 0.25, 0.75],
    },
  },
};

const textRevealVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const About = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <Wrapper
      className="relative about about-section overflow-hidden flex justify-center py-10"
      id="about"
    >
      <motion.div
        ref={ref}
        className="custom-container flex flex-col"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        <div className="wrapper mt-36 md:mt-20 grid grid-rows-1 xl:grid-cols-2 xl:gap-4">
          <motion.div
            className="img-content w-full h-full flex justify-center items-center"
            variants={slideInLeftVariants}
          >
            <motion.div
              className="content overflow-hidden"
              variants={scaleVariants}
              whileHover={{
                scale: 1.02,
                transition: { duration: 0.3 },
              }}
            >
              <motion.div
                className="overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.2 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              />
            </motion.div>
          </motion.div>

          <motion.div variants={slideInRightVariants}>
            <motion.div className="title" variants={textRevealVariants}>
              <h3>
                <motion.span
                  className="text-2xl text-orange-500"
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.8, duration: 0.6 }}
                >
                  About
                </motion.span>{" "}
              </h3>
            </motion.div>

            <motion.div className="heading" variants={textRevealVariants}>
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 1.2, duration: 0.8, ease: "easeOut" }}
              >
                TALKING BHAGAVAD GITA
              </motion.h2>
            </motion.div>

            <motion.div className="description" variants={slideUpVariants}>
              <motion.p
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{
                  delay: 1.4,
                  duration: 1.2,
                  ease: "easeOut",
                }}
              >
                Bhagavad Gita, also known as the Gita - "The Song of The Lord"
                is a practical guide to one's life that guides one to
                re-organise their life, achieve inner peace and approach the
                Supreme Lord (the Ultimate Reality). It is a 700-verse text in
                Sanskrit which comprises chapters 23 through 40 in the
                Bhishma-Parva section of the Mahabharata. The Bhagavad Gita is a
                dialogue between Arjuna, a supernaturally gifted warrior and his
                guide and charioteer Lord Krishna on the battlefield of
                Kurukshetra. As both armies stand ready for the battle, the
                mighty warrior Arjuna, on observing the warriors on both sides
                becomes overwhelmed with grief and compassion due to the fear of
                losing his relatives and friends and the consequent sins
                attributed to killing his own relatives. So, he surrenders to
                Lord Krishna, seeking a solution. Thus, follows the wisdom of
                the Bhagavad Gita. Over 18 chapters, Gita packs an intense
                analysis of life, emotions and ambitions, discussion of various
                types of yoga, including Jnana, Bhakti, Karma and Raja, the
                difference between Self and the material body as well as the
                revelation of the Ultimate Purpose of Life.
              </motion.p>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating decorative elements */}
        <motion.div
          className="absolute top-20 left-10 w-2 h-2 bg-orange-500 rounded-full opacity-30"
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-3 h-3 bg-gray-400 rounded-full opacity-20"
          animate={{
            y: [0, 20, 0],
            x: [0, 10, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </motion.div>
    </Wrapper>
  );
};

export default About;

// ✅ STYLING UNTOUCHED
const Wrapper = styled.section`
  width: 100vw;
  height: 100%;
  position: relative;

  .custom-container {
    margin: 0 8rem;
    p {
      color: ${({ theme }) => theme.colors.heading.primary};
      line-height: 1.8em;
    }
    .img-content {
      position: relative;
    }
    .title {
      position: relative;
      margin-bottom: 5px;
      z-index: 1;
      font-size: 1.4rem;
      line-height: 2.2rem;
      letter-spacing: 4px;
      text-transform: uppercase;
      font-weight: 400;
      color: #6f7794;
      overflow: hidden;
    }
    .heading {
      color: #555;
      overflow: hidden;
      h2 {
        font-weight: bold;
        font-size: 2.5rem;
        background: linear-gradient(135deg, #333 0%, #555 50%, #777 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    }
    .content {
      position: relative;
      z-index: 2;
      background: url("/images/bg7.png");
      background-size: cover;
      background-repeat: no-repeat;
      background-position: 50% 0%;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;

      &:before {
        content: "";
        position: absolute;
        background: linear-gradient(
          135deg,
          rgba(0, 0, 0, 0.3) 0%,
          rgba(0, 0, 0, 0.1) 100%
        );
        inset: 0;
        z-index: 1;
      }
    }

    .description {
      position: relative;
      width: auto;
      max-width: 750px;

      p {
        font-size: 1rem;
        line-height: 1.8;
        text-align: justify;
        color: #666;
      }
    }
  }

  @media (min-width: 1280px) {
    .content {
      width: 500px;
      height: 100%;
      min-height: 400px;
    }
  }

  @media (max-width: 1280px) {
    .content {
      width: 100%;
      height: 400px;
    }
    .custom-container {
      margin: 0 5rem;
      .content {
        margin-bottom: 2rem;
      }
    }
  }

  @media (max-width: 768px) {
    .custom-container {
      margin: 0 2rem;
    }
    .heading h2 {
      font-size: 2rem;
    }
  }
`;