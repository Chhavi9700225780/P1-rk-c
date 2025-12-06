import React, { useContext, useEffect, useReducer, useState } from "react";
import reducer from "./Reducer";
import axios from "axios";

// Create a new context
const AppContext = React.createContext();

// Define the API URL
const API = 'http://localhost:5000';

// Define the initial state of the application
const initialState = {
  DefaultLanguage: "english",
  isLoading: true,
  isChapterLoading: true,
  isSingleLoading: true,
  isVersesLoading: true,
  isError: false,
  isVerseLoading: true,
  isSlokLoading: true,
  chapter: [],
  image: "",
  description: "",
  slok: [],
  singleChapter: {},
  chapterVerses: [],
  verse: {},
  isdarkMode: JSON.parse(localStorage.getItem("TOGGLE_DARKTHEME")) || false,
};

// Define the AppProvider component
const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [header, setHeader] = useState(false);

  // Select default language
  const selectLanguage = (data) => {
    return dispatch({ type: "SET_SELECT_LANGUAGE", payload: data });
  };

  // --- 1. OPTIMIZED: Get all chapters ---
  const fetchChapters = async () => {
    // Optimization: If we already have chapters, don't fetch again.
    if (state.chapter && state.chapter.length > 0) {
      // Ensure loading is set to false just in case
      if (state.isChapterLoading) dispatch({ type: "GET_CHAPTER", payload: state.chapter });
      return; 
    }

    dispatch({ type: "SET_CHAPTERS_LOADING" });
    try {
      const response = await axios.get(`${API}/chapters`);
      const data = response.data;
      dispatch({ type: "GET_CHAPTER", payload: data });
    } catch (error) {
      dispatch({ type: "API_ERROR" });
    }
  };

  // Get random slok (Verse of the day) - We usually want this to refresh, so we keep it.
  const fetchRandomSlok = async () => {
    dispatch({ type: "SET_LOADING" });
    try {
      const response = await axios.get(`${API}/slok`);
      const data = response.data;
      dispatch({ type: "GET_RANDOM_SLOK", payload: data });
    } catch (error) {
      dispatch({ type: "API_ERROR" });
    }
  };

  // --- 2. OPTIMIZED: Get Single Chapter ---
  const GetSingleChapter = async (chapterId) => {
    // Optimization: If we already have this chapter in memory, skip fetch
    if (
      state.singleChapter && 
      // Compare as strings to be safe
      String(state.singleChapter.chapter_number) === String(chapterId)
    ) {
      // Just ensure loading is false
      return; 
    }

    dispatch({ type: "SET_SINGLE_LOADING" });
    try {
      const response = await axios.get(`${API}/chapter/${chapterId}`);
      const data = response.data;
      dispatch({ type: "GET_SINGLE_CHAPTER", payload: data });
    } catch (error) {
      dispatch({ type: "SET_SINGLE_ERROR" });
    }
  };

  // --- 3. OPTIMIZED: Get All Verses ---
  // url input usually comes as "1/slok"
  const GetAllVerses = async (url) => {
    const chapterId = url.split('/')[0]; // Extract ID "1" from "1/slok"

    // Optimization: If current verses belong to this chapter, skip fetch
    if (
      state.chapterVerses && 
      state.chapterVerses.length > 0 &&
      String(state.chapterVerses[0].chapter_number) === String(chapterId)
    ) {
      return;
    }

    dispatch({ type: "SET_VERSES_LOADING" });
    try {
      const response = await axios.get(`${API}/chapter/${url}`);
      const data = response.data;
      dispatch({ type: "GET_ALL_VERSES", payload: data });
    } catch (error) {
      dispatch({ type: "SET_SINGLE_ERROR" });
    }
  };

  // Get particular verse (We keep this fresh as user might toggle languages)
  const GetVerse = async (url) => {
    dispatch({ type: "SET_VERSE_LOADING" });
    try {
      const response = await axios.get(`${API}/chapter/${url}`);
      const data = response.data;
      dispatch({ type: "GET_VERSE", payload: data });
    } catch (error) {
      dispatch({ type: "SET_SINGLE_ERROR" });
    }
  };

  // Toggle the application theme
  const toggleTheme = () => {
    return dispatch({ type: "TOGGLE_THEME" });
  };

  useEffect(() => {
    fetchChapters();
  }, []);

  useEffect(() => {
    fetchRandomSlok();
  }, []);

  return (
    <AppContext.Provider
      value={{
        ...state,
        header,
        setHeader,
        selectLanguage,
        fetchChapters,
        fetchRandomSlok,
        GetSingleChapter,
        GetAllVerses,
        GetVerse,
        toggleTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Global custom hook
const useGlobalContext = () => {
  return useContext(AppContext);
};

export { AppContext, AppProvider, useGlobalContext };