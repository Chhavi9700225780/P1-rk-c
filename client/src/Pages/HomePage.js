import React, { Suspense, useEffect } from "react";
import HeroSection from "../Components/HeroSection";
import About from "./About";
import Contact from "./Contact";
import styled from "styled-components";
import { ToastContainer } from "react-toastify";
import Border from "../Components/Border";
import { useLocation } from "react-router-dom";

const Chapters = React.lazy(() => import("../Components/Chapters"));

const MAX_SCROLL_RETRIES = 10; // retry up to ~1s (10 * 100ms)
const RETRY_INTERVAL_MS = 100;

const HomePage = () => {
  const location = useLocation();

  function scrollToElementById(id, behavior = "smooth") {
    if (!id) return false;
    const el = document.getElementById(id);
    if (!el) return false;
    const navOffset =
      parseInt(
        getComputedStyle(document.documentElement).getPropertyValue("--nav-height")
      ) || 0;
    const top = el.getBoundingClientRect().top + window.pageYOffset - navOffset;
    window.scrollTo({ top, behavior });
    return true;
  }

  // Waits for the element to exist (useful for lazy loaded components), then scrolls.
  function waitForElementThenScroll(id, { maxRetries = MAX_SCROLL_RETRIES, interval = RETRY_INTERVAL_MS, behavior = "smooth" } = {}) {
    let attempts = 0;
    let cancelled = false;

    const tryScroll = () => {
      if (cancelled) return;
      const ok = scrollToElementById(id, behavior);
      if (ok) return;
      attempts += 1;
      if (attempts >= maxRetries) return;
      timer = setTimeout(tryScroll, interval);
    };

    let timer = setTimeout(tryScroll, 0);

    // return cancel function
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }

  // Scroll-on-navigation / hash handling
  useEffect(() => {
    const targetFromState = location.state && location.state.scrollTo;
    const hash = location.hash ? location.hash.replace("#", "") : null;
    const targetId = targetFromState || hash;

    if (!targetId) return;

    // Retry-based scroll to handle lazy-loaded sections
    const cancelWait = waitForElementThenScroll(targetId, { maxRetries: 12, interval: 100, behavior: "smooth" });

    // Clean navigation state/hash so future navigation behaves normally
    try {
      // Remove state without creating a new history entry
      const newUrl = window.location.pathname + (hash ? `#${hash}` : "");
      window.history.replaceState({}, "", newUrl);
    } catch (e) {
      // ignore
    }

    return () => {
      if (typeof cancelWait === "function") cancelWait();
    };
    // We intentionally watch location.key (if available) or pathname/hash/state changes
  }, [location.pathname, location.hash, location.state]);

  // On reload: if reloaded with a hash, clear it and ensure hero visible
  useEffect(() => {
    try {
      const navEntries = performance.getEntriesByType?.("navigation") || [];
      const navType = navEntries[0]?.type || (performance?.navigation?.type === 1 ? "reload" : "navigate");

      if (navType === "reload" && window.location.hash) {
        // Remove hash without adding history entry
        window.history.replaceState({}, "", window.location.pathname);
        // scroll hero into view (use 'auto' to avoid anim during reload)
        waitForElementThenScroll("hero", { maxRetries: 12, interval: 80, behavior: "auto" });
      }
    } catch (e) {
      // no-op
    }
  }, []);

  return (
    <Wrapper className="relative w-screen overflow-hidden">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <HeroSection />
      <Border />
      <Suspense fallback={<div>Loading...</div>}>
        <Chapters />
      </Suspense>
      <Border />
      <About />
      <Border />
      <Contact />
    </Wrapper>
  );
};

export default HomePage;

const Wrapper = styled.div`
/* background-color: rgb(250,247,237); */
`