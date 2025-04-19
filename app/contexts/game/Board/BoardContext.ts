import React, { createContext, useReducer, useContext } from "react";

const BoardContext = createContext();

const initialState = {
  // Estado inicial del Board
  board: [],
  playerPosition: { x: 0, y: 0 },
};

function boardReducer(state, action) {
  switch (action.type) {
    case "SET_BOARD":
      return { ...state, board: action.payload };
    case "MOVE_PLAYER":
      return { ...state, playerPosition: action.payload };
    default:
      return state;
  }
}

export function BoardProvider({ children }) {
  const [state, dispatch] = useReducer(boardReducer, initialState);
  return (
    <BoardContext.Provider value={{ state, dispatch }}>
      {children}
    </BoardContext.Provider>
  );
}

export function useBoard() {
  return useContext(BoardContext);
}