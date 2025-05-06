import { useEffect, useRef, useCallback } from "react";
import { useGameWebSocket } from "~/contexts/game/GameWebSocketProvider";
import { useUsers } from "~/contexts/UsersContext";

// Cooldown period in milliseconds - adjust to match your animation/transition time
const MOVE_COOLDOWN = 200; // e.g., 200ms cooldown

export default function PlayerController() {
  const { sendMessage } = useGameWebSocket();
  const { state: usersState } = useUsers();

  const moveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pressedKeyRef = useRef<string | null>(null);
  const lastMoveTimeRef = useRef<number>(0); // Track the timestamp of the last sent move

  // Helper para saber si el jugador está "vivo"
  const isAlive = usersState.mainUser.state !== "dead";
  const canMakeMovements = usersState.gameState === "playing";

  // Function to send move message, respecting cooldown
  const trySendMove = useCallback((direction: "up" | "down" | "left" | "right") => {
    const now = Date.now();
    if (now - lastMoveTimeRef.current >= MOVE_COOLDOWN) {
      console.log("Enviando mensaje de movimiento:", direction);
      sendMessage({ type: "movement", payload: direction });
      lastMoveTimeRef.current = now; // Update last move time
      return true; // Indicate that the message was sent
    }
    console.log("Movimiento ignorado (cooldown activo)");
    return false; // Indicate that the message was blocked by cooldown
  }, [sendMessage]);

  useEffect(() => {
    if (!isAlive || !canMakeMovements) {
      // Clear interval if player can no longer move
      if (moveIntervalRef.current) {
        clearInterval(moveIntervalRef.current);
        moveIntervalRef.current = null;
      }
      pressedKeyRef.current = null; // Reset pressed key
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      const direction = getDirectionFromKey(e.key);
      if (!direction) { return };

      // Prevent re-triggering if the same key is already held down
      if (pressedKeyRef.current === direction) { return };

      // Attempt to send the first move immediately
      const sent = trySendMove(direction);

      // Only set up interval if the first move was successful
      if (sent) {
        pressedKeyRef.current = direction; // Set the currently pressed key

        // Clear any existing interval before starting a new one
        if (moveIntervalRef.current) {
          clearInterval(moveIntervalRef.current);
        }

        // Start interval for continuous movement while key is held
        moveIntervalRef.current = setInterval(() => {
          // Inside interval, also respect the cooldown
          trySendMove(direction);
        }, MOVE_COOLDOWN); // Interval matches cooldown for smoother continuous move
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const direction = getDirectionFromKey(e.key);
      // Only clear if the released key is the one currently tracked as pressed
      if (direction && pressedKeyRef.current === direction) {
        pressedKeyRef.current = null;
        if (moveIntervalRef.current) {
          clearInterval(moveIntervalRef.current);
          moveIntervalRef.current = null;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Cleanup function
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (moveIntervalRef.current) {
        clearInterval(moveIntervalRef.current);
      }
    };
  }, [isAlive, canMakeMovements, trySendMove]); // Include trySendMove in dependencies

  return null; // This component doesn't render anything
}

// Helper function remains the same
function getDirectionFromKey(key: string): "up" | "down" | "left" | "right" | null {
  switch (key.toLowerCase()) { // Use toLowerCase for case-insensitivity
    case "arrowup":
    case "w":
      return "up";
    case "arrowdown":
    case "s":
      return "down";
    case "arrowleft":
    case "a":
      return "left";
    case "arrowright":
    case "d":
      return "right";
    default:
      return null;
  }
}