import React, { useState } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { useGlobalContext } from "../../Context/Context";
import ChapterBox from "./ChapterBox";
import Loading from "../Common/Loading";

const PER_PAGE = 6;

// --- OPTIMIZATION: Move variants outside to prevent re-creation on render ---
const titleVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const gridVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.5, delay: 0.2 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" }
  },
  exit: { 
    opacity: 0, 
    y: -20, 
    scale: 0.95,
    transition: { duration: 0.2 } 
  }
};

const btnVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  hover: { scale: 1.02, y: -1 },
  tap: { scale: 0.98 }
};

const Chapters = () => {
  const [visibleCount, setVisibleCount] = useState(PER_PAGE);

  // OPTIMIZATION: Use context directly. No need for useEffect/useState duplication.
  const { chapter, isChapterLoading, DefaultLanguage } = useGlobalContext();
  
  // Fallback to empty array to prevent crashes
  const safeChapters = chapter || [];

  const showMore = () => {
    const old = visibleCount;
    const next = Math.min(old + PER_PAGE, safeChapters.length);
    setVisibleCount(next);

    // Scroll logic
    setTimeout(() => {
      const items = document.querySelectorAll(".chapter-list > *");
      const el = items && items[old]; 
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  };

  const showLess = () => {
    setVisibleCount(PER_PAGE);
    const el = document.getElementById("chapters");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const allVisible = visibleCount >= safeChapters.length;

  return (
    <Wrapper className="relative chapters" id="chapters">
      <div className="chapter-container m-auto">
        <div className="wrapper flex flex-col justify-center">
          
          {/* Title */}
          <motion.div 
            className="title mb-10 text-center"
            variants={titleVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h1>Chapters</h1>
          </motion.div>

          {/* Content */}
          {isChapterLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Loading />
            </motion.div>
          ) : (
            <>
              <motion.div 
                className="grid gap-3 md:grid-cols-2 chapter-list" 
                aria-live="polite"
                layout
                variants={gridVariants}
                initial="hidden"
                animate="visible"
              >
                <AnimatePresence>
                  {safeChapters.slice(0, visibleCount).map((item, index) => (
                    <motion.div
                      key={item.id}
                      layout
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ delay: index * 0.05 }} // Stagger effect based on index
                    >
                      <ChapterBox
                        id={item.id}
                        heading={item.name_transliterated}
                        meaning={item.name_meaning}
                        desc={
                          DefaultLanguage === "english"
                            ? item.chapter_summary
                            : item.chapter_summary_hindi
                        }
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* Controls */}
              {safeChapters.length > PER_PAGE && (
                <motion.div 
                  className="controls mt-6 flex justify-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                >
                  <AnimatePresence mode="wait">
                    {!allVisible ? (
                      <motion.button
                        key="show-more"
                        onClick={showMore}
                        className="btn-show-more px-6 py-2 rounded-md font-medium"
                        variants={btnVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        whileHover="hover"
                        whileTap="tap"
                        transition={{ duration: 0.2 }}
                      >
                        Show more
                      </motion.button>
                    ) : (
                      <motion.button
                        key="show-less"
                        onClick={showLess}
                        className="btn-show-less px-6 py-2 rounded-md font-medium"
                        variants={btnVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        whileHover="hover"
                        whileTap="tap"
                        transition={{ duration: 0.2 }}
                      >
                        Show less
                      </motion.button>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </Wrapper>
  );
};

export default Chapters;

// ✅ STYLING UNTOUCHED
const Wrapper = styled.div`
  width: 100vw;
  height: auto;
  .title {
    h1 {
      font-size: 2.5em;
      font-weight: 700;
      color: ${({ theme }) => theme.colors.heading.primary};
    }
  }

  .controls .btn-show-more {
    background: ${({ theme }) => theme.colors.orange};
    color: white;
    border: none;
    cursor: pointer;
    box-shadow: 0 6px 18px rgba(0,0,0,0.08);
    transition: transform 0.18s ease, box-shadow 0.18s ease;
  }
    .controls .btn-show-less {
    background: ${({ theme }) => theme.colors.textgray};
    color: white;
    border: none;
    cursor: pointer;
    box-shadow: 0 6px 18px rgba(0,0,0,0.08);
    transition: transform 0.18s ease, box-shadow 0.18s ease;
  }
  .controls .btn-show-more:hover,
  .controls .btn-show-less:hover {
    transform: translateY(-3px);
  }

  @media (min-width: 1175px) {
    .chapter-container {
      padding: 60px 8rem;
    }
  }
  @media (max-width: 1175px) {
    .chapter-container {
      padding: 60px 3rem;
    }
  }
`;