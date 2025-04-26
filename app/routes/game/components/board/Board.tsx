import { useState, useEffect, useRef, useCallback } from "react";
import IceCream from "./ice-cream/IceCream";
import IceCreamController from "./ice-cream/iceCreamController/IceCreamController";
import Fruit from "./fruit/Fruit";
import Troll from "./enemy/Troll";
import IceBlock from "./ice-block/IceBlock";
import type {  BoardCell, UserInformation } from "../../../../contexts/game/types/types";
import { useBoard } from "~/contexts/game/Board/BoardContext";
import { useFruitBar } from "~/contexts/game/FruitBar/FruitBarContext";
import { useUsers } from "~/contexts/UsersContext";
import { useGameWebSocket } from "~/routes/game/GameWebSocketProvider";
import { closeWebSocket } from "~/services/websocket";
import "./Board.css";

export default function Board() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cellSize, setCellSize] = useState(0);
  const [isBackgroundLoaded, setIsBackgroundLoaded] = useState(false);
  const {state: usersState} = useUsers();
  
  const { state: boardState } = useBoard();
  const fruits = boardState.fruits;
  const iceBlocks = boardState.iceBlocks;
  const enemies = boardState.enemies;
  const iceCreams = [usersState.mainUser, usersState.secondaryUser];
  const { state: fruitBarState } = useFruitBar();
  const { connectWebSocket } = useGameWebSocket();


  useEffect(() => {
    const setupCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
  
      const boardElement = canvas.parentElement;
      if (!boardElement) return;
  
      // Usa getBoundingClientRect para obtener el tamaño real
      const rect = boardElement.getBoundingClientRect();
      const size = Math.min(rect.width, rect.height);
  
      canvas.width = size;
      canvas.height = size;
  
      const cell = size / 16;
      setCellSize(cell);

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'rgba(5, 206, 241, 0.8)';
        ctx.fillRect(0, 0, size, size);

        const bgImage = new Image();
        bgImage.src = "/fondo mapa.png";

        bgImage.onload = () => {
          const scale = Math.max(
            size / bgImage.width,
            size / bgImage.height
          );
          const scaledWidth = bgImage.width * scale;
          const scaledHeight = bgImage.height * scale;
          const offsetX = (size - scaledWidth) / 2;
          const offsetY = (size - scaledHeight) / 2;

          ctx.clearRect(0, 0, size, size);
          ctx.drawImage(
            bgImage,
            offsetX, offsetY,
            scaledWidth, scaledHeight
          );

          ctx.fillStyle = 'rgba(0, 10, 30, 0.0)';
          ctx.fillRect(0, 0, size, size);

          setIsBackgroundLoaded(true);
        };

        bgImage.onerror = () => {
          console.error('Error al cargar la imagen de fondo');
          setIsBackgroundLoaded(true);
        };
      }
    };
    closeWebSocket(); // Cierra cualquier conexión WebSocket existente
    connectWebSocket();

    setupCanvas();
    window.addEventListener('resize', setupCanvas);

    return () => {
      window.removeEventListener('resize', setupCanvas);
    };
  }, []);


  const getElementsStyles = (x: number, y: number, size: number) => ({
    position: 'absolute' as const,
    left: `${x * size}px`,
    top: `${y * size}px`,
    width: `${size}px`,
    height: `${size}px`,
  });

  const renderFruits = () => {
    return fruits.map((fruit: BoardCell) => {
      if (!fruit.item || !fruit.item.id) return null;
      const style = getElementsStyles(fruit.y, fruit.x, cellSize);
      return (
        <div key={fruit.item.id} style={style}>
          <Fruit fruitInformation={fruit} subtype={fruitBarState.actualFruit} />
        </div>
      );
    });
  };

  const renderIceBlocks = () => {
    return iceBlocks.map((block: BoardCell) => {
      if (!block.item || block.item.id) return null;
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
      if (!enemy.character || !enemy.character.id) return null;
      const style = getElementsStyles(enemy.y, enemy.x, cellSize);
      return (
        <div key={enemy.character.id} style={style}>
          <Troll trollInformation={enemy} />
        </div>
      );
    });
  };

  const renderIceCreams = () => {
    return iceCreams.map((iceCream: UserInformation) => {
      if (!iceCream.id) return null;
      const style = getElementsStyles(iceCream.position.y, iceCream.position.x, cellSize);
      return (
        <div key={iceCream.id} style={style}>
          <IceCream {...iceCream} />
        </div>
      );
    });
  };

  return (
    <div
    className="board"
    style={{
    position: "relative",
    width: "90vw",         // O un valor fijo como "700px"
    height: "90vw",        // O usa "min(90vw, 70vh)" para cuadrado responsivo
    maxWidth: "700px",
    maxHeight: "700px",
    margin: "0 auto"
  }}> 
      <canvas
        ref={canvasRef}
        className={`board-canvas ${isBackgroundLoaded ? "loaded" : "loading"}`}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
        }}
      />
      {cellSize > 0 && <IceCreamController />}
      {cellSize > 0 && renderEnemies()}
      {cellSize > 0 && renderIceBlocks()}
      {cellSize > 0 && renderFruits()}
      {cellSize > 0 && renderIceCreams()}
    </div>
  );
}
