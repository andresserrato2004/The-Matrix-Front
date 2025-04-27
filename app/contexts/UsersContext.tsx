import { createContext, useReducer, useContext } from "react";
import type { ReactNode, Dispatch } from "react";
import type { PlayerMove, UserInformation, GameState } from "./game/types/types";

export interface UsersState {
    mainUser: UserInformation;
    secondaryUser: UserInformation;
    gameState: GameState;
}

type UsersAction =
    | { type: "SET_USER_INFORMATION"; payload: UserInformation }
    | { type: "SET_MATCHID"; payload: { matchId: string } }
    | { type: "MOVE_USER"; payload: PlayerMove }
    | { type: "SET_MAIN_USER"; payload: UserInformation }
    | { type: "SET_GAME_STATE"; payload: GameState }
    | { type: "SET_SECONDARY_USER"; payload: UserInformation };

const initialState: UsersState = {
    mainUser: {
        id: "",
        matchId: "",
        name: "player1",
        flavour: "vanilla",
        position: { x: 0, y: 0 },
        direction: "down",
        state: "alive"
    },
    secondaryUser: {
        id: "",
        matchId: "",
        name: "player2",
        flavour: "vanilla",
        position: { x: 0, y: 0 },
        direction: "down",
        state: "alive"
    },
    gameState: "playing"
};

function usersReducer(state: UsersState, action: UsersAction): UsersState {
  switch (action.type) {
    case "SET_MAIN_USER":
        return { ...state, mainUser: action.payload };
    case "SET_SECONDARY_USER":
        return { ...state, secondaryUser: action.payload };
    case "SET_USER_INFORMATION":
        if (action.payload.id === state.mainUser.id) {
            return { ...state, mainUser: action.payload };
        }
        return { ...state, secondaryUser: action.payload };

    case "SET_MATCHID":
        return {
            mainUser: {
                ...state.mainUser,
                matchId: action.payload.matchId,
                id: state.mainUser.id, // Ensure 'id' is preserved
            },
            secondaryUser: {
                ...state.secondaryUser,
                matchId: action.payload.matchId,
                id: state.secondaryUser.id, // Ensure 'id' is preserved
            },
            gameState: state.gameState,
        };
    case "MOVE_USER":
        if (action.payload.playerId === state.mainUser.id) {
            return {
                ...state,
                mainUser: {
                    ...state.mainUser,
                    position: action.payload.coordinates,
                    direction: action.payload.direction,
                    state: action.payload.state
                },
            };
        }
        return {
            ...state,
            secondaryUser: {
                ...state.secondaryUser,
                position: action.payload.coordinates,
                direction: action.payload.direction,
                state: action.payload.state
            },
        };
    case "SET_GAME_STATE":
        return {
            ...state,
            gameState: action.payload,
        };
    default:
      return state;
  }
}

interface UsersContextProps {
  state: UsersState;
  dispatch: Dispatch<UsersAction>;
}

const UsersContext = createContext<UsersContextProps | undefined>(undefined);

export const UsersProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(usersReducer, initialState);
  return (
    <UsersContext.Provider value={{ state, dispatch }}>
      {children}
    </UsersContext.Provider>
  );
};

export function useUsers() {
  const context = useContext(UsersContext);
  if (!context) throw new Error("useUsers must be used within a UsersProvider");
  return context;
}