import { useNavigate } from "@remix-run/react";
import { useUser } from "../../contexts/user/userContext";
import { useState } from "react";
import Modal from "~/components/modal/Modal";
import api from "~/services/api";
import "./styles.css";

export default function JoinScreen() {
    const navigate = useNavigate();
    const [showModal, setIsShowModal] = useState(false);
    const [roomCode, setRoomCode] = useState("");
    const [isJoining, setIsJoining] = useState(false);
    const [joinError, setJoinError] = useState("");
    const { userData } = useUser();

    const openModal = () => {
        setRoomCode("");
        setJoinError("");
        setIsJoining(false);
        setIsShowModal(true);
    };

    const closeModal = () => setIsShowModal(false);

    const handleRoomCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Convert to uppercase and limit to 6 characters
        const value = e.target.value.toUpperCase().slice(0, 6);
        setRoomCode(value);

        // Clear any previous error when user is typing
        if (joinError) {
            setJoinError("");
        }
    };

    const handleJoinLobby = async () => {
        if (!roomCode.trim()) {
            setJoinError("Please enter a room code");
            return;
        }

        // Show loading state
        setIsJoining(true);

        try {
            // Simulate API call to validate room code
            await new Promise(resolve => setTimeout(resolve, 1000));

            // For demo purposes, let's check if the code is exactly 6 characters
            // In a real implementation, you would validate against your backend
            if (roomCode.length === 6) {
                // Valid code - navigate to the lobby with the room code
                navigate(`/createlobby?code=${roomCode}`);
            } else {
                // Invalid code
                setJoinError("Invalid room code. Please check and try again.");
            }
        } catch (error) {
            setJoinError("Error joining room. Please try again.");
            console.error("Join room error:", error);
        } finally {
            setIsJoining(false);
        }
    };


    const handleCreateLobby = async () => {

        const lobbyData = {
            level: 1,
            map: "desert"
        };

        try {
            //console.log("askdjhsakd", `http://192.168.50.31:3000/rest/users/${userData?.userId}/matches`);
            //console.log("userData", userData?.userId);
            const response = await api.post(`/rest/users/${userData?.userId}/matches`, lobbyData);
            //console.log("API response:", response.data);
            navigate(`/createlobby?code=${response.data.code}`);
        } catch (error) {
            console.error("Error in handleCreateLobby:", error);
            const Error = (error as any);
            if (Error.response) {
                console.error(`Server error: ${Error.response.data?.message || Error.response.statusText}`);
            } else if (Error.request) {
                console.error("Network error: Unable to reach the server");
            } else {
                console.error(`Error: ${Error.message}`);
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
                <button className="join-screen__button" onClick={openModal}>
                    Join Lobby
                </button>
                <button className="join-screen__button" onClick={handleCreateLobby}>
                    Create Lobby
                </button>
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
                            placeholder="Enter 6-Digit Lobby Code"
                            className={`join-modal-input ${joinError ? 'input-error' : ''}`}
                            value={roomCode}
                            onChange={handleRoomCodeChange}
                            // Automatically convert to uppercase
                            style={{ textTransform: 'uppercase' }}
                            maxLength={6}
                        />

                        {joinError && (
                            <div className="join-error-message">
                                {joinError}
                            </div>
                        )}

                        <div className="join-modal-buttons">
                            <button
                                className="join-modal-button-cancel"
                                onClick={closeModal}
                                disabled={isJoining}
                            >
                                Cancel
                            </button>
                            <button
                                className="join-modal-button-join"
                                onClick={handleJoinLobby}
                                disabled={isJoining || !roomCode.trim()}
                            >
                                {isJoining ? 'Joining...' : 'Join'}
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
