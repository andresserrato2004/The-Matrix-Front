import { useNavigate } from "@remix-run/react";
import { useUser } from "../../contexts/user/userContext";
import { useState } from "react";
import Modal from "~/components/modal/Modal";
import api from "~/services/api";
import Button from "~/components/shared/Button";
import { useWebSocket } from "~/hooks/useWebSocket";
import "./styles.css";

const lobbyData = {
    level: 1,
    map: "desert"
};

export default function JoinScreen() {
    const navigate = useNavigate();
    const [showModal, setIsShowModal] = useState(false);
    const [roomCode, setRoomCode] = useState("");
    const [isJoining, setIsJoining] = useState(false);
    const [joinError, setJoinError] = useState("");
    const { userData, setUserData } = useUser();
    const { connect } = useWebSocket();

    const openModal = () => {
        setRoomCode("");
        setJoinError("");
        setIsJoining(false);
        setIsShowModal(true);
    };

    const closeModal = () => setIsShowModal(false);

    const handleRoomCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.slice(0, 8);
        setRoomCode(value);

        // Clear any previous error when user is typing
        if (joinError) {
            setJoinError("");
        }
    };

    const handleEnableRoom = async () => {
        if (!roomCode.trim()) {
            setJoinError("Please enter a room code");
            return;
        }

        // Show loading state
        setIsJoining(true);

        try {
            console.log("roomCode", roomCode);
            // Create WebSocket connection using the hook
            const wssURI = `/ws/join-game/${userData?.userId}/${roomCode}`;
            const ws = connect(wssURI);
            console.log("ws", ws);

            if (ws) {
                console.log("WebSocket connection established in joinscreen");

                ws.onmessage = (event) => {
                    try {
                        const message = JSON.parse(event.data);
                        console.log("Received message in joinscreen:", message);

                        if (message.message === 'match-found') {
                            // Configurar al jugador como player 2
                            const positions = message.match.board.playersStartCoordinates;

                            // Actualizar userData con la posición del jugador 2
                            setUserData({
                                ...userData,
                                matchId: message.match.id,
                                position: positions[1].reverse(),
                                isPlayer2: true // Marcar como jugador 2
                            });

                            // Navegar a la pantalla de crear lobby con el estado actualizado
                            navigate(`/createlobby?code=${roomCode}`, {
                                state: {
                                    isPlayer2: true,
                                    matchData: message,
                                    showSecondPlayer: true // Indicar que se debe mostrar el segundo jugador
                                }
                            });
                        }
                    } catch (error) {
                        console.error("Error parsing WebSocket message:", error);
                    }
                };

                ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    setJoinError("Error connecting to game server. Please try again.");
                    setIsJoining(false);
                };

                ws.onclose = () => {
                    console.log('WebSocket connection closed');
                };
            } else {
                setJoinError("Failed to create WebSocket connection");
                setIsJoining(false);
            }
        } catch (error) {
            setJoinError("Error joining room. Please try again.");
            console.error("Join room error:", error);
            setIsJoining(false);
        }
    };

    const handleCreateLobby = async () => {



        try {
            
            const response = await api.post(`/rest/users/${userData?.userId}/matches`, lobbyData);
            const response2 = await api.get(`/rest/users/${userData?.userId}/matches`);
            console.log("API response:", response2.data.matchId);
            navigate(`/createlobby?code=${response2.data.matchId}`);
        } catch (error) {
            console.error("Error in handleCreateLobby:", error);
            const err = (error as Error | { response?: { data?: { message?: string }, statusText?: string }, request?: unknown });
            if ('response' in err && err.response) {
                console.error(`Server error: ${err.response.data?.message || err.response.statusText}`);
            } else if ('request' in err && err.request) {
                console.error("Network error: Unable to reach the server");
            } else {
                console.error(`Error: ${error}`);
            }
        }
    }

    return (
        <div className="join-screen">
            <img className="background" src="/CusBackground.png" alt="bg" />
            <div className="join-screen__menu">
                <img className="iceCream" src="/image 8-picaai.png" alt="iceCream" />
            </div>
            <div className="join-screen__buttons">
                <Button
                    variant="primary"
                    size="large"
                    onClick={openModal}
                >
                    Join Lobby
                </Button>
                <Button
                    variant="secondary"
                    size="large"
                    onClick={handleCreateLobby}
                >
                    Create Lobby
                </Button>
            </div>

            <Modal
                isOpen={showModal}
                onClose={closeModal}
                blurAmount="13px"
            >
                <div className="join-modal-content">
                    <h2 className="join-modal-title">Join Lobby</h2>
                    <div className="join-modal-forms">
                        <input
                            type="text"
                            placeholder="Enter 8-Digit Lobby Code"
                            className={`join-modal-input ${joinError ? 'input-error' : ''}`}
                            value={roomCode}
                            onChange={handleRoomCodeChange}
                            maxLength={8}
                        />

                        {joinError && (
                            <div className="join-error-message">
                                {joinError}
                            </div>
                        )}

                        <div className="join-modal-buttons">
                            <Button
                                variant="secondary"
                                size="medium"
                                onClick={closeModal}
                                disabled={isJoining}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                size="medium"
                                onClick={handleEnableRoom}
                                disabled={isJoining || !roomCode.trim()}
                            >
                                {isJoining ? 'Joining...' : 'Join'}
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
