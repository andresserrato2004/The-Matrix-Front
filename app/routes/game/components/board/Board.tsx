import { useState, useEffect, useRef, useCallback } from "react";
import IceCream from "./ice-cream/IceCream";
import Fruit from "./fruit/Fruit";
import Troll from "./enemy/Troll";
import IceBlock from "./ice-block/IceBlock";
import "./Board.css";
import type { Character, BoardCell, Item } from "../../../../contexts/game/types/types";
import { useUser } from "~/contexts/user/userContext";
import { createWebSocketConnection, sendMessage, ws } from "~/services/websocket";



// TODO porner las interfaces en un archivo separado

interface GameMessageInput {
  type: 'movement' | 'exec-power' | 'rotate' | 'set-color';
  payload: 'up' | 'down' | 'left' | 'right' | string;
}

type BoardProps = {
  boardData: BoardCell[];
  matchId: string;
  hostId: string;
  guestId: string;
  hostIsAlive: boolean;
  setHostIsAlive: (isAlive: boolean) => void;
  guestIsAlive: boolean;
  setGuestIsAlive: (isAlive: boolean) => void;
  backgroundImage?: string;
  actualFruit: string;
  setActualFruit: (fruit: string) => void;
  fruitsCounter: number;
  setFruitsCounter: (count: number) => void;
  setMinutes: (minutes: number) => void;
  setSeconds: (seconds: number) => void;
};

export default function Board({
  boardData,
  matchId,
  hostId,
  guestId,
  hostIsAlive,
  setHostIsAlive,
  guestIsAlive,
  setGuestIsAlive,
  backgroundImage = "/fondo mapa.png",
  actualFruit,
  setActualFruit,
  fruitsCounter,
  setFruitsCounter,
  setMinutes,
  setSeconds
}: BoardProps) {
  // Referencia al canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gridSize, setGridSize] = useState({ width: 0, height: 0 });
  const [cellSize, setCellSize] = useState(0);
  const [isBackgroundLoaded, setIsBackgroundLoaded] = useState(false);
  const { userData, secondaryUserData, setSecondaryUserData } = useUser();

  // Estado para el helado controlable
  const [playerDirection, setPlayerDirection] = useState("down");

  const [playerPosition, setPlayerPosition] = useState({ x: userData?.position[0], y: userData?.position[1] }); // Posición inicial en medio del tablero
  const [isMoving, setIsMoving] = useState(false);

  // Usamos una referencia para el estado de movimiento en lugar de un estado
  // Esto evita problemas de sincronización con los event listeners
  const isMovingRef = useRef(false);

  // informacion del tablero
  const [fruits, setFruits] = useState<BoardCell[]>([]);
  const [iceBlocks, setIceBlocks] = useState<BoardCell[]>([]);
  const [enemies, setEnemies] = useState<BoardCell[]>([]);
  const [iceCreams, setIceCreams] = useState<BoardCell[]>([]);

  // Cargar información del tablero desde el WebSocket
  useEffect(() => {
    setFruits(boardData.filter(cell => cell.item?.type === 'fruit'));
    setEnemies(boardData.filter(cell => cell.character?.type === 'troll'));
    setIceBlocks(boardData.filter(cell => cell.item?.type === 'block'));
    setIceCreams(boardData.filter(cell => cell.character?.type === 'iceCream'));
  }, [boardData]);

  // Inicializar y configurar el canvas
  useEffect(() => {
    const setupCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Determinar el tamaño del canvas basado en el contenedor
      const boardElement = canvas.parentElement;
      if (!boardElement) return;

      // Obtener el tamaño del board y hacerlo cuadrado (el más pequeño entre ancho y alto)
      const boardWidth = boardElement.clientWidth;
      const boardHeight = boardElement.clientHeight;
      const size = Math.min(boardWidth, boardHeight) * 0.95; // 95% para dejar un pequeño margen

      // Actualizar tamaño del canvas
      canvas.width = size;
      canvas.height = size;

      // Calcular tamaño de celda
      const cell = size / 16;
      setCellSize(cell);
      setGridSize({ width: size, height: size });

      // Dibujar imagen de fondo en el canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Dibujar un color base mientras carga la imagen
        ctx.fillStyle = 'rgba(5, 206, 241, 0.8)'; // Un azul oscuro semi-transparente
        ctx.fillRect(0, 0, size, size);

        // Cargar la imagen de fondo
        const bgImage = new Image();
        bgImage.src = backgroundImage;

        bgImage.onload = () => {
          // Opción que mantiene la proporción y centra la imagen
          const scale = Math.max(
            size / bgImage.width,
            size / bgImage.height
          );
          const scaledWidth = bgImage.width * scale;
          const scaledHeight = bgImage.height * scale;
          const offsetX = (size - scaledWidth) / 2;
          const offsetY = (size - scaledHeight) / 2;

          // Limpiar el canvas
          ctx.clearRect(0, 0, size, size);

          // Dibujar la imagen con las dimensiones calculadas
          ctx.drawImage(
            bgImage,
            offsetX, offsetY,
            scaledWidth, scaledHeight
          );

          // Aplicar un overlay para dar efecto de profundidad
          ctx.fillStyle = 'rgba(0, 10, 30, 0.0)'; // Azul muy oscuro semi-transparente
          ctx.fillRect(0, 0, size, size);

          setIsBackgroundLoaded(true);
        };

        bgImage.onerror = () => {
          console.error('Error al cargar la imagen de fondo');
          // Mantener el color base como fallback
          setIsBackgroundLoaded(true);
        };
      }
    };

    // Configurar canvas inicial

    createWebSocketConnection(`/ws/game/${userData?.userId}/${userData?.matchId}`);
    setupCanvas();

    // Reconfigurarlo si cambia el tamaño de la ventana
    window.addEventListener('resize', setupCanvas);

    return () => {
      window.removeEventListener('resize', setupCanvas);
    };
  }, [backgroundImage]);


  useEffect(() => {
    // Configurar el manejador de mensajes del WebSocket
    if (ws) {
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          // Verificar si el mensaje contiene datos del jugador
          console.log("Received message: ", message);
          if (message.id && message.coordinates && message.direction) {
            console.log("Received player update:", message);
            console.log(message.coordinates, message.coordinates[1])

            // Actualizar el usuario correspondiente
            if (message.id === userData?.userId) {
              console.log("Updating main player position:", message.coordinates);
              // Actualizar al usuario principal
              setPlayerPosition({ x: message.coordinates.x, y: message.coordinates.y });
              setPlayerDirection(message.direction);
            } else if (message.id === secondaryUserData?.userId) {
              // Actualizar al usuario secundario
              setSecondaryUserData({
                ...secondaryUserData,
                position: message.coordinates,
                direction: message.direction,
              });
            }
            if (message.idItemConsumed) {
              console.log("Removing fruit with ID:", message.idItemConsumed);
              removeFruit(message.idItemConsumed);
              setFruitsCounter(fruitsCounter + 1);
            }
          }
          else if (message.minutesLeft && message.secondsLeft) {
            // Actualizar el temporizador del juego
            setMinutes(message.minutesLeft);
            setSeconds(message.secondsLeft);
          }
          else if (message.fruits && message.board && message.fruitsType && message.currentRound) {
            setActualFruit(message.fruitsType);
            for (const cell of message.board) {
              if (cell.item?.type === 'fruit') {
                addFruit(cell);
              }
            }
          }
          else if (message.enemyId && message.coordinates && message.direction) {
            updateEnemy(message.enemyId, message.coordinates.y, message.coordinates.x, message.direction);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };
    }
  }, [ws, userData?.userId, secondaryUserData, setSecondaryUserData]);

  // Lógica para mover el helado con el teclado
  useEffect(() => {
    // Función para mover el helado
    const movePlayer = (direction: string) => {
      // Verificar si ya está en movimiento
      if (isMovingRef.current) return;


      const directionPayload = direction as 'up' | 'down' | 'left' | 'right';

      console.log("Sending movement message:", directionPayload);

      if (ws && ws.readyState === WebSocket.OPEN) {
        const message: GameMessageInput = {
          type: 'movement',
          payload: directionPayload,
        };
        sendMessage(message);
      } else {
        // WebSocket is closed or not connected
        console.log("WebSocket is not connected or closed (readyState:", ws?.readyState, "). Reconnecting...");

        // Create a new WebSocket connection
        const newWs = createWebSocketConnection(`/ws/game/${userData?.userId}/${userData?.matchId}`);

        // Use setTimeout to allow the connection to establish before sending
        setTimeout(() => {
          if (newWs && newWs.readyState === WebSocket.OPEN) {
            const message: GameMessageInput = {
              type: 'movement',
              payload: directionPayload,
            };
            sendMessage(message);
          }
        }, 500); // Give it 500ms to connect
      }


      // Enviar mensaje por WebSocket

      // Marcar como en movimiento
      isMovingRef.current = true;
      setIsMoving(true);

      // Establecer la dirección
      setPlayerDirection(direction);

      // Calcular nueva posición
      setPlayerPosition(prev => {
        const newPos = { ...prev };

        switch (direction) {
          case 'up':
            newPos.y = Math.max(0, prev.y - 1);
            break;
          case 'down':
            newPos.y = Math.min(15, prev.y + 1);
            break;
          case 'left':
            newPos.x = Math.max(0, prev.x - 1);
            break;
          case 'right':
            newPos.x = Math.min(15, prev.x + 1);
            break;
        }

        return newPos;
      });

      // Liberar el movimiento después de completar la animación
      setTimeout(() => {
        isMovingRef.current = false;
        setIsMoving(false);
      }, 400); // Este valor debe coincidir con la duración de la transición CSS
    };

    // Manejador de teclas presionadas
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignorar repeticiones automáticas
      if (event.repeat) return;

      // Si está en movimiento, no hacer nada
      if (isMovingRef.current) return;

      let direction = '';
      switch (event.key) {
        case "ArrowUp":
        case "w":
        case "W":
          direction = 'up';
          break;
        case "ArrowDown":
        case "s":
        case "S":
          direction = 'down';
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          direction = 'left';
          break;
        case "ArrowRight":
        case "d":
        case "D":
          direction = 'right';
          break;
        default:
          return;
      }

      movePlayer(direction);
    };

    // Agregar listeners para eventos de teclado
    window.addEventListener('keydown', handleKeyDown);

    // Asegurarse de que el estado de movimiento esté sincronizado al inicio
    isMovingRef.current = isMoving;

    // Limpieza al desmontar
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [userData?.userId, userData?.matchId]); // Sin dependencias para evitar recrear el efecto

  // Crear la grilla de 16x16
  const renderGrid = () => {
    const grid = [];

    // Generar celdas vacías para la grilla
    for (let row = 0; row < 16; row++) {
      for (let col = 0; col < 16; col++) {
        grid.push(
          <div
            key={`cell-${row}-${col}`}
            className="grid-cell"
            style={{
              position: 'absolute',
              left: `${col * cellSize}px`,
              top: `${row * cellSize}px`,
              width: `${cellSize}px`,
              height: `${cellSize}px`,
              border: '1px solid rgba(255, 255, 255, 0.0)',
              boxSizing: 'border-box',
            }}
          />
        );
      }
    }

    return grid;
  };

  const getElementsStyles = (x: number, y: number, size: number) => ({
    position: 'absolute' as const,
    left: `${x * size}px`,
    top: `${y * size}px`,
    width: `${size}px`,
    height: `${size}px`,
  });

  const renderFruits = () => {
    return fruits.map((fruit: BoardCell) => {
      if (!fruit.item) return null; // Asegúrate de que el item exista
      const style = getElementsStyles(fruit.y, fruit.x, cellSize);
      return (
        <div key={fruit.item.id} style={style}>
          <Fruit fruitInformation={fruit} subtype={actualFruit} />
        </div>
      );
    });
  };

  const renderIceBlocks = () => {
    return iceBlocks.map((block: BoardCell) => {
      if (!block.item) return null; // Asegúrate de que el item exista
      const style = getElementsStyles(block.y, block.x, cellSize);
      return (
        <div key={block.item.id} style={style}>
          <IceBlock blockInformation={block} />
        </div>
      );
    });
  };

  const renderEnemies = () => {
    return enemies.map((enemy: BoardCell) => {
      if (!enemy.character) return null; // Asegúrate de que el item exista
      const style = getElementsStyles(enemy.y, enemy.x, cellSize);
      return (
        <div key={enemy.character.id} style={style}>
          <Troll trollInformation={enemy} />
        </div>
      );
    });
  };

  const renderIceCreams = () => {
    return iceCreams.map((iceCream: BoardCell) => {
      if (!iceCream.character) return null; // Asegúrate de que el item exista
      const style = getElementsStyles(iceCream.y, iceCream.x, cellSize);
      return (
        <div key={iceCream.character.id} style={style}>
          <IceCream
            playerInformation={iceCream}
            playerColor={actualFruit}
            hostIsAlive={hostIsAlive} setHostIsAlive={setHostIsAlive}
            guestIsAlive={guestIsAlive} setGuestIsAlive={setGuestIsAlive}
            hostId={hostId} guestId={guestId} matchId={matchId}
          />
        </div>
      );
    });
  };

  // FUNCIONES DE FRUTAS
  // --- Elimina una fruit dado su id
  const removeFruit = useCallback((id: string) => {
    console.log("Removing fruit with ID:", id);
    // Eliminar la fruta del estado actual
    setFruits((prev) => prev.filter((cell) => cell.item?.id !== id));
  }, []);

  // --- Añade una fruta
  const addFruit = (newFruitCell: BoardCell) => {
    setFruits(prevFruits => {
      // Verifica si ya existe una fruta en esa posición para evitar duplicados
      const exists = prevFruits.some(
        fruit => fruit.item?.id === newFruitCell.item?.id
      );
      if (!exists) {
        return [...prevFruits, newFruitCell];
      }
      return prevFruits;
    });
  };

  // FUNCIONES DE BLOQUES
  // --- Elimina un bloque de hielo dado su id
  const removeBlock = useCallback((id: string) => {
    setIceBlocks(prev => prev.filter(cell => cell.item?.id !== id));
  }, []);
  const addIceBlock = (newIceBlock: BoardCell) => {
    setIceBlocks(prevIceBlock => {
      // Verifica si ya existe una fruta en esa posición para evitar duplicados
      const exists = prevIceBlock.some(
        iceBlock => iceBlock.item?.id === newIceBlock.item?.id
      );
      if (!exists) {
        return [...prevIceBlock, newIceBlock];
      }
      return prevIceBlock;
    });
  };

  // FUNCIONES DE ENEMIGOS
  // --- Actualiza un enemigo dado su id
  const updateEnemy = useCallback((id: string, newX: number, newY: number, newDirection: String) => {
    setEnemies(prev =>
      prev.map(cell =>
        cell.character?.id === id
          ? {
            ...cell,
            x: newX,
            y: newY,
            character: {
              ...cell.character,
              orientation: newDirection
            }
          }
          : cell
      )
    );
  }, []);

  // FUNCIONES DE HELADOS
  // --- Actualiza un helado dado su id
  const updateIceCream = useCallback((id: string, newX: number, newY: number, newDirection: Direction) => {
    setIceCreams(prev =>
      prev.map(cell =>
        cell.character?.id === id
          ? {
            ...cell,
            x: newX,
            y: newY,
            character: {
              ...cell.character!,
              orientation: newDirection
            }
          }
          : cell
      )
    );
  }, []);


  return (
    <div className="board">
      {/* Canvas para dibujar el fondo */}
      <canvas
        ref={canvasRef}
        className={`board-canvas ${isBackgroundLoaded ? 'loaded' : 'loading'}`}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Grilla de 16x16 */}
      <div
        className="grid-container"
        style={{
          position: 'relative',
          width: `${gridSize.width}px`,
          height: `${gridSize.height}px`,
          margin: '0 auto',
        }}
      >
        {cellSize > 0 && renderGrid()}

        {/* Helado controlable por el usuario */}
        {cellSize > 0 && (
          <div
            className={`player-ice-cream ${playerDirection} ${isMoving ? 'moving' : ''}`}
            style={{
              position: 'absolute',
              left: `${playerPosition.y * cellSize}px`,
              top: `${playerPosition.x * cellSize}px`,
              width: `${cellSize * 1.2}px`, // 20% más grande que una celda
              height: `${cellSize * 1.2}px`,
              zIndex: 10, // Por encima de otras entidades
              transform: 'translate(-10%, -10%)', // Centrar el sprite aumentado
              transition: 'left 0.4s ease-out, top 0.4s ease-out', // Animación suave
            }}
          >
            <img
              src={userData?.imageUrl}
              alt="Player Ice Cream"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                transform: 'none',
                transition: 'transform 0.3s ease-out',
              }}
            />
          </div>
        )}

        {/* Secondary User */}
        {cellSize > 0 && secondaryUserData?.position && (
          <>
            {/* {console.log(
              "Secondary User Position:",
              secondaryUserData.position,
              "Calculated Left:",
              secondaryUserData.position.x * cellSize,
              "Calculated Top:",
              secondaryUserData.position.y * cellSize
            )} */}
            <div
              className="secondary-user"
              style={{
                position: 'absolute',
                left: `${secondaryUserData.position.y * cellSize}px`,
                top: `${secondaryUserData.position.x * cellSize}px`,
                width: `${cellSize * 1.2}px`, // 20% más grande que una celda
                height: `${cellSize * 1.2}px`,
                zIndex: 9, // Por debajo del jugador principal
                transform: 'translate(-10%, -10%)', // Centrar el sprite aumentado
                transition: 'left 0.4s ease-out, top 0.4s ease-out', // Animación suave
              }}
            >
              <img
                src={secondaryUserData.imageUrl || "/vainilla.png"} // Imagen del secondaryUser o una predeterminada
                alt="Secondary User"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  transform: 'none',
                }}
              />
            </div>
          </>
        )}

        {/* Entidades del juego posicionadas en la grilla */}
        {cellSize > 0 && renderEnemies()}
        {cellSize > 0 && renderIceBlocks()}
        {cellSize > 0 && renderFruits()}
        {cellSize > 0 && renderIceCreams()}

      </div>
    </div>
  );
}