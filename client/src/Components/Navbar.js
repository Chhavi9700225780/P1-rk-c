import React, { useState } from "react";
import styled from "styled-components";
import { CgClose, CgMenu } from "react-icons/cg";
import Toggler from "./Toggler";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useGlobalContext } from "../Context/Context";
import LanguageBtn from "../Styles/LanguageBtn";
import { Button } from "../Styles/Button";

// 🔑 import auth context
import { useAuth } from "../Context/AuthContext";
// ✨ Create a new styled component for the Login button
const LoginButton = styled(Button)`
  border: 1px solid #f59e0b;
  background: linear-gradient(
    135deg,
    rgba(245, 158, 11, 0.12),   /* light orange top-left */
    rgba(245, 158, 11, 0.25)    /* slightly stronger bottom-right */
  );
  color:  '#fff';
  padding: 0.5rem 1.2rem;
  border-radius: 5px;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease-in-out;
  cursor: pointer;
  white-space: nowrap;
  min-width: 80px;

  &:hover {
    background-color: ${({ theme }) => theme.colors.orange || '#f59e0b'};
    background-image: none; /* remove gradient on hover */
    color: ${({ theme }) => theme.colors.black || '#212529'};
    transform: scale(1.05);
  }
`;


const Navbar = ({ header }) => {
  const [menuIcon, setMenuIcon] = useState(false);
  const { isdarkMode } = useGlobalContext();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, openAuthModal } = useAuth(); // 👈 get auth state

  // unified handler: scroll if on home, otherwise navigate to home with state
  const handleNavClick = (e, targetId) => {
    e && e.preventDefault();
    setMenuIcon(false);

    if (location.pathname === "/" || location.pathname === "") {
      const el = document.getElementById(targetId);
      if (el) {
        const navOffset =
          parseInt(
            getComputedStyle(document.documentElement).getPropertyValue(
              "--nav-height"
            )
          ) || 0;
        const top =
          el.getBoundingClientRect().top + window.pageYOffset - navOffset;
        window.scrollTo({ top, behavior: "smooth" });
        window.history.replaceState(null, "", `#${targetId}`);
      } else {
        window.history.replaceState(null, "", `#${targetId}`);
      }
      return;
    }

    navigate("/", { state: { scrollTo: targetId } });
  };

  return (
    <Wrapper className="w-full">
      <div className={menuIcon ? "navbar active" : "navbar "}>
        <div
          className="menu_mobile_overlay"
          onClick={() => setMenuIcon(false)}
        ></div>
        <div
          className={
            menuIcon
              ? "navbar-container w-full grid gap-3 active"
              : "navbar-container w-full grid gap-3"
          }
        >
          <div className="logo px-3">
            <a href="/#hero" onClick={(e) => handleNavClick(e, "hero")}>
              <img
                src={
                  location.pathname === "/" && !menuIcon
                    ? !isdarkMode && header
                      ? "/images/logo3.png"
                      : "/images/logo2.png"
                    : !isdarkMode
                    ? "/images/logo3.png"
                    : "/images/logo2.png"
                }
                alt="logo"
                width={100}
                height={100}
              />
            </a>
            <CgClose
              name="close-outline"
              className="mobile-nav-icon close-outline"
              onClick={() => setMenuIcon(false)}
            />
          </div>

          <div className="navbar-lists flex justify-center items-center">
            <ul>
              <li>
                <a
                  href="/#hero"
                  onClick={(e) => handleNavClick(e, "hero")}
                  className="navbar-link "
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  onClick={(e) => handleNavClick(e, "about")}
                  className="navbar-link "
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="/chapters"
                  onClick={(e) => handleNavClick(e, "chapters")}
                  className="navbar-link "
                >
                  Chapters
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  onClick={(e) => handleNavClick(e, "contact")}
                  className="navbar-link "
                >
                  Contact Us
                </a>
              </li>
              <li>
                <NavLink
                  to="/talktokrishna"
                  className="navbar-link "
                  onClick={() => setMenuIcon(false)}
                >
                  GitaGPT
                </NavLink>
              </li>
            </ul>
          </div>

          <div className="mode-toggler flex justify-end items-center mr-3">
            {user ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Toggler />
                <LanguageBtn />
                <button
                  onClick={() => navigate("/profile")}
                  title={user.displayName || user.email || "Profile"}
                  className="profile-avatar-btn"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="avatar"
                    />
                  ) : (
                    (user.displayName || user.email || "U")
                      .slice(0, 1)
                      .toUpperCase()
                  )}
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Toggler />
                <LanguageBtn />
                <LoginButton onClick={() => navigate("/login")}>
                  Sign in
                </LoginButton>
              </div>
            )}
          </div>
        </div>

        <div className="mobile-navbar flex justify-between items-center">
          <div className="mobile-navbar-btn">
            <CgMenu
              name="menu-outline"
              className="mobile-nav-icon"
              onClick={() => setMenuIcon(true)}
            />
          </div>

          <div className="mobile-logo flex justify-center">
            <a href="/#home" onClick={(e) => handleNavClick(e, "home")}>
              <img
                className=" h-12"
                src={
                  location.pathname === "/"
                    ? !isdarkMode && header
                      ? "/images/logo3.png"
                      : "/images/logo2.png"
                    : !isdarkMode
                    ? "/images/logo3.png"
                    : "/images/logo2.png"
                }
                alt="logo"
              />
            </a>
          </div>

          <div className="mobile-mode-toggler flex justify-end items-center">
            {user ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Toggler />
                <LanguageBtn />
                <button
                  onClick={() => navigate("/profile")}
                  title={user.displayName || user.email || "Profile"}
                  className="profile-avatar-btn"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="avatar"
                    />
                  ) : (
                    (user.displayName || user.email || "U").slice(0, 1).toUpperCase()
                  )}
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Toggler />
                <LanguageBtn />
              <LoginButton onClick={() => navigate("/login")}>Sign in</LoginButton>
          
              </div>
            )}
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.nav`
  width: 100%;
  height: 80px;
  padding: 20px 10px;

  .menu_mobile_overlay {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 8001;
    width: 100%;
    height: 100%;
    background-color: #250831;
    opacity: 0.1;
  }

  .navbar-container {
    grid-template-columns: 0.5fr 2fr 0.5fr;

    .navbar-link {
      position: relative;
      font-size: 1.2rem;
      line-height: 1.5rem;
      color: white;
      padding: 0.5rem 0rem;
      cursor: pointer;
      text-decoration: none;
      font-weight: 500;
      text-transform: uppercase;
      transition: all 0.4s ease;

      &:link,
      &:visited {
        font-size: 1rem;
      }
      &:active {
        color: ${({ theme }) => theme.colors.orange};
      }

      &:after {
        content: "";
        display: block;
        position: relative;
        z-index: 1;
        top: auto;
        bottom: 0;
        left: 0;
        height: 2px;
        transform: none;
        background-color: ${({ theme }) => theme.colors.orange};
        transition: all 0.2s ease;
        width: 0;
      }
    }

    .navbar-lists {
      ul {
        display: flex;
        justify-content: center;
        align-items: center;
      }
      li {
        padding: 0 20px;
      }
    }

    .mode-toggler {
      font-size: 2rem;
      color: white;
    }
  }

  .profile-avatar-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(145deg, #f59e0b, #ffc107);
    border: 2px solid rgba(255, 255, 255, 0.5);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
    overflow: hidden;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    font-weight: 600;
    font-size: 1.1rem;
    cursor: pointer;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
    transition: all 0.2s ease-in-out;
    flex-shrink: 0;

    &:hover {
      transform: scale(1.08);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
      border-color: rgba(255, 255, 255, 0.8);
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  li:hover > .navbar-link::after {
    width: 100%;
  }

  li:hover > .navbar-link {
    color: ${({ theme }) => theme.colors.orange};
  }

  .mobile-navbar {
    display: none;
    background-color: transparent;
    cursor: pointer;
    border: none;
  }

  @media (min-width: 980px) {
    .mobile-logo {
      display: none;
    }
    .logo {
      .close-outline {
        display: none;
      }
    }
  }

  @media (max-width: 980px) {
    .mobile-navbar {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      justify-content: space-between;
      width: 100%;
      z-index: 9999;
      font-size: 3.2rem;
      border: white;
      .mobile-nav-icon {
        color: white;
      }
    }
    
    .profile-avatar-btn {
      width: 36px;
      height: 36px;
      font-size: 1rem;
    }

    .active .menu_mobile_overlay {
      display: block;
      z-index: 998;
    }
    .mobile-mode-toggler {
      font-size: 2rem;
      color: white;
    }
    .active .mobile-nav-icon {
      display: none;
      color: white;
      z-index: 9999;
    }
    .active .close-outline {
      display: flex;
    }
    .navbar-container {
      position: fixed;
      width: 50vw;
      height: 100vh;
      top: 0;
      left: 0;
      background-color: rgb(37, 8, 49);
      display: flex;
      flex-direction: column;
      visibility: hidden;
      opacity: 0;
      transform: translateX(-100%);
    }

    .active .navbar-container {
      visibility: visible;
      opacity: 1;
      transform: translateX(0);
      z-index: 999;
      transform-origin: right;
      width: 300px;

      .logo {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        padding: 15px 30px 13px 30px;
        margin-bottom: 2rem;
        img {
          width: auto;
          height: 100%;
        }
        .close-outline {
          font-size: 2rem;
          cursor: pointer;
        }
      }
      .navbar-lists {
        justify-content: start;
        ul {
          display: flex;
          flex-direction: column;
          justify-content: start;
          align-items: start;
          width: 100%;
          padding: 0 2rem;
          li {
            padding: 1.5rem 0;
            width: 100%;
            border-bottom: 2px solid rgba(95, 44, 112, 0.5);

            .navbar-link {
              display: block;
              font-size: 1.5rem;
              color: white;
              transition: all 0.4s ease;
              width: max-content;
              &:after {
                content: "";
                display: block;
                position: relative;
                z-index: 1;
                top: auto;
                bottom: 0;
                left: 0;
                height: 2px;
                transform: none;
                background-color: ${({ theme }) => theme.colors.orange};
                transition: all 0.2s ease;
                width: 0;
              }
            }
          }
          li:hover > .navbar-link::after {
            width: 100%;
          }
          li:hover > .navbar-link {
            color: ${({ theme }) => theme.colors.orange};
          }
        }
      }
      .mode-toggler {
        display: none;
      }
    }
  }
`;

export default Navbar;