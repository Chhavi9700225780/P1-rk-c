import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import {
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
} from "react-icons/md";

const ChapterBtn = ({ id }) => {
  return (
    <Wrapper className="chapter-btn">
      <div className="prev-arrow">
        <Link to={`/chapter/${id}/slok/${sh-1}`}>
          <MdKeyboardDoubleArrowLeft />
        </Link>
      </div>
      <div className="cur">
        <Link to={`/chapter/${id}`}>chapter 6</Link>
      </div>
      <div className="next-arrow">
        <Link to={`/chapter/${id}/slok/${sh+1}`}>
        <MdKeyboardDoubleArrowRight />
        </Link>
        
      </div>
    </Wrapper>
  );
};

export default ChapterBtn;

const Wrapper = styled.div`
`;
