import React, { useMemo, memo } from "react";
import styled from "styled-components";
import { NavLink, useParams } from "react-router-dom";
import { useGlobalContext } from "../../Context/Context";
import ChapterBtn from "../../Styles/ChapterBtn";
import Loading from "../Common/Loading";

const VerseTable = ({ singleChapter, progressMap = {}, onToggleChapterComplete }) => {
  const { id, sh } = useParams();
  const { chapterVerses, isVersesLoading, DefaultLanguage } = useGlobalContext();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  };

  // Optimization: Memoize this calculation to avoid re-running on every render
  const isChapterCompleted = useMemo(() => {
    if (!chapterVerses || chapterVerses.length === 0) return false;
    return chapterVerses.every((v) => progressMap[v.verse_number]);
  }, [chapterVerses, progressMap]);

  const handleToggle = () => {
    if (onToggleChapterComplete) {
      onToggleChapterComplete(!isChapterCompleted);
    }
  };

  return (
    <Wrapper className="mb-5">
      <aside className="right-section">
        <div className="right-content">
          <div className="coverImg">
            <img src={`/images/${id}.jpg`} alt={`Chapter ${id} cover`} loading="lazy" />
          </div>
          <div className="chapterTitle text-center">
            <h4>
              {DefaultLanguage === "hindi" ? (
                <>{`${id}. ${singleChapter.name}`}</>
              ) : (
                <>{`${id}. ${singleChapter.name_transliterated}`}</>
              )}
            </h4>
          </div>
          <ChapterBtn id={id} />

          <div className="verseTable">
            {!isVersesLoading ? (
              chapterVerses.map((item, index) => {
                const completed = progressMap[item.verse_number];
                return (
                  <NavLink
                    key={item.id}
                    to={`/chapter/${id}/slok/${index + 1}`}
                    onClick={scrollToTop}
                    className={`verse-count ${sh === String(index + 1) ? "active" : ""} ${
                      completed ? "completed" : ""
                    }`}
                  >
                    <span>{index + 1}</span>
                  </NavLink>
                );
              })
            ) : (
              <Loading />
            )}
          </div>

          {/* Chapter-level complete toggle */}
          {onToggleChapterComplete && (
            <div className="chapter-complete">
              <button
                onClick={handleToggle}
                className={`chapter-complete-btn ${isChapterCompleted ? "done" : ""}`}
              >
                {isChapterCompleted
                  ? "Unmark Chapter"
                  : "Mark Chapter Complete"}
              </button>
            </div>
          )}
        </div>
      </aside>
    </Wrapper>
  );
};

// Optimization: Prevent re-renders if props haven't changed
export default memo(VerseTable);

// ✅ STYLING UNTOUCHED
const Wrapper = styled.div`
  height: 100%;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);

  .right-section {
    padding: 1em;
    height: 100%;
    background-color: ${({ theme }) => theme.colors.bg.primary};

    .coverImg {
      margin-bottom: 0.5em;
      img {
        width: 100%;
      }
    }

    .chapterTitle {
      h4 {
        color: ${({ theme }) => theme.colors.heading.primary};
        font-size: 1.2em;
      }
    }
  }

  .verseTable {
    width: 100%;
    height: 100%;
    display: flex;
    flex-wrap: wrap;
    align-items: center;

    .verse-count {
      text-align: center;
      border: 1px solid #999;
      background-color: ${({ theme }) => theme.colors.bg.primary};
      cursor: pointer;
      color: ${({ theme }) => theme.colors.heading.primary};

      span {
        font-size: 1rem;
      }

      &:hover {
        span {
          color: white;
        }
        background-color: #ffc071;
        text-decoration: none;
      }
    }

   .verse-count.active {
      background-color: orange;  /* A vibrant orange similar to your theme */
      color: white;
      border-color: #f97316;
      text-decoration: none;
      cursor: pointer;
    }

    .verse-count.completed {
      background-image: linear-gradient(to bottom right, #14b8a6, #0891b2);
      color: white;
      border-color: #0d9488;
    }
  }
 
   .verse-count.active.completed {
     background-color: orange; 
     background-image: none; // Ensure gradient is removed
     color: white;
     border-color: #f97316; 
  }
   
  .chapter-complete {
    margin-top: 1rem;
    display: flex;
    justify-content: center;

    .chapter-complete-btn {
      width: 100%;
      padding: 10px 14px;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      background: ${({ theme }) => theme.colors.orange};
      color: #111;
      transition: background 0.2s ease;

      &.done {
        background: linear-gradient(to bottom right, #14b8a6, #0891b2);
        color: white;
      }

      &:hover {
        opacity: 0.9;
      }
    }
  }

  @media screen and (max-width: 960px) {
    .verseTable .verse-count {
      min-width: 12%;
      margin-right: 2%;
      margin-bottom: 2%;

      span {
        font-size: 0.8rem;
      }
    }
  }

  @media screen and (min-width: 960px) {
    .verse-count {
      min-width: 15.58442%;
      margin-right: 1%;
      margin-bottom: 1.2987%;
    }
  }

  @media (min-width: 750px) {
    max-width: 24%;
    min-width: 250px;
    margin-left: 1rem;
  }
`;