import React, { createContext, useReducer, useContext } from "react";

const FruitBarContext = createContext();

const initialState = {
  // Estado inicial del FruitBar
  fruits: [],
};

function fruitBarReducer(state, action) {
  switch (action.type) {
    case "SET_FRUITS":
      return { ...state, fruits: action.payload };
    default:
      return state;
  }
}

export function FruitBarProvider({ children }) {
  const [state, dispatch] = useReducer(fruitBarReducer, initialState);
  return (
    <FruitBarContext.Provider value={{ state, dispatch }}>
      {children}
    </FruitBarContext.Provider>
  );
}

export function useFruitBar() {
  return useContext(FruitBarContext);
}