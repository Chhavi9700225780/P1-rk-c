import React, { useEffect, useState } from "react";
import { useGlobalContext } from "../Context/Context";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Shlok from "../Components/Shlok";
import styled from "styled-components";
import VerseTable from "../Components/VerseTable";
import Loading from "../Components/Loading";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../Context/AuthContext";

import { motion, useReducedMotion } from "framer-motion";
import { fadeUp, staggerContainer } from "../utils/animations";

const ChapterPage = () => {
  // Extract the "id" parameter from the URL
  const { id } = useParams();
const location = useLocation();
const navigate = useNavigate();
  // Initialize state variables
  const [showChapter, setShowChapter] = useState({});
  const [showChapterVerses, setShowChapterVerses] = useState([]);

  // progress map: { verseNumber: true/false }
  const [progressMap, setProgressMap] = useState({});
  const [loadingChapterToggle, setLoadingChapterToggle] = useState(false);

  // Extract data from the global context using the useGlobalContext hook
  const {
    GetSingleChapter,
    singleChapter,
    GetAllVerses,
    chapterVerses,
    isVersesLoading,
    isSingleLoading,
    DefaultLanguage,
  } = useGlobalContext();

  const { user, openAuthModal } = useAuth();
  
  // reduced motion preference
  const reduceMotion = useReducedMotion();
  const containerVariants = reduceMotion ? { hidden: {}, visible: {} } : staggerContainer;
  const itemVariant = reduceMotion ? { hidden: {}, visible: {} } : fadeUp;

  // Update showChapter state when singleChapter changes
  useEffect(() => {
    setShowChapter(singleChapter);
  }, [singleChapter]);

  // Update showChapterVerses state when chapterVerses changes
  useEffect(() => {
    setShowChapterVerses(chapterVerses);
  }, [chapterVerses]);

  // Fetch single chapter details and verses when component mounts or id changes
  useEffect(() => {
    GetSingleChapter(`${id}`);
    GetAllVerses(`${id}/slok`);
    // fetch progress after requesting verses (so we know verse numbers)
    // small delay to allow verses to load if they are lazy — we'll fetch regardless
    fetchChapterProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Fetch per-verse progress for this chapter from backend
  async function fetchChapterProgress() {
    try {
      const res = await axios.get(`/progress/me/chapter/${id}`, { withCredentials: true });
      if (res.data && res.data.ok) {
        const map = {};
        // Accept either res.data.verses array or res.data.chapterVerses etc.
        const versesArr = res.data.verses || res.data.chapterVerses || [];
        versesArr.forEach((v) => {
          // support both { verse, completed } and { verse_number, completed }
          const verseNum = v.verse || v.verse_number || v.verseNumber || v.index;
          if (typeof verseNum !== "undefined") map[Number(verseNum)] = !!v.completed;
        });
        setProgressMap(map);
      } else {
        setProgressMap({});
      }
    } catch (err) {
      // silent fail — user might be anonymous; clear map
      setProgressMap({});
      // console.error('fetchChapterProgress', err);
    }
  }

  // Toggle whole chapter complete/uncomplete
  const toggleWholeChapter = async (markComplete = true) => {
    if (!user) {
      toast.info("Please log in to mark chapter progress");
      navigate("/login")
      return;
    }
    try {
      setLoadingChapterToggle(true);
      await axios.post(
        "/progress/me/chapter",
        { chapterId: Number(id), completed: !!markComplete },
        { withCredentials: true }
      );
      // refresh progress map after change
      await fetchChapterProgress();
      toast.success(markComplete ? "Chapter marked complete" : "Chapter marked incomplete");
    } catch (err) {
      console.error("toggleWholeChapter", err);
      toast.error(err?.response?.data?.message || "Failed to update chapter progress");
    } finally {
      setLoadingChapterToggle(false);
    }
  };
// This hook handles scrolling to the verse specified in the URL hash.
  useEffect(() => {
    // We only run this after the verses have finished loading.
    if (!isVersesLoading && location.hash) {
      // Find the element with the ID that matches the hash (e.g., #verse-42 -> 'verse-42').
      const elementId = location.hash.substring(1);
      const element = document.getElementById(elementId);

      if (element) {
        // If the element is found, scroll to it smoothly.
        // A small timeout ensures the browser has time to render everything first.
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
  }, [location.hash, isVersesLoading]); // Re-run if the hash changes or when verses load.
  // ==================== END OF MODIFICATION ====================

  return (
    <>
      {/* motion.section wraps the page so it can animate children */}
      <motion.section id="chapter" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }}>
        <Wrapper id="chapter">
          <div className="chapter-container px-0 xl:px-20 py-3">
            <div className="wrapper px-8 md:px-10 xl:px-20">
              <div className="custom-container flex justify-center">

                  {/* Render a verse table component (kept outside animated list) */}
                   
                               <VerseTable
                  singleChapter={singleChapter}
                  id={id}
                  showChapterVerses={showChapterVerses}
                  progressMap={progressMap}
                  onToggleChapterComplete={toggleWholeChapter}
                />
              
                
                <div className="inner-container ml-4 ">
                  {/* main-section */}
                  <div className="main-section overflow-hidden flex flex-col">
                    {isSingleLoading ? (
                      <Loading />
                    ) : (
                      <>
                        {/* Animated chapter intro */}
                        <motion.div
                          className="relative chapter-intro  pt-20 pb-10 flex justify-center flex-col items-center"
                          variants={itemVariant}
                        >
                          {/* Display chapter title based on language */}
                          <div className="chapter-heading mb-3 flex justify-center flex-col items-center">
                            <h3 className="font-bold mb-0">
                              {DefaultLanguage === "hindi" ? (
                                <>
                                  <span className="text-2xl">अध्याय {id}{" "}:{" "}</span>
                                  {showChapter.name}
                                </>
                              ) : (
                                <>
                                  <span className="text-2xl">Chapter {id}{" "}:{" "}</span>
                                  {showChapter.name_transliterated}
                                </>
                              )}
                            </h3>
                          </div>

                          {/* Display chapter summary based on language */}
                          <div className="chapter-summary">
                            <p>
                              {Object.keys(showChapter).length !== 0 ? (
                                DefaultLanguage === "hindi" ? (
                                  <>{showChapter.chapter_summary_hindi}</>
                                ) : (
                                  <>{showChapter.chapter_summary}</>
                                )
                              ) : (
                                ""
                              )}
                            </p>
                          </div>
                        </motion.div>

                        {/* Verses list with staggered entrance */}
                        <motion.div className="list-container z-10 " id="list" variants={containerVariants}>
                          <div className="list-items pb-14">
                            {!isVersesLoading ? (
                              <>
                                {/* Display total verse count */}
                                <div className="search-item py-5 mb-5 text-center">
                                  <span className="font-bold text-xl">
                                    {DefaultLanguage === "hindi" ? (
                                      <>
                                        {showChapterVerses.length} {`श्लोक`}
                                      </>
                                    ) : (
                                      <>{showChapterVerses.length} Verses</>
                                    )}
                                  </span>
                                </div>

                                {/* Map and render each verse with animation */}
                                {showChapterVerses.map((item, index) => (
                                  <motion.div key={item.id} variants={itemVariant}
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
    </>
  );
};

export default ChapterPage;

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
        /* opacity: 0.46; */
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
