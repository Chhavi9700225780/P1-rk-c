const reducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return {
        ...state,
        isLoading: true,
      };
    case "API_ERROR":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    case "SET_CHAPTERS_LOADING":
      return {
        ...state,
        isChapterLoading: true,
      };
    case "GET_CHAPTER":
      return {
        ...state,
        chapter: action.payload,
        isChapterLoading: false,
      };
    case "GET_RANDOM_SLOK":
      return {
        ...state,
        slok: action.payload,
        isLoading: false,
      };
    case "SET_SINGLE_LOADING":
      return {
        ...state,
        isSingleLoading: true,
      };
    case "GET_SINGLE_CHAPTER":
      return {
        ...state,
        isSingleLoading: false,
        singleChapter: action.payload,
      };
    case "SET_SINGLE_ERROR":
      return {
        ...state,
        isSingleLoading: false,
        isError: true,
      };
    case "SET_VERSES_LOADING":
      return {
        ...state,
        isVersesLoading: true,
      };
    case "GET_ALL_VERSES":
      return {
        ...state,
        chapterVerses: action.payload,
        isVersesLoading: false,
      };

    case "SET_VERSE_LOADING":
      return {
        ...state,
        isVerseLoading: true,
      };
    case "GET_VERSE":
      return {
        ...state,
        verse: action.payload,
        isVerseLoading: false,
      };
    case "TOGGLE_THEME": {
      state.isdarkMode = !state.isdarkMode;
      const mode = localStorage.setItem(
        "TOGGLE_DARKTHEME",
        JSON.stringify(state.isdarkMode)
      );
      return {
        ...state,
        ...mode,
      };
    }

    case "SET_SELECT_LANGUAGE":{

      return{
        ...state,
        DefaultLanguage: action.payload,
      }
    }

    default:
      return state;
  }
};

export default reducer;
