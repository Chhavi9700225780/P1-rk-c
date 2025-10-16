import React from "react";
import styled from "styled-components";

const Loading = () => {
  return (
    <Wrapper>
      <div className="status mb-5">
        <div className="border-t-transparent border-solid animate-spin  rounded-full border-yellow-400 border-4 h-10 w-10"></div>
      </div>
      <div>
        <span>Loding.... Please Wait</span>
      </div>
    </Wrapper>
  );
};

export default Loading;

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  span{
    color: ${({ theme }) => theme.colors.heading.primary};
  }
`;
