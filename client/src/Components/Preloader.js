import React from 'react'
import styled from 'styled-components';

const Preloader = () => {
  return (
    <Wrapper>
      <div>
        <img src="/preloader/ripple.svg" alt=""/>
      </div>
    </Wrapper>
  )
}

export default Preloader;

const Wrapper = styled.div`
 width: 100vw;
 height: 100vh;
 display: flex;
 justify-content: center;
 align-items: center;
 background-color: rgb(255, 255, 255)
`