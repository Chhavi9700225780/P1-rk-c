import React from "react";
import { Link, useParams } from "react-router-dom";
import styled from "styled-components";
import {
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
} from "react-icons/md";
import { useGlobalContext } from "../Context/Context";

const ChapterBtn = () => {
 const {id} = useParams();
 const {DefaultLanguage } = useGlobalContext();

  return (
    <Wrapper className="chapter-btn">
      <button className="prev-arrow hidden">
        <Link to={`/chapter/${Number(id) - 1}`} className={id <=1 ? "disabled" : ""} >
          <MdKeyboardDoubleArrowLeft />
        </Link>
      </button>
      <div className="cur">
        <Link to={`/chapter/${id}`}>
          {
            DefaultLanguage === "hindi" ? 
            <>{`अध्याय ${id}`}</>:
            <>{`Chapter ${id}`}</>
          }
        </Link>
      </div>
      <button className="next-arrow">
        <Link to={`/chapter/${Number(id) + 1}`} className={id >=18 ? "disabled" : ""}>
        <MdKeyboardDoubleArrowRight />
        </Link>
      </button>
    </Wrapper>
  );
};

export default ChapterBtn;

const Wrapper = styled.div`
width: 100%;
height: 100%;
display: flex;
justify-content: center;
align-items: center;
margin-bottom: 0.5em;
.prev-arrow, .next-arrow{
  display: flex;
  justify-content: center;
  align-items: center;
  width: 20%;
  border-radius: 2px;
  /* background-color: #ffc071; */
  background-color: ${({ theme }) => theme.colors.orange};
  a{
  display: flex;
  justify-content: center;
  align-items: center;
    width: 100%;
    padding: 0.4em 0;
    font-size: 1.4em;
  }
}
.prev-arrow, .next-arrow{
 .disabled{
  opacity: 0.5;
  pointer-events: none;
 }
}
.cur{
  display: flex;
  justify-content: center;
  align-items: center;
  width: 60%;
  padding: 0.5em 0;
  border-radius: 2px;
  /* background-color: #ffc071; */
  background-color: ${({ theme }) => theme.colors.orange};
  margin: 0 1.26582%;
  a{
    font-size: 1em;
    font-weight: 500;
  }
}
`;
