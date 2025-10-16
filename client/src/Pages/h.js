import React, { useEffect, useRef, useState } from "react";
import api from "../api";
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import styled from "styled-components";

import {
  User,
  CreditCard as Edit3,
  RefreshCw,
  LogOut,
  BarChart3,
  Grid3x3 as Grid3X3,
  Check,
  X,
  CheckCircle,
  Sparkles,
  Heart,
  Play,
  Pause,
  ExternalLink,
  Trash2
} from "lucide-react";

export default function ProfilePage() {
  const { user, fetchMe } = useAuth();
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("bar"); // "bar" | "grid" | "favs"
  const [chapterDetails, setChapterDetails] = useState({});
  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [savingName, setSavingName] = useState(false);
  const navigate = useNavigate();
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  // New favourites state
  const [favourites, setFavourites] = useState([]);
  const [loadingFavs, setLoadingFavs] = useState(false);

  // Centralized audio player
  const audioRef = useRef(null); // will hold HTMLAudioElement
  const [playingFav, setPlayingFav] = useState(null); // string id e.g. `${chapter}-${verse}` or _id
  const [audioProgress, setAudioProgress] = useState(0); // 0..1

  useEffect(() => {
    // initialize audio element once
    const audio = new Audio();
    audio.preload = "metadata";
    audioRef.current = audio;

    const onEnded = () => {
      setPlayingFav(null);
      setAudioProgress(0);
    };
    const onTimeUpdate = () => {
      try {
        const p = audioRef.current;
        if (!p || !p.duration || isNaN(p.duration)) return;
        setAudioProgress(p.currentTime / p.duration);
      } catch (e) {
        // ignore
      }
    };
    const onError = () => {
      toast.error("Audio playback failed");
      setPlayingFav(null);
    };

    audio.addEventListener("ended", onEnded);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("error", onError);
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, []);

  // helpers
  const getFavKey = (f) => (f._id ? `id-${f._id}` : `c${f.chapter}-v${f.verse}`);

  // toggle centralized player for this favourite
  const togglePlayFavourite = async (fav, e) => {
    if (e) e.stopPropagation();
    if (!fav) return;

    const key = getFavKey(fav);
    const audio = audioRef.current;
    if (!audio) return;

    // if same item is playing, pause it
    if (playingFav === key) {
      try {
        audio.pause();
      } catch (_) {}
      setPlayingFav(null);
      return;
    }

    // else switch source and play
    const src = `/verse_recitation/${fav.chapter}/${fav.verse}.mp3`;
    try {
      // stop previous
      if (!audio.paused) {
        try {
          audio.pause();
        } catch (_) {}
      }
      audio.src = src;
      audio.currentTime = 0;
      const playPromise = audio.play();
      // handle promise-based autoplay block on browsers
      if (playPromise && typeof playPromise.then === "function") {
        await playPromise;
      }
      setPlayingFav(key);
      setAudioProgress(0);
    } catch (err) {
      console.error("Audio play error", err);
      toast.error("Unable to play audio (autoplay blocked?)");
      setPlayingFav(null);
    }
  };

  const stopAnyPlaying = () => {
    const audio = audioRef.current;
    if (audio && !audio.paused) {
      try {
        audio.pause();
      } catch (_) {}
    }
    setPlayingFav(null);
    setAudioProgress(0);
  };

  const loadSummary = async () => {
    setLoading(true);
    try {
      const res = await api.get("/progress/me");
      if (res.data && res.data.ok) setSummary(res.data.chapters || []);
      else setSummary([]);
    } catch (err) {
      console.error("loadSummary", err);
      toast.error("Failed to load progress summary");
      setSummary([]);
    } finally {
      setLoading(false);
    }
  };

  const loadChapterDetail = async (chId) => {
    if (chapterDetails[chId]) {
      setChapterDetails((prev) => {
        const newDetails = { ...prev };
        delete newDetails[chId];
        return newDetails;
      });
      return;
    }

    try {
      const res = await api.get(`/progress/me/chapter/${chId}`);
      const verses = res?.data?.verses || [];
      setChapterDetails((prev) => ({ ...prev, [chId]: verses }));
      const completedCount = verses.filter((v) => !!v && !!v.completed).length;
      const totalVerses = verses.length;
      const percent = totalVerses ? Math.round((completedCount / totalVerses) * 100) : 0;
      setSummary((prev) =>
        prev.map((c) => (c.chapter === chId ? { ...c, completedCount, totalVerses, percent } : c))
      );
    } catch (err) {
      console.error("loadChapterDetail error", err);
      toast.error("Failed to load chapter details");
      setChapterDetails((prev) => ({ ...prev, [chId]: [] }));
    }
  };

  const saveName = async () => {
    if (!nameDraft || nameDraft.trim().length < 2) {
      toast.error("Please enter a valid name (min 2 chars).");
      return;
    }
    setSavingName(true);
    try {
      const res = await api.patch("/auth/me", { displayName: nameDraft.trim() });
      if (res.data && res.data.ok) {
        await fetchMe();
        setEditing(false);
        toast.success("Name updated");
      } else {
        toast.error(res.data?.message || "Failed to update name");
      }
    } catch (err) {
      console.error("saveName", err);
      toast.error("Failed to update name");
    } finally {
      setSavingName(false);
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("logout", err);
    } finally {
      try {
        await fetchMe();
      } catch (e) {}
      navigate("/#hero");
    }
  };

  useEffect(() => {
    loadSummary();
    fetchMe().catch(() => {});
    setNameDraft(user?.displayName || "");
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    setNameDraft(user?.displayName || "");
  }, [user?.displayName]);

  // Banner / animation setup (unchanged)
  useEffect(() => {
    const spiritualImages = ["/krishna.png", "/gita.png"];
    let idx = 0;

    const init = (i) => {
      const el = document.getElementById(`banner-bg-${i}`);
      const img = spiritualImages[i - 1];
      if (!el) return;
      if (!img) {
        el.style.display = "none";
        return;
      }
      el.style.display = "block";
      el.style.backgroundImage = `url('${img}')`;
      el.style.backgroundSize = "cover";
      el.style.backgroundPosition = "center center";
      el.style.backgroundRepeat = "no-repeat";
      el.style.transform = "scale(1.05)";
      el.style.transition = "opacity 800ms ease, transform 1200ms ease";
      el.style.opacity = i === 1 ? "1" : "0";
      el.style.pointerEvents = "none";
      el.style.filter = "brightness(1.05) contrast(1.05) saturate(1.15)";
    };
    [1, 2].forEach((i) => init(i));

    const rotate = setInterval(() => {
      const imgsCount = spiritualImages.filter(Boolean).length;
      if (imgsCount <= 1) return;

      const prevIndex = idx % imgsCount;
      const nextIdx = (idx + 1) % imgsCount;
      const prev = document.getElementById(`banner-bg-${prevIndex + 1}`);
      const next = document.getElementById(`banner-bg-${nextIdx + 1}`);

      if (prev) {
        prev.style.opacity = "0";
        prev.style.transform = "scale(1.08)";
      }
      setTimeout(() => {
        if (next) {
          next.style.opacity = "1";
          next.style.transform = "scale(1.03)";
        }
        idx = nextIdx;
        setActiveBannerIndex(nextIdx);
      }, 400);
    }, 10000);

    const onResize = () => {
      const mobile = window.innerWidth <= 640;
      for (let i = 1; i <= 2; i++) {
        const el = document.getElementById(`banner-bg-${i}`);
        if (!el || el.style.display === "none") continue;
        el.style.backgroundPosition = mobile ? "center 30%" : "center center";
      }
    };

    window.addEventListener("resize", onResize);
    onResize();

    return () => {
      clearInterval(rotate);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // -------------------------
  // Favourites: fetch and handlers
  // -------------------------
  useEffect(() => {
    // load favourites once on mount (you can change to lazy load on view toggle)
    let mounted = true;
    const loadFavourites = async () => {
      setLoadingFavs(true);
      try {
        const res = await api.get("/favourites/me", { withCredentials: true });
        if (!mounted) return;
        if (res.data && res.data.ok) {
          setFavourites(res.data.favourites || []);
        } else {
          setFavourites([]);
        }
      } catch (err) {
        console.error("loadFavourites", err);
        setFavourites([]);
      } finally {
        if (mounted) setLoadingFavs(false);
      }
    };
    loadFavourites();
    return () => {
      mounted = false;
    };
  }, []);

  // optimistic remove helper used in favourites UI
  const removeFavouriteLocally = (chapter, verse) => {
    setFavourites((arr) => arr.filter((x) => !(Number(x.chapter) === Number(chapter) && Number(x.verse) === Number(verse))));
  };

  return (
    <Wrapper>
      {/* Lotus petals, visible only when Krishna image (index 0) is active */}
      <div className={`animation-container ${activeBannerIndex === 0 ? "visible" : ""}`}>
        {[...Array(15)].map((_, i) => (
          <div className="feather" key={i} />
        ))}
      </div>

      {/* Feathers, visible only when Gita image (index 1) is active */}
      <div className={`animation-container ${activeBannerIndex === 1 ? "visible" : ""}`}>
        {[...Array(15)].map((_, i) => (
          <div className="feather" key={i} />
        ))}
      </div>

      <div className="max-w-7xl main-content mt-9 mx-auto p-4 lg:p-6 space-y-8" style={{ paddingTop: 72 }}>
        {/* Header */}
        <div className="text-center mb-4 relative px-4">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-100/20 via-yellow-100/20 to-orange-100/20 blur-3xl -z-10" />
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="text-orange-500 w-6 h-6 lg:w-8 lg:h-8 animate-pulse" />
            <h1 className=" page-title text-xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
              Your Gita Journey
            </h1>
            <Heart className="text-red-500 w-6 h-6 lg:w-8 lg:h-8 animate-pulse" />
          </div>
          <p className="page-subtitle text-sm md:text-xl mt-2 max-w-4xl mx-auto leading-relaxed ">
            Walk the divine path with Lord Krishna's wisdom — track your reading and practice through the sacred Bhagavad Gita.
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white profile-card rounded-xl shadow-xl border border-orange-50 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-24 h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-orange-200/30 to-yellow-200/30 rounded-full blur-2xl -translate-x-12 -translate-y-12" />
          <div className="absolute bottom-0 right-0 w-32 h-32 lg:w-40 lg:h-40 bg-gradient-to-br from-yellow-200/30 to-orange-200/30 rounded-full blur-2xl translate-x-12 translate-y-12" />

          {/* Banner */}
          <div className="relative h-40 lg:h-48 overflow-hidden ">
            <div id="banner-bg-1" className="absolute inset-0 bg-no-repeat bg-cover bg-center" />
            <div id="banner-bg-2" className="absolute inset-0 bg-no-repeat bg-cover bg-center" />

            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/6 via-transparent to-yellow-500/6" />

            <div className="absolute inset-0 overflow-hidden" aria-hidden>
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full animate-pulse"
                  style={{
                    left: `${10 + i * 14}%`,
                    top: `${20 + (i % 2) * 22}%`,
                    opacity: 0.6 + (i % 2) * 0.2,
                    animationDelay: `${i * 0.35}s`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="relative px-4 lg:px-10 pt-4 lg:pt-20 pb-4 max-h-[180px]">
            {/* Avatar */}
            <div className="absolute -top-12 lg:-top-16 left-6 lg:left-10">
              <div className="relative">
                <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full border-[6px] border-white shadow-2xl overflow-hidden bg-white flex items-center justify-center">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-orange-100 text-2xl lg:text-4xl font-bold text-gray-800">
                      {user?.displayName ? user.displayName[0].toUpperCase() : (user?.email || "U")[0].toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col -ml-20 -mt-9 lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1 space-y-2 pl-0 lg:pl-40 mt-4 lg:mt-6">
                {/* Name and edit */}
                <div className="flex items-center gap-2 flex-wrap">
                  {!editing ? (
                    <>
                      <h2 className="text-lg name lg:text-3xl font-bold text-gray-800">
                        {user?.displayName || "No name set"}
                      </h2>
                      <button
                        onClick={() => {
                          setEditing(true);
                          setNameDraft(user?.displayName || "");
                        }}
                        className="p-1 text-gray-400 hover:text-orange-500 rounded-full hover:bg-orange-50 transition-all duration-150"
                        title="Edit name"
                      >
                        <Edit3 size={18} />
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 w-full max-w-md">
                      <input
                        type="text"
                        value={nameDraft}
                        onChange={(e) => setNameDraft(e.target.value)}
                        className="text-base lg:text-xl font-semibold bg-transparent border-b-2 border-orange-300 focus:border-orange-500 outline-none text-gray-800 w-full"
                        placeholder="Enter your name"
                        autoFocus
                      />
                      <button
                        onClick={saveName}
                        disabled={savingName}
                        className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-full transition-all duration-150 disabled:opacity-50 shadow"
                      >
                        {savingName ? <RefreshCw size={16} className="animate-spin" /> : <Check size={16} />}
                      </button>
                      <button
                        onClick={() => {
                          setEditing(false);
                          setNameDraft(user?.displayName || "");
                        }}
                        className="p-2 bg-gray-300 hover:bg-gray-400 text-white rounded-full transition-all duration-150 shadow"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex  flex-wrap items-center gap-3 text-sm lg:text-base">
                  <span className="text-gray-600 name font-medium">{user?.email}</span>
                  <div className="h-5 w-px bg-gray-300" />
                  <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-100 shadow-sm">
                    <CheckCircle size={16} className="text-green-600 " />
                    <span className="font-semibold text-sm ">Verified Devotee</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-row gap-3 -mt-5 items-center lg:items-start">
                <button
                  onClick={() => {
                    loadSummary();
                    toast.info("Refreshing progress...");
                  }}
                  className="flex items-center gap-2 h-10 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold shadow transition-all duration-150"
                >
                  <RefreshCw size={16} />
                  <span className="text-sm">Refresh</span>
                </button>

                <button
                  onClick={logout}
                  className="flex items-center gap-2 h-10 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold shadow transition-all duration-150"
                >
                  <LogOut size={16} />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Progress + Favourites Card */}
        <div className="bg-white progress-card rounded-2xl shadow-lg border border-gray-100 p-4 lg:p-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-3">
            <div>
              <h3 className="text-lg lg:text-2xl name font-bold text-gray-800 mb-1">Your Progress</h3>
              <p className="text-gray-600 name text-sm lg:text-base">Track your reading journey through each chapter</p>
            </div>

            <div className="flex items-center gap-3">
              {/* View switch (bar/grid) - hide on small screens */}
              <button
                onClick={() => setViewMode((m) => (m === "bar" ? "grid" : "bar"))}
                className="hidden md:inline-flex mt-3 lg:mt-0 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-all duration-150 flex items-center gap-2 shadow-sm"
                title="Switch progress view"
              >
                {viewMode === "bar" ? <Grid3X3 size={16} /> : <BarChart3 size={16} />}
                <span className="text-sm">Switch to {viewMode === "bar" ? "Grid" : "Bar"} view</span>
              </button>

              {/* NEW: Show favourites button */}
              <button
                onClick={() => setViewMode((m) => (m === "favs" ? "bar" : "favs"))}
                className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-shadow duration-150 ${
                  viewMode === "favs"
                    ? "bg-orange-50 border border-orange-200 text-orange-600 shadow-sm"
                    : "bg-white border border-gray-200 text-gray-800 hover:bg-orange-50"
                }`}
                title="Show my favourites"
                aria-pressed={viewMode === "favs"}
              >
                <Heart size={16} className={viewMode === "favs" ? "text-orange-600" : "text-gray-600"} />
                <span className="text-sm">{viewMode === "favs" ? "Showing Favourites" : "Show Favourites"}</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3 text-gray-600">
                <RefreshCw size={20} className="animate-spin" />
                <span className="text-base font-medium">Loading your progress...</span>
              </div>
            </div>
          ) : viewMode === "favs" ? (
            // ===== FAVOURITES VIEW =====
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 lg:p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-gray-800">My Favourites</h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setFavourites((f) => [...f].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
                      toast.info("Sorted by most recent");
                    }}
                    className="text-sm text-gray-500 hover:text-gray-800"
                  >
                    Sort
                  </button>
                </div>
              </div>

              {loadingFavs ? (
                <div className="flex items-center justify-center py-8 text-gray-600">
                  <RefreshCw size={18} className="animate-spin mr-2" />
                  Loading favourites...
                </div>
              ) : favourites.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart size={32} className="text-amber-500" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-800 mb-2">No favourites yet</h4>
                  <p className="text-gray-600 text-sm">Tap the heart while reading a verse to save it here.</p>
                </div>
              ) : (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {favourites.map((f) => {
                    const key = getFavKey(f);
                    const isPlaying = playingFav === key;
                    return (
                      <article
                        key={f._id || `${f.chapter}-${f.verse}`}
                        className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-lg transition cursor-pointer flex flex-col justify-between"
                        role="button"
                        onClick={() => navigate(`/chapter/${f.chapter}/slok/${f.verse}`)}
                        aria-label={`Open verse BG ${f.chapter}.${f.verse}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 text-white font-bold flex items-center justify-center text-sm">
                              {f.chapter}.{f.verse}
                            </div>
                            <div className="text-left">
                              <p className="text-sm text-gray-700 font-semibold line-clamp-2">
                                {f.verseText ? f.verseText.slice(0, 120) : `Bhagavad Gita ${f.chapter}.${f.verse}`}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">{f.translationSnippet ? f.translationSnippet.slice(0, 60) : ""}</p>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <small className="text-xs text-gray-400">{f.createdAt ? new Date(f.createdAt).toLocaleDateString() : ""}</small>
                            <div className="flex items-center gap-2">
                              {/* Play / Pause central control with beautiful styles */}
                              <button
                                onClick={(e) => togglePlayFavourite(f, e)}
                                className={`relative flex items-center justify-center w-10 h-10 rounded-full transition transform ${
                                  isPlaying ? "bg-orange-500 text-white shadow-lg scale-105" : "bg-white border border-gray-200 text-orange-600 hover:bg-orange-50"
                                }`}
                                aria-label={isPlaying ? "Pause" : "Play verse"}
                                title={isPlaying ? "Pause" : "Play"}
                              >
                                {isPlaying ? <Pause size={16} /> : <Play size={16} />}

                                {/* animated ring when playing */}
                                {isPlaying && (
                                  <span
                                    className="absolute inset-0 rounded-full"
                                    style={{
                                      boxShadow: "0 6px 20px rgba(245,158,11,0.18)",
                                      animation: "pulse 1200ms infinite"
                                    }}
                                  />
                                )}
                              </button>

                              {/* Remove */}
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  const prev = favourites;
                                  removeFavouriteLocally(f.chapter, f.verse);
                                  // stop playing if this item was playing
                                  if (playingFav === key) stopAnyPlaying();
                                  try {
                                    await api.post("/favourites/toggle", { chapter: Number(f.chapter), verse: Number(f.verse) }, { withCredentials: true });
                                    toast.success("Removed from favourites");
                                  } catch (err) {
                                    setFavourites(prev);
                                    toast.error("Failed to remove favourite");
                                  }
                                }}
                                className="p-2 rounded-md hover:bg-red-50 text-red-500"
                                aria-label="Remove favourite"
                                title="Remove"
                              >
                                <Trash2 size={16} />
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/chapter/${f.chapter}/slok/${f.verse}`);
                                }}
                                className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
                                title="Open verse"
                                aria-label="Open verse"
                              >
                                <ExternalLink size={16} />
                              </button>
                            </div>

                            {/* small progress bar under controls when playing */}
                            {isPlaying && (
                              <div className="w-full mt-2 h-1 bg-gray-100 rounded-full overflow-hidden" style={{ minWidth: 100 }}>
                                <div className="h-full bg-orange-400 transition-all" style={{ width: `${Math.round((audioProgress || 0) * 100)}%` }} />
                              </div>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            // ===== EXISTING PROGRESS RENDERING (unchanged) =====
            <>
              {summary.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User size={36} className="text-gray-400" />
                  </div>
                  <h4 className="text-lg lg:text-2xl font-bold text-gray-800 mb-2">No progress yet</h4>
                  <p className="text-gray-600 text-sm lg:text-base">Start reading a chapter to track your progress</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {summary.map((ch) => (
                    <div key={ch.chapter} className="group">
                      {viewMode === "bar" ? (
                        <div className="  bg-white bg-gradient-to-r from-gray-50 to-gray-100 hover:from-amber-50 hover:to-yellow-50 rounded-xl p-4 transition-all duration-200 border border-gray-200 hover:border-amber-200 hover:shadow-md">
                          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center text-white font-bold text-lg lg:text-xl shadow">
                                {ch.chapter}
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-800 text-sm lg:text-lg mb-0">Chapter {ch.chapter}</h4>
                                <p className="text-gray-600 text-sm">{ch.completedCount}/{ch.totalVerses} verses completed</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 w-full lg:w-auto">
                              <div className="flex-1 lg:w-64 bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                                <div
                                  className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full transition-all duration-700 ease-out shadow-sm"
                                  style={{ width: `${ch.percent}%` }}
                                />
                              </div>
                              <div className="text-lg font-bold text-gray-800 min-w-[44px] text-right">
                                {ch.percent}%
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className=" bg-white bg-gradient-to-r from-gray-50 to-gray-100 hover:from-amber-50 hover:to-yellow-50 rounded-xl p-4 transition-all duration-200 border border-gray-200 hover:border-amber-200 hover:shadow-md">
                          <div
                            className="flex items-center justify-between cursor-pointer mb-4"
                            onClick={() => loadChapterDetail(ch.chapter)}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow">
                                {ch.chapter}
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-800 text-sm lg:text-lg mb-0">Chapter {ch.chapter}</h4>
                                <p className="text-gray-600 text-sm">{ch.completedCount}/{ch.totalVerses} verses</p>
                              </div>
                            </div>
                            <div className="text-amber-600 font-semibold text-sm hover:text-amber-700 transition-colors">
                              {chapterDetails[ch.chapter] ? "Hide details" : "View details"}
                            </div>
                          </div>

                          {chapterDetails[ch.chapter] && (
                            <div className="grid gap-2 mt-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(40px, 1fr))" }}>
                              {chapterDetails[ch.chapter].map((v) => (
                                <button
                                  key={v.verse}
                                  onClick={() => navigate(`/chapter/${ch.chapter}/slok/${v.verse}`)}
                                  className={`w-full h-10 rounded-xl flex items-center justify-center text-sm font-semibold transition-all duration-150 shadow-md cursor-pointer ${
                                    v.completed
                                      ? "bg-gradient-to-br from-green-400 to-green-500 text-white shadow-green-200 hover:shadow-green-300"
                                      : "bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700 hover:from-gray-300 hover:to-gray-400"
                                  }`}
                                >
                                  {v.verse}
                                </button>
                              ))}
                            </div>
                          )}

                          {!chapterDetails[ch.chapter] && (
                            <button
                              onClick={() => loadChapterDetail(ch.chapter)}
                              className="text-amber-600 hover:text-amber-700 font-semibold text-sm transition-colors duration-150 hover:underline mt-2"
                            >
                              Click to view verse-by-verse progress →
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Wrapper>
  );
}

/* ----- Styled wrapper (kept from your original file, with small additions for line-clamp) ----- */

const Wrapper = styled.div`
position: relative;
overflow: hidden;

/* This lifts your main content onto a higher layer (z-index: 2) */
.max-w-7xl {
  position: relative;
  z-index: 2;
}

/* ... keep all your existing CSS (omitted here for brevity in commentary) ... */
/* I paste your original Wrapper content exactly so styles remain identical. */

/* Re-inserting your whole original CSS from earlier (unchanged) */
  /* Base style for BOTH animation containers */
  .animation-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    pointer-events: none;
    z-index: 1;
    transition: opacity 0.8s ease-in-out, visibility 0.8s;
  }

  .animation-container.visible {
    opacity: 1;
    visibility: visible;
  }

  .lotus-petal {
    position: absolute;
    top: -150px;
    width: 38px;
    height: 58px;
    transform-origin: 50% 100%;
    clip-path: polygon(
      50% 0%,
      70% 10%,
      95% 30%,
      100% 60%,
      85% 95%,
      50% 100%,
      15% 95%,
      0% 60%,
      5% 30%,
      30% 10%
    );
    background: radial-gradient(
      circle at 50% 25%,
      rgba(255, 255, 255, 0.85) 0%,
      rgba(255, 200, 220, 0.6) 25%,
      #f7c6d7 55%,
      #e0a3b8 80%,
      #c68096 100%
    );
    filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.12));
    animation: fall-sway linear infinite;
  }

  @keyframes fall-sway {
    0% { transform: translateY(0) rotateZ(0deg) translateX(0); opacity: 1; }
    25% { transform: translateY(25vh) rotateZ(10deg) translateX(5vw); }
    50% { transform: translateY(50vh) rotateZ(-10deg) translateX(-5vw); }
    75% { transform: translateY(75vh) rotateZ(5deg) translateX(3vw); }
    100% { transform: translateY(120vh) rotateZ(0deg) translateX(0); opacity: 0; }
  }

  /* Feather animation */
  .feather {
    position: absolute;
    top: -150px;
    background-image: url('/images/feather.png');
    background-size: contain;
    background-repeat: no-repeat;
    animation: fall-down linear infinite;
  }

  @keyframes fall-down {
    0% { transform: translateY(0) rotate(-20deg); opacity: 0.7; }
    100% { transform: translateY(120vh) rotate(360deg); opacity: 0; }
  }

  .feather:nth-child(1) { left: 5%; animation-duration: 25s; animation-delay: 0s; width: 40px; height: 40px; }
  .feather:nth-child(2) { left: 15%; animation-duration: 18s; animation-delay: 2s; width: 25px; height: 25px; }
  .feather:nth-child(3) { left: 25%; animation-duration: 22s; animation-delay: 4s; width: 35px; height: 35px; }
  .feather:nth-child(4) { left: 35%; animation-duration: 16s; animation-delay: 1s; width: 45px; height: 45px; opacity: 0.8; }
  .feather:nth-child(5) { left: 45%; animation-duration: 28s; animation-delay: 5s; width: 20px; height: 20px; }
  .feather:nth-child(6) { left: 55%; animation-duration: 15s; animation-delay: 3s; width: 50px; height: 50px; }
  .feather:nth-child(7) { left: 65%; animation-duration: 20s; animation-delay: 0s; width: 30px; height: 30px; }
  .feather:nth-child(8) { left: 75%; animation-duration: 17s; animation-delay: 6s; width: 40px; height: 40px; opacity: 0.7; }
  .feather:nth-child(9) { left: 85%; animation-duration: 24s; animation-delay: 2s; width: 25px; height: 25px; }
  .feather:nth-child(10) { left: 95%; animation-duration: 19s; animation-delay: 7s; width: 35px; height: 35px; }
  .feather:nth-child(11) { left: 10%; animation-duration: 26s; animation-delay: 8s; width: 40px; height: 40px; }
  .feather:nth-child(12) { left: 20%; animation-duration: 14s; animation-delay: 10s; width: 25px; height: 25px; }
  .feather:nth-child(13) { left: 50%; animation-duration: 21s; animation-delay: 9s; width: 30px; height: 30px; }
  .feather:nth-child(14) { left: 80%; animation-duration: 18s; animation-delay: 11s; width: 45px; height: 45px; }
  .feather:nth-child(15) { left: 90%; animation-duration: 27s; animation-delay: 12s; width: 20px; height: 20px; }

  /* Dark theme overrides (kept from your original) */
  :where(html.dark),
  &:has(html.dark) {
    --bg-main: #0f172a;
    --bg-card: #1e293b;
    --text-primary: #e2e8f0;
    --text-secondary: #94a3b8;
    --border-color: rgba(148, 163, 184, 0.15);
    --accent-glow: rgba(251, 191, 36, 0.2);
    --shadow-color: rgba(0, 0, 0, 0.4);

    background-color: var(--bg-main);

    .feather {
      display: none;
    }

    .text-gray-800,
    .text-gray-700,
    .text-gray-600 {
      color: var(--text-secondary);
    }

    h1, h2, h3, h4, .font-bold, .font-semibold {
      color: var(--text-primary);
    }

    .bg-white {
      background-color: var(--bg-card) !important;
      border-color: var(--border-color);
      box-shadow: 0 8px 32px var(--shadow-color);
    }

    .bg-gradient-to-r.from-orange-600 {
      filter: brightness(1.2);
    }

    .bg-gradient-to-br.from-pink-100 {
      background: linear-gradient(to bottom right, #334155, #1e293b);
      color: var(--text-primary);
    }

    .border-b-2.border-orange-300 {
      color: var(--text-primary);
      border-color: var(--accent-glow);
    }

    .bg-gray-100 {
      background-color: rgba(148, 163, 184, 0.1);
      color: var(--text-secondary);
      &:hover {
        background-color: rgba(148, 163, 184, 0.2);
      }
    }

    .bg-green-50 {
      background-color: rgba(16, 185, 129, 0.1);
      border-color: rgba(16, 185, 129, 0.2);
      color: #10b981;
    }
    .text-green-600 {
      color: #10b981;
    }

    .from-gray-50 {
      background: linear-gradient(to right, #283446, #212c3d);
      border-color: var(--border-color);
      &:hover {
         border-color: var(--accent-glow);
      }
    }

    .bg-gray-200 {
        background-color: rgba(148, 163, 184, 0.1);
    }

    .from-gray-200 {
        background: linear-gradient(to bottom right, #475569, #334155);
        color: var(--text-secondary);
        &:hover {
            background: linear-gradient(to bottom right, #54647a, #475569);
        }
    }

    .text-amber-600 {
        color: #f59e0b;
    }
  }

  /* Responsive fixes (kept) */
  @media (max-width: 1023px) {
    & .relative.px-4.lg\\:px-10.pt-4.lg\\:pt-20.pb-4 {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding-top: 1rem;
      padding-bottom: 1rem;
      max-height: none;
    }

    & .flex.flex-col.-ml-20.-mt-9 {
      margin: 0;
      flex-direction: row;
      align-items: center;
      gap: 1rem;
      width: 100%;
    }

    & .absolute.-top-12 {
      position: relative;
      top: 0;
      left: 0;
      flex-shrink: 0;
    }

    & .w-24.h-24 {
      width: 64px;
      height: 64px;
    }
    & .border-\\[6px\\] {
      border-width: 4px;
    }

    & .flex-1.space-y-2 {
      margin: 0;
      padding: 0;
      min-width: 0;
      flex-grow: 1;
    }

    & h2.text-lg {
      font-size: 1.125rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    & .flex.flex-wrap.items-center.gap-3 {
       flex-wrap: nowrap;
       gap: 0.5rem;
    }

    & span.text-gray-600 {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    & .flex.flex-row.gap-3.-mt-5 {
      margin: 0;
      width: 100%;
      justify-content: flex-end;
    }

    & .flex.flex-row.gap-3.-mt-5 > button {
      height: 38px;
      padding: 0 12px;
    }

    & .relative.h-40 {
        height: 140px;
    }
  }

  @media (max-width: 480px) {
    & .flex.flex-col.-ml-20.-mt-9 {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
    }

    & .flex.flex-row.gap-3.-mt-5 {
      justify-content: flex-start;
    }
  }

  background-color: ${({ theme }) => (theme.name === "dark" ? "#0f172a" : "#F9FAFB")};

  .page-subtitle {
     color: ${({ theme }) => theme.colors.heading.secondary || "#575757"};
  }

  .profile-card, .progress-card {
    background-color: ${({ theme }) => (theme.name === "dark" ? "#1e293b" : "#FFFFFF")};
    border: 1px solid ${({ theme }) => (theme.name === "dark" ? "rgba(148, 163, 184, 0.15)" : "#F3F4F6")};
  }

  .name{
    color: ${({ theme }) => (theme.name === "dark" ? "rgba(255,255,255,0.99)" : "none")};
  }

  .page-title, .font-bold.bg-gradient-to-r {
    filter: ${({ theme }) => (theme.name === "dark" ? "brightness(1.2)" : "none")};
  }

  .verified-badge {
    background-color: ${({ theme }) => (theme.name === "dark" ? "rgba(16, 185, 129, 0.1)" : "#d4edda")};
    border: 1px solid ${({ theme }) => (theme.name === "dark" ? "rgba(16, 185, 129, 0.2)" : "transparent")};
    color: ${({ theme }) => (theme.name === "dark" ? "#10b981" : "#155724")};

    .icon {
      color: ${({ theme }) => (theme.name === "dark" ? "#10b981" : "#28a745")};
    }
  }

  .chapter-item {
    background-color: ${({ theme }) => (theme.name === "dark" ? "#1e293b" : "#F9FAFB")};
    border: 1px solid ${({ theme }) => (theme.name === "dark" ? "rgba(148, 163, 184, 0.15)" : "#E5E7EB")};
    &:hover {
      border-color: #F59E0B;
      background-color: ${({ theme }) => (theme.name === "dark" ? "#334155" : "#FFFFFF")};
    }
  }

  .progress-bar-bg {
     background-color: ${({ theme }) => (theme.name === "dark" ? "rgba(148, 163, 184, 0.15)" : "#E5E7EB")};
  }

  .verse-grid-item {
    background: ${({ theme }) => (theme.name === "dark" ? "#334155" : "#F3F4F6")};
    &.completed {
        background: linear-gradient(to bottom right, #10b981, #28a745);
        color: white;
    }
  }

  /* small helper for multi-line clamping (if Tailwind line-clamp not available) */
  line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* pulse animation for play ring */
@keyframes pulse {
  0% { transform: scale(1); opacity: 0.95; }
  50% { transform: scale(1.12); opacity: 0.7; }
  100% { transform: scale(1); opacity: 0.95; }
}
`;
