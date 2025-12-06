import React, { useMemo, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../../Context/AuthContext";
import api from "../../utils/api"; // Use central API
import { toast } from "react-toastify";
import { Play, Volume2 } from "lucide-react";

const Shlok = ({ chapterVerse, DefaultLanguage, isCompleted: initialCompleted = false, onProgressChange }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // 1. Safe Audio URL Generation
  const audioUrl = chapterVerse?.chapter_number && chapterVerse?.verse_number
    ? `/verse_recitation/${chapterVerse.chapter_number}/${chapterVerse.verse_number}.mp3`
    : null;

  // 2. Local State
  const [completed, setCompleted] = useState(!!initialCompleted);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // 3. Audio Handlers
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

  // 4. Optimized Description Logic (Memoized)
  const desc = useMemo(() => {
    const arr = chapterVerse?.translations || [];
    // Find specific author based on language
    const preferred = arr.find(t => 
      (DefaultLanguage === "english" && t.author_name === "Swami Adidevananda") ||
      (DefaultLanguage === "hindi" && t.author_name === "Swami Tejomayananda")
    );
    // Fallback to first available or empty string
    return preferred ? preferred.description : (arr[0]?.description || "");
  }, [chapterVerse, DefaultLanguage]);

  // 5. Toggle Progress (Using api.js)
  const toggleVerseProgress = async (mark) => {
    if (!user) {
      toast.info("Please log in to mark progress");
      navigate("/login");
      return;
    }

    const prev = completed;
    setCompleted(mark); // Optimistic update
    setLoading(true);

    try {
      const payload = {
        chapter: Number(chapterVerse.chapter_number),
        verse: Number(chapterVerse.verse_number),
        completed: !!mark,
      };

      // Use configured API instance (handles BaseURL + Credentials)
      const res = await api.post("/progress/me/verse", payload);

      if (res.data?.ok) {
        toast.success(mark ? "Marked as completed" : "Marked as incomplete");
        if (onProgressChange) onProgressChange(); // Refresh parent
      } else {
        throw new Error(res.data?.message);
      }
    } catch (err) {
      setCompleted(prev); // Rollback
      toast.error(err.message || "Failed to update progress");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper className="relative">
      <div className="shlok">
        <div className="flex flex-col justify-between">
          
          {/* Title Link */}
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

          {/* Description Text */}
          <div className="description">
            <p>{desc}</p>
          </div>

          {/* Controls Area */}
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

          {/* Audio Player Section */}
          <div>
            {audioUrl && (
              <>
                <audio
                  ref={audioRef}
                  src={audioUrl}
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

// ✅ STYLING UNTOUCHED
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

  /* --- ADDED STYLES FOR AUDIO BUTTON --- */
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
    flex-shrink: 0;
    margin-left: 1rem; /* Added spacing from controls */

    &:hover {
      background-color: #2ECC71;
      color: white;
      transform: scale(1.1);
    }

    svg {
      margin-left: 3px; 
    }
  }
`;