import React from "react";
import Navbar from "./Navbar";
import styled from "styled-components";

const Header = ({ header, location }) => {
  return (
    <Wrapper>
      <div
        className={
          !header && location.pathname === "/"
            ? "header w-full"
            : "header active w-full"
        }
      >
        <Navbar header={header} location={location} />
      </div>
    </Wrapper>
  );
};

export default Header;

const Wrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 99;
  width: 100vw;
  height: 80px;
  .header.active {
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
    background-color: ${({ theme }) => theme.colors.bg.primary};
    .navbar-link,
    .mode-toggler,
    .mobile-mode-toggler,
    .mobile-nav-icon[name="menu-outline"] {
      color: ${({ theme }) => theme.colors.heading.primary};
    }
    li:hover > .navbar-link {
      color: ${({ theme }) => theme.colors.orange};
    }
    li .navbar-link.active{
        color: ${({ theme }) => theme.colors.orange};
    }
    li .navbar-link.active.navbar-link:after{
      width: 100%;
    }
  }
`;
