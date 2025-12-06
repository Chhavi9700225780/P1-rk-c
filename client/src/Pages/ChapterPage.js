import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { motion, useReducedMotion } from "framer-motion";
import api from "../utils/api";
import { toast } from "react-toastify";

// Context & Components
import { useGlobalContext } from "../Context/Context";
import { useAuth } from "../Context/AuthContext";
import Shlok from "../Components/Chapters/Shlok";
import VerseTable from "../Components/Chapters/VerseTable";
import Loading from "../Components/Common/Loading";
import { fadeUp, staggerContainer } from "../utils/animations";

const ChapterPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Use Context Data DIRECTLY (No need for duplicate local state)
  const {
    GetSingleChapter,
    singleChapter,
    GetAllVerses,
    chapterVerses,
    isVersesLoading,
    isSingleLoading,
    DefaultLanguage,
  } = useGlobalContext();

  const { user } = useAuth();
  
  // Local State for User Progress only
  const [progressMap, setProgressMap] = useState({});
  const [loadingChapterToggle, setLoadingChapterToggle] = useState(false);

  // Animation Preferences
  const reduceMotion = useReducedMotion();
  const containerVariants = reduceMotion ? { hidden: {}, visible: {} } : staggerContainer;
  const itemVariant = reduceMotion ? { hidden: {}, visible: {} } : fadeUp;

  // 1. Fetch Data on ID Change
  useEffect(() => {
    window.scrollTo(0, 0); // Ensure top on new chapter
    GetSingleChapter(`${id}`);
    GetAllVerses(`${id}/slok`);
    fetchChapterProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // 2. Fetch Progress (Async)
  const fetchChapterProgress = async () => {
    if (!user) {
        setProgressMap({});
        return;
    }
    try {
      const res = await api.get(`/progress/me/chapter/${id}`, { withCredentials: true });
      if (res.data && res.data.ok) {
        const map = {};
        const versesArr = res.data.verses || res.data.chapterVerses || [];
        versesArr.forEach((v) => {
          const verseNum = v.verse || v.verse_number || v.verseNumber || v.index;
          if (typeof verseNum !== "undefined") map[Number(verseNum)] = !!v.completed;
        });
        setProgressMap(map);
      } else {
        setProgressMap({});
      }
    } catch (err) {
      setProgressMap({});
    }
  };

  // 3. Handle Scroll to Hash (#verse-15)
  useEffect(() => {
    if (!isVersesLoading && location.hash) {
      const elementId = location.hash.substring(1);
      const element = document.getElementById(elementId);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300); // Increased delay slightly for reliability
      }
    }
  }, [location.hash, isVersesLoading]);

  // 4. Toggle Chapter Completion
  const toggleWholeChapter = async (markComplete = true) => {
    if (!user) {
      toast.info("Please log in to mark chapter progress");
      navigate("/login");
      return;
    }
    try {
      setLoadingChapterToggle(true);
      await api.post(
        "/progress/me/chapter",
        { chapterId: Number(id), completed: !!markComplete },
        { withCredentials: true }
      );
      await fetchChapterProgress(); // Refresh map
      toast.success(markComplete ? "Chapter marked complete" : "Chapter marked incomplete");
    } catch (err) {
      console.error("toggleWholeChapter", err);
      toast.error(err?.response?.data?.message || "Failed to update chapter progress");
    } finally {
      setLoadingChapterToggle(false);
    }
  };

  return (
    <motion.section 
      id="chapter" 
      initial="hidden" 
      whileInView="visible" 
      viewport={{ once: true, amount: 0.15 }}
    >
      <Wrapper id="chapter">
        <div className="chapter-container px-0 xl:px-20 py-3">
          <div className="wrapper px-8 md:px-10 xl:px-20">
            <div className="custom-container flex justify-center">

              {/* Sidebar: Verse Table */}
              <VerseTable
                singleChapter={singleChapter}
                id={id}
                // showChapterVerses is now just chapterVerses from context
                showChapterVerses={chapterVerses} 
                progressMap={progressMap}
                onToggleChapterComplete={toggleWholeChapter}
              />
              
              {/* Main Content Area */}
              <div className="inner-container ml-4">
                <div className="main-section overflow-hidden flex flex-col">
                  {isSingleLoading ? (
                    <Loading />
                  ) : (
                    <>
                      {/* Chapter Intro */}
                      <motion.div
                        className="relative chapter-intro pt-20 pb-10 flex justify-center flex-col items-center"
                        variants={itemVariant}
                      >
                        <div className="chapter-heading mb-3 flex justify-center flex-col items-center">
                          <h3 className="font-bold mb-0">
                            {DefaultLanguage === "hindi" ? (
                              <>
                                <span className="text-2xl">अध्याय {id}{" "}:{" "}</span>
                                {singleChapter.name}
                              </>
                            ) : (
                              <>
                                <span className="text-2xl">Chapter {id}{" "}:{" "}</span>
                                {singleChapter.name_transliterated}
                              </>
                            )}
                          </h3>
                        </div>

                        <div className="chapter-summary">
                          <p>
                            {Object.keys(singleChapter).length !== 0 ? (
                              DefaultLanguage === "hindi" ? (
                                <>{singleChapter.chapter_summary_hindi}</>
                              ) : (
                                <>{singleChapter.chapter_summary}</>
                              )
                            ) : ""}
                          </p>
                        </div>
                      </motion.div>

                      {/* Verses List */}
                      <motion.div className="list-container z-10" id="list" variants={containerVariants}>
                        <div className="list-items pb-14">
                          {!isVersesLoading ? (
                            <>
                              <div className="search-item py-5 mb-5 text-center">
                                <span className="font-bold text-xl">
                                  {DefaultLanguage === "hindi" ? (
                                    <>{chapterVerses.length} {`श्लोक`}</>
                                  ) : (
                                    <>{chapterVerses.length} Verses</>
                                  )}
                                </span>
                              </div>

                              {chapterVerses.map((item) => (
                                <motion.div 
                                  key={item.id} 
                                  variants={itemVariant}
                                  id={`verse-${item.verse_number || item.verse}`} 
                                >
                                  <Shlok
                                    chapterVerse={item}
                                    DefaultLanguage={DefaultLanguage}
                                    isCompleted={!!progressMap[item.verse_number || item.verse]}
                                    onProgressChange={fetchChapterProgress}
                                  />
                                </motion.div>
                              ))}
                            </>
                          ) : (
                            <Loading />
                          )}
                        </div>
                      </motion.div>
                    </>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </Wrapper>
    </motion.section>
  );
};

export default ChapterPage;

// ✅ STYLING UNTOUCHED (Copy of your wrapper)
const Wrapper = styled.div`
  position: relative;
  width: 100vw;
  height: auto;
  margin-top: 80px;
  background: url("/images/bg3.jpg");
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  
  .chapter-container{
    background: ${({ theme }) => theme.colors.gradient.primary};
    padding-bottom: 3rem;
  }

  .inner-container{
    position: relative;
    width: 100%;
    background-color: ${({ theme }) => theme.colors.bg.primary};
    overflow: hidden;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);

    &::before{
       content: "";
       position: absolute;
       top: 0;
       left: 0;
       background-color: ${({ theme }) => theme.colors.bg.primary};
       height: 30px;
       width: 100%;
       z-index: 2;
    }
    &::after{
       content: "";
       position: absolute;
       bottom: 0;
       left: 0;
       background-color: ${({ theme }) => theme.colors.bg.primary};
       height: 30px;
       width: 100%;
       z-index: 2;
    }
  }

  .search-item{
    span{
      color: ${({ theme }) => theme.colors.heading.primary};
    }
  }

  .main-section {
    position: relative;
    padding: 30px 1em 1em 1em;
    overflow-y: scroll;
    height: 100vh;
    z-index: 1;
  }

  .chapter-intro {
    padding-top: 2em;
    position: relative;
    z-index: 2;
  }
  .chapter-heading {
    position: relative;
    width: 100%;
    height: 100%;
    h3 {
        font-size: 1.5em;
        color: ${({ theme }) => theme.colors.highlight.primary};
      }
  }
  .chapter-summary {
    line-height: 30px;
    p{
      padding: 1em;
      color: ${({ theme }) => theme.colors.heading.secondary};
    }
  }
  .list-container {
    .search-item {
      position: relative;
      &::before{
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        background: ${({ theme }) => theme.colors.border.primary};
        width: 100%;
        height: 2px;
      }
      &:after{
        content: "";
        position: absolute;
        bottom: 0;
        left: 0;
        background: ${({ theme }) => theme.colors.border.primary};
        width: 100%;
        height: 2px;
      }
    }
  }
  .shapes {
    position: absolute;
    top: 10%;
    left: 25%;
    z-index: -1;
    .shape {
      top: 0%;
      left: 0%;
      img {
        width: 451px;
        height: 100%;
      }
    }
  }

  @media (min-width: 750px) {
    .inner-container {
      max-width: 74%;
      min-width: 70%;
      min-height: 100vh;
    }
  }

  @media (max-width: 750px) {
    .custom-container {
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
  }
`;