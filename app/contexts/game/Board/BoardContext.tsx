import React, { createContext, useReducer, useContext, ReactNode, Dispatch } from "react";

interface Position {
  x: number;
  y: number;
}

interface BoardState {
  board: any[]; // Cambia 'any' por el tipo real de tu tablero
  playerPosition: Position;
}

type BoardAction =
  | { type: "SET_BOARD"; payload: any[] }
  | { type: "MOVE_PLAYER"; payload: Position };

const initialState: BoardState = {
  board: [],
  playerPosition: { x: 0, y: 0 },
};

function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case "SET_BOARD":
      return { ...state, board: action.payload };
    case "MOVE_PLAYER":
      return { ...state, playerPosition: action.payload };
    default:
      return state;
  }
}

interface BoardContextProps {
  state: BoardState;
  dispatch: Dispatch<BoardAction>;
}

const BoardContext = createContext<BoardContextProps | undefined>(undefined);

export const BoardProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(boardReducer, initialState);
  return (
    <BoardContext.Provider value={{ state, dispatch }}>
      {children}
    </BoardContext.Provider>
  );
};

export function useBoard() {
  const context = useContext(BoardContext);
  if (!context) throw new Error("useBoard must be used within a BoardProvider");
  return context;
}