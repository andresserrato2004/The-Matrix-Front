import { useEffect, createContext, useContext, useCallback, useState, useRef } from "react";
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
  // intentos de reconexión
  const reconnectAttempts = useRef(0);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);


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
        usersDispatch({
            type: "SET_GAME_STATE",
            payload: "lost-connection"
          });
        if (reconnectAttempts.current < 10) { // 10 intentos * 2 segundos = 20 segundos
          reconnectAttempts.current += 1;
          console.warn(`WebSocket cerrado inesperadamente. Intentando reconectar (Intento ${reconnectAttempts.current}/10)`);
          reconnectTimeout.current = setTimeout(() => {
            connectWebSocket();
            sendMessage({type: "update-all", payload: ""}); // Enviar mensaje de reconexión
          }, 2000); // 2 segundos
        } else {
          console.error("No se pudo reconectar después de 1 minuto.");
        }
      }
    };

    ws.onerror = (event) => {
      console.error("WebSocket error:", event);
    };
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log("Received message from gameWebSocket: ", message);
        // MENSAJES PARA EL HEADER
        if (message.type === "update-time") {
          headerDispatch({ type: "SET_MINUTES", payload: message.payload.minutesLeft });
          headerDispatch({ type: "SET_SECONDS", payload: message.payload.secondsLeft });
        }
        else if (message.type === "update-move") {
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
            // Manejar el consumo de una fruta
            console.log("Removing fruit with ID:", message.payload.idItemConsumed);
            headerDispatch({ type: "INCREMENT_SCORE" });
            boardDispatch({ type: "DELETE_FRUIT", payload: message.payload.idItemConsumed });
          }
        }
        // MENSAJES PARA EL TABLERO Y HEADER 
        else if (message.type === "update-enemy") {
          // Manejar el movimiento de un enemigo
          boardDispatch({ type: "MOVE_ENEMY", payload: message.payload });
        }
        // MENSAJE DE ESTADO DEL JUEGO
        else if (message.type === "end") {
          // Manejar el resultado del juego
          usersDispatch({
            type: "SET_GAME_STATE",
            payload: message.payload.result
          });
        }
        // MENSAJE DE FRUTAS
        else if (message.type === "update-fruits") {
          console.log("Nueva ronda de frutas puesta: ", message);
          boardDispatch({ type: "SET_FRUITS", payload: message.payload.cells });
          fruitBarDispatch({ type: "SET_ACTUAL_FRUIT", payload: message.payload.fruitType });
        }
        // MENSAJE DE BLOQUES DE HIELO
        else if (message.type === "update-frozen-cells") {
          console.log("Bloques de hielo actualizados: ");
          boardDispatch({ 
            type: "UPDATE_ICE_BLOCKS", 
            payload: {
              cells: message.payload.cells,
              actualFruit: fruitBarState.actualFruit,
            }
        });
        }
        // MENSAJE DE RECONEXIÓN
        else if (message.type === "update-all") {
          // Actualizar el tiempo
          headerDispatch({ type: "SET_MINUTES", payload: message.payload.time.minutesLeft });
          headerDispatch({ type: "SET_SECONDS", payload: message.payload.time.secondsLeft });
          // Actualizar el estado de los jugadores
          const host = message.payload.players[0];
          const guest = message.payload.players[1];
          const isMainUserHost = host.id === usersState.mainUser.id;
          usersDispatch({
            type: "SET_MAIN_USER",
            payload: {
              ...usersState.mainUser,
              state: isMainUserHost ? host.state : guest.state,
              flavour: isMainUserHost ? host.color : guest.color,
            }
          });
          usersDispatch({
            type: "SET_SECONDARY_USER",
            payload: {
              ...usersState.secondaryUser,
              state: !isMainUserHost ? host.state : guest.state,
              flavour: !isMainUserHost ? host.color : guest.color,
            }
          });
          // Actualizar la fruta actual
          // Actualizar el estado del tablero
          boardDispatch({ type: "SET_BOARD", payload: message.payload.cells });
          // Actualizar el estado de la partida
          usersDispatch({
            type: "SET_GAME_STATE",
            payload: "playing"
          });
        }
        // MENSAJE DE FRUTA ESPECIAL
        else if (message.type === "update-special-fruit") {
          // Actualizar el estado de la fruta especial
          console.log("Fruta especial actualizada: ", message);
          boardDispatch({ type: "UPDATE_SPECIAL_FRUIT", payload: message.payload });
        }
        else if (message.type === "paused") {
          usersDispatch({
            type: "SET_GAME_STATE",
            payload: message.payload === true ? "paused" : "playing"
          });
          headerDispatch({ type: "SET_IS_RUNNING", payload: !message.payload });
        }
        else {
          console.warn("Mensaje no reconocido:", message);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error, "on message: ", event.data);
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