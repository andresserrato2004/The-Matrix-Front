import { useEffect, createContext, useContext, useCallback, useState } from "react";
import type { ReactNode } from "react";
import { useHeader } from "./Header/HeaderContext";
import { useBoard } from "./Board/BoardContext";
import { useFruitBar } from "./FruitBar/FruitBarContext";
import { useUsers } from "~/contexts/UsersContext";
import { useUser } from "~/contexts/user/userContext";
import type { OutputMessage } from "~/types/outputMessage";

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || "ws://localhost:3000";

const GameWebSocketContext = createContext<{
  connectWebSocket: () => void;
  sendMessage: (msg: OutputMessage) => void;
} | undefined>(undefined);

export function GameWebSocketProvider({ children }: { children: ReactNode }) {
  const { dispatch: headerDispatch } = useHeader();
  const { dispatch: boardDispatch } = useBoard();
  const { state: fruitBarState, dispatch: fruitBarDispatch } = useFruitBar();
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
    console.log(" ...");
    const socket = new WebSocket(`${WS_BASE_URL}/ws/game/${userData.userId}/${userData.matchId}`);
    setWs(socket);
    console.log(ws);
  }, [userData?.userId, userData?.matchId, ws]);

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

        switch (message.type) {
          case "update-time":
            headerDispatch({ type: "SET_MINUTES", payload: message.payload.minutesLeft });
            headerDispatch({ type: "SET_SECONDS", payload: message.payload.secondsLeft });
            break;

          case "update-move":
            usersDispatch({
              type: "MOVE_USER",
              payload: {
                playerId: message.payload.id,
                coordinates: message.payload.coordinates,
                direction: message.payload.direction,
                state: message.payload.state,
              }
            });
            if (message.payload.idItemConsumed) {
              console.log("Removing fruit with ID:", message.payload.idItemConsumed);
              headerDispatch({ type: "INCREMENT_SCORE" });
              boardDispatch({ type: "DELETE_FRUIT", payload: message.payload.idItemConsumed });
            }
            break;

            case "update-enemy":
            boardDispatch({ type: "MOVE_ENEMY", payload: message.payload });
            break;

          case "end":
            usersDispatch({
              type: "SET_GAME_STATE",
              payload: message.payload.result
            });
            break;

          case "update-fruits":
            console.log("Nueva ronda de frutas puesta: ", message);
            boardDispatch({ type: "SET_FRUITS", payload: message.payload.cells });
            fruitBarDispatch({ type: "SET_ACTUAL_FRUIT", payload: message.payload.fruitType });
            break;

          case "update-frozen-cells":
            console.log("Bloques de hielo actualizados: ");
            boardDispatch({
              type: "UPDATE_ICE_BLOCKS",
              payload: {
                cells: message.payload.cells,
                actualFruit: fruitBarState.actualFruit,
              }
            });
            break;

          default:
            console.warn("Tipo de mensaje desconocido:", message.type, message);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error, "on message: ", event.data);
      }
    };
    console.log("eventos añadidos a websocket", ws);
  }, [ws, boardDispatch, fruitBarState.actualFruit, usersDispatch, fruitBarDispatch, headerDispatch]);

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