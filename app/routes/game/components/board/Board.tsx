import { useState, useEffect, useRef } from "react";
import IceCream from "./ice-cream/IceCream";
import FruitFactory from "./fruit/FruitFactory";
import IceBlock from "./ice-block/IceBlock";
import type { BoardCell, UserInformation } from "~/types/types";
import { useBoard } from "~/contexts/game/Board/BoardContext";
import { useFruitBar } from "~/contexts/game/FruitBar/FruitBarContext";
import { useUsers } from "~/contexts/UsersContext";
import { useGameWebSocket } from "~/contexts/game/GameWebSocketProvider";
import { closeWebSocket } from "~/services/websocket";
import "./Board.css";
import EnemyFactory from "./enemies/enemyFactory/enemyFactory";
import Rock from "./staticElements/Rock";

export const ICE_BLOCK_ANIMATION_INTERVAL = 75; // ms

export default function Board() {
	// Variables de canvas y tamaño de celda
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [cellSize, setCellSize] = useState(0);
	const [isBackgroundLoaded, setIsBackgroundLoaded] = useState(false);
	// Variables de estado del juego
	const { state: boardState } = useBoard();
	const fruits = boardState.fruits;
	const enemies = boardState.enemies;
	const iceBlocks = boardState.iceBlocks;
	const [visibleIceBlocks, setVisibleIceBlocks] = useState<BoardCell[]>([]);
	// Variables de estado de los usuarios
	const { state: usersState } = useUsers();
	const iceCreams = [usersState.mainUser, usersState.secondaryUser];
	// Variables de estado de la barra de frutas
	const { state: fruitBarState } = useFruitBar();
	const { connectWebSocket } = useGameWebSocket();

	useEffect(() => {
		console.log("gameState", usersState.gameState);
		//console.log(JSON.stringify(iceCreams));
	}
		, [iceCreams]);

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

			const ctx = canvas.getContext("2d");
			if (ctx) {
				ctx.fillStyle = "rgba(5, 206, 241, 0.8)";
				ctx.fillRect(0, 0, size, size);

				const bgImage = new Image();
				bgImage.src = "/fondo mapa.png";

				bgImage.onload = () => {
					const scale = Math.max(size / bgImage.width, size / bgImage.height);
					const scaledWidth = bgImage.width * scale;
					const scaledHeight = bgImage.height * scale;
					const offsetX = (size - scaledWidth) / 2;
					const offsetY = (size - scaledHeight) / 2;

					ctx.clearRect(0, 0, size, size);
					ctx.drawImage(bgImage, offsetX, offsetY, scaledWidth, scaledHeight);

					ctx.fillStyle = "rgba(0, 10, 30, 0.0)";
					ctx.fillRect(0, 0, size, size);

					setIsBackgroundLoaded(true);
				};

				bgImage.onerror = () => {
					//console.error("Error al cargar la imagen de fondo");
					setIsBackgroundLoaded(true);
				};
			}
		};
		closeWebSocket(); // Cierra cualquier conexión WebSocket existente
		connectWebSocket();

		setupCanvas();
		window.addEventListener("resize", setupCanvas);

		return () => {
			window.removeEventListener("resize", setupCanvas);
		};
	}, [connectWebSocket]);

	useEffect(() => {
		if (!iceBlocks) return;

		let timeout: NodeJS.Timeout;

		function areBlocksEqual(a: BoardCell, b: BoardCell) {
			return a.coordinates.x === b.coordinates.x && a.coordinates.y === b.coordinates.y;
		}

		function blockIsNotPresent(current: BoardCell[], target: BoardCell[]) {
			return target.find(
				t => !current.some(c => areBlocksEqual(c, t))
			);
		}

		function blockIsPresent(current: BoardCell[], target: BoardCell[]) {
			return current.find(
				c => !target.some(t => areBlocksEqual(c, t))
			);
		}

		function animateIceBlocks() {
			// Agregar bloques que faltan
			if (visibleIceBlocks.length < iceBlocks.length) {
				const blockToAdd = blockIsNotPresent(visibleIceBlocks, iceBlocks);
				if (blockToAdd) {
					setVisibleIceBlocks(prev => {
						if (prev.some(b => areBlocksEqual(b, blockToAdd))) return prev; // Ya existe, no lo agregues
						return [...prev, blockToAdd];
					});
					timeout = setTimeout(animateIceBlocks, ICE_BLOCK_ANIMATION_INTERVAL);
				}
			}
			// Eliminar bloques que sobran
			else if (visibleIceBlocks.length > iceBlocks.length) {
				const blockToRemove = blockIsPresent(visibleIceBlocks, iceBlocks);
				if (blockToRemove) {
					setVisibleIceBlocks(prev =>
						prev.filter(
							b => !areBlocksEqual(b, blockToRemove)
						)
					);
					timeout = setTimeout(animateIceBlocks, ICE_BLOCK_ANIMATION_INTERVAL);
				}
			}
			// Si son iguales, termina la animación
		}

		if (visibleIceBlocks.length !== iceBlocks.length) {
			timeout = setTimeout(animateIceBlocks, ICE_BLOCK_ANIMATION_INTERVAL);
		}

		return () => clearTimeout(timeout);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [iceBlocks, visibleIceBlocks]);

	const getElementsStyles = (x: number, y: number, size: number, needsTransition = false) => ({
		position: "absolute" as const,
		left: `${x * size}px`,
		top: `${y * size}px`,
		width: `${size}px`,
		height: `${size}px`,
		transition: needsTransition ? "left 1s ease-out, top 1s ease-out" : "none"
	});

	const renderFruits = () => {
		return fruits.map((fruit: BoardCell) => {
			if (!fruit.item || !fruit.item.id) return null;
			const style = getElementsStyles(fruit.coordinates.y, fruit.coordinates.x, cellSize);

			return (
				<div key={fruit.item.id} style={style}>
					<FruitFactory fruitInformation={fruit} subtype={fruitBarState.actualFruit} />
				</div>
			);
		});
	};

	const renderIceBlocks = () => {
		return visibleIceBlocks.map((block: BoardCell) => {
			const style = getElementsStyles(block.coordinates.y, block.coordinates.x, cellSize);
			return (
				<div key={`${block.coordinates.x}-${block.coordinates.y}`} style={style}>
					<IceBlock blockInformation={block} styles={style} cellSize={cellSize} />
				</div>
			);
		});
	};

	const renderEnemies = () => {
		return enemies.map((enemy: BoardCell) => {
			if (!enemy.character || !enemy.character.id) return null;
			const style = {
				...getElementsStyles(
					enemy.coordinates.y,
					enemy.coordinates.x,
					cellSize,
					true
				)
			};

			return (
				<div key={enemy.character.id} style={style}>
					<EnemyFactory enemyInformation={enemy} styles={style} />
				</div>
			);
		});
	};

	const renderIceCreams = () => {
		return iceCreams.map((iceCream: UserInformation) => {
			if (!iceCream.id || !iceCream.position.x || !iceCream.position.y) return null;
			const style = {
				...getElementsStyles(
					iceCream.position.y,
					iceCream.position.x,
					cellSize,
					true
				),

			};
			return (
				<div key={iceCream.id} style={style}>
					<IceCream iceCreamInformation={iceCream} styles={style} />
				</div>
			);
		});
	};

	const renderStaticElements = () => {
		return boardState.staticElements.map((element: BoardCell) => {
			const style = getElementsStyles(element.coordinates.y, element.coordinates.x, cellSize);
			return (
				<div key={element.item?.id} style={style}>
					<Rock
						blockInformation={element}
						styles={style}
						cellSize={cellSize}
					/>
				</div>
			);
		}
		);
	};

	return (
		<div className="board-wrapper" style={{
			position: "relative",
			display: "flex",
			justifyContent: "center",
			alignItems: "center",
			width: "calc(90vw + 72px)", // 36px a cada lado
			height: "calc(90vw + 72px)",
			maxWidth: "calc(700px + 72px)",
			maxHeight: "calc(700px + 72px)",
			margin: "25px auto 95px",
			boxSizing: "content-box"
		}}>
			{/* Bordes */}
			<div className="board-border board-border-top" />
			<div className="board-border board-border-bottom" />
			<div className="board-border board-border-left" />
			<div className="board-border board-border-right" />

			<div
				className="board"
				style={{
					position: "relative",
					width: "90vw",
					height: "90vw",
					maxWidth: "700px",
					maxHeight: "700px",
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					padding: "0",
					boxSizing: "border-box"
				}}
			>
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
				{cellSize > 0 && renderEnemies()}
				{cellSize > 0 && renderIceBlocks()}
				{cellSize > 0 && renderFruits()}
				{cellSize > 0 && renderIceCreams()}
				{cellSize > 0 && renderStaticElements()}
			</div>
		</div>
	);
}
