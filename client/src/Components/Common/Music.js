import React, { useState, useRef } from "react";
import { MdMusicNote, MdMusicOff } from "react-icons/md";
import styled from "styled-components";
import songsdata from "../../config/musicList";

const Music = () => {
  // Optimization 1: Track index instead of object for simpler logic
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const currentSong = songsdata[currentIndex];

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      // Optimization 2: Handle Play Promise to prevent "Interrupted" errors
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((error) => console.error("Playback failed:", error));
      }
    }
  };

  const playNext = () => {
    // Optimization 3: Use modulo (%) for infinite looping
    setCurrentIndex((prevIndex) => (prevIndex + 1) % songsdata.length);
  };

  return (
    <Wrapper onClick={togglePlay} aria-label={isPlaying ? "Pause music" : "Play music"}>
      <audio
        ref={audioRef}
        src={currentSong.url}
        autoPlay={isPlaying} // React handles the autoplay when src changes
        onEnded={playNext}
      />
      <div className="btn">
        {isPlaying ? <MdMusicNote /> : <MdMusicOff />}
      </div>
    </Wrapper>
  );
};

export default Music;

const Wrapper = styled.div`
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  bottom: 2rem;
  left: 2rem;
  cursor: pointer;
  width: 50px;
  height: 50px;
  padding: 0.25rem;
  z-index: 99;
  border-radius: 50%; /* Added here for stability */
  background-color: ${({ theme }) => theme.colors.orange};
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }

  .btn {
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white; /* Ensure icon is visible */
  }

  @media (max-width: 700px) {
    width: 40px;
    height: 40px;
    bottom: 5rem;
    left: 1rem;
    
    .btn {
        font-size: 1.2rem;
    }
  }
`;