import { useEffect, useRef, useState } from "react";
import { ws, sendMessage } from "~/services/websocket";
import "./IceCream.css";
import type { BoardCell } from "../../../../../contexts/game/types/types";

type IceCreamProps = {
  playerInformation: BoardCell
  playerColor: string;
  hostIsAlive: boolean;
  setHostIsAlive: (isAlive: boolean) => void;
  guestIsAlive: boolean;
  setGuestIsAlive: (isAlive: boolean) => void;
  hostId: string;
  guestId: string;
  matchId: string;
};

export default function IceCream({ 
    playerInformation, playerColor, 
    hostIsAlive, setHostIsAlive, 
    guestIsAlive, setGuestIsAlive, 
    hostId, guestId, matchId}: IceCreamProps) {
  const [direction, setDirection] = useState(playerInformation.character?.orientation);
  const [xPosition, setxPosition] = useState(playerInformation.x);
  const [yPosition, setyPosition] = useState(playerInformation.y);  
  const holdTimeout = useRef<NodeJS.Timeout | null>(null);
  const moveInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Escuchar mensajes del WebSocket
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.message === "element move" && data.id === playerInformation.character?.id) {
          setxPosition(data.xPosition);
          setyPosition(data.yPosition);        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    if (ws) {
      ws.addEventListener("message", handleMessage);
    }

    return () => {
      if (ws) {
        ws.removeEventListener("message", handleMessage);
      }
    };
  }, [playerInformation]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return; // Evita múltiples activaciones inmediatas

      let newDirection: string | null = null;
      switch (event.key) {
        case "ArrowUp":
          newDirection = "up";
          break;
        case "ArrowDown":
          newDirection = "down";
          break;
        case "ArrowLeft":
          newDirection = "left";
          break;
        case "ArrowRight":
          newDirection = "right";
          break;
        default:
          return;
      }

      // Si la dirección cambió, actualizarla
      if (newDirection !== direction) {
        sendMessage({ type: "player_set_direction", direction: newDirection });
        setDirection(newDirection);
      }

      // Esperar 500ms para enviar el primer mensaje
      holdTimeout.current = setTimeout(() => {
        sendMessage({ type: "player_move", direction: newDirection });

        // Después del primer mensaje, iniciar el envío repetitivo cada 200ms
        moveInterval.current = setInterval(() => {
          sendMessage({ type: "player_move", direction: newDirection });
        }, 200);
      }, 500);
    };

    const handleKeyUp = () => {
      if (holdTimeout.current) {
        clearTimeout(holdTimeout.current);
        holdTimeout.current = null;
      }
      if (moveInterval.current) {
        clearInterval(moveInterval.current);
        moveInterval.current = null;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [direction]);

  return (
    <div className="IceCream" style={{ left: `${playerInformation.x * 40}px`, top: `${playerInformation.y * 40}px` }}>
      <img src={`/assets/player-${playerInformation.character?.id}.webp`} alt={`Player ${playerInformation.character?.id}`} />
    </div>
  );
}
