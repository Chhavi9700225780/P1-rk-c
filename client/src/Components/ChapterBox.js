import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const ChapterBox = ({ id, heading, meaning, desc }) => {
  let navigate = useNavigate();

  const  scrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }

  const OpenChapter = (id) => {
    navigate(`/chapter/${id}`);
    scrollToTop();
  };

  return (
    <Wrapper className="chapter" onClick={() => OpenChapter(id)} >
      <div className="chapter-box"  >
        <div className="h-full flex flex-col p-10 justify-center">
          <div className="title flex flex-col mb-3">
            <div className="heading mr-4">
              <h5 className="font-bold">Chapter-{id}</h5>
            </div>

            <div className="description mr-4">
              <h4 className="mb-1 text-xl font-semibold">{heading}</h4>
              <span className="text-sm font-light">{meaning}</span>
            </div>
          </div>
          <div className="description">
            <p className="text-gray-500 line-clamp-3">
              {desc ? (
                <>{desc}</>
              ) : (
                <>
                  Dhṛtarāṣṭra said: O Sañjaya, after my sons and the sons of
                  Pāṇḍu assembled in the place of pilgrimage at Kurukṣetra,
                  desiring to fight, what did they do?
                </>
              )}
            </p>
          </div>
          <div className="button font-semibold text-sm mt-4">SEE MORE</div>
        </div>
      </div>
    </Wrapper>
  );
};

export default ChapterBox;

const Wrapper = styled.div`
  .chapter-box {
    width: 100%;
    height: 100%;
    /* background-color: white; */
    background: ${({ theme }) => theme.colors.bg.primary};
    box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    transition: transform linear 0.2s;
    border: none;
    cursor: pointer;
    &:hover {
      border: 1px solid rgba(249, 115, 22, 0.5);
      /* background-color: #fffaec; */
      /* background-color: ${({ theme }) => theme.colors.heading.primary}; */
      transform: scale(1.01)
    }
    .heading{
      color: #f97316;
    }
    .description{

      span,h4{
        color: ${({ theme }) => theme.colors.heading.primary};
      }
      p{
        color: ${({ theme }) => theme.colors.heading.secondary};
      }
    }
    .button{
      color: ${({ theme }) => theme.colors.heading.primary};
    }
  }
`;
