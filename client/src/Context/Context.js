import React, { useContext, useEffect, useReducer, useState } from "react";
import reducer from "./Reducer";
import axios from "axios";

// Create a new context
const AppContext = React.createContext();

// Define the API URL
//const API = 'https://gita2.onrender.com';
// This line will use the production URL when the app is built,
// and fall back to the localhost URL for local development.

const API = "http://54.160.180.195:5000";

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
  }

  // Define the AppProvider component
const AppProvider = ({ children }) => {
  // Use the useReducer hook to manage state using the reducer function
  const [state, dispatch] = useReducer(reducer, initialState);

  // Use the useState hook to manage the header state
  const [header, setHeader] = useState(false);


 // Select default language
   const selectLanguage = (data) =>{
    return dispatch({type: "SET_SELECT_LANGUAGE", payload: data})
   }


  //get all particular chapter
  const fetchChapters = async () => {
    dispatch({type: "SET_CHAPTERS_LOADING"})
    try {
      const response = await axios.get(`${API}/chapters`);
      const data = response.data;
      dispatch({type: "GET_CHAPTER", payload: data})
    } catch (error) {
      dispatch({type: "API_ERROR"})
    }
  };

  //get random slok
  const fetchRandomSlok = async () => {
    dispatch({type: "SET_LOADING"})
    try {
      dispatch({type: "SET_LOADING"})
      const response = await axios.get(`${API}/slok`);
      const data = response.data;
      dispatch({type: "GET_RANDOM_SLOK", payload: data})
    } catch (error) {
      dispatch({type: "API_ERROR"})
    }
  };

  //get  particular chapter
  const GetSingleChapter = async (url) => {
    dispatch({type: "SET_SINGLE_LOADING"})
    try {
      const response = await axios.get(`${API}/chapter/${url}`);
      const data = response.data;
      dispatch({type: "GET_SINGLE_CHAPTER", payload: data})
    } catch (error) {
      dispatch({type: "SET_SINGLE_ERROR"})
    }
  };

  //get all shlok from particular chapter
  const GetAllVerses = async (url) => {
    dispatch({type: "SET_VERSES_LOADING"})
    try {
      const response = await axios.get(`${API}/chapter/${url}`);
      const data = response.data;
      dispatch({type: "GET_ALL_VERSES", payload: data})
    } catch (error) {
      dispatch({type: "SET_SINGLE_ERROR"})
    }
  };

  //get particular shlok from particular chapter
  const GetVerse = async (url) => {
    dispatch({type: "SET_VERSE_LOADING"})
    try {
      const response = await axios.get(`${API}/chapter/${url}`);
      const data = response.data;
      // console.log(data)
      dispatch({type: "GET_VERSE", payload: data})
    } catch (error) {
      dispatch({type: "SET_SINGLE_ERROR"})
    }
  };

    // Toggle the application theme (dark/light mode)
  const toggleTheme= () =>{
    return dispatch({type: "TOGGLE_THEME"})
}
  
 
  useEffect(()=>{
    fetchChapters();
  }, [])

  useEffect(()=>{
    fetchRandomSlok();
  }, [])


  return <AppContext.Provider value={{...state,header, setHeader,selectLanguage, fetchChapters, fetchRandomSlok, GetSingleChapter, GetAllVerses, GetVerse, toggleTheme}} >
  {children}
  </AppContext.Provider>;
};

//global custom hook
const useGlobalContext = () =>{
    return useContext(AppContext);
}

export {AppContext, AppProvider, useGlobalContext}