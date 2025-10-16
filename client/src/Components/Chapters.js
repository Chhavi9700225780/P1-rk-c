import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { useGlobalContext } from "../Context/Context";
import ChapterBox from "./ChapterBox";
import Loading from "./Loading";

const PER_PAGE = 6;

const Chapters = () => {
  const [chapters, setChapters] = useState([]);
  const [visibleCount, setVisibleCount] = useState(PER_PAGE);

  const { chapter, isChapterLoading, DefaultLanguage } = useGlobalContext();

  useEffect(() => {
    setChapters(chapter || []);
    // reset visible count if chapters change (optional)
    setVisibleCount(PER_PAGE);
  }, [chapter]);

  // show more: increase visibleCount by PER_PAGE (max chapters.length)
  const showMore = () => {
    const old = visibleCount;
    const next = Math.min(old + PER_PAGE, chapters.length);
    setVisibleCount(next);

    // scroll to the first newly revealed item after a short delay so React renders it
    setTimeout(() => {
      const items = document.querySelectorAll(".chapter-list > *");
      const el = items && items[old]; // first newly revealed element (0-indexed)
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  };

  // show less: collapse back to initial PER_PAGE and scroll top of chapters
  const showLess = () => {
    setVisibleCount(PER_PAGE);
    const el = document.getElementById("chapters");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const allVisible = visibleCount >= chapters.length;

  return (
    <Wrapper className="relative chapters" id="chapters">
      <div className="chapter-container m-auto">
        <div className="wrapper flex flex-col justify-center">
          {/* title */}
          <motion.div 
            className="title mb-10 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h1>Chapters</h1>
          </motion.div>

          {/* chapters */}
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <AnimatePresence>
                  {chapters.slice(0, visibleCount).map((item, index) => {
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ 
                          duration: 0.4,
                          delay: index * 0.05,
                          ease: "easeOut"
                        }}
                        layout
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
                    );
                  })}
                </AnimatePresence>
              </motion.div>

              {/* control */}
              {chapters.length > PER_PAGE && (
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
                        aria-expanded={!allVisible}
                        aria-controls="chapters"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Show more
                      </motion.button>
                    ) : (
                      <motion.button
                        key="show-less"
                        onClick={showLess}
                        className="btn-show-less px-6 py-2 rounded-md font-medium"
                        aria-expanded={allVisible}
                        aria-controls="chapters"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.98 }}
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