import React from 'react'
import styled from 'styled-components';

const Border = () => {
  return (
    <Wrapper>
      <div className="custom-container">
      <div className="relative w-full h-full">
        <img src="./images/border1.png" alt="border" width={100} height={100} />
        </div>
      </div>
    </Wrapper>
  )
}

export default Border;

const Wrapper = styled.div`
.custom-container {
    margin: 0 8rem;

    img{
      width: 100%;
      height:auto;
    }
}
@media (max-width: 1280px) {

    .custom-container {
      margin: 0 5rem;
      
    }
  }
`