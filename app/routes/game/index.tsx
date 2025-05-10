import { useState, useEffect, lazy, Suspense, useCallback } from "react";
import { useLocation } from "@remix-run/react";
import LoadingScreen from "~/components/loadingScreen/LoadingScreen";
import type { BoardCell } from "../../types/types/types";
import { useHeader } from "~/contexts/game/Header/HeaderContext";
import { useBoard } from "~/contexts/game/Board/BoardContext";
import { useFruitBar } from "~/contexts/game/FruitBar/FruitBarContext";
import { useUser } from "~/contexts/user/userContext";
import IceCreamController from "./components/board/ice-cream/iceCreamController/IceCreamController";
import { useUsers } from "~/contexts/UsersContext";
import ModalWinLose from "./components/modalWinLose";
import "./styles.css";


const Header = lazy(() => import("./components/header/Header"));
const Board = lazy(() => import("./components/board/Board"));
const FruitBar = lazy(() => import("./components/fruit-bar/FruitBar"));

export default function GameScreen() {
	// Estados de carga
	const location = useLocation();
	const { userData } = useUser();

	const [componentsLoaded, setComponentsLoaded] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [loadingMessage, setLoadingMessage] = useState(
		"Preparando el campo de juego...",
	);
	const [assetProgress, setAssetProgress] = useState(0);
	const [componentProgress, setComponentProgress] = useState(0);

	const [showModal, setShowModal] = useState(false);
	const [modalType, setModalType] = useState<'win' | 'lose'>('lose');
	const [modalMessage, setModalMessage] = useState("");

	const { state: headerSate, dispatch: headerDispatch } = useHeader();
	const { state: boardState, dispatch: boardDispatch } = useBoard();
	const { state: fruitBarState, dispatch: fruitBarDispatch } = useFruitBar();
	const { state: usersState, dispatch: usersDispatch } = useUsers();

	// Estado de datos del juego
	const [gameData, setGameData] = useState<{
		message: string;
		match: {
			id: string;
			level: number;
			map: string;
			hostId: string;
			guestId: string;
			typeFruits: string[];
			board: {
				enemiesNumber: number;
				fruitsNumber: number;
				playersStartCoordinates: number[][];
				fruitType: string;
				enemiesCoordinates: number[][];
				fruitsCoordinates: number[][];
				cells: BoardCell[];
			};
		};
	}>(location.state);

	// Estado del tablero
	const [hostIsAlive, setHostIsAlive] = useState(true);
	const [guestIsAlive, setGuestIsAlive] = useState(true);

	// FruitBar States
	const [fruits, setFruits] = useState<string[]>([]);

	// Función para precargar imágenes con seguimiento de progreso
	const preloadImages = useCallback((imageList: string[]): Promise<boolean> => {
		return new Promise((resolve) => {
			const totalImages = imageList.length;

			if (totalImages === 0) {
				setAssetProgress(100);
				resolve(true);
				return;
			}

			let loadedImages = 0;

			for (const src of imageList) {
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
			}
		});
	}, []);


	useEffect(() => {
		if (usersState.gameState === "win") {
			setModalType('win');
			setModalMessage("¡Felicidades! Has ganado el juego.");
			setShowModal(true);
		} else if (usersState.gameState === "lose") {
			setModalType('lose');
			setModalMessage("Game Over. ¡Inténtalo de nuevo!");
			setShowModal(true);
		}
	}, [usersState.gameState]);

	const handleCloseModal = () => {
		setShowModal(false);
		if (modalType === 'win') {
			// Aquí puedes redirigir a la pantalla de victoria o hacer otra acción
			console.log("Redirigiendo a la pantalla de victoria...");
		} else if (modalType === 'lose') {
			// Aquí puedes redirigir a la pantalla de derrota o hacer otra acción
			console.log("Redirigiendo a la pantalla de derrota...");
		}
	}


	useEffect(() => {
		console.log("gameData", JSON.stringify(gameData));
		// cargar boardContext

		const coordinates = gameData.match.board.playersStartCoordinates;
		const hostCoords = coordinates[0];
		const guestCoords = coordinates[1];

		const isMainUserHost = gameData.match.hostId === usersState.mainUser.id;


		usersDispatch({
			type: "SET_MAIN_USER",
			payload: {
				...usersState.mainUser, // Keep existing info
				position: {
					// If main user is host, use hostCoords[1] (X=1), else use guestCoords[1] (X=14)
					x: isMainUserHost ? hostCoords[0] : guestCoords[0],
					// If main user is host, use hostCoords[0] (Y=9), else use guestCoords[0] (Y=9)
					y: isMainUserHost ? hostCoords[1] : guestCoords[1]
				},
				direction: "down", // Set initial direction
				state: "alive"     // Set initial state
			}
		});

		usersDispatch({
			type: "SET_SECONDARY_USER",
			payload: {
				...usersState.secondaryUser, // Keep existing info
				position: {
					// If main user is NOT host, use hostCoords[1] (X=1), else use guestCoords[1] (X=14)
					x: !isMainUserHost ? hostCoords[0] : guestCoords[0],
					// If main user is NOT host, use hostCoords[0] (Y=9), else use guestCoords[0] (Y=9)
					y: !isMainUserHost ? hostCoords[1] : guestCoords[1]
				},
				direction: "down", // Set initial direction
				state: "alive"     // Set initial state
			}
		});
		boardDispatch({ type: "SET_BOARD", payload: gameData.match.board.cells });
		// cargar fruitBarContext
		fruitBarDispatch({
			type: "SET_FRUITS",
			payload: gameData.match.typeFruits
		});
		fruitBarDispatch({ type: "SET_ACTUAL_FRUIT", payload: gameData.match.typeFruits[0] });



	}, [boardDispatch, fruitBarDispatch, gameData]);

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
			"¡Casi listo!",
		];

		let messageIndex = 0;
		const messageInterval = setInterval(() => {
			messageIndex = (messageIndex + 1) % messages.length;
			setLoadingMessage(messages[messageIndex]);
		}, 800);

		// Precargar imágenes del juego
		const gamePaths = [
			// Personajes
			"/vainilla.png",
			"/chocolate.png",
			"/amarillo.png",
			"/azulito.png",
			"/fresa.png",
			"/verde.png",

			// // Enemigos
			// "/enemy-troll.png", "/enemy-goblin.png",
			// "/enemy-slime.png", "/enemy-dragon.png",

			// Frutas
			"/fruits/banana.webp",
			"/fruits/grape.webp",
			"/fruits/watermelon.webp",
			"/fruits/orange.webp",

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
				setFruits(gameData.match.typeFruits || []);

			} catch (error) {
				console.error("Error al cargar recursos del juego:", error);
				// Si hay error, cargar datos básicos de todos modos
				setGameData(gameData);
				setFruits(gameData.match.typeFruits || []);

				// Forzar finalización después de un tiempo
				setTimeout(() => {
					setIsLoading(false);
				}, 2000);
			}
		};

		loadGameResources();

		return () => clearInterval(messageInterval);
	}, [gameData, preloadImages]);

	// Efecto para verificar cuándo se han cargado tanto los componentes como los recursos
	useEffect(() => {
		// Verificar si se completó la carga
		if (componentsLoaded && assetProgress >= 95) {
			// Añadir un pequeño retraso para una transición más suave
			setTimeout(() => {
				setIsLoading(false);
			}, 1000);
		}
	}, [componentsLoaded, assetProgress]);

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
			<Suspense
				fallback={
					<LoadingScreen message="Cargando componentes..." progress={100} />
				}
			>
				<Header />
				<Board />
				<FruitBar />
				<IceCreamController />
				<ModalWinLose
					isVisible={showModal}
					onClose={handleCloseModal}
					type={modalType}
					title={modalType === 'win' ? "¡Victoria!" : "Game Over"}
					message={modalMessage}
				/>
			</Suspense>
		</div>
	);
}
