import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import {BiChevronRight}  from "react-icons/bi"
import {AiFillGithub, AiFillInstagram, AiFillLinkedin} from "react-icons/ai"

const Footer = () => {

  const  scrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }


  return (
    <Wrapper
      className="footer relative overflow-hidden flex flex-col justify-center items-center"
      id="footer"
    >
      <div className="footer-container px-10">
        <div className="wrapper grid sm:grid-cols-3 gap-2">

          <div className="logo p-5" >
            <div className="mb-5">
              <a href="/">
                <img src="/images/logo2.png" alt="logo" />
              </a>
            </div>
            <div className="heading">
              <p className="lg:text-base">
                Bhagavad Gita is a practical guide to one's life that guides you
                to re-organise your life, achieve inner peace and approach the
                Supreme Lord (the Ultimate Reality)
              </p>
            </div>
          </div>

          <div className="footer-link lg:mx-10 md:mx-5 p-5 flex flex-col">
            <div className="mb-2">
              <h1 className="text-xl font-bold">USEFUL LINKS</h1>
            </div>
            <ul>
              <li onClick={scrollToTop}>
                <Link to="/" className="flex items-center">
                <span className="link-icon"><BiChevronRight/></span>
                <span>Home</span>
                </Link>
              </li>
              <li onClick={scrollToTop}>
                <Link to="/#about" className="flex items-center">
                <span className="link-icon"><BiChevronRight/></span>
                <span>About us</span></Link>
              </li>
              <li onClick={scrollToTop}>
                <Link to="/#contact" className="flex items-center">
                  <span className="link-icon"><BiChevronRight/></span>
                  <span>Contact Us</span>
                </Link>
              </li>
            </ul>
          </div>

          <div className="footer-link p-5 flex flex-col" >
            <div className="mb-2">
              <h1 className="text-xl font-bold">FOLLOW ME</h1>
            </div>
            <ul>
              <li>
                <a href="https://www.instagram.com/chh.avi_91/" target='_blank' rel="noreferrer" className="flex items-center">
                <span className="link-icon"><AiFillInstagram/></span>
                <span>Instagram</span>
                </a>
              </li>
              <li>
                <a href="https://www.linkedin.com/in/chhavi-265863299/" target='_blank'  rel="noreferrer" className="flex items-center">
                <span className="link-icon"><AiFillLinkedin/></span>
                <span>Linkedin</span>
                </a>
              </li>
              <li>
                <a href="https://github.com/Chhavi9700225780" target='_blank'  rel="noreferrer" className="flex items-center">
                <span className="link-icon"><AiFillGithub/></span>
                <span>Github</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom w-full flex flex-col justify-center items-center">
          <div className="mb-10 w-full">
            <div className="footer-bottom-line"></div>
          </div>
          <span className="flex justify-center items-center flex-wrap">
            <span className="mb-1">@ 2024 All rights reserved |</span> <span className="mb-1">
            Designed With 💙 By{" "}
            <a href="https://www.linkedin.com/in/chhavi-265863299/" target='_blank'  rel="noreferrer" className=" text-sm font-bold ">
              Chhavi
            </a>
            </span>
          </span>
        </div>
      </div>
    </Wrapper>
  );
};

export default Footer;

const Wrapper = styled.footer`
  position: relative;
  width: 100vw;
  height: 100%;
  /* background-color: #1D0427; */
  background-color: rgb(30, 30, 37);

  .footer-container {
    padding-top: 25px;
    padding-bottom: 25px;
    max-width: 1000px;
    
    .logo{
      .heading{
        max-width: 30rem;
        color: #BCB4BF;
      }
      
    }

    .footer-link{
      h1{
        color: white;
      }
    }

    ul {
      li {
        cursor: pointer;
        margin: 0 0 13px;
        color: #BCB4BF;
        span{
          
          margin-bottom: 0;
        }
        .link-icon{
          font-size: 1.2rem;
          font-weight: 700;
          margin-right: 0.2rem;
          color: ${({ theme }) => theme.colors.orange};
        }
        &:hover{
          color: ${({ theme }) => theme.colors.orange};
          text-decoration: underline;
        }
        a {
          font-size: 1rem;
        }

      }
    }

    .footer-bottom {
      color: white;
      .footer-bottom-line{
        border-top: 1px solid #BCB4BF;
      }
      a{
        color: ${({ theme }) => theme.colors.orange};
        &:hover{
          text-decoration: underline;
        }
      }
    }
  }
  @media (min-width: 1016px) {
    .heading{
      p{
        font-size: 1rem;
        line-height: 1.5rem;
      }
    }
  }

  @media (min-width: 800px) and (max-width: 1016px) {
    .heading{
      p{
        font-size: 0.85rem;
        line-height: 1.2rem;
      }
    }
  }
  @media (min-width: 700px) and (max-width: 800px) {
  
    .heading{
      p{
        font-size: 0.7rem;
        line-height: 1.2rem;
      }
    }
  }
  @media (max-width: 700px) {
  
  .footer-container{
    min-width: 100%
  }
}

`;
