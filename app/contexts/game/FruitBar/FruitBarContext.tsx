import { createContext, useReducer, useContext } from "react";
import type { ReactNode, Dispatch } from "react";

interface FruitBarState {
  fruits: string[]; // Cambia 'any' por el tipo real de tus frutas
  actualFruit: string;
}

type FruitBarAction = 
  | { type: "SET_FRUITS"; payload: string[] } 
  | { type: "SET_ACTUAL_FRUIT"; payload: string };

const initialState: FruitBarState = {
  fruits: [],
  actualFruit: "",
};

function fruitBarReducer(state: FruitBarState, action: FruitBarAction): FruitBarState {
  switch (action.type) {
    case "SET_FRUITS":
      return { ...state, fruits: action.payload };
    case "SET_ACTUAL_FRUIT":
      return { ...state, actualFruit: action.payload };
    default:
      return state;
  }
}

interface FruitBarContextProps {
  state: FruitBarState;
  dispatch: Dispatch<FruitBarAction>;
}

const FruitBarContext = createContext<FruitBarContextProps | undefined>(undefined);

export const FruitBarProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(fruitBarReducer, initialState);
  return (
    <FruitBarContext.Provider value={{ state, dispatch }}>
      {children}
    </FruitBarContext.Provider>
  );
};

export function useFruitBar() {
  const context = useContext(FruitBarContext);
  if (!context) throw new Error("useFruitBar must be used within a FruitBarProvider");
  return context;
}