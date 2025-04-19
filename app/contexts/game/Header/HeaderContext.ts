import React, { createContext, useReducer, useContext } from "react";

const HeaderContext = createContext();

const initialState = {
  // Define aquí el estado inicial del Header
  score: 0,
  level: 1,
};

function headerReducer(state, action) {
  switch (action.type) {
    case "SET_SCORE":
      return { ...state, score: action.payload };
    case "SET_LEVEL":
      return { ...state, level: action.payload };
    default:
      return state;
  }
}

export function HeaderProvider({ children }) {
  const [state, dispatch] = useReducer(headerReducer, initialState);
  return (
    <HeaderContext.Provider value={{ state, dispatch }}>
      {children}
    </HeaderContext.Provider>
  );
}

export function useHeader() {
  return useContext(HeaderContext);
}