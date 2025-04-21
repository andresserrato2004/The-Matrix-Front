import React, { useEffect } from "react";
import type { ReactNode } from "react";
import { useHeader } from "../../contexts/game/Header/HeaderContext";
import { useBoard } from "../../contexts/game/Board/BoardContext";
import { useFruitBar } from "../../contexts/game/FruitBar/FruitBarContext";
import { useUsers } from "~/contexts/UsersContext";
import { ws, createWebSocketConnection } from "~/services/websocket";

export function GameWebSocketProvider({ children }: { children: ReactNode }) {
  const { dispatch: headerDispatch } = useHeader();
  const { dispatch: boardDispatch } = useBoard();
  const { dispatch: fruitBarDispatch } = useFruitBar();
  const { state: usersState, dispatch: usersDispatch } = useUsers();


  useEffect(() => {
    if (!ws) {
      console.error("WebSocket is not initialized.");
      return;
    }
    if (!usersState.mainUser.id || !usersState.secondaryUser.id || !usersState.mainUser.matchId || !usersState.secondaryUser.matchId) return;
    // Crea la conexión SOLO aquí
    createWebSocketConnection(`/ws/game/${usersState.mainUser.id}/${usersState.mainUser.matchId}`);
    // Configurar el manejador de mensajes del WebSocket
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log("Received message from gameWebSocket: ", message);
        // MENSAJES PARA EL HEADER
         if (message.minutesLeft && message.secondsLeft) {
           // Actualizar el temporizador del juego
           headerDispatch({ type: "SET_MINUTES", payload: message.minutesLeft });
           headerDispatch({ type: "SET_SECONDS", payload: message.secondsLeft });
        } else if (message.id && message.coordinates && message.direction && message.state) {
          
          if (message.idItemConsumed) {
            // Manejar el consumo de una fruta
            console.log("Removing fruit with ID:", message.idItemConsumed);
            headerDispatch({ type: "INCREMENT_SCORE" });
          }
        }
        // MENSAJES PARA EL TABLERO Y HEADER 
        else if (message.fruits && message.board && message.fruitType && message.currentType) {
          // Actualizar el estado del tablero y las frutas
          boardDispatch({ type: "SET_BOARD", payload: message.board });
          fruitBarDispatch({ type: "SET_ACTUAL_FRUIT", payload: message.currentType });
        } else if (message.enemyId && message.coordinates && message.direction) {
          // Manejar el movimiento de un enemigo
          boardDispatch({ type: "MOVE_ENEMY", payload: message });
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };
  }, [ws]);

  // Puedes exponer sendMessage por contexto si lo necesitas en los hijos
  return <>{children}</>;
}