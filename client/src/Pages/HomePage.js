import React, { Suspense, useEffect } from "react";
import styled from "styled-components";
import { useLocation } from "react-router-dom";

// Eager Load
import HeroSection from "../Components/Layouts/HeroSection";
import Border from "../Components/Common/Border";

// Lazy Load
const Chapters = React.lazy(() => import("../Components/Chapters/Chapters"));
const About = React.lazy(() => import("./About"));
const Contact = React.lazy(() => import("./Contact"));

const MAX_SCROLL_RETRIES = 10;
const RETRY_INTERVAL_MS = 100;

// --- HELPER FUNCTIONS (Moved Outside Component to fix Dependency Warning) ---

function scrollToElementById(id, behavior = "smooth") {
  if (!id) return false;
  const el = document.getElementById(id);
  if (!el) return false;
  
  const navOffset =
    parseInt(
      getComputedStyle(document.documentElement).getPropertyValue("--nav-height")
    ) || 80; // Fallback to 80
  
  const top = el.getBoundingClientRect().top + window.pageYOffset - navOffset;
  window.scrollTo({ top, behavior });
  return true;
}

function waitForElementThenScroll(id, { maxRetries = MAX_SCROLL_RETRIES, interval = RETRY_INTERVAL_MS, behavior = "smooth" } = {}) {
  let attempts = 0;
  let timer;
  let cancelled = false;

  const tryScroll = () => {
    if (cancelled) return;
    const ok = scrollToElementById(id, behavior);
    if (ok) return;
    
    attempts += 1;
    if (attempts < maxRetries) {
      timer = setTimeout(tryScroll, interval);
    }
  };

  timer = setTimeout(tryScroll, 0);

  return () => {
    cancelled = true;
    clearTimeout(timer);
  };
}

// --- MAIN COMPONENT ---

const HomePage = () => {
  const location = useLocation();

  useEffect(() => {
    const targetFromState = location.state && location.state.scrollTo;
    const hash = location.hash ? location.hash.replace("#", "") : null;
    const targetId = targetFromState || hash;

    if (!targetId) return;

    // Now safe to call because it's defined outside the component
    const cancelWait = waitForElementThenScroll(targetId, { maxRetries: 12, interval: 100, behavior: "smooth" });

    try {
      const newUrl = window.location.pathname + (hash ? `#${hash}` : "");
      window.history.replaceState({}, "", newUrl);
    } catch (e) {
      // ignore
    }

    return () => {
      if (typeof cancelWait === "function") cancelWait();
    };
  }, [location.pathname, location.hash, location.state]);

  useEffect(() => {
    try {
      const navEntries = performance.getEntriesByType?.("navigation") || [];
      const navType = navEntries[0]?.type || (performance?.navigation?.type === 1 ? "reload" : "navigate");

      if (navType === "reload" && window.location.hash) {
        window.history.replaceState({}, "", window.location.pathname);
        waitForElementThenScroll("hero", { maxRetries: 12, interval: 80, behavior: "auto" });
      }
    } catch (e) {
      // no-op
    }
  }, []);

  return (
    <Wrapper className="relative w-screen overflow-hidden">
      
      <HeroSection />
      
      <Border />
      
      <Suspense fallback={<div style={{ textAlign: "center", padding: "50px" }}>Loading Chapters...</div>}>
        <Chapters />
      </Suspense>
      
      <Border />
      
      <Suspense fallback={null}>
        <About />
      </Suspense>
      
      <Border />
      
      <Suspense fallback={null}>
        <Contact />
      </Suspense>

    </Wrapper>
  );
};

export default HomePage;

const Wrapper = styled.div`
  /* background-color: rgb(250,247,237); */
`;