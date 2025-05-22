import { useEffect, useRef, useCallback } from "react";
import { useGameWebSocket } from "~/contexts/game/GameWebSocketProvider";
import { useUsers } from "~/contexts/UsersContext";

const MOVE_COOLDOWN = 780; // Match the animation duration from IceCream.css
const KEY_REPEAT_DELAY = 500; // Delay before key repeat starts
const KEY_REPEAT_INTERVAL = 500; // Interval between repeated key events


export default function IceCreamController() {
  const { sendMessage } = useGameWebSocket();
  const { state: usersState } = useUsers();

  const moveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pressedKeyRef = useRef<string | null>(null);
  const lastMoveTimeRef = useRef<number>(0);
  const keyRepeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper para saber si el jugador está "vivo"
  const isAlive = usersState.mainUser.state !== "dead";
  const canMakeMovements = usersState.gameState === "playing";

  // Function to send move message, respecting cooldown
  const trySendMove = useCallback((direction: "up" | "down" | "left" | "right") => {
    const now = Date.now();
    if (now - lastMoveTimeRef.current >= MOVE_COOLDOWN) {
      //console.log("Sending move:", direction);
      sendMessage({ type: "movement", payload: direction });
      lastMoveTimeRef.current = now;
      return true;
    }
    return false;
  }, [sendMessage]);

  // Handle key repeat
  const handleKeyRepeat = useCallback(() => {
    if (!pressedKeyRef.current || !isAlive || !canMakeMovements) return;
    
    const direction = pressedKeyRef.current as "up" | "down" | "left" | "right";
    if (trySendMove(direction)) {
      keyRepeatTimeoutRef.current = setTimeout(handleKeyRepeat, KEY_REPEAT_INTERVAL);
    }
  }, [isAlive, canMakeMovements, trySendMove]);

  // Handle key down
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isAlive || !canMakeMovements) return;

    if (event.code === "Space" || event.key === " " || event.key === "Spacebar") {
      //console.log("Space key pressed");
        sendMessage({ type: "exec-power", payload: "power-execution" });
        return;
      }
    const key = event.key.toLowerCase();
    let direction: "up" | "down" | "left" | "right" | null = null;

    switch (key) {
      case "arrowup":
      case "w":
        direction = "up";
        break;
      case "arrowdown":
      case "s":
        direction = "down";
        break;
      case "arrowleft":
      case "a":
        direction = "left";
        break;
      case "arrowright":
      case "d":
        direction = "right";
        break;
    }

    if (direction && direction !== pressedKeyRef.current) {
      pressedKeyRef.current = direction;
      trySendMove(direction);

      // Start key repeat after delay
      if (keyRepeatTimeoutRef.current) {
        clearTimeout(keyRepeatTimeoutRef.current);
      }
      keyRepeatTimeoutRef.current = setTimeout(handleKeyRepeat, KEY_REPEAT_DELAY);
    }
  }, [isAlive, canMakeMovements, trySendMove, handleKeyRepeat, sendMessage]);

  // Handle key up
  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    if (
      (key === "arrowup" || key === "w") && pressedKeyRef.current === "up" ||
      (key === "arrowdown" || key === "s") && pressedKeyRef.current === "down" ||
      (key === "arrowleft" || key === "a") && pressedKeyRef.current === "left" ||
      (key === "arrowright" || key === "d") && pressedKeyRef.current === "right"
    ) {
      pressedKeyRef.current = null;
      if (keyRepeatTimeoutRef.current) {
        clearTimeout(keyRepeatTimeoutRef.current);
        keyRepeatTimeoutRef.current = null;
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (keyRepeatTimeoutRef.current) {
        clearTimeout(keyRepeatTimeoutRef.current);
      }
    };
  }, [handleKeyDown, handleKeyUp]);

  return null;
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