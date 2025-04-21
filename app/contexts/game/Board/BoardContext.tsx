import { createContext, useReducer, useContext } from "react";
import type { ReactNode, Dispatch } from "react";
import type { BoardCell, EnemyMove, PlayerMove } from "../types/types"; 

interface BoardState {
  fruits: BoardCell[];
  enemies: BoardCell[];
  iceBlocks: BoardCell[];
}

type BoardAction =
  // Tablero en general
  | { type: "SET_BOARD"; payload: BoardCell[] }
  // Frutas
  | { type: "SET_FRUITS"; payload: BoardCell[] }
  | { type: "DELETE_FRUIT"; payload: string }
  // Bloques de hielo
  | { type: "DELETE_ICE_BLOCKS"; payload: string[] }
  | { type: "ADD_ICE_BLOCKS"; payload: BoardCell[] }
  // Enemigos
  | { type: "MOVE_ENEMY"; payload: EnemyMove };

const initialState: BoardState = {
  fruits: [],
  enemies: [],
  iceBlocks: [],
};

function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case "SET_BOARD":
      return setBoard(action.payload);
    case "SET_FRUITS":
      return setFruits(state, action.payload);
    case "DELETE_FRUIT":
      return deleteFruit(state, action.payload);
    case "DELETE_ICE_BLOCKS":
      return deleteIceBlocks(state, action.payload); 
    case "ADD_ICE_BLOCKS":
      return addIceBlocks(state, action.payload); 
    case "MOVE_ENEMY":
      return updateEnemy(state, action.payload);
    default:
      return state;
  }
}

// --- Funciones auxiliares para el reducer ---
// TABLERO
function setBoard(payload: BoardCell[]): BoardState {
  return {
    fruits: payload.filter(cell => cell.item?.type === "fruit"),
    enemies: payload.filter(cell => cell.character?.type === "troll"),
    iceBlocks: payload.filter(cell => cell.item?.type === "iceBlock"),
  }
}
// FRUTAS
function deleteFruit(state: BoardState, fruitId: string): BoardState {
  return {
    ...state,
    fruits: state.fruits.filter((fruit: BoardCell) => fruit.item?.id !== fruitId),
  };
}
function setFruits(state: BoardState, newFruits: BoardCell[]): BoardState {
  return {
    ...state,
    fruits: [...newFruits],
  };
}
// BLOQUES DE HIELO
function deleteIceBlocks(state: BoardState, blockIds: string[]): BoardState {
  return {
    ...state,
    iceBlocks: state.iceBlocks.filter(cell => cell.item ? !blockIds.includes(cell.item.id) : true),
  };
}
function addIceBlocks(state: BoardState, newIceBlocks: BoardCell[]): BoardState {
  const existingIds = new Set(state.iceBlocks.map(block => block.item?.id));
  const filteredNewBlocks = newIceBlocks.filter(
    block => block.item?.id && !existingIds.has(block.item.id)
  );
  return {
    ...state,
    iceBlocks: [...state.iceBlocks, ...filteredNewBlocks],
  };
}
// ENEMIGOS
function updateEnemy(state: BoardState, enemyMove: EnemyMove): BoardState {
  return {
    ...state,
    enemies: state.enemies.map(enemy =>
      enemy.character?.id === enemyMove.enemyId
        ? {
            ...enemy,
            x: enemyMove.coordinates.x,
            y: enemyMove.coordinates.y,
            character: {
              ...enemy.character,
              orientation: enemyMove.direction
            }
          }
        : enemy
    )
  };
}


// --- Contexto y provider ---

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