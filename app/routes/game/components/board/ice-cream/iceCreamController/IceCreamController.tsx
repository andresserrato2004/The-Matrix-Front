import { useEffect, useRef } from "react";
import { useGameWebSocket } from "~/routes/game/GameWebSocketProvider";
import { useUsers } from "~/contexts/UsersContext";

const MOVE_INTERVAL = 120; // ms entre movimientos continuos

export default function PlayerController() {
  const { sendMessage } = useGameWebSocket();
  const { state: usersState } = useUsers();

  const moveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pressedKeyRef = useRef<string | null>(null);

  // Helper para saber si el jugador está "vivo"
  const isAlive = usersState.mainUser.state !== "dead";

  useEffect(() => {
    if (!isAlive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const direction = getDirectionFromKey(e.key);
      if (!direction) return;

      // Si ya está presionada, ignora (evita múltiples intervalos)
      if (pressedKeyRef.current === direction) return;
      pressedKeyRef.current = direction;

      // Envío inmediato para cambio de dirección
      sendMessage({ type: "changeDirection", direction });

      // Envío repetido para movimiento continuo
      moveIntervalRef.current = setInterval(() => {
        sendMessage({ type: "move", direction });
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