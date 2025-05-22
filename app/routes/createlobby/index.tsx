import { useState, useEffect, useRef } from "react";
import LvlSelector from "./components/LvlSelector";
import { useWebSocket } from "~/hooks/useWebSocket";
import { sendMessage } from "~/services/websocket";
import { useNavigate, useLocation } from "@remix-run/react";
import { useUser } from "~/contexts/user/userContext";
import Button from "~/components/shared/Button";
import IceCreamSelector from "./components/IceCreamSelector";
import GameControls from "./components/GameControls";
import api from "~/services/api";
import "./styles.css";
import { useUsers } from "~/contexts/UsersContext";

// TODO tipar todo

// TODO hacer clean code

const iceCreams = [
    { id: 1, name: "Vanilla", image: "/vainilla.png", flavour: "vanilla" },
    { id: 2, name: "Chocolate", image: "/chocolate.png", flavour: "chocolate" },
    { id: 3, name: "amarillo", image: "/amarillo.png", flavour: "yellow" },
    { id: 4, name: "azulito", image: "/azulito.png", flavour: "blue" },
    { id: 5, name: "fresa", image: "/fresa.png", flavour: "strawberry" },
    { id: 6, name: "verde", image: "/verde.png", flavour: "lime" }
];

export default function Lobby() {
    const navigate = useNavigate();
    const location = useLocation();
    const { state: usersState, dispatch: usersDispatch } = useUsers();
    const { userData, setUserData, secondaryUserData, setSecondaryUserData } = useUser();
    const { connect } = useWebSocket();
    const hasReconnected = useRef(false);
    const [isnewconnection, setIsnewconnection] = useState(true);

    const [player1IceCream, setPlayer1IceCream] = useState(null);
    const [player2IceCream, setPlayer2IceCream] = useState(null);
    const [player1Ready, setPlayer1Ready] = useState(false);
    const [player2Ready, setPlayer2Ready] = useState(false);
    const [isSoloPlayer, setIsSoloPlayer] = useState(true);
    const [player1Name, setPlayer1Name] = useState("Player 1");
    const [player2Name, setPlayer2Name] = useState("Player 2");
    const [countdown, setCountdown] = useState(3);
    // Inicializa roomCode con "Loading..."
    const [roomCode, setRoomCode] = useState("Loading...");
    const [isSearching, setIsSearching] = useState(false);
    const [searchTime, setSearchTime] = useState(0);
    const [error, setError] = useState("");

    // Estado para controlar la visibilidad del segundo jugador
    const [showSecondPlayer, setShowSecondPlayer] = useState(false);

    // Estado para controlar la animación previa a la aparición
    const [playerJoining, setPlayerJoining] = useState(false);

    // Variable para prevenir navegaciones duplicadas
    const [gameStarted, setGameStarted] = useState(false);
    const [message, setMessage] = useState(null);

    // Estado para mostrar/ocultar el selector
    const [showLvlSelector, setShowLvlSelector] = useState(false);

    // Estado para el WebSocket activo
    const [lobbyWebSocket, setLobbyWebSocket] = useState(null);

    // Callback cuando se selecciona un nivel
    const handleSelectLevel = async (level: number) => {
        if (!userData?.userId || !roomCode) {
            console.error("Missing userId or roomCode");
            return;
        }

        const lobbyData = {
            level: level,
            map: "desert"
        };

        try {
            const response = await api.put(`/rest/users/${userData.userId}/matches/${roomCode}`, lobbyData);
            console.log("Level updated successfully:", response.data);
            setShowLvlSelector(false); // Oculta el selector después de seleccionar
        } catch (error) {
            console.error("Error updating level:", error);
            const err = (error as Error | { response?: { data?: { message?: string }, statusText?: string }, request?: unknown });
            if ('response' in err && err.response) {
                console.error(`Server error: ${err.response.data?.message || err.response.statusText}`);
            } else if ('request' in err && err.request) {
                console.error("Network error: Unable to reach the server");
            } else {
                console.error(`Error: ${error}`);
            }
        }
    };

    // Callback para volver atrás
    const handleBack = () => {
        setShowLvlSelector(false);
    };

    // Cargar el código de sala cuando el componente se monte

    let state;


    useEffect(() => {
        const loadRoomCode = async () => {
            try {
                console.log("userData:", userData);
                console.log("userData?.userId:", userData?.userId);
                const response = await api.get(`/rest/users/${userData?.userId}/matches`);
                console.log("API response:", response.data.matchId);
                setRoomCode(response.data.matchId);

                // Solo mostrar el segundo jugador si viene del estado de navegación
                state = location.state as { showSecondPlayer?: boolean };
                console.log("state?.showSecondPlayer:", state?.showSecondPlayer);

                if (state?.showSecondPlayer && isnewconnection) {
                    // Cerrar cualquier conexión WebSocket existente
                    if (lobbyWebSocket) {
                        console.log("Cerrando conexión WebSocket existente");
                        lobbyWebSocket.close();
                        setLobbyWebSocket(null);
                        setIsnewconnection(false);
                    }

                    // Crear nueva conexión WebSocket para la sala
                    const wssURI = `/ws/join-game/${userData?.userId}/${response.data.matchId}`;
                    console.log("wssURIii2", wssURI);
                    const newWs = connect(wssURI);

                    if (newWs) {
                        console.log("Nueva conexión WebSocket establecida para el jugador que se une");
                        setWebSocketHandlers(newWs);
                        setLobbyWebSocket(newWs);
                        hasReconnected.current = true; // Marcar que ya se realizó la reconexión
                    }

                    setPlayerJoining(true);
                    setShowSecondPlayer(true);
                    setIsSoloPlayer(false);
                }

            } catch (error) {
                console.error("Error loading room code:", error);
                setRoomCode("ERROR");
            }
        };

        if (userData?.userId) {
            loadRoomCode();
        }
    }, [userData, location.state, connect, lobbyWebSocket]);

    const togglePlayer1Ready = () => setPlayer1Ready(prev => !prev);
    const togglePlayer2Ready = () => setPlayer2Ready(prev => !prev);

    // Simulate matchmaking search timer
    useEffect(() => {
        let searchTimer;
        if (isSearching) {
            searchTimer = setInterval(() => {
                setSearchTime(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(searchTimer);
    }, [isSearching]);

    // Set default player 2 character in solo mode
    useEffect(() => {
        if (isSoloPlayer && !player2IceCream && iceCreams.length > 0) {
            // Choose a different character than player 1 if possible
            const player1Id = player1IceCream?.id;
            const availableCharacters = player1Id
                ? iceCreams.filter(ice => ice.id !== player1Id)
                : iceCreams;

            setPlayer2IceCream(availableCharacters[0] || iceCreams[0]);
            setPlayer2Ready(false); // Auto-ready player 2 in solo mode
        }
    }, [isSoloPlayer, player1IceCream, player2IceCream]);

    // Define a new condition for game readiness
    const isGameReady = isSoloPlayer
        ? (player1Ready && player1IceCream) // Solo mode only needs player 1 ready
        : (player1Ready && player2Ready && player1IceCream && player2IceCream); // Two players need both ready



    // Countdown timer when players are ready
    useEffect(() => {
        if (!isGameReady || gameStarted) return;

        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    console.log("game data:", message);
                    navigate("/game", { state: message });
                    setGameStarted(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            clearInterval(timer);
            setCountdown(3);
        };
    }, [isGameReady, navigate, gameStarted, message]);

    //quitar al otro jugador
    useEffect(() => {
        if (showSecondPlayer) {
            if (!player1Ready) {
                setPlayer1Ready(false);
            }
            if (!player2Ready) {
                setPlayer2Ready(false);
            }
        }
    }, [showSecondPlayer, player1Ready, player2Ready]);

    const setWebSocketHandlers = (websocket) => {
        if (!websocket) return;
        setLobbyWebSocket(websocket);

        websocket.onopen = () => {
            console.log("WebSocket connection opened successfully in createlobby");
        };

        websocket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                console.log("Received message in createlobbyyy:", message);
                console.log("message.type:", message.type);
                if (message.type === 'player-update') {
                    console.log("player-update message received in createlobby");
                    const { id, status, name } = message.payload;

                    // Determinar si el mensaje es para el host o el guest
                    const isHost = id === usersState.secondaryUser.id;
                    console.log("isHost:", isHost, "id:", id, "usersState.mainUser.id:", usersState.mainUser.id);
                    console.log("userData?.isPlayer2:", userData?.isPlayer2);
                    console.log("status:", state?.showSecondPlayer);
                    console.log("status:", status);

                    // Actualizar el estado según el tipo de mensaje
                    if (status) {

                        if (state?.showSecondPlayer) {
                            if (!isHost) {
                                // Si soy el jugador 2, actualizo al jugador 1 (el otro jugador)
                                setPlayer1Ready(status === 'READY');
                            } else {
                                // Si soy el jugador 1, actualizo al jugador 2 (el otro jugador)
                                setPlayer2Ready(status === 'READY');
                            }
                        } else {
                            if (!isHost) {
                                setPlayer2Ready(status === 'READY');
                            } else {
                                setPlayer1Ready(status === 'READY');
                            }
                        }
                    }


                    if (name) {

                        if (state?.showSecondPlayer) {
                            if (!isHost) {
                                console.log("!isHost:", isHost,);
                                // Si soy el jugador 2, actualizo al jugador 1 (el otro jugador)
                                setPlayer1Name(name);
                            } else {
                                // Si soy el jugador 1, actualizo al jugador 2 (el otro jugador)
                                setPlayer2Name(name);
                            }
                        } else {
                            if (!isHost) {
                                // Si soy el jugador 2, actualizo al jugador 1 (el otro jugador)
                                console.log("!isHost:", isHost,);
                                setPlayer2Name(name);
                            } else {
                                // Si soy el jugador 1, actualizo al jugador 2 (el otro jugador)
                                setPlayer1Name(name);
                            }
                        }
                    }
                }

                if (message.message === 'match-found') {
                    const positions = message.match.board.playersStartCoordinates;
                    console.log("Match found ID:", message.match?.id);
                    setMessage(message);

                    // Mostrar inmediatamente el segundo jugador
                    setPlayerJoining(true);
                    setShowSecondPlayer(true);

                    if (message.match.host === userData?.userId) {
                        // Si eres el host
                        const position = positions[0].reverse();
                        console.log("Position for player 1 (host):", position);

                        // Llenar los datos del host en userData
                        setUserData({
                            ...userData,
                            matchId: message.match.id,
                            position: message.match.board.playersStartCoordinates[0],
                        });

                        usersDispatch({
                            type: "SET_MAIN_USER",
                            payload: {
                                ...usersState.mainUser,
                                matchId: message.match.id,
                                position: position,
                            }
                        });

                        // Llenar los datos del guest en secondaryUserData
                        setSecondaryUserData({
                            userId: message.match.guestId,
                            username: message.match.guestUsername,
                            position: message.match.board.playersStartCoordinates[1],
                        });

                        usersDispatch({
                            type: "SET_SECONDARY_USER",
                            payload: {
                                ...usersState.secondaryUser,
                                matchId: message.match.id,
                                id: message.match.guestId,
                                position: positions[1]
                            }
                        });
                    } else {
                        // Si eres el guest
                        console.log("Position for player 2 (guest):", positions);

                        // Llenar los datos del guest en userData
                        setUserData({
                            ...userData,
                            matchId: message.match.id,
                            position: message.match.board.playersStartCoordinates[1],
                        });

                        usersDispatch({
                            type: "SET_MAIN_USER",
                            payload: {
                                ...usersState.mainUser,
                                id: message.match.guestId,
                                matchId: message.match.id,
                                position: positions[1]
                            }
                        });

                        // Llenar los datos del host en secondaryUserData
                        setSecondaryUserData({
                            userId: message.match.hostId,
                            username: message.match.hostUsername,
                            position: message.match.board.playersStartCoordinates[0],
                        });

                        usersDispatch({
                            type: "SET_SECONDARY_USER",
                            payload: {
                                ...usersState.secondaryUser,
                                id: message.match.hostId,
                                matchId: message.match.id,
                                position: positions[0]
                            }
                        });
                    }
                    console.log("userData updated with matchId:", userData);
                    console.log("Match found, navigating to game screen");

                    // Si estamos en modo solo, iniciar la partida inmediatamente
                    if (isSoloPlayer) {
                        setGameStarted(true);
                        navigate("/game", { state: message });
                    }
                }
            } catch (error) {
                console.error("Error parsing WebSocket message:", error);
            }
        };

        websocket.onerror = (error) => {
            console.error("WebSocket error:", error);
            setError("WebSocket connection error");
        };

        websocket.onclose = () => {
            console.log("WebSocket connection closed");
            setIsSearching(false);
        };
    };

    const handleStartGame = () => {
        // Evitar iniciar el juego más de una vez
        if (gameStarted) return;

        if (isSoloPlayer) {
            // For solo mode, only check if player 1 is ready
            if (player1Ready && player1IceCream) {
                setGameStarted(true);
                console.log("game data:", message);
                navigate("/game", { state: message });
            } else {
                alert("Please select your character and click Ready to start");
            }
        } else {
            // For two-player mode, check both players
            if ((player1Ready && player2Ready) && (player1IceCream && player2IceCream)) {
                setGameStarted(true);
                console.log("game data:", message);
                navigate("/game", { state: message });
            } else {
                alert("Both players must select a character and be ready to start");
            }
        }
    };

    const handleBackButton = () => {
        navigate("/joinscreen");
    };

    const handleFindOpponent = () => {
        try {
            // Construir la URL para el WebSocket
            const matchDetails = { level: 1, map: "desert" };
            const wssURI = `/ws/matchmaking/${roomCode}`;

            console.log("Connecting to WebSocket:", wssURI);

            // Usar el hook para conectar con el path específico
            const newWs = connect(wssURI);

            if (newWs) {
                console.log("WebSocket connected successfully");

                // Configuración del manejo de mensajes
                setWebSocketHandlers(newWs);

                setIsSearching(true);
            } else {
                setError("Failed to create WebSocket connection");
            }
        } catch (error) {
            console.error("Error in handleFindOpponent:", error);
            setError(`Error connecting to WebSocket: ${error.message}`);
        }
    };

    const cancelMatchmaking = () => {
        setIsSearching(false);
        setSearchTime(0);
        // Cerrar la conexión WebSocket
        const ws = connect(`/ws/matchmaking/${roomCode}`);
        if (ws) {
            ws.close();
        }
    };

    // Format search time as MM:SS
    const formatSearchTime = () => {
        const minutes = Math.floor(searchTime / 60);
        const seconds = searchTime % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleEnableRoom = () => {
        try {
            // Create WebSocket connection for publishing matches
            const wssURI = `/ws/publish-match/${userData?.userId}/${roomCode}`;
            const newWs = connect(wssURI);

            if (newWs) {
                console.log("WebSocket connection established");
                setWebSocketHandlers(newWs);
            } else {
                setError("Failed to create WebSocket connection");
            }
        } catch (error) {
            console.error("Error enabling room:", error);
            setError("Error enabling room. Please try again.");
        }
    };

    // Handlers que envían mensajes por WebSocket
    const handlePlayer1IceCream = (iceCream) => {
        setPlayer1IceCream(iceCream);
        if (lobbyWebSocket && showSecondPlayer) {
            sendMessage({
                type: 'set-color',
                payload: iceCream.flavour
            });
        }
    };

    const handlePlayer1Name = (name) => {
        setPlayer1Name(name);
        if (lobbyWebSocket && showSecondPlayer && name.length > 1) {
            sendMessage({
                type: 'set-name',
                payload: name
            });
        }
    };

    const handlePlayer1Ready = () => {
        const newReady = !player1Ready;
        setPlayer1Ready(newReady);
        if (lobbyWebSocket && showSecondPlayer) {
            sendMessage({
                type: 'set-state',
                payload: newReady ? 'READY' : 'WAITING'
            });
        }
    };

    const handlePlayer2IceCream = (iceCream) => {
        setPlayer2IceCream(iceCream);
        if (lobbyWebSocket && showSecondPlayer) {
            sendMessage({
                type: 'set-color',
                payload: iceCream.flavour
            });
        }
    };

    const handlePlayer2Name = (name) => {
        setPlayer2Name(name);
        if (lobbyWebSocket && showSecondPlayer && name.length > 1) {
            sendMessage({
                type: 'set-name',
                payload: name
            });
        }
    };

    const handlePlayer2Ready = () => {
        const newReady = !player2Ready;
        setPlayer2Ready(newReady);
        if (lobbyWebSocket && showSecondPlayer) {
            sendMessage({
                type: 'set-state',
                payload: newReady ? 'READY' : 'WAITING'
            });
        }
    };


    return (
        <div className="lobby-screen">

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {/* Mensaje de estado cuando el jugador se está uniendo */}
            {playerJoining && !showSecondPlayer && (
                <div className="player-connecting-status">
                    <p>Player connecting...</p>
                </div>
            )}

            {/* Contenedor principal con clases dinámicas */}
            <div className={`selectors-container ${!showSecondPlayer ? 'single-player-mode' : ''} ${playerJoining ? 'player-joining' : ''}`}>
                {/* Player 1 selector - siempre visible */}
                <div className="player1-container">
                    <IceCreamSelector
                        iceCreams={iceCreams}
                        selectedIceCream={player1IceCream}
                        onIceCreamSelect={handlePlayer1IceCream}
                        position="left"
                        playerName="Player 1"
                        isReady={player1Ready}
                        onReadyToggle={handlePlayer1Ready}
                        playerCustomName={player1Name}
                        onPlayerNameChange={handlePlayer1Name}
                        isDisabled={
                            showSecondPlayer && (userData?.userId !== usersState.secondaryUser.id)
                        }
                        waitingForPlayer={false}
                    />
                </div>

                {/* Middle section */}
                <div className="middle-section">
                    {/* Mensaje de espera arriba */}
                    {!playerJoining && !showSecondPlayer && (
                        <div className="waiting-for-player">
                            <p>Waiting for another player to join...</p>
                        </div>
                    )}

                    <div className="room-info">
                        <div className="room-code-display">
                            <h2 className="room-code-label">Room Code</h2>
                            <div className="room-code-value">{roomCode}</div>
                            <p className="room-code-help">Share this code with another player to join your game.</p>
                        </div>

                        <Button
                            variant="primary"
                            size="large"
                            onClick={handleEnableRoom}
                            className="enable-room-button"
                        >
                            Enable Room
                        </Button>

                        {isSearching ? (
                            <div className="matchmaking-status">
                                <div className="searching-indicator">
                                    <div className="pulse-dot" />
                                    <span>Searching for opponent...</span>
                                </div>
                                <div className="search-time">Time: {formatSearchTime()}</div>
                                <button
                                    className="cancel-search-button"
                                    onClick={cancelMatchmaking}
                                    type="button"
                                >
                                    Cancel Search
                                </button>
                            </div>
                        ) : (
                            <div className="matchmaking-controls">
                                <button
                                    className="find-opponent-button"
                                    onClick={handleFindOpponent}
                                    type="button"

                                >
                                    Find Opponent
                                </button>
                                <p className="matchmaking-help">
                                    {!showSecondPlayer
                                        ? "Waiting for another player to join..."
                                        : !player1Ready || !player2Ready
                                            ? "Both players must be ready to find opponents"
                                            : "Click to find an opponent"}
                                </p>
                            </div>
                        )}

                        {/* Botón "Selector Level" */}
                        {!showLvlSelector ? (
                            <Button onClick={() => setShowLvlSelector(true)} type="button">
                                Selector Level
                            </Button>
                        ) : (
                            <LvlSelector
                                onSelect={handleSelectLevel}
                                onBack={handleBack}
                            />
                        )}
                    </div>

                    {isGameReady && (
                        <div className="countdown-container">
                            <p className="countdown-text">Game starts in</p>
                            <div className="countdown-number">{countdown}</div>
                            <button
                                className="start-now-button"
                                onClick={handleStartGame}
                                disabled={gameStarted}
                                type="button"
                            >
                                Start Now
                            </button>
                        </div>
                    )}

                    {!isGameReady && !isSearching && (
                        <GameControls
                            onStartGame={handleStartGame}
                            onBack={handleBackButton}
                            disabled={!player1IceCream || !player1Ready || gameStarted}
                        />
                    )}


                </div>

                {/* Contenedor para el segundo jugador */}
                <div className="player2-container">
                    <IceCreamSelector
                        iceCreams={iceCreams}
                        selectedIceCream={player2IceCream}
                        onIceCreamSelect={handlePlayer2IceCream}
                        position="right"
                        playerName="Player 2"
                        isReady={player2Ready}
                        onReadyToggle={handlePlayer2Ready}
                        playerCustomName={player2Name}
                        onPlayerNameChange={handlePlayer2Name}
                        isDisabled={
                            !showSecondPlayer || (userData?.userId !== usersState.mainUser.id)
                        }
                        waitingForPlayer={!showSecondPlayer}
                    />
                </div>
            </div>
        </div>
    );
}
