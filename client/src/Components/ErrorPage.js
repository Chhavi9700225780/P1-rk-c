import React from "react";
import styled from "styled-components";

const ErrorPage = () => {
  return (
    <Wrapper className="relative py-10 flex justify-center">
      <div className="relative custom-container w-full flex flex-col justify-center items-center">
        <div className="relative wrapper flex flex-col justify-center items-center z-10">
          <div className="heading text-center w-full">
            <h1 className="text-6xl sm:text-5xl">PAGE NOT FOUND!</h1>
          </div>
          <div className="description text-center w-full max-w-xl md:w-3/4 lg:w-7/12">
            <p className="text-lg">
            The page you are looking for might have been removed had its name changed or is temporarily unavailable.
            </p>
          </div>
          <div className="not-found-404 w-full text-center">
            <h1 className=" text-slate-300">404</h1>
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

export default ErrorPage;

const Wrapper = styled.div`
  width: 100vw;
  min-height: 80vh;
  background-color: ${({ theme }) => theme.colors.bg.primary};
  .custom-container {
    margin: 0 3rem;
    min-width: 375px;
    max-width: 1080px;
    color: ${({ theme }) => theme.colors.heading.primary};
    .wrapper{
      width: 100%;
      height: 100%;
      p {
      line-height: 1.8em;
    }
    .not-found-404{
      position: absolute;
      content: "";
      z-index: -1;
      h1{
        color: rgba(0, 0, 0, 0.1);
        font-size: 18rem;
      }
    }
    }
  }
`;
