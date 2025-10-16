import React from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useGlobalContext } from "../Context/Context";
import styled from "styled-components";
import { useState } from "react";
import VerseTable from "../Components/VerseTable";
import Loading from "../Components/Loading";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../Context/AuthContext";
import { Play, Volume2 } from "lucide-react";

import { Loader2, CheckCircle2, Circle, Heart } from "lucide-react";
const VersePage = () => {
  const {
    GetVerse,
    verse,
    isVerseLoading,
    GetSingleChapter,
    singleChapter,
    GetAllVerses,
    DefaultLanguage,
  } = useGlobalContext();

  const { user } = useAuth();
  const navigate = useNavigate();

  const { id, sh } = useParams();
  const [wordMeaning, setWordMeaning] = useState([
    {
      id: "",
      word: "",
      meaning: "",
    },
  ]);

  // AUDIO: ref, state, url (use verse when available, fallback to params)
  const audioRef = React.useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioUrl =
    verse && verse.chapter_number != null && verse.verse_number != null
      ? `/verse_recitation/${verse.chapter_number}/${verse.verse_number}.mp3`
      : id && sh
      ? `/verse_recitation/${id}/${sh}.mp3`
      : null;

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return console.warn("audioRef missing");
    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        const p = audio.play();
        if (p && typeof p.then === "function") await p;
        setIsPlaying(true);
      }
    } catch (err) {
      console.error("Audio play error:", err);
    }
  };

  const handleAudioEnded = () => setIsPlaying(false);

  // debug tip
  console.log("audioUrl:", audioUrl);

  // progress map for this chapter: { verseNumber: true/false }
  const [progressMap, setProgressMap] = useState({});
  const [loadingVerseToggle, setLoadingVerseToggle] = useState(false);
  const [loadingChapterToggle, setLoadingChapterToggle] = useState(false);

  useEffect(() => {
    if (Object.keys(verse).length !== 0) {
      const inputString = verse.word_meanings || "";
      const sentences = inputString ? inputString.split("; ") : [];
      const arrayOfObjects = sentences.map((sentence, index) => ({
        id: `${index + 1}`,
        word: sentence.split("—")[0],
        meaning: sentence.split("—")[1],
      }));
      setWordMeaning(arrayOfObjects);
    } else {
      setWordMeaning([]);
    }
  }, [verse]);

  useEffect(() => {
    GetSingleChapter(`${id}`);
    GetVerse(`${id}/slok/${sh}`);
    GetAllVerses(`${id}/slok`);
    fetchChapterProgress(); // fetch progress when this page loads or id changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, sh]);

  // Fetch per-verse progress for this chapter
  const fetchChapterProgress = async () => {
    try {
      const res = await axios.get(`/progress/me/chapter/${id}`, {
        withCredentials: true,
      });
      if (res.data && res.data.ok) {
        const map = {};
        const versesArr = res.data.verses || res.data.chapterVerses || [];
        versesArr.forEach((v) => {
          const verseNum =
            v.verse || v.verse_number || v.verseNumber || v.index;
          if (typeof verseNum !== "undefined")
            map[Number(verseNum)] = !!v.completed;
        });
        setProgressMap(map);
      } else {
        setProgressMap({});
      }
    } catch (err) {
      // probably anonymous user — clear progress map silently
      setProgressMap({});
    }
  };

  // Toggle single verse (mark/unmark)
  const toggleVerse = async (mark) => {
    // guard: require login
    if (!user) {
      toast.info("Please log in to mark verse progress");
      navigate("/login");
      return;
    }

    // optimistic UI: update map locally before sending
    const verseNum = Number(sh);
    const prev = progressMap[verseNum];
    setProgressMap((m) => ({ ...m, [verseNum]: !!mark }));
    setLoadingVerseToggle(true);

    try {
      const payload = {
        chapter: Number(id),
        verse: verseNum,
        completed: !!mark,
      };
      const res = await axios.post("/progress/me/verse", payload, {
        withCredentials: true,
      });
      if (res.data && res.data.ok) {
        toast.success(
          mark ? "Verse marked complete" : "Verse marked incomplete"
        );
        // refresh full chapter progress to sync state
        await fetchChapterProgress();
      } else {
        // rollback
        setProgressMap((m) => ({ ...m, [verseNum]: prev }));
        toast.error(res.data?.message || "Failed to update verse progress");
      }
    } catch (err) {
      // rollback on error
      setProgressMap((m) => ({ ...m, [verseNum]: prev }));
      console.error("toggleVerse err", err);
      toast.error(err?.response?.data?.message || "Network/server error");
    } finally {
      setLoadingVerseToggle(false);
    }
  };

  // Toggle whole chapter complete/uncomplete
  const toggleWholeChapter = async (markComplete = true) => {
    if (!user) {
      toast.info("Please log in to mark chapter progress");
      navigate("/login");
      return;
    }
    try {
      setLoadingChapterToggle(true);
      await axios.post(
        "/progress/me/chapter",
        { chapterId: Number(id), completed: !!markComplete },
        { withCredentials: true }
      );
      await fetchChapterProgress();
      toast.success(
        markComplete ? "Chapter marked complete" : "Chapter marked incomplete"
      );
    } catch (err) {
      console.error("toggleWholeChapter", err);
      toast.error(
        err?.response?.data?.message || "Failed to update chapter progress"
      );
    } finally {
      setLoadingChapterToggle(false);
    }
  };

  // derive current verse completed state
  const currentVerseNum = Number(sh);
  const currentCompleted = !!(progressMap[currentVerseNum] || false);

  // ===== Favourite state =====
  const [isFavourite, setIsFavourite] = useState(false);
  const [loadingFav, setLoadingFav] = useState(false);

  // Check if current verse is favourite when page loads
  useEffect(() => {
    const fetchFav = async () => {
      try {
        const res = await axios.get("/favourites/me", {
          withCredentials: true,
        });
        if (res.data && res.data.ok) {
          const favs = res.data.favourites || [];
          const found = favs.some(
            (f) =>
              Number(f.chapter) === Number(id) && Number(f.verse) === Number(sh)
          );
          setIsFavourite(found);
        }
      } catch (err) {
        setIsFavourite(false); // ignore if not logged in
      }
    };
    fetchFav();
  }, [id, sh]);

  // Toggle favourite
  const toggleFavourite = async () => {
    if (!user) {
      toast.info("Please log in to manage favourites");
      navigate("/login");
      return;
    }
    setLoadingFav(true);
    const prev = isFavourite;
    setIsFavourite(!prev); // optimistic update
    try {
      const res = await axios.post(
        "/favourites/toggle",
        { chapter: Number(id), verse: Number(sh) },
        { withCredentials: true }
      );
      if (!(res.data && res.data.ok)) {
        setIsFavourite(prev); // rollback
        toast.error(res.data?.message || "Failed to update favourite");
      } else {
        if (res.data.favourite) toast.success("Added to favourites");
        else toast.success("Removed from favourites");
      }
    } catch (err) {
      setIsFavourite(prev); // rollback
      toast.error(err?.response?.data?.message || "Network/server error");
    } finally {
      setLoadingFav(false);
    }
  };

  return (
    <>
      <Wrapper>
        <div className="wrapper px-0 xl:px-20 py-3">
          <div className="chapter-container px-8 md:px-10 xl:px-20 ">
            {/* Conditional rendering based on verse availability */}
            {Object.keys(verse).length !== 0 ? (
              <>
                <div className="custom-container flex justify-center">
                  
                     {/* Render a verse table component and pass progressMap + chapter toggle */}
                  <VerseTable
                    singleChapter={singleChapter}
                    id={id}
                    sh={sh}
                    progressMap={progressMap}
                    onToggleChapterComplete={toggleWholeChapter}
                  />
                 
                  <div className="inner-container lg:ml-4 ">
                    <div className="main-section flex justify-center flex-col">
                      {isVerseLoading ? (
                        <>
                          <Loading />
                        </>
                      ) : (
                        <>
                          {/* Display chapter introduction */}
                          <div className="chapter-intro flex justify-center flex-col items-center">
                            <div className="chapter-heading  flex justify-center flex-col items-center">
                              <h4 className="font-bold mb-5">
                                {/* Display chapter and verse numbers */}
                                {DefaultLanguage === "hindi" ? (
                                  <>
                                    भगवद्गीता:{" "}
                                    {`अध्याय ${verse.chapter_number}, श्लोक ${verse.verse_number}`}
                                  </>
                                ) : (
                                  <>
                                    Bhagavad Gita:{" "}
                                    {`Chapter ${verse.chapter_number}, Verse ${verse.verse_number}`}
                                  </>
                                )}
                              </h4>
                            </div>
                            {/* Display verse text */}
                            <div className="chapter-slok text-orange-600 text-center font-bold">
                              <p className="text-xl">
                                {verse.text.split("\n")[0]
                                  ? `${verse.text.split("\n")[0]}`
                                  : ""}
                                <br />
                                {verse.text.split("\n")[2]
                                  ? verse.text.split("\n")[2]
                                  : ""}
                                <br />
                                {verse.text.split("\n")[4]
                                  ? verse.text.split("\n")[4]
                                  : ""}
                              </p>
                            </div>

                            {/* AUDIO: audio element + play button */}
                            <div
                              className="audio-container"
                              style={{
                                display: "flex",
                                justifyContent: "center",
                                margin: "12px 0",
                              }}
                            >
                              {/* always render audio element so audioRef exists; src empty if audioUrl null */}
                              <audio
                                ref={audioRef}
                                src={audioUrl || ""}
                                preload="metadata"
                                onEnded={handleAudioEnded}
                              />
                              {audioUrl ? (
                                <button
                                  type="button"
                                  onClick={togglePlay}
                                  aria-label="Play verse audio"
                                  className=" w-14 h-14 rounded-full border-2 
   bg-gradient-to-br from-[#14b8a6] to-[#0891b2] text-white
    flex items-center justify-center 
    transition duration-200
   "
                                >
                                  {/* simple text icon so no extra import changes required */}
                                  {isPlaying ? (
                                    <Volume2 size={28} />
                                  ) : (
                                    <Play size={28} />
                                  )}
                                </button>
                              ) : (
                                // debug visible fallback so you can see it renders even when audio missing
                                <button
                                  type="button"
                                  onClick={() =>
                                    console.log(
                                      "No audioUrl for verse:",
                                      id,
                                      sh,
                                      verse
                                    )
                                  }
                                  style={{
                                    background: "#fee2e2",
                                    border: "1px dashed #f87171",
                                    padding: "8px 12px",
                                    borderRadius: 8,
                                  }}
                                >
                                  No audio
                                </button>
                              )}
                            </div>

                            {/* Display verse transliteration */}
                            <div className="transliteration text-center">
                              <p>
                                {verse.transliteration.split("\n")[0]}
                                <br />
                                {verse.transliteration.split("\n")[1]}
                                <br />
                                {verse.transliteration.split("\n")[2]}
                              </p>
                            </div>
                            {/* Display word meanings */}
                            <div className="WordMeanings text-center">
                              <p>
                                {wordMeaning.map((item) => (
                                  <span key={item.id}>
                                    <span className="highlight">
                                      {item.word}
                                      {"—"}
                                    </span>
                                    <span className="meaning">
                                      {item.meaning};{" "}
                                    </span>
                                  </span>
                                ))}
                              </p>
                            </div>
                          </div>

                          {/* Display translation and commentary */}
                          <div className="list-container z-10">
                            <div className="list-items flex flex-col justify-center items-center pb-14">
                              <div className="translation flex flex-col justify-center items-center w-full">
                                <div className="heading mb-3 text-center w-full p-2">
                                  <h3 className=" mb-0">Translation</h3>
                                </div>
                                {/* Map and render translation content */}
                                <div className="description w-full">
                                  {verse.translations.map((item) => {
                                    return DefaultLanguage === "hindi" &&
                                      item.language === "hindi" ? (
                                      <div
                                        key={item.id}
                                        className="desc-content mt-6"
                                      >
                                        <div className="title">
                                          <h3 className="text-center font-bold mb-0">
                                            {item.author_name}
                                          </h3>
                                        </div>

                                        <p>
                                          <span className="verseShort">
                                            <u className="font-bold">
                                              BG{" "}
                                              {`${verse.chapter_number}.${verse.verse_number}`}
                                            </u>
                                            {":"}
                                          </span>{" "}
                                          {item.description.split("।")[4]}
                                        </p>
                                      </div>
                                    ) : DefaultLanguage === "english" &&
                                      item.language === "english" ? (
                                      <div
                                        key={item.id}
                                        className="desc-content mt-6"
                                      >
                                        <div className="title">
                                          <h3 className="text-center font-bold mb-0">
                                            {item.author_name}
                                          </h3>
                                        </div>

                                        <p>
                                          <span className="verseShort">
                                            <u className="font-bold">
                                              BG{" "}
                                              {`${verse.chapter_number}.${verse.verse_number}`}
                                            </u>
                                            {":"}
                                          </span>{" "}
                                          {item.description}
                                        </p>
                                      </div>
                                    ) : (
                                      <React.Fragment key={item.id} />
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Display commentary */}
                              <div className="commentary flex flex-col justify-center items-center w-full">
                                <div className="heading mb-3 text-center w-full p-2">
                                  <h3 className="mb-0">Commentary</h3>
                                </div>

                                <div className="description w-full ">
                                  {verse.commentaries.map((item) => {
                                    return DefaultLanguage === "english" &&
                                      item.language === "english" ? (
                                      <div
                                        key={item.id}
                                        className="desc-content mt-3"
                                      >
                                        <div className="title">
                                          <h3 className="text-center font-bold">
                                            {item.author_name}
                                          </h3>
                                        </div>
                                        <div className="content">
                                          <p className="text-gray-400">
                                            {item.description}
                                          </p>
                                        </div>
                                      </div>
                                    ) : DefaultLanguage === "hindi" &&
                                      item.language === "hindi" ? (
                                      <div
                                        key={item.id}
                                        className="desc-content mt-3"
                                      >
                                        <div className="title">
                                          <h3 className="text-center font-bold">
                                            {item.author_name}
                                          </h3>
                                        </div>
                                        <div className="content">
                                          <p className="text-gray-500">
                                            {item.description}
                                          </p>
                                        </div>
                                      </div>
                                    ) : (
                                      <React.Fragment key={item.id} />
                                    );
                                  })}
                                </div>
                              </div>

                              {/* ===== Redesigned Verse Controls: Option 2 (Soft & Modern) ===== */}
                              <div className="verse-progress-controls mt-6 w-full flex flex-col sm:flex-row items-center justify-center gap-3">
                                {/* Completion Toggle Button */}
                               <button
  onClick={() => toggleVerse(!currentCompleted)}
  disabled={loadingVerseToggle}
  className={`
    flex items-center justify-center gap-2.5 w-full sm:w-auto
    px-5 rounded-lg font-bold
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-70 disabled:cursor-wait
    ${
      currentCompleted
        ? "bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-lg"
        : "bg-slate-100 text-slate-600 hover:bg-slate-200 focus:ring-cyan-500"
    }
  `}
>
  {loadingVerseToggle ? (
    <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" />
  ) : currentCompleted ? (
    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
  ) : (
    <>
      <Circle className="w-5 h-5 flex-shrink-0 text-slate-400 group-hover:hidden" />
      <CheckCircle2 className="w-5 h-5 flex-shrink-0 hidden group-hover:inline-block" />
    </>
  )}
  <span className="whitespace-nowrap mt-4 font-bold" style={{ lineHeight: '20px' }}>
    {currentCompleted ? "Completed" : "Mark Complete"}
  </span>
</button>


                                {/* Favourite Toggle Button (Icon only with text as a sibling) */}
                                <button
                                  onClick={toggleFavourite}
                                  disabled={loadingFav}
                                  className={`
            flex items-center justify-center gap-2 w-full sm:w-auto
            px-5  rounded-lg font-bold
            transition-all duration-200 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-offset-2
            disabled:opacity-70 disabled:cursor-wait
            ${
              isFavourite
                ? "bg-rose-500 text-white shadow-md"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 focus:ring-rose-500"
            }
        `}
                                >
                                  {loadingFav ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                  ) : (
                                    <Heart
                                      className={`w-5 h-5 ${
                                        isFavourite ? "fill-current" : ""
                                      }`}
                                    />
                                  )}
                                  <span className="whitespace-nowrap mt-4 ">
                                    {isFavourite ? "Favourite" : "Favourite"}
                                  </span>
                                </button>
                              </div>
                              {/* ===== end added controls ===== */}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  
                </div>
              </>
            ) : (
              <>
                <Loading />
              </>
            )}
          </div>
        </div>
      </Wrapper>
    </>
  );
};

export default VersePage;

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

  /* background-color: #f7f7fc; */
  .chapter-intro {
    padding-top: 1em;
    position: relative;
    z-index: 2;
    .chapter-heading {
      position: relative;
      width: 100%;
      height: 100%;
      h4 {
        color: ${({ theme }) => theme.colors.heading.primary};
        font-size: 1.4em;
      }
    }
    .chapter-slok {
      p {
        color: rgb(255, 152, 0);
        line-height: 2rem;
      }
    }
    .transliteration {
      p {
        color: ${({ theme }) => theme.colors.heading.primary};
        font-family: "Noto Serif", serif;
        font-style: italic;
      }
    }
    .WordMeanings {
      padding: 1em;
      .highlight {
        font-style: italic;
        color: ${({ theme }) => theme.colors.highlight.secondary};
      }
      p {
        color: ${({ theme }) => theme.colors.heading.secondary};
      }
      span {
        font-weight: 500;
        font-family: "Noto Serif", serif;
      }
    }
    p {
      margin: 0 0 20px;
    }
  }

  .list-container {
    .verseShort {
      font-family: cursive;
      color: #000000;
      background-color: rgb(255, 152, 0);
    }
    .translation {
      p {
        color: ${({ theme }) => theme.colors.textgray};
        padding: 1rem;
        font-weight: 500;
      }
    }
    .heading {
      /* color: ${({ theme }) => theme.colors.heading.primary} */
      background-color: ${({ theme }) => theme.colors.orange};
      h3 {
        font-size: 1.5em;
        font-weight: 700;
      }
    }
    .translation,
    .commentary {
      .description {
        h3 {
          color: ${({ theme }) => theme.colors.heading.primary};
          font-size: 1.5rem;
        }
      }
    }
    .commentary {
      .description {
        .desc-content {
          p {
            color: ${({ theme }) => theme.colors.textgray};
            line-height: 2em;
            padding: 1rem;
            font-weight: 500;
          }
        }
      }
    }
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
