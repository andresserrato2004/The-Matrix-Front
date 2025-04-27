import { useEffect, useRef } from "react";
import { useGameWebSocket } from "~/contexts/game/GameWebSocketProvider";
import { useUsers } from "~/contexts/UsersContext";
import type { MovementMessage } from "~/contexts/game/types/outputMessage";

const MOVE_INTERVAL = 500; // ms entre movimientos continuos

export default function PlayerController() {
  const { sendMessage } = useGameWebSocket();
  const { state: usersState } = useUsers();

  const moveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pressedKeyRef = useRef<string | null>(null);

  // Helper para saber si el jugador está "vivo"
  const isAlive = usersState.mainUser.state !== "dead";
  const canMakeMovements = usersState.gameState === "playing";

  useEffect(() => {
    if (!isAlive || !canMakeMovements) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const direction = getDirectionFromKey(e.key);
      if (!direction) return;

      // Si ya está presionada, ignora (evita múltiples intervalos)
      if (pressedKeyRef.current === direction) return;
      pressedKeyRef.current = direction;

      // Envío inmediato para cambio de dirección
      console.log("Enviando mensaje de movimiento:", direction);
      sendMessage({ type: "movement", payload: direction });

      // Envío repetido para movimiento continuo
      moveIntervalRef.current = setInterval(() => {
        console.log("Enviando mensaje de movimiento continuo:", direction);
        sendMessage({ type: "movement", payload: direction });
      }, MOVE_INTERVAL);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const direction = getDirectionFromKey(e.key);
      if (!direction) return;

      pressedKeyRef.current = null;
      if (moveIntervalRef.current) {
        clearInterval(moveIntervalRef.current);
        moveIntervalRef.current = null;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (moveIntervalRef.current) clearInterval(moveIntervalRef.current);
    };
  }, [isAlive, sendMessage]);

  return null;
}

// Helper para traducir teclas a direcciones
function getDirectionFromKey(key: string): "up" | "down" | "left" | "right" | null {
  switch (key) {
    case "ArrowUp":
    case "w":
    case "W":
      return "up";
    case "ArrowDown":
    case "s":
    case "S":
      return "down";
    case "ArrowLeft":
    case "a":
    case "A":
      return "left";
    case "ArrowRight":
    case "d":
    case "D":
      return "right";
    default:
      return null;
  }
}