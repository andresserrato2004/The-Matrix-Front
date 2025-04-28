import { useEffect, createContext, useContext, useCallback, useState } from "react";
import type { ReactNode, Dispatch } from "react";
import { useHeader } from "./Header/HeaderContext";
import { useBoard } from "./Board/BoardContext";
import { useFruitBar } from "./FruitBar/FruitBarContext";
import { useUsers } from "~/contexts/UsersContext";
import { useUser } from "~/contexts/user/userContext";
import type { OutputMessage } from "~/contexts/game/types/outputMessage";

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || "ws://localhost:3000";

const GameWebSocketContext = createContext<{
  connectWebSocket: () => void;
  sendMessage: (msg: OutputMessage ) => void;
} | undefined>(undefined);

export function GameWebSocketProvider({ children }: { children: ReactNode }) {
  const { dispatch: headerDispatch } = useHeader();
  const { dispatch: boardDispatch } = useBoard();
  const { dispatch: fruitBarDispatch } = useFruitBar();
  const { state: usersState, dispatch: usersDispatch } = useUsers();
  const [ws, setWs] = useState<WebSocket | null>(null);
  
  const { userData, secondaryUserData, setSecondaryUserData } = useUser();

  const connectWebSocket = useCallback(() => {
    if (!userData?.userId || !userData?.matchId) {
      console.warn("No hay datos de usuario o match para conectar WebSocket");
      return;
    }
    // Cierra el anterior si existe
    if (ws) {
      ws.close();
    }
    console.log("Conectando WebSocket desde GameWebSocketProvider...");
    const socket = new WebSocket(`${WS_BASE_URL}/ws/game/${userData.userId}/${userData.matchId}`);
    setWs(socket);
    console.log(ws);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?.userId, userData?.matchId]);

  // Función para enviar mensajes
  const sendMessage = useCallback((msg: OutputMessage) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(typeof msg === "string" ? msg : JSON.stringify(msg));
    } else {
      console.warn("WebSocket no está conectado, no se puede enviar el mensaje.");
    }
  }, [ws]);


  useEffect(() => {
    if (!ws) return;
    console.log("websocket a añadirle eventos ", ws);
    ws.onopen = () => {
      console.log("WebSocket conectado.");
    };

    ws.onclose = (event) => {
      if (event.wasClean) {
        console.log(`WebSocket cerrado limpiamente, código=${event.code}, razón=${event.reason}`);
      } else {
        console.warn("WebSocket cerrado inesperadamente.");
      }
    };

    ws.onerror = (event) => {
      console.error("WebSocket error:", event);
    };
    console.log("añadirle el onmessage al websocket", ws);
    //if (!usersState.mainUser.id || !usersState.secondaryUser.id || !usersState.mainUser.matchId || !usersState.secondaryUser.matchId) return;
    // Crea la conexión SOLO aquí
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
        } 
        else if (message.id && message.coordinates && message.direction && message.state) {
          usersDispatch({
            type: "MOVE_USER",
            payload: {
              playerId: message.id,
              coordinates: message.coordinates,
              direction: message.direction,
              state: message.state,
            }
          }); 
          if (message.idItemConsumed) {
            // Manejar el consumo de una fruta
            console.log("Removing fruit with ID:", message.idItemConsumed);
            headerDispatch({ type: "INCREMENT_SCORE" });
            boardDispatch({ type: "DELETE_FRUIT", payload: message.idItemConsumed });
          }
        }
        // MENSAJES PARA EL TABLERO Y HEADER 
        else if (message.enemyId && message.coordinates && message.direction) {
          // Manejar el movimiento de un enemigo
          boardDispatch({ type: "MOVE_ENEMY", payload: message });
        }
        else if (message.result) {
          // Manejar el resultado del juego
          usersDispatch({
              type: "SET_GAME_STATE",
              payload: message.result
          });
        }
        else if (message.id && message.state) {
          const isHost = message.id === usersState.mainUser.id;
          if (isHost) {
            usersDispatch({
              type: "SET_MAIN_USER",
              payload: {
                ...usersState.mainUser,
                state: message.state,
              },
            });
          }
          else {
            usersDispatch({
              type: "SET_SECONDARY_USER",
              payload: {
                ...usersState.secondaryUser,
                state: message.state,
              },
            });
          }
        }
        else if (message.fruitType && message.fruitsNumber && message.cells && message.currentRound) {
          // Actualizar el estado del tablero y las frutas
          console.log("Nueva ronda de frutas puesta: ", message);
          boardDispatch({ type: "SET_FRUITS", payload: message.cells });
          fruitBarDispatch({ type: "SET_ACTUAL_FRUIT", payload: message.fruitType });
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };
    console.log("eventos añadidos a websocket", ws);
  }, [ws]);

  // Puedes exponer sendMessage por contexto si lo necesitas en los hijos
  return (
    <GameWebSocketContext.Provider value={{ connectWebSocket, sendMessage }}>
      {children}
    </GameWebSocketContext.Provider>
  );
}

export function useGameWebSocket() {
  const ctx = useContext(GameWebSocketContext);
  if (!ctx) throw new Error("useGameWebSocket debe usarse dentro de GameWebSocketProvider");
  return ctx;
}