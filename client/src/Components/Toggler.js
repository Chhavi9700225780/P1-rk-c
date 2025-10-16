import React, { useState } from 'react';
import { RiMoonLine, RiSunLine } from "react-icons/ri";
import styled from "styled-components";
import { useGlobalContext } from '../Context/Context';

const Toggler = () => {
const {isdarkMode, toggleTheme} = useGlobalContext();
    
let [toggle, setToggle] = useState(isdarkMode);

const toggleMode = () => {
  toggleTheme();
  setToggle(!isdarkMode);
};
  return (
    <Wrapper>
      {toggle === false ? (
        <RiMoonLine className="icon" onClick={() => toggleMode()} />
      ) : (
        <RiSunLine className="icon" onClick={() => toggleMode()} />
      )}
    </Wrapper>
  )
}

export default Toggler;

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  cursor: pointer;
  svg{
    display: inline;
  }
`;