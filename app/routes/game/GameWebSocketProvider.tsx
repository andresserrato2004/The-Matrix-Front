import React, { useEffect } from "react";
import type { ReactNode } from "react";
import { useHeader } from "../../contexts/game/Header/HeaderContext";
import { useBoard } from "../../contexts/game/Board/BoardContext";
import { useFruitBar } from "../../contexts/game/FruitBar/FruitBarContext";
import { useUser } from "~/contexts/user/userContext";
import { ws } from "~/services/websocket";

export function GameWebSocketProvider({ children }: { children: ReactNode }) {
  const { dispatch: headerDispatch } = useHeader();
  const { dispatch: boardDispatch } = useBoard();
  const { dispatch: fruitBarDispatch } = useFruitBar();
  const { userData, secondaryUserData, setSecondaryUserData } = useUser();


  useEffect(() => {
    if (!ws) return;
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
        } else if (message.id && message.coordinates && message.direction) {
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
        }
        // MENSAJES PARA EL TABLERO
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };
  }, [headerDispatch, boardDispatch, fruitBarDispatch]);

  // Puedes exponer sendMessage por contexto si lo necesitas en los hijos
  return <>{children}</>;
}