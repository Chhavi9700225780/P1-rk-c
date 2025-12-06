import React, { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Context & Styles
import { useGlobalContext } from "./Context/Context";
import { GlobalStyle } from "./GlobalStyle/GlobalStyle";
import { darkTheme, lightTheme } from "./config/Theme";

// Critical Components (Load immediately)
import Header from "./Components/Layouts/Header";
import Footer from "./Components/Layouts/Footer";
import Preloader from "./Components/Common/Preloader"; // Standard loader
import ScrollToTopButton from "./Components/Common/ScrollToTopButton";
import Music from "./Components/Common/Music";

// Lazy Load Pages & Heavy Components
const HomePage = lazy(() => import("./Pages/HomePage"));
const About = lazy(() => import("./Pages/About"));
const Contact = lazy(() => import("./Pages/Contact"));
const Chapters = lazy(() => import("./Components/Chapters/Chapters"));
const ChapterPage = lazy(() => import("./Pages/ChapterPage"));
const VersePage = lazy(() => import("./Pages/VersePage"));
const GitaEmbedPage = lazy(() => import("./Pages/GitaEmbedPage"));
const LoginPage = lazy(() => import("./Pages/LoginPage"));
const ProfilePage = lazy(() => import("./Pages/ProfilePage"));
const JapaPage = lazy(() => import("./Pages/JapaPage"));
const ErrorPage = lazy(() => import("./Components/Common/ErrorPage"));

function App() {
  const { isLoading, isdarkMode, header, setHeader } = useGlobalContext();
  const location = useLocation();
  const [ticking, setTicking] = useState(false); // Throttle state

  // Optimized Scroll Handler (Throttled)
  const changeHeaderBackground = useCallback(() => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        if (window.scrollY >= 10) {
          setHeader(true);
        } else {
          setHeader(false);
        }
        setTicking(false);
      });
      setTicking(true);
    }
  }, [setHeader, ticking]);

  useEffect(() => {
    window.addEventListener("scroll", changeHeaderBackground);
    return () => window.removeEventListener("scroll", changeHeaderBackground);
  }, [changeHeaderBackground]);

  // Toast Styles
  const toastStyle = {
    borderRadius: 10,
    padding: "12px 14px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
    borderLeft: `6px solid ${isdarkMode ? "#f59e0b" : "#f59e0b"}`,
    background: isdarkMode ? "#0f1724" : "#ffffff",
    color: isdarkMode ? "#e6eef8" : "#0b1220",
    fontWeight: 600,
  };

  // Helper to determine if we should hide layout elements
  const isFullscreenPage = ["/login", "/japa"].includes(location.pathname);
  const isProfileOrEmbed = ["/profile", "/talktokrishna"].includes(location.pathname);

  return (
    <ThemeProvider theme={isdarkMode ? darkTheme : lightTheme}>
      <GlobalStyle />

      <div className="app">
        {isLoading ? (
          <Preloader />
        ) : (
          <>
            {/* Header: Hide on Login/Japa */}
            {!isFullscreenPage && (
              <Header header={header} location={location} />
            )}

            {/* Global Tools: Music & ScrollToTop (Hide on Login/Profile/Embed/Japa) */}
            {!isFullscreenPage && !isProfileOrEmbed && (
              <>
                <Music />
                <ScrollToTopButton />
              </>
            )}

            {/* Suspense Wrapper handles loading state for all lazy routes */}
            <Suspense fallback={<Preloader />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/chapters" element={<Chapters />} />
                <Route path="/chapter/:id/" element={<ChapterPage />} />
                <Route path="/chapter/:id/slok/:sh" element={<VersePage />} />
                <Route path="/talktokrishna" element={<GitaEmbedPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/japa" element={<JapaPage />} />
                <Route path="*" element={<ErrorPage />} />
              </Routes>
            </Suspense>

            {/* Footer: Hide on Login/Profile/Embed/Japa */}
            {!isFullscreenPage && !isProfileOrEmbed && <Footer />}

            <ToastContainer
              position="top-right"
              autoClose={4000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme={isdarkMode ? "dark" : "light"}
              toastStyle={toastStyle}
            />
          </>
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;