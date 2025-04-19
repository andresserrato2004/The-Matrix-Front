import { useState, useEffect, lazy, Suspense } from "react";
import { useLocation } from "@remix-run/react";
import LoadingScreen from "~/components/loadingScreen/LoadingScreen";
import type { BoardCell } from "./components/board/types/types";
import "./styles.css";


const Header = lazy(() => import("./components/header/Header"));
const Board = lazy(() => import("./components/board/Board"));
const FruitBar = lazy(() => import("./components/fruit-bar/FruitBar"));

export default function GameScreen() {
  // Estados de carga
  const location = useLocation();
  const [componentsLoaded, setComponentsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Preparando el campo de juego...");
  const [assetProgress, setAssetProgress] = useState(0);
  const [componentProgress, setComponentProgress] = useState(0);

  // Estado de datos del juego
  const [gameData, setGameData] = useState<{
    message: string;
    match: {
      id: string;
      level: number;
      map: string;
      host: string;
      guest: string;
      board: {
        host: string | null;
        guest: string | null;
        fruitType: string;
        fruitsType: string[];
        enemies: number;
        enemiesCoordinates: number[][];
        fruitsCoordinates: number[][];
        fruits: number;
        playersStartCoordinates: number[][];
        board: BoardCell[];
      }
    };

  }>(location.state);

  // Estado del tablero
  const [boardData, setBoardData] = useState<BoardCell[]>([]);
  const [hostIsAlive, setHostIsAlive] = useState(true);
  const [guestIsAlive, setGuestIsAlive] = useState(true);
  // Header States
  const [isRunning, setIsRunning] = useState(true);
  const [fruitsCounter, setFruitsCounter] = useState(0);
  const [minutes, setMinutes] = useState(1);
  const [seconds, setSeconds] = useState(30);
  const [musicOn, setMusicOn] = useState(true);
  const [soundEffectsOn, setSoundEffectsOn] = useState(true);

  // FruitBar States
  const [fruits, setFruits] = useState<string[]>([]);
  const [actualFruit, setActualFruit] = useState("");

  // Función para precargar imágenes con seguimiento de progreso
  const preloadImages = (imageList) => {
    return new Promise((resolve, reject) => {
      const totalImages = imageList.length;

      if (totalImages === 0) {
        setAssetProgress(100);
        resolve(true);
        return;
      }

      let loadedImages = 0;

      imageList.forEach((src) => {
        const img = new Image();

        img.onload = () => {
          loadedImages++;
          // Actualizar el progreso después de cada imagen cargada
          const progress = Math.round((loadedImages / totalImages) * 100);
          setAssetProgress(progress);

          if (loadedImages === totalImages) {
            resolve(true);
          }
        };

        img.onerror = () => {
          loadedImages++;
          // Actualizar el progreso aun cuando hay error
          const progress = Math.round((loadedImages / totalImages) * 100);
          setAssetProgress(progress);

          console.error(`Error cargando imagen: ${src}`);
          if (loadedImages === totalImages) {
            // No rechazamos la promesa para evitar que se interrumpa la carga
            resolve(false);
          }
        };

        img.src = src;
      });
    });
  };

  // Efecto para precargar componentes React
  useEffect(() => {
    const preloadComponents = async () => {
      try {
        // Empezamos en 10% para mostrar progreso inicial
        setComponentProgress(10);

        // Cargamos el Header (más ligero)
        await import("./components/header/Header");
        setComponentProgress(30);

        // Cargamos el Board (componente más pesado)
        // await import("./components/board/Board");
        // setComponentProgress(70);

        // Cargamos el FruitBar
        await import("./components/fruit-bar/FruitBar");
        setComponentProgress(100);

        setComponentsLoaded(true);
        console.log("Componentes precargados correctamente.");
      } catch (error) {
        console.error("Error al precargar componentes:", error);
        setComponentsLoaded(true);
        setComponentProgress(100); // En caso de error, marcamos como completado
      }
    };

    preloadComponents();
  }, []);

  // Efecto para precargar recursos del juego
  useEffect(() => {
    // Mostrar diferentes mensajes durante la carga
    const messages = [
      "Preparando el campo de juego...",
      "Cargando personajes...",
      "Configurando enemigos...",
      "¡Casi listo!"
    ];

    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      setLoadingMessage(messages[messageIndex]);
    }, 800);

    // Precargar imágenes del juego
    const gamePaths = [
      // Personajes
      "/vainilla.png", "/chocolate.png", "/amarillo.png",
      "/azulito.png", "/fresa.png", "/verde.png",

      // // Enemigos
      // "/enemy-troll.png", "/enemy-goblin.png",
      // "/enemy-slime.png", "/enemy-dragon.png",

      // Frutas
      "/fruits/banana.webp", "/fruits/grape.webp",
      "/fruits/watermelon.webp", "/fruits/orange.webp",

      // // Bloques
      // "/ice-block-solid.png", "/ice-block-breakable.png", "/ice-block-thin.png"
    ];

    // Carga de recursos con seguimiento de progreso
    const loadGameResources = async () => {
      try {
        // Precargar imágenes con seguimiento de progreso
        await preloadImages(gamePaths);

        // Establecer los datos del juego
        setGameData(gameData);
        setFruits(gameData.match.board.fruitsType || []);
        setBoardData(gameData?.match.board.board || []);

        // Verificar si podemos finalizar la carga
        checkLoadingCompletion();
      } catch (error) {
        console.error("Error al cargar recursos del juego:", error);
        // Si hay error, cargar datos básicos de todos modos
        setGameData(gameData);
        setFruits(gameData.match.board.fruitsType || []);
        setBoardData(gameData.match.board.board || []);

        // Forzar finalización después de un tiempo
        setTimeout(() => {
          setIsLoading(false);
        }, 2000);
      }
    };

    loadGameResources();

    return () => clearInterval(messageInterval);
  }, []);

  // Efecto para verificar cuándo se han cargado tanto los componentes como los recursos
  useEffect(() => {
    checkLoadingCompletion();
  }, [componentsLoaded, assetProgress]);

  // Función para verificar si se completó la carga
  const checkLoadingCompletion = () => {
    if (componentsLoaded && assetProgress >= 95) {
      // Añadir un pequeño retraso para una transición más suave
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  };

  // Renderizar pantalla de carga mientras se cargan los recursos
  if (isLoading || !gameData) {
    return (
      <LoadingScreen
        message={loadingMessage}
        boardData={gameData}
        componentProgress={componentProgress}
        progress={assetProgress}
      />
    );
  }

  // Solo renderizar el juego cuando la carga esté completa
  return (
    <div className="game-screen">
      <Suspense fallback={<LoadingScreen message="Cargando componentes..." progress={100} />}>
        <Header
          isRunning={isRunning}
          setIsRunning={setIsRunning}
          fruitsCounter={fruitsCounter}
          minutes={minutes}
          seconds={seconds}
          musicOn={musicOn}
          setMusicOn={setMusicOn}
          soundEffectsOn={soundEffectsOn}
          setSoundEffectsOn={setSoundEffectsOn}
        />
        <Board
          boardData={gameData.match.board.board}
          matchId={gameData.match.id}
          hostId={gameData.match.host}
          guestId={gameData.match.guest}
          hostIsAlive={hostIsAlive}
          setHostIsAlive={setHostIsAlive}
          guestIsAlive={guestIsAlive}
          setGuestIsAlive={setGuestIsAlive}
          actualFruit={gameData.match.board.fruitType}
          setActualFruit={setActualFruit}
          fruitsCounter={fruitsCounter}
          setFruitsCounter={setFruitsCounter}
          setMinutes={setMinutes}
          setSeconds={setSeconds}
        />
        <FruitBar
          fruits={gameData.match.board.fruitsType}
          selectedFruit={gameData.match.board.fruitType}
        />
      </Suspense>
    </div>
  );
}