import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { CgChevronDoubleUp } from "react-icons/cg";

const ScrollToTopButton = () => {
  const [visible, setVisible] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    let ticking = false;

    const toggleVisibility = () => {
      const scrolled = document.documentElement.scrollTop || document.body.scrollTop;
      const shouldBeVisible = scrolled > 250;

      // Optimization: Only update state if value changes
      setVisible((prev) => {
        if (prev !== shouldBeVisible) {
          return shouldBeVisible;
        }
        return prev;
      });
      
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(toggleVisibility);
        ticking = true;
      }
    };

    // Optimization: { passive: true } improves scrolling performance
    window.addEventListener("scroll", onScroll, { passive: true });
    
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {visible && (
        <Wrapper>
          <div className="top-btn" onClick={scrollToTop}>
            <CgChevronDoubleUp className="up-icon" />
          </div>
        </Wrapper>
      )}
    </>
  );
};

export default ScrollToTopButton;

// ✅ STYLING UNTOUCHED
const Wrapper = styled.div`
  .top-btn {
    position: fixed;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 50px;
    height: 50px;
    bottom: 2rem;
    right: 2rem;
    cursor: pointer;
    padding: 0.25rem;
    z-index: 999;
    border-radius: 50%;
    box-shadow: 0px 0px 24px rgba(0, 0, 0, 0.2);
    background-color: ${({ theme }) => theme.colors.orange};

    .up-icon {
      font-size: 1.5rem;
      transition: transform 0.5s;
      &:hover {
        transform: translateY(-2px);
      }
    }
  }
  @media (max-width: 700px) {
    .top-btn{
      width: 40px;
      height: 40px;
      bottom: 5rem;
      right: 1rem;
    }
  }
`;