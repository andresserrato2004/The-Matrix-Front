import React, { createContext, useReducer, useContext } from "react";
import type { ReactNode, Dispatch } from "react";

interface HeaderState {
  score: number;
  minutes: number;
  seconds: number;
  musicOn: boolean;
  soundEffectsOn: boolean;
  isRunning: boolean;
}

type HeaderAction =
  | { type: "INCREMENT_SCORE" }
  | { type: "SET_SCORE"; payload: number }
  | { type: "SET_MINUTES"; payload: number }
  | { type: "SET_SECONDS"; payload: number }
  | { type: "SET_MUSIC"; payload: boolean }
  | { type: "SET_SOUND_EFFECTS"; payload: boolean }
  | { type: "SET_IS_RUNNING"; payload: boolean };

const initialState: HeaderState = {
  score: 0,
  minutes: 0,
  seconds: 0,
  musicOn: true,
  soundEffectsOn: true,
  isRunning: true
};

function headerReducer(state: HeaderState, action: HeaderAction): HeaderState {
  switch (action.type) {
    case "SET_SCORE":
      return { ...state, score: action.payload };
    case "INCREMENT_SCORE":
      return { ...state, score: state.score + 1 };
    case "SET_MINUTES":
      return { ...state, minutes: action.payload };
    case "SET_SECONDS":
      return { ...state, seconds: action.payload };
    case "SET_MUSIC":
      return { ...state, musicOn: action.payload };
    case "SET_SOUND_EFFECTS":
      return { ...state, soundEffectsOn: action.payload };
    case "SET_IS_RUNNING":
      return { ...state, isRunning: action.payload };
    default:
      return state;
  }
}

interface HeaderContextProps {
  state: HeaderState;
  dispatch: Dispatch<HeaderAction>;
}

const HeaderContext = createContext<HeaderContextProps | undefined>(undefined);

export const HeaderProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(headerReducer, initialState);
  return (
    <HeaderContext.Provider value={{ state, dispatch }}>
      {children}
    </HeaderContext.Provider>
  );
};

export function useHeader() {
  const context = useContext(HeaderContext);
  if (!context) throw new Error("useHeader must be used within a HeaderProvider");
  return context;
}