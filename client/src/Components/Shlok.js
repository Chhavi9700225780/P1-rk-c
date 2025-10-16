import React, { useCallback, useMemo, useState , useRef} from "react";
import { Link , useNavigate} from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../Context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";

import { Play, Volume2 } from "lucide-react"; 
/**
 * Shlok component
 * Props:
 *  - chapterVerse: verse object (has chapter_number, verse_number, translations, etc.)
 *  - DefaultLanguage: "english" | "hindi"
 *  - isCompleted?: optional boolean initial state (if parent provides)
 *  - onProgressChange?: optional callback to notify parent to re-fetch progress
 */
const Shlok = ({ chapterVerse, DefaultLanguage, isCompleted: initialCompleted = false, onProgressChange }) => {
  const { user, openAuthModal } = useAuth();
const navigate = useNavigate();

 //console.log("Checking verse data:", chapterVerse); // <-- ADD THIS LINE
//const audioUrl = `/verse_recitation/${chapterVerse.chapter_number}/${chapterVerse.verse_number}.mp3`;
  // --- ^ ^ ^ ADD THIS LINE ^ ^ ^ ---



  console.log("--- DEBUGGING SHLOK COMPONENT ---");
  console.log("1. Received chapterVerse prop:", chapterVerse);

  let audioUrl = null; // Initialize audioUrl as null

  if (chapterVerse && chapterVerse.chapter_number && chapterVerse.verse_number) {
    console.log("2. Chapter Number:", chapterVerse.chapter_number);
    console.log("3. Verse Number:", chapterVerse.verse_number);

    // Construct the URL
    audioUrl = `/verse_recitation/${chapterVerse.chapter_number}/${chapterVerse.verse_number}.mp3`;
    console.log("4. Constructed audioUrl:", audioUrl);

  } else {
    console.error("ERROR: The 'chapterVerse' prop is either missing or does not contain chapter_number/verse_number.");
  }

  console.log("--- END DEBUGGING ---");





  // local optimistic state for the verse completed flag
  const [completed, setCompleted] = useState(!!initialCompleted);
  const [loading, setLoading] = useState(false);



// --- 3. ADD AUDIO STATE & REFS ---
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // --- 4. ADD AUDIO HANDLER ---
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const description = useCallback(
    (arr) => {
      for (let i = 0; i < (arr || []).length; i++) {
        if (
          DefaultLanguage === "english" &&
          arr[i].author_name === "Swami Adidevananda"
        ) {
          return arr[i].description;
        } else if (
          DefaultLanguage === "hindi" &&
          arr[i].author_name === "Swami Tejomayananda"
        ) {
          return arr[i].description;
        }
      }
      // fallback: return first available description or empty
      return (arr && arr[0] && arr[0].description) || "";
    },
    [DefaultLanguage]
  );

  const desc = useMemo(
    () => description(chapterVerse.translations),
    [description, chapterVerse]
  );

  // Helper to call backend for toggling verse progress
  const toggleVerseProgress = async (mark) => {
    if (!user) {
      toast.info("Please log in to mark progress");
     navigate("/login");
      return;
    }

    // optimistic update
    const prev = completed;
    setCompleted(mark);
    setLoading(true);

    try {
      const payload = {
        chapter: Number(chapterVerse.chapter_number),
        verse: Number(chapterVerse.verse_number),
        completed: !!mark,
      };

      const res = await axios.post("/progress/me/verse", payload, { withCredentials: true });

      if (res.data && res.data.ok) {
        toast.success(mark ? "Marked as completed" : "Marked as incomplete");
        // notify parent to refresh chapter/verse progress UI if they provided a handler
        if (typeof onProgressChange === "function") {
          try {
            await onProgressChange(); // allow parent to re-fetch progress
          } catch (e) {
            // ignore parent errors
          }
        }
      } else {
        // rollback
        setCompleted(prev);
        toast.error(res.data?.message || "Failed to update progress");
      }
    } catch (err) {
      console.error("toggleVerseProgress", err);
      setCompleted(prev);
      const msg = err?.response?.data?.message || "Network/server error";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper className="relative">
      <div className="shlok">
        <div className="flex flex-col justify-between">
          <div className="flex justify-center items-center title">
            <Link
              to={`/chapter/${chapterVerse.chapter_number}/slok/${chapterVerse.verse_number}`}
              className="relative w-full"
            >
              <h4 className="mb-0 text-center">
                {DefaultLanguage === "hindi" ? (
                  <>{`भगवद्गीता ${chapterVerse.chapter_number}.${chapterVerse.verse_number}`}</>
                ) : (
                  <>{`Bhagavad Gita ${chapterVerse.chapter_number}.${chapterVerse.verse_number}`}</>
                )}
              </h4>

              <span className="open absolute float-right">
                {`view `}
                <span className="viewCommentaryText">commentary</span>
                {` >>`}
              </span>
            </Link>
          </div>
          {/* --- 5. ADDED JSX FOR SANSKRIT TEXT & AUDIO BUTTON --- */}
          {/* This section appears to be in your screenshot but was missing from the code */}
        
      
          <div className="description">
            <p>{desc}</p>
          </div>

          {/* mark/unmark controls — placed below description */}
          <div className="progress-controls">
            <button
              className={`btn mark ${completed ? "marked" : ""}`}
              onClick={() => toggleVerseProgress(true)}
              disabled={loading}
              title="Mark as completed"
            >
              {loading && !completed ? <span className="tiny">...</span> : "Mark"}
            </button>

            <button
              className="btn unmark"
              onClick={() => toggleVerseProgress(false)}
              disabled={loading}
              title="Mark as incomplete"
            >
              {loading && completed ? <span className="tiny">...</span> : "Unmark"}
            </button>

            <div className="status">
              {completed ? <span className="done">Completed</span> : <span className="not-done">Not completed</span>}
            </div>
          </div>

          
<div >
  

    
    {/* THE AUDIO BUTTON - NOW USING our new 'audioUrl' variable */}
    {audioUrl && ( // This now checks our manually created variable
      <>
        <audio 
          ref={audioRef} 
          src={audioUrl} // The src also uses our variable
          onEnded={handleAudioEnded}
          preload="metadata"
        />
        <button onClick={togglePlay} className="play-button" aria-label="Play verse audio">
          {isPlaying ? <Volume2 size={32} /> : <Play size={32} />}
        </button>
      </>
    )}

  
  
</div>

        </div>
      </div>
    </Wrapper> 
  );
};

export default Shlok;

const Wrapper = styled.div`
  .shlok {
    padding-bottom: 0.5em;

    .title {
      background-color: ${({ theme }) => theme.colors.orange};
      margin-bottom: 10px;
      padding: 12px 0;
      .open {
        top: 0;
        right: 1rem;
      }
      a {
        &:hover {
          .open {
            display: inline;
            text-decoration: underline;
          }
        }
        .open {
          display: none;
        }
      }
    }

    .description {
      p {
        color: ${({ theme }) => theme.colors.heading.secondary};
        margin: 20px 0;
        padding: 0 1em;
        font-size: 1.1em;
      }
    }

    /* controls area */
    .progress-controls {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 1em 20px 1em;
      flex-wrap: wrap;
    }

    .btn {
      min-width: 110px;
      padding: 10px 14px;
      border-radius: 8px;
      border: none;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      transition: transform .12s ease, box-shadow .12s ease;
      &:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

      &.mark {
        background: ${({ theme }) => theme.colors.orange};
        color: #111;
      }
      &.unmark {
        background: #f3f4f6; /* light gray */
        color: #111;
      }
    }

    .status {
      margin-left: 6px;
      font-size: 0.95rem;
      color: #444;
      .done {
        color: #059669; /* green */
        font-weight: 700;
      }
      .not-done {
        color: #666;
      }
    }

    .tiny {
      display: inline-block;
      width: 16px;
      text-align: center;
    }
  }

  @media screen and (max-width: 720px) {
    .viewCommentaryText {
      display: none;
    }
    .progress-controls {
      gap: 8px;
      .btn { min-width: 44%; }
    }
  }


  /* --- 6. ADD NEW STYLES FOR VERSE & BUTTON --- */
  .verse-container {
    padding: 1.5em 1em;
    text-align: center;
  }

  .sanskrit-text-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1.5rem; /* space between text and button */
    margin-bottom: 1rem;
  }
  
  .devanagari {
    font-size: 1.8rem; /* larger font for sanskrit */
    line-height: 1.8;
    color: ${({ theme }) => theme.colors.heading.primary};
    font-weight: 500;
  }

  .play-button {
    background-color: transparent;
    border: 2px solid #2ECC71; /* green border */
    color: #2ECC71; /* green icon */
    border-radius: 50%;
    width: 50px;
    height: 50px;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    flex-shrink: 0; /* prevent the button from shrinking */

    &:hover {
      background-color: #2ECC71;
      color: white;
      transform: scale(1.1);
    }

    svg {
      margin-left: 3px; // to optically center the play icon
    }
  }

  .transliteration, .word-meaning {
    color: ${({ theme }) => theme.colors.heading.secondary};
    font-style: italic;
    margin-bottom: 1rem;
    padding: 0 1em;
    line-height: 1.6;
  }
  
  .word-meaning {
    font-style: normal;
    color: #007bff; // blue color as in screenshot
  }
`;
