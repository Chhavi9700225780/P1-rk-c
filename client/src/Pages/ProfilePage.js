import React, { useEffect, useState, useRef, useCallback } from "react";
import api from "../api";
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import styled from "styled-components";
import {
  Play,
  Pause,
  ExternalLink,
  Trash2,
  Repeat,
  RefreshCw,
  User,
  CreditCard as Edit3,
  LogOut,
  BarChart3,
  Grid3x3 as Grid3X3,
  Check,
  X,
  CheckCircle,
  Sparkles,
  Heart,
  Award,
  BookOpen,
  TrendingUp,
  Zap,
} from "lucide-react";

export default function ProfilePage() {
  const { user, fetchMe } = useAuth();
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("bar");
  const [chapterDetails, setChapterDetails] = useState({});
  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [savingName, setSavingName] = useState(false);
  const navigate = useNavigate();
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [favourites, setFavourites] = useState([]);
  const [loadingFavs, setLoadingFavs] = useState(false);
  const audioRef = useRef(null);
  const [playingFav, setPlayingFav] = useState(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [japaCount, setJapaCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audioRef.current = audio;

    const onEnded = () => {
      setPlayingFav(null);
      setAudioProgress(0);
    };
    const onTimeUpdate = () => {
      const p = audioRef.current;
      if (!p || !p.duration || isNaN(p.duration)) return;
      setAudioProgress(p.currentTime / p.duration);
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

  const getFavKey = (f) => (f._id ? `id-${f._id}` : `c${f.chapter}-v${f.verse}`);

  const togglePlayFavourite = async (fav, e) => {
    if (e) e.stopPropagation();
    if (!fav) return;

    const key = getFavKey(fav);
    const audio = audioRef.current;
    if (!audio) return;

    if (playingFav === key) {
      try {
        audio.pause();
      } catch (_) {}
      setPlayingFav(null);
      return;
    }

    const src = `/verse_recitation/${fav.chapter}/${fav.verse}.mp3`;
    try {
      if (!audio.paused) {
        try {
          audio.pause();
        } catch (_) {}
      }
      audio.src = src;
      audio.currentTime = 0;
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.then === "function") {
        await playPromise;
      }
      setPlayingFav(key);
      setAudioProgress(0);
    } catch (err) {
      console.error("Audio play error", err);
      toast.error("Unable to play audio");
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
      console.log("Verses:", verses);
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
  }, []);

  useEffect(() => {
    setNameDraft(user?.displayName || "");
  }, [user?.displayName]);

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

  useEffect(() => {
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

  const removeFavouriteLocally = (chapter, verse) => {
    setFavourites((arr) =>
      arr.filter((x) => !(Number(x.chapter) === Number(chapter) && Number(x.verse) === Number(verse)))
    );
  };

  const fetchJapaCount = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/japaCount/me", { withCredentials: true });

      if (res.data && res.data.ok) {
        setJapaCount(res.data.japaCount);
      } else {
        toast.error(res.data?.message || "Could not fetch Japa count.");
      }
    } catch (err) {
      if (err.response?.status !== 401 && err.response?.status !== 403) {
        toast.error(err.response?.data?.message || "A network error occurred.");
      }
      console.error("fetchJapaCount error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJapaCount();
  }, [fetchJapaCount]);

  const handleRefresh = () => {
    toast.info("Refreshing Japa count...");
    fetchJapaCount();
  };

  const totalCompleted = summary.reduce((acc, ch) => acc + (ch.completedCount || 0), 0);
  const totalVerses = summary.reduce((acc, ch) => acc + (ch.totalVerses || 0), 0);
  const overallProgress = totalVerses ? Math.round((totalCompleted / totalVerses) * 100) : 0;

  return (
    <Wrapper>
      <div className={`animation-container ${activeBannerIndex === 0 ? "visible" : ""}`}>
        {[...Array(15)].map((_, i) => (
          <div className="feather" key={i} />
        ))}
      </div>

      <div className={`animation-container ${activeBannerIndex === 1 ? "visible" : ""}`}>
        {[...Array(15)].map((_, i) => (
          <div className="feather" key={i} />
        ))}
      </div>

      <div className="max-w-7xl main-content lg:mt-7  mx-auto p-4 lg:p-8 space-y-6" style={{ paddingTop: 80 }}>
        {/* Enhanced Header */}
        <div className="text-center  mb-5 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10 blur-3xl -z-10" />
          <div className="flex items-center justify-center gap-3 lg:mb-1">
            <Sparkles className="text-orange-500 w-7 h-7 lg:w-9 lg:h-9 animate-pulse" />
            <h1 className="page-title text-2xl md:text-4xl lg:text-5xl font-black bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 bg-clip-text text-transparent tracking-tight">
              Your Sacred Journey
            </h1>
            <Heart className="text-rose-500 w-7 h-7 lg:w-9 lg:h-9 animate-pulse" fill="currentColor" />
          </div>
          <p className="page-subtitle text-sm md:text-xl lg:text-xl max-w-2xl mx-auto leading-relaxed font-medium opacity-80">
            Walk the divine path with Lord Krishna's wisdom through the sacred Bhagavad Gita
          </p>
        </div>

        {/* Elevated Profile Card */}
        <div className="profile-card rounded-3xl shadow-2xl border overflow-hidden relative backdrop-blur-sm">
          <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-orange-300/20 to-amber-300/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-br from-amber-300/20 to-orange-300/20 rounded-full blur-3xl" />

          {/* Enhanced Banner */}
          <div className="relative h-48 lg:h-56 overflow-hidden">
            <div id="banner-bg-1" className="absolute inset-0 bg-no-repeat bg-cover bg-center" />
            <div id="banner-bg-2" className="absolute inset-0 bg-no-repeat bg-cover bg-center" />

            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 via-transparent to-amber-600/10" />

            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-white/40 rounded-full animate-float"
                  style={{
                    left: `${15 + i * 12}%`,
                    top: `${25 + (i % 3) * 20}%`,
                    animationDelay: `${i * 0.4}s`,
                    animationDuration: `${3 + (i % 3)}s`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Profile Content */}
          <div className="relative px-6 lg:px-12 pb-8" style={{ marginTop: -60 }}>
            {/* Avatar with glow */}
            <div className="flex flex-col lg:flex-row  -top-12 lg:-top-16 left-10 lg:left-10 gap-8 lg:gap-8 items-start">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-amber-500 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
                <div className="relative w-32 h-32 lg:w-44 lg:h-44 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-white transform hover:scale-105 transition-transform duration-300">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 via-amber-100 to-orange-200 text-4xl lg:text-5xl font-black text-orange-600">
                      {user?.displayName
                        ? user.displayName[0].toUpperCase()
                        : (user?.email || "U")[0].toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              {/* Info Section */}
              <div className="flex-1 space-y-4 lg:pt-4">
                <div className="space-y-3 lg:mt-16">
                  {!editing ? (
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="name text-2xl lg:text-4xl font-black tracking-tight">
                        {user?.displayName || "No name set"}
                      </h2>
                      <button
                        onClick={() => {
                          setEditing(true);
                          setNameDraft(user?.displayName || "");
                        }}
                        className="p-2 text-gray-400 hover:text-orange-500 rounded-xl hover:bg-orange-50/50 transition-all duration-200"
                        title="Edit name"
                      >
                        <Edit3 size={20} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 max-w-xl">
                      <input
                        type="text"
                        value={nameDraft}
                        onChange={(e) => setNameDraft(e.target.value)}
                        className="flex-1 text-xl lg:text-2xl font-bold bg-white/50 border-2 border-orange-300 focus:border-orange-500 outline-none rounded-xl px-4 py-2 transition-all duration-200"
                        placeholder="Enter your name"
                        autoFocus
                      />
                      <button
                        onClick={saveName}
                        disabled={savingName}
                        className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl"
                      >
                        {savingName ? <RefreshCw size={18} className="animate-spin" /> : <Check size={18} />}
                      </button>
                      <button
                        onClick={() => {
                          setEditing(false);
                          setNameDraft(user?.displayName || "");
                        }}
                        className="p-3 bg-gray-300 hover:bg-gray-400 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-sm lg:text-base">
                    <span className="name font-semibold opacity-70">{user?.email}</span>
                    <div className="h-5 w-px bg-gray-300/50" />
                    <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4  rounded-full border border-emerald-200 shadow-sm">
                      <CheckCircle size={18} className="text-emerald-600" />
                      <span className="font-bold text-sm mt-4">Verified Devotee</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
               
              </div>

               <div className="flex flex-wrap gap-3 lg:mt-20 pt-2">
                  <button
                    onClick={() => {
                      loadSummary();
                      toast.info("Refreshing progress...");
                    }}
                    className="flex items-center gap-2 px-5  bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    <RefreshCw size={18} />
                    <span className="text-sm mt-4">Refresh</span>
                  </button>

                  <button
                    onClick={logout}
                    className="flex items-center gap-2 px-5  bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    <LogOut size={18} />
                    <span className="text-sm mt-4">Logout</span>
                  </button>
                </div>
            </div>
          </div>
        </div>


        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Japa Count Card */}
          <div className="stat-card rounded-2xl shadow-lg border p-6 backdrop-blur-sm transform hover:scale-105 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl">
                <Repeat size={28} className="text-orange-600" />
              </div>
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
              </button>
            </div>
            <h3 className="stat-label text-sm font-bold uppercase tracking-wide opacity-60 mb-2">
              Total Japa Count
            </h3>
            <p className="stat-value text-4xl font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              {isLoading ? "..." : japaCount.toLocaleString()}
            </p>
            <p className="text-xs opacity-50 mt-2 font-medium">Sacred recitations completed</p>
          </div>

          {/* Overall Progress Card */}
          <div className="stat-card rounded-2xl shadow-lg border p-6 backdrop-blur-sm transform hover:scale-105 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl">
                <TrendingUp size={28} className="text-blue-600" />
              </div>
              <Award size={24} className="text-amber-500" />
            </div>
            <h3 className="stat-label text-sm font-bold uppercase tracking-wide opacity-60 mb-2">
              Overall Progress
            </h3>
            <p className="stat-value text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {overallProgress}%
            </p>
            <p className="text-xs opacity-50 mt-2 font-medium">
              {totalCompleted} of {totalVerses} verses
            </p>
          </div>

          {/* Chapters Progress Card */}
          <div className="stat-card rounded-2xl shadow-lg border p-6 backdrop-blur-sm transform hover:scale-105 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl">
                <BookOpen size={28} className="text-emerald-600" />
              </div>
              <Zap size={24} className="text-amber-500 animate-pulse" />
            </div>
            <h3 className="stat-label text-sm font-bold uppercase tracking-wide opacity-60 mb-2">
              Chapters Started
            </h3>
            <p className="stat-value text-4xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              {summary.length}
            </p>
            <p className="text-xs opacity-50 mt-2 font-medium">On your spiritual journey</p>
          </div>
        </div>

        {/* Progress Card */}
        <div className="progress-card rounded-3xl shadow-2xl border p-6 lg:p-10 backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
            <div>
              <h3 className="name text-2xl lg:text-3xl font-black mb-2 tracking-tight">Your Progress</h3>
              <p className="stat-label text-sm lg:text-base font-medium opacity-70">
                Track your reading journey through each chapter
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setViewMode((m) => (m === "bar" ? "grid" : "bar"))}
                className={`px-5 py-2.5 rounded-xl font-bold transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105 ${
                  viewMode === "bar" || viewMode === "grid"
                    ? "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700"
                    : "bg-white border text-gray-700"
                }`}
              >
                {viewMode === "bar" ? <Grid3X3 size={18} /> : <BarChart3 size={18} />}
                <span className="text-sm">{viewMode === "bar" ? "Grid" : "Bar"} View</span>
              </button>

              <button
                onClick={() => setViewMode((m) => (m === "favs" ? "bar" : "favs"))}
                className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${
                  viewMode === "favs"
                    ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white"
                    : "bg-white border border-gray-200 text-gray-700 hover:border-rose-300"
                }`}
              >
                <Heart
                  size={18}
                  className={viewMode === "favs" ? "text-white" : "text-rose-500"}
                  fill={viewMode === "favs" ? "white" : "none"}
                />
                <span className="text-sm">Favourites</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-orange-100 border-t-orange-500 animate-spin" />
                <BookOpen size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-500" />
              </div>
              <p className="mt-6 text-base font-bold opacity-60">Loading your progress...</p>
            </div>
          ) : viewMode === "favs" ? (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-50/30 via-pink-50/20 to-orange-50/30 blur-3xl -z-10" />

              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 flex items-center justify-center shadow-xl">
                    <Heart size={28} className="text-white" fill="white" />
                  </div>
                  <div>
                    <h4 className="name text-xl lg:text-2xl font-black">My Sacred Favourites</h4>
                    <p className="stat-label text-sm opacity-60 font-medium">
                      {favourites.length} {favourites.length === 1 ? "verse" : "verses"} saved
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setFavourites((f) => [...f].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
                    toast.info("Sorted by most recent");
                  }}
                  className="px-4 py-2.5 bg-white hover:bg-gray-50 border rounded-xl font-bold transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <RefreshCw size={16} />
                  <span className="hidden sm:inline text-sm">Sort</span>
                </button>
              </div>

              {loadingFavs ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full border-4 border-rose-100 border-t-rose-500 animate-spin" />
                    <Heart size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-rose-500" />
                  </div>
                  <p className="mt-6 text-base font-bold opacity-60">Loading your sacred verses...</p>
                </div>
              ) : favourites.length === 0 ? (
                <div className="text-center py-20 px-4">
                  <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-300/40 to-pink-300/40 blur-3xl animate-pulse" />
                    <div className="relative w-28 h-28 bg-gradient-to-br from-rose-100 via-pink-100 to-orange-100 rounded-3xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                      <Heart size={48} className="text-rose-500" strokeWidth={2.5} />
                    </div>
                  </div>
                  <h4 className="name text-3xl font-black mb-4">No favourites yet</h4>
                  <p className="stat-label text-base max-w-md mx-auto leading-relaxed opacity-70">
                    Start your spiritual collection by tapping the{" "}
                    <Heart size={18} className="inline text-rose-500 mb-1" /> while reading verses
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                  {favourites.map((f) => {
                    const key = getFavKey(f);
                    const isPlaying = playingFav === key;
                    return (
                      <article
                        key={f._id || `${f.chapter}-${f.verse}`}
                        className="fav-card group relative rounded-2xl p-6 border-2 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden transform hover:scale-105"
                        onClick={() => navigate(`/chapter/${f.chapter}/slok/${f.verse}`)}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/0 via-amber-50/0 to-orange-50/0 group-hover:from-orange-50/60 group-hover:via-amber-50/40 group-hover:to-orange-50/60 transition-all duration-300 pointer-events-none" />
                        <div className="absolute -top-3 -right-3 w-24 h-24 bg-gradient-to-br from-orange-300/30 to-pink-300/30 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />

                        <div className="relative z-10">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl blur opacity-50 group-hover:opacity-70 transition-opacity" />
                                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 via-amber-400 to-orange-500 text-white font-black flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                                  <div className="text-center leading-tight">
                                    <div className="text-xs opacity-90">BG</div>
                                    <div className="text-base">
                                      {f.chapter}.{f.verse}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <span className="text-xs font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                                  Ch {f.chapter}
                                </span>
                                <Heart size={14} className="text-rose-400 fill-rose-400 animate-pulse mt-2" />
                              </div>
                            </div>
                          </div>

                          <div className="mb-4 space-y-2">
                            <p className="verse-text text-sm font-bold leading-relaxed line-clamp-3 group-hover:text-gray-900 transition-colors">
                              {f.verseText ? f.verseText.slice(0, 150) : `Bhagavad Gita ${f.chapter}.${f.verse}`}
                            </p>
                            {f.translationSnippet && (
                              <p className="stat-label text-xs leading-relaxed line-clamp-2 italic opacity-60">
                                {f.translationSnippet.slice(0, 100)}...
                              </p>
                            )}
                          </div>

                          <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-4" />

                          <div className="flex items-center justify-between">
                            <button
                              onClick={(e) => togglePlayFavourite(f, e)}
                              className={`relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl ${
                                isPlaying
                                  ? "bg-gradient-to-br from-orange-500 to-amber-600 text-white scale-110"
                                  : "bg-white border-2 border-gray-200 text-orange-600 hover:border-orange-400"
                              }`}
                            >
                              {isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} className="ml-0.5" />}
                              {isPlaying && <span className="absolute -inset-1 rounded-xl bg-orange-500/30 animate-ping" />}
                            </button>

                            {isPlaying && (
                              <div className="flex-1 mx-4 h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                <div
                                  className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 rounded-full transition-all duration-300"
                                  style={{ width: `${Math.round((audioProgress || 0) * 100)}%` }}
                                />
                              </div>
                            )}

                            <div className="flex items-center gap-2">
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  const prev = favourites;
                                  removeFavouriteLocally(f.chapter, f.verse);
                                  if (playingFav === key) stopAnyPlaying();
                                  try {
                                    await api.post(
                                      "/favourites/toggle",
                                      { chapter: Number(f.chapter), verse: Number(f.verse) },
                                      { withCredentials: true }
                                    );
                                    toast.success("Removed from favourites");
                                  } catch (err) {
                                    setFavourites(prev);
                                    toast.error("Failed to remove favourite");
                                  }
                                }}
                                className="p-2.5 rounded-xl hover:bg-red-50 text-red-500 transition-all duration-200 hover:scale-110"
                              >
                                <Trash2 size={18} strokeWidth={2.5} />
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/chapter/${f.chapter}/slok/${f.verse}`);
                                }}
                                className="p-2.5 rounded-xl hover:bg-orange-50 text-orange-600 transition-all duration-200 hover:scale-110"
                              >
                                <ExternalLink size={18} strokeWidth={2.5} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <>
              {summary.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <BookOpen size={48} className="text-gray-400" />
                  </div>
                  <h4 className="name text-2xl lg:text-3xl font-black mb-3">No progress yet</h4>
                  <p className="stat-label text-base opacity-70">Start reading a chapter to track your progress</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {summary.map((ch) => (
                    <div key={ch.chapter} className="group">
                      {viewMode === "bar" ? (
                        <div className="chapter-card rounded-2xl p-6 transition-all duration-300 border-2 shadow-lg hover:shadow-2xl transform hover:scale-102">
                          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
                            <div className="flex items-center gap-5">
                              <div className="w-14 h-14 lg:w-18 lg:h-18 bg-gradient-to-br from-orange-400 via-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-xl transform group-hover:scale-110 transition-transform duration-300">
                                {ch.chapter}
                              </div>
                              <div>
                                <h4 className="chapter-title font-black text-base lg:text-xl mb-1">Chapter {ch.chapter}</h4>
                                <p className="chapter-subtitle text-sm font-medium">
                                  {ch.completedCount}/{ch.totalVerses} verses completed
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 w-full lg:w-auto">
                              <div className="flex-1 lg:w-72 bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                                <div
                                  className="h-full bg-gradient-to-r from-orange-400 via-amber-500 to-orange-600 rounded-full transition-all duration-700 ease-out shadow-lg"
                                  style={{ width: `${ch.percent}%` }}
                                />
                              </div>
                              <div className="text-xl font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent min-w-[52px] text-right">
                                {ch.percent}%
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="chapter-card rounded-2xl p-6 transition-all duration-300 border-2 shadow-lg hover:shadow-2xl">
                          <div
                            className="flex items-center justify-between cursor-pointer mb-5"
                            onClick={() => loadChapterDetail(ch.chapter)}
                          >
                            <div className="flex items-center gap-5">
                              <div className="w-14 h-14 lg:w-18 lg:h-18 bg-gradient-to-br from-orange-400 via-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-xl">
                                {ch.chapter}
                              </div>
                              <div>
                                <h4 className="chapter-title font-black text-base lg:text-xl mb-1">
                                  Chapter {ch.chapter}
                                </h4>
                                <p className="chapter-subtitle text-sm font-medium">
                                  {ch.completedCount}/{ch.totalVerses} verses
                                </p>
                              </div>
                            </div>
                            <div className="action-text text-sm font-bold hover:underline transition-colors">
                              {chapterDetails[ch.chapter] ? "Hide details" : "View details"}
                            </div>
                          </div>

                          {chapterDetails[ch.chapter] && (
                            <div
                              className="grid gap-3 mt-5"
                              style={{ gridTemplateColumns: "repeat(auto-fit, minmax(44px, 1fr))" }}
                            >
                              {chapterDetails[ch.chapter].map((v) => (
                                <button
                                  key={v.verse}
                                  onClick={() => navigate(`/chapter/${ch.chapter}/slok/${v.verse}`)}
                                 className={`verse-btn w-full h-12 rounded-xl flex items-center justify-center text-sm font-black transition-all duration-200 shadow-md hover:shadow-xl cursor-pointer transform hover:scale-110 ${
  v.completed
    ? "completed bg-gradient-to-br from-emerald-400 to-teal-500 text-white" // ✨ Add 'completed' class here
    : "bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700 hover:from-gray-300 hover:to-gray-400"
}`}
                                >
                                  {v.verse}
                                </button>
                              ))}
                            </div>
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

const Wrapper = styled.div`
  position: relative;
  overflow: hidden;
  min-height: 100vh;

  .max-w-7xl {
    position: relative;
    z-index: 2;
  }

  .animation-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    pointer-events: none;
    z-index: 1;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.8s ease-in-out, visibility 0.8s;
  }

  .animation-container.visible {
    opacity: 1;
    visibility: visible;
  }

  .feather {
    position: absolute;
    top: -150px;
    background-image: url("/images/feather.png");
    background-size: contain;
    background-repeat: no-repeat;
    animation: fall-down linear infinite;
  }

  @keyframes fall-down {
    0% {
      transform: translateY(0) rotate(-20deg);
      opacity: 0.7;
    }
    100% {
      transform: translateY(120vh) rotate(360deg);
      opacity: 0;
    }
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0) scale(1);
      opacity: 0.6;
    }
    50% {
      transform: translateY(-20px) scale(1.1);
      opacity: 1;
    }
  }

  .feather:nth-child(1) {
    left: 5%;
    animation-duration: 25s;
    animation-delay: 0s;
    width: 40px;
    height: 40px;
  }
  .feather:nth-child(2) {
    left: 15%;
    animation-duration: 18s;
    animation-delay: 2s;
    width: 25px;
    height: 25px;
  }
  .feather:nth-child(3) {
    left: 25%;
    animation-duration: 22s;
    animation-delay: 4s;
    width: 35px;
    height: 35px;
  }
  .feather:nth-child(4) {
    left: 35%;
    animation-duration: 16s;
    animation-delay: 1s;
    width: 45px;
    height: 45px;
  }
  .feather:nth-child(5) {
    left: 45%;
    animation-duration: 28s;
    animation-delay: 5s;
    width: 20px;
    height: 20px;
  }
  .feather:nth-child(6) {
    left: 55%;
    animation-duration: 15s;
    animation-delay: 3s;
    width: 50px;
    height: 50px;
  }
  .feather:nth-child(7) {
    left: 65%;
    animation-duration: 20s;
    animation-delay: 0s;
    width: 30px;
    height: 30px;
  }
  .feather:nth-child(8) {
    left: 75%;
    animation-duration: 17s;
    animation-delay: 6s;
    width: 40px;
    height: 40px;
  }
  .feather:nth-child(9) {
    left: 85%;
    animation-duration: 24s;
    animation-delay: 2s;
    width: 25px;
    height: 25px;
  }
  .feather:nth-child(10) {
    left: 95%;
    animation-duration: 19s;
    animation-delay: 7s;
    width: 35px;
    height: 35px;
  }
  .feather:nth-child(11) {
    left: 10%;
    animation-duration: 26s;
    animation-delay: 8s;
    width: 40px;
    height: 40px;
  }
  .feather:nth-child(12) {
    left: 20%;
    animation-duration: 14s;
    animation-delay: 10s;
    width: 25px;
    height: 25px;
  }
  .feather:nth-child(13) {
    left: 50%;
    animation-duration: 21s;
    animation-delay: 9s;
    width: 30px;
    height: 30px;
  }
  .feather:nth-child(14) {
    left: 80%;
    animation-duration: 18s;
    animation-delay: 11s;
    width: 45px;
    height: 45px;
  }
  .feather:nth-child(15) {
    left: 90%;
    animation-duration: 27s;
    animation-delay: 12s;
    width: 20px;
    height: 20px;
  }

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  background: ${({ theme }) => (theme.name === "dark" ? "#0a0f1e" : "#fafbfc")};

  .page-title {
    filter: ${({ theme }) => (theme.name === "dark" ? "brightness(1.3)" : "none")};
  }

  .page-subtitle,
  .stat-label,
  .chapter-subtitle {
    color: ${({ theme }) => (theme.name === "dark" ? "rgba(255, 255, 255, 0.7)" : "#6b7280")};
  }

  .name,
  .stat-value,
  .chapter-title,
  .verse-text {
    color: ${({ theme }) => (theme.name === "dark" ? "rgba(255, 255, 255, 0.95)" : "#111827")};
  }

  .profile-card,
  .stat-card,
  .progress-card,
  .chapter-card,
  .fav-card {
    background: ${({ theme }) => (theme.name === "dark" ? "rgba(30, 41, 59, 0.7)" : "#ffffff")};
    border-color: ${({ theme }) => (theme.name === "dark" ? "rgba(148, 163, 184, 0.15)" : "#f3f4f6")};
    backdrop-filter: blur(10px);
  }

  .chapter-card:hover,
  .fav-card:hover {
    border-color: ${({ theme }) => (theme.name === "dark" ? "rgba(251, 146, 60, 0.4)" : "#fed7aa")};
    background: ${({ theme }) => (theme.name === "dark" ? "rgba(30, 41, 59, 0.9)" : "#ffffff")};
  }

  .action-text {
    color: ${({ theme }) => (theme.name === "dark" ? "#fbbf24" : "#f59e0b")};
  }

  .verse-btn {
    &:not(.completed) {
      background: ${({ theme }) =>
        theme.name === "dark"
          ? "linear-gradient(to bottom right, #475569, #334155)"
          : "linear-gradient(to bottom right, #e5e7eb, #d1d5db)"};
      color: ${({ theme }) => (theme.name === "dark" ? "rgba(255, 255, 255, 0.8)" : "#374151")};

      &:hover {
        background: ${({ theme }) =>
          theme.name === "dark"
            ? "linear-gradient(to bottom right, #64748b, #475569)"
            : "linear-gradient(to bottom right, #d1d5db, #9ca3af)"};
      }
    }
  }

  :where(html.dark) & {
    .feather {
      opacity: 0.3;
    }
  }

  @media (max-width: 1023px) {
    .profile-card {
      padding: 1rem;
    }
  }

  @media (max-width: 640px) {
  .main-content {
    padding-top: 90px !important; // ✨ Changed from 60px to 80px
  }
}
`;
