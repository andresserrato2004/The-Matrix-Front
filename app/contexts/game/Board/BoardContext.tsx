import React, { createContext, useReducer, useContext } from "react";
import type { ReactNode, Dispatch } from "react";
import type { BoardCell, EnemyMove, PlayerMove } from "../types/types"; 
import IceBlock from "~/routes/game/components/board/ice-block/IceBlock";

interface BoardState {
  fruits: BoardCell[];
  enemies: BoardCell[];
  iceBlocks: BoardCell[];
  iceCreams: BoardCell[];
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
  | { type: "MOVE_ENEMY"; payload: EnemyMove }
  // Helados
  | { type: "MOVE_PLAYER"; payload: PlayerMove };

const initialState: BoardState = {
  fruits: [],
  enemies: [],
  iceBlocks: [],
  iceCreams: []
};

function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case "SET_BOARD":
      return { ...state }; // Example logic for setting the board
    case "SET_FRUITS":
      return setFruits(state, action.payload);
    case "DELETE_FRUIT":
      return deleteFruit(state, action.payload);
    case "DELETE_ICE_BLOCKS":
      return deleteIceBlocks(state, action.payload); 
    case "ADD_ICE_BLOCKS":
      return addIceBlocks(state, action.payload); 
    case "MOVE_PLAYER":
      return updateIceCream(state, action.payload); // Update the player position
    case "MOVE_ENEMY":
      return updateEnemy(state, action.payload); // Update the enemy position
    default:
      return state;
  }
}

// --- Funciones auxiliares para el reducer ---
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
// HELADOS
function updateIceCream(
  state: BoardState, iceCreamMove: PlayerMove): BoardState {
  return {
    ...state,
    iceCreams: state.iceCreams.map(iceCream =>
      iceCream.character?.id === iceCreamMove.playerId
        ? {
            ...iceCream,
            x: iceCreamMove.coordinates.x,
            y: iceCreamMove.coordinates.y,
            character: {
              ...iceCream.character,
              orientation: iceCreamMove.direction,
              state: iceCreamMove.state
            }
          }
        : iceCream
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