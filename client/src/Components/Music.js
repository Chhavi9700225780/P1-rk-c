import React, { useState } from "react";
import { useRef } from "react";
import { MdMusicNote,MdMusicOff } from "react-icons/md";
import styled from "styled-components";
import songsdata from "../config/musicList"

const Music = () => {
  const [currentSong, setCurrentSong] = useState(songsdata[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioPlayer = useRef();

  // console.log(isPlaying)

  const handlePlayPause = () => {
   const prevValue = isPlaying;
   setIsPlaying(!prevValue);
   if(!prevValue){
    audioPlayer.current.play();
   }
   else{
    audioPlayer.current.pause();
   }
  };

  const playNext = () =>{
    const index = songsdata.findIndex(x=>x.title === currentSong.title);

    if (index === songsdata.length-1)
    {
      setCurrentSong(songsdata[0]);
    }
    else
    {
      setCurrentSong(songsdata[index + 1]);
    }
  }

  const endedEvent = () => {
    playNext()
  }
  

  return (
    <Wrapper className="rounded-full" onClick={handlePlayPause}>
      <audio ref={audioPlayer} src={currentSong.url} autoPlay={isPlaying ? true : false} onEnded={endedEvent}></audio>
      <button className="btn">
        {isPlaying ? <MdMusicNote/> : <MdMusicOff/>}
      </button>
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
background-color: ${({ theme }) => theme.colors.orange};
.btn{
    font-size: 1.5rem;
}
@media (max-width: 700px) {
  width: 40px;
  height: 40px;
  bottom: 5rem;
  left: 1rem;
}
`
