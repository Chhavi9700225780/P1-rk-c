import React, { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { toast } from "react-toastify";
import { Play, Volume2, Loader2, CheckCircle2, Circle, Heart } from "lucide-react";

// API & Context
import api from "../utils/api"; // Use your central API file
import { useGlobalContext } from "../Context/Context";
import { useAuth } from "../Context/AuthContext";

// Components
import VerseTable from "../Components/Chapters/VerseTable";
import Loading from "../Components/Common/Loading";

const VersePage = () => {
  const { id, sh } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    GetVerse,
    verse,
    isVerseLoading,
    GetSingleChapter,
    singleChapter,
    GetAllVerses,
    DefaultLanguage,
  } = useGlobalContext();

  // --- 1. OPTIMIZED: Memoize Word Meanings (No State/Effect needed) ---
  const wordMeaning = useMemo(() => {
    if (!verse?.word_meanings) return [];
    return verse.word_meanings.split("; ").map((sentence, index) => ({
      id: `${index + 1}`,
      word: sentence.split("—")[0],
      meaning: sentence.split("—")[1],
    }));
  }, [verse]);

  // --- 2. Audio Logic ---
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioUrl = verse?.chapter_number && verse?.verse_number
    ? `/verse_recitation/${verse.chapter_number}/${verse.verse_number}.mp3`
    : null;

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error("Audio play error:", err);
    }
  };

  // --- 3. Progress & Favourite State ---
  const [progressMap, setProgressMap] = useState({});
  const [loadingVerseToggle, setLoadingVerseToggle] = useState(false);
  const [isFavourite, setIsFavourite] = useState(false);
  const [loadingFav, setLoadingFav] = useState(false);

  // Fetch Initial Data
  useEffect(() => {
    window.scrollTo(0, 0);
    GetSingleChapter(id);
    GetAllVerses(`${id}/slok`);
    GetVerse(`${id}/slok/${sh}`);
    
    // Fetch User Specific Data
    if (user) {
      fetchChapterProgress();
      fetchFavStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, sh, user]); // Added user to dependency to refetch on login

  // Fetch Progress
  const fetchChapterProgress = async () => {
    try {
      const res = await api.get(`/progress/me/chapter/${id}`);
      if (res.data?.ok) {
        const map = {};
        (res.data.verses || []).forEach((v) => {
          const num = v.verse || v.verse_number;
          if (num) map[Number(num)] = !!v.completed;
        });
        setProgressMap(map);
      }
    } catch (err) {
      // Silent fail
    }
  };

  // Fetch Favourite Status
  const fetchFavStatus = async () => {
    try {
      const res = await api.get("/favourites/me");
      if (res.data?.ok) {
        const isFav = (res.data.favourites || []).some(
          (f) => Number(f.chapter) === Number(id) && Number(f.verse) === Number(sh)
        );
        setIsFavourite(isFav);
      }
    } catch (err) {
      // Silent fail
    }
  };

  // Toggle Verse Completion
  const toggleVerse = async (mark) => {
    if (!user) {
      toast.info("Please log in to mark progress");
      return navigate("/login");
    }

    setLoadingVerseToggle(true);
    // Optimistic Update
    setProgressMap(prev => ({ ...prev, [Number(sh)]: mark }));

    try {
      const res = await api.post("/progress/me/verse", {
        chapter: Number(id),
        verse: Number(sh),
        completed: mark,
      });
      
      if (res.data?.ok) {
        toast.success(mark ? "Verse completed" : "Verse unchecked");
        fetchChapterProgress(); // Sync exact state
      } else {
        throw new Error(res.data?.message);
      }
    } catch (err) {
      setProgressMap(prev => ({ ...prev, [Number(sh)]: !mark })); // Rollback
      toast.error("Failed to update progress");
    } finally {
      setLoadingVerseToggle(false);
    }
  };

  // Toggle Chapter Completion (for sidebar)
  const toggleWholeChapter = async (markComplete) => {
    if (!user) return navigate("/login");
    try {
      await api.post("/progress/me/chapter", {
        chapterId: Number(id),
        completed: markComplete,
      });
      fetchChapterProgress();
      toast.success(markComplete ? "Chapter completed" : "Chapter unchecked");
    } catch (err) {
      toast.error("Failed to update chapter");
    }
  };

  // Toggle Favourite
  const toggleFavourite = async () => {
    if (!user) return navigate("/login");
    
    setLoadingFav(true);
    setIsFavourite(prev => !prev); // Optimistic

    try {
      const res = await api.post("/favourites/toggle", {
        chapter: Number(id),
        verse: Number(sh),
      });
      
      if (!res.data?.ok) throw new Error();
      
      toast.success(res.data.favourite ? "Added to favourites" : "Removed from favourites");
    } catch (err) {
      setIsFavourite(prev => !prev); // Rollback
      toast.error("Failed to update favourite");
    } finally {
      setLoadingFav(false);
    }
  };

  const currentCompleted = !!progressMap[Number(sh)];

  return (
    <Wrapper>
      <div className="wrapper px-0 xl:px-20 py-3">
        <div className="chapter-container px-8 md:px-10 xl:px-20">
          
          {/* Show Content Only When Verse Data Exists */}
          {verse && Object.keys(verse).length > 0 ? (
            <div className="custom-container flex justify-center">
              
              {/* Left Sidebar */}
              <VerseTable
                singleChapter={singleChapter}
                id={id}
                sh={sh}
                progressMap={progressMap}
                onToggleChapterComplete={toggleWholeChapter}
              />

              {/* Main Content */}
              <div className="inner-container lg:ml-4">
                <div className="main-section flex justify-center flex-col">
                  {isVerseLoading ? (
                    <Loading />
                  ) : (
                    <>
                      {/* Header */}
                      <div className="chapter-intro flex justify-center flex-col items-center">
                        <div className="chapter-heading mb-5">
                          <h4 className="font-bold text-center">
                            {DefaultLanguage === "hindi" ? (
                              <>भगवद्गीता: अध्याय {verse.chapter_number}, श्लोक {verse.verse_number}</>
                            ) : (
                              <>Bhagavad Gita: Chapter {verse.chapter_number}, Verse {verse.verse_number}</>
                            )}
                          </h4>
                        </div>

                        {/* Sanskrit Verse */}
                       <div className="chapter-slok text-orange-500 text-center font-bold">
                              <p className="text-xl">
                                {verse.text?.split("\n").map((line, i) => (
                                  <React.Fragment key={i}>
                                    {line}<br />
                                  </React.Fragment>
                                ))}
                              </p>
                            </div>

                        {/* Audio Player */}
                       <div className="audio-container flex justify-center mb-2 -mt-2 " >
                              <audio ref={audioRef} src={audioUrl || ""} preload="metadata" onEnded={togglePlay} />
                              {audioUrl ? (
                                <button
                                  type="button"
                                  onClick={togglePlay}
                                  className="w-14 h-14 rounded-full border-2 bg-gradient-to-br from-[#14b8a6] to-[#0891b2] text-white flex items-center justify-center transition duration-200"
                                >
                                  {isPlaying ? <Volume2 size={28} /> : <Play size={28} />}
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  style={{ background: "#fee2e2", border: "1px dashed #f87171", padding: "8px 12px", borderRadius: 8 }}
                                >
                                  No audio
                                </button>
                              )}
                            </div>

                        {/* Transliteration */}
                        <div className="transliteration text-center italic text-gray-600 mb-6">
                          {verse.transliteration?.split("\n").map((line, i) => (
                             <p key={i}>{line}</p>
                          ))}
                        </div>

                        {/* Word Meanings */}
                        <div className="WordMeanings text-center p-4 bg-orange-50/50 rounded-lg">
                          <p>
                            {wordMeaning.map((item, i) => (
                              <span key={i} className="mr-2 inline-block">
                                <span className="font-bold text-orange-700">{item.word}</span>
                                <span className="text-gray-600"> — {item.meaning};</span>
                              </span>
                            ))}
                          </p>
                        </div>
                      </div>

                      {/* Translations & Commentary */}
                      <div className="list-container mt-8 pb-14">
                         {/* Translation Section */}
                         <div className="mb-8">
                            <h3 className="text-center font-bold text-xl bg-orange-100 py-2 mb-4">Translation</h3>
                            {verse.translations?.map((t) => (
                               ((DefaultLanguage === "hindi" && t.language === "hindi") || (DefaultLanguage === "english" && t.language === "english")) && (
                                 <div key={t.id} className="desc-content mt-4 px-4">
                                    <h4 className="font-bold text-center mb-2">{t.author_name}</h4>
                                        <p>
                                          <span className="verseShort">
                                            <u className="font-bold bg-orange-300">BG {`${verse.chapter_number}.${verse.verse_number}`}</u>:
                                          </span>{" "}
                                          {t.description}
                                        </p>
                                 </div>
                               )
                            ))}
                         </div>

                         {/* Commentary Section */}
                         <div>
                            <h3 className="text-center font-bold text-xl bg-orange-100 py-2 mb-4">Commentary</h3>
                            {verse.commentaries?.map((c) => (
                               ((DefaultLanguage === "hindi" && c.language === "hindi") || (DefaultLanguage === "english" && c.language === "english")) && (
                                 <div key={c.id} className="desc-content mt-4 px-4">
                                    <h4 className="font-bold text-center mb-2">{c.author_name}</h4>
                                    <p className="text-gray-600 leading-loose">{c.description}</p>
                                 </div>
                               )
                            ))}
                         </div>
                      </div>

                      {/* Actions Bar (Mark Complete / Favorite) */}
                      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8 pb-8">
                         <button
                            onClick={() => toggleVerse(!currentCompleted)}
                            disabled={loadingVerseToggle}
                            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all shadow-md ${
                               currentCompleted ? "bg-teal-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                         >
                            {loadingVerseToggle ? <Loader2 className="animate-spin" /> : currentCompleted ? <CheckCircle2 /> : <Circle />}
                            {currentCompleted ? "Completed" : "Mark Complete"}
                         </button>

                         <button
                            onClick={toggleFavourite}
                            disabled={loadingFav}
                            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all shadow-md ${
                               isFavourite ? "bg-rose-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                         >
                            {loadingFav ? <Loader2 className="animate-spin" /> : <Heart className={isFavourite ? "fill-white" : ""} />}
                            Favourite
                         </button>
                      </div>

                    </>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <Loading />
          )}
        </div>
      </div>
    </Wrapper>
  );
};

export default VersePage;

// ✅ STYLING UNTOUCHED (Matches original)
const Wrapper = styled.div`
  position: relative;
  width: 100vw;
  height: auto;
  margin-top: 80px;
  background: url("/images/bg3.jpg");
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;

  .wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: ${({ theme }) => theme.colors.gradient.primary};
    padding-bottom: 3rem;
  }

  .inner-container {
    position: relative;
    width: 100%;
    background-color: ${({ theme }) => theme.colors.bg.primary};
    overflow: hidden;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);

    &::before {
      content: "";
      position: absolute;
      top: 0;
      right: 0;
      background-color: ${({ theme }) => theme.colors.bg.primary};
      height: 30px;
      width: 100%;
      z-index: 2;
    }
    &::after {
      content: "";
      position: absolute;
      bottom: 0;
      right: 0;
      background-color: ${({ theme }) => theme.colors.bg.primary};
      height: 30px;
      width: 100%;
      z-index: 2;
    }
  }

  .main-section {
    position: relative;
    padding: 3em 1em;
    height: 100%;
    overflow-y: scroll;
    z-index: 1;
  }

  .chapter-intro {
    padding-top: 1em;
    position: relative;
    z-index: 2;
    .chapter-heading h4 {
      color: ${({ theme }) => theme.colors.heading.primary};
      font-size: 1.4em;
    }
  }
  
  .list-container .heading {
     background-color: ${({ theme }) => theme.colors.orange};
  }

  @media (min-width: 750px) {
    .inner-container {
      max-width: 74%;
      min-width: 460px;
      min-height: 100%;
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