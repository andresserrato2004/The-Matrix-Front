import { createContext, useReducer, useContext, useEffect, useRef } from "react";
import type { ReactNode, Dispatch } from "react";
import type { BoardCell, EnemyMove, EspecialFruitInformation } from "../../../types/types"; 

interface BoardState {
  fruits: BoardCell[];
  enemies: BoardCell[];
  iceBlocks: BoardCell[];
  pendingIceBlockUpdates?: BoardCell[];
  actualFruit?: string;
  especialFruit: EspecialFruitInformation;
}

type BoardAction =
  // Tablero en general
  | { type: "SET_BOARD"; payload: BoardCell[] }
  // Frutas
  | { type: "SET_FRUITS"; payload: BoardCell[] }
  | { type: "DELETE_FRUIT"; payload: string }
  // Bloques de hielo
  | { type: "UPDATE_ICE_BLOCKS"; payload: {cells: BoardCell[], actualFruit: string} }
  // Enemigos
  | { type: "MOVE_ENEMY"; payload: EnemyMove }
  | { type: "START_ICE_BLOCKS_ANIMATION"; payload: { cells: BoardCell[], actualFruit: string } }
  | { type: "STEP_ICE_BLOCKS_ANIMATION" }
  // Fruta especial
  | { type: "UPDATE_SPECIAL_FRUIT"; payload: EspecialFruitInformation }

const initialState: BoardState = {
  fruits: [],
  enemies: [],
  iceBlocks: [],
  pendingIceBlockUpdates: [],
  actualFruit: "",
  especialFruit: null,
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
      return {
        ...state,
        pendingIceBlockUpdates: action.payload.cells,
        actualFruit: action.payload.actualFruit
      };
    case "MOVE_ENEMY":
      return updateEnemy(state, action.payload);
    case "START_ICE_BLOCKS_ANIMATION":
      return {
        ...state,
        pendingIceBlockUpdates: [...action.payload.cells],
        actualFruit: action.payload.actualFruit,
      };
    case "STEP_ICE_BLOCKS_ANIMATION": {
      if (!state.pendingIceBlockUpdates || state.pendingIceBlockUpdates.length === 0) return state;
      const [nextCell, ...rest] = state.pendingIceBlockUpdates;
      // Aplica la lógica de updateIceBlocks SOLO a esa celda
      const updatedState = updateIceBlocks(state, nextCell, state.actualFruit || "");
      return {
        ...updatedState,
        pendingIceBlockUpdates: rest,
      };
    }
    case "UPDATE_SPECIAL_FRUIT":
      return {
        ...state,
        especialFruit: action.payload
        };
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
    especialFruit: null,
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
function updateIceBlocks(state: BoardState, updatedIceBlock: BoardCell, actualFruit: string): BoardState {
  const newFruits = [...state.fruits];
  let newIceBlocks = [...state.iceBlocks];
    // 1. Si item es diferente de null; actualiza la fruta correspondiente
    // 2. Si item es null, character es null y frozen es true; añade el cell a iceBlocks si no existe ya
    if (updatedIceBlock.frozen) {
      const exists = newIceBlocks.some(
        b =>
          b.coordinates.x === updatedIceBlock.coordinates.x &&
          b.coordinates.y === updatedIceBlock.coordinates.y
      );
      const newCell = updatedIceBlock.item ? {
        ...updatedIceBlock,
        item: {
          ...updatedIceBlock.item,
          type: actualFruit,
        }
      } : updatedIceBlock;
      if (!exists) {
        newIceBlocks.push(newCell);
      }
    }
    // 3. frozen es false; elimina el cell de iceBlocks por posición
    else {
      newIceBlocks = newIceBlocks.filter(
        b =>
          !(b.coordinates.x === updatedIceBlock.coordinates.x &&
            b.coordinates.y === updatedIceBlock.coordinates.y)
      );
    }
    if (updatedIceBlock.item && updatedIceBlock.item.type === "fruit") {
      const fruitIndex = newFruits.findIndex(fruit => fruit.item?.id === updatedIceBlock.item?.id);
      if (fruitIndex !== -1) {
        newFruits[fruitIndex] = {
          ...newFruits[fruitIndex],
          frozen: updatedIceBlock.frozen,
        item: {
          ...newFruits[fruitIndex].item,
          id: newFruits[fruitIndex].item?.id || "", // Ensure id is always a string
          type: actualFruit,
        },
        };
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
              orientation: enemyMove.direction,
              enemyStatus: enemyMove.enemyStatus,
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
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (state.pendingIceBlockUpdates && state.pendingIceBlockUpdates.length > 0) {
      timerRef.current = setTimeout(() => {
        dispatch({ type: "STEP_ICE_BLOCKS_ANIMATION" });
      }, 100);
    } else if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state.pendingIceBlockUpdates]);

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