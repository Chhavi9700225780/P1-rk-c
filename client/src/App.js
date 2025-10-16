// src/App.js
import { Route, Routes, useLocation } from "react-router-dom";
import HomePage from "./Pages/HomePage";
import About from "./Pages/About";
import { GlobalStyle } from "./GlobalStyle/GlobalStyle";
import { ThemeProvider } from "styled-components";
import Contact from "./Pages/Contact";
import VersePage from "./Pages/VersePage";
import ChapterPage from "./Pages/ChapterPage";
import Chapters from "./Components/Chapters";
import ErrorPage from "./Components/ErrorPage";
import { useGlobalContext } from "./Context/Context";
import Music from "./Components/Music";
import ScrollToTopButton from "./Components/ScrollToTopButton";
import Footer from "./Components/Footer";
import Preloader from "./Components/Preloader";
import Header from "./Components/Header";
import { useCallback, useEffect } from "react";
import { darkTheme, lightTheme } from "./config/Theme";
import GitaEmbedPage from "./Pages/GitaEmbedPage";


import LoginPage from "./Pages/LoginPage";
import ProfilePage from "./Pages/ProfilePage";


// Toast imports
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import JapaPage from "./Pages/JapaPage";

// Define the main App component
function App() {
  // Destructure values from the global context
  // Destructure values from the global context
  const { isLoading, isdarkMode, header, setHeader } = useGlobalContext();
  const location = useLocation();



  // Function to change the header background based on scroll position
  const changeHeaderBackground = useCallback(() => {
    if (window.scrollY >= 10) {
      setHeader(true);
    } else {
      setHeader(false);
    }
  }, [setHeader]);

  useEffect(() => {
    // Add scroll event listener to change header background
    window.addEventListener("scroll", changeHeaderBackground);
    return () => {
      window.removeEventListener("scroll", changeHeaderBackground);
    };
  }, [changeHeaderBackground]);

  
// Toast styling that adapts to dark/light theme
  const toastStyle = {
    borderRadius: 10,
    padding: "12px 14px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
    borderLeft: `6px solid ${isdarkMode ? "#f59e0b" : "#f59e0b"}`,
    background: isdarkMode ? "#0f1724" : "#ffffff",
    color: isdarkMode ? "#e6eef8" : "#0b1220",
    fontWeight: 600,
  };

  

  return (
    <ThemeProvider theme={isdarkMode ? darkTheme : lightTheme}>
      <GlobalStyle />

      {/* ✨ FIX 1: This main div is now a flex container for the whole app 
      style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}

      */}

      <div className="app">
        {isLoading ? (
          <Preloader />
        ) : (
          <>
            {location.pathname !== "/login" && location.pathname !== "/japa" && (
              <>
                <Header header={header} location={location} />
              </>
            )}
            {location.pathname !== "/login" && location.pathname !== "/profile" && location.pathname !== "/talktokrishna" && location.pathname !== "/japa" && (
              <>
                <Music />
                <ScrollToTopButton />
              </>
            )}

            {/* ✨ FIX 2: A <main> tag now wraps your Routes. It will grow to fill available space. 
            style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
            */}
           
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/chapters" element={<Chapters />} />
                  <Route path="/chapter/:id/" element={<ChapterPage />} />
                  <Route path="/chapter/:id/slok/:sh" element={<VersePage />} />
                  <Route
                    path="/talktokrishna"
                    element={<GitaEmbedPage />}
                  />
                  <Route path="/login" element={<LoginPage />}></Route>
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/japa" element={<JapaPage />} />
                  <Route path="*" element={<ErrorPage />}></Route>
                </Routes>
             

            {location.pathname !== "/login" && location.pathname !== "/profile" && location.pathname !== "/talktokrishna" && location.pathname !== "/japa"&& <Footer />}

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