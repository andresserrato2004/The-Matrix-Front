import { createContext, useReducer, useContext } from "react";
import type { ReactNode, Dispatch } from "react";
import type { BoardCell, EnemyMove, PlayerMove } from "../../../types/types/types"; 

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
  | { type: "UPDATE_ICE_BLOCKS"; payload: BoardCell[] }
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
    case "UPDATE_ICE_BLOCKS":
      return updateIceBlocks(state, action.payload);
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
function updateIceBlocks(state: BoardState, updatedIceBlocks: BoardCell[]): BoardState {
  let newFruits = [...state.fruits];
  let newIceBlocks = [...state.iceBlocks];

  for (const cell of updatedIceBlocks) {
    // 1. Si item es diferente de null; actualiza la fruta correspondiente
    if (cell.item) {
      newFruits = newFruits.map(fruit =>
        fruit.item?.id === cell.item?.id ? { ...fruit, ...cell } : fruit
      );
    }
    // 2. Si item es null, character es null y frozen es true; añade el cell a iceBlocks si no existe ya
    else if (!cell.item && !cell.character && cell.frozen) {
      const exists = newIceBlocks.some(
        b =>
          b.coordinates.x === cell.coordinates.x &&
          b.coordinates.y === cell.coordinates.y
      );
      if (!exists) {
        newIceBlocks.push(cell);
      }
    }
    // 3. Si item es null, character es null y frozen es false; elimina el cell de iceBlocks por posición
    else if (!cell.item && !cell.character && !cell.frozen) {
      newIceBlocks = newIceBlocks.filter(
        b =>
          !(b.coordinates.x === cell.coordinates.x &&
            b.coordinates.y === cell.coordinates.y)
      );
    }
  }

  return {
    ...state,
    fruits: newFruits,
    iceBlocks: newIceBlocks,
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
            coordinates: enemyMove.coordinates,
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