import { useNavigate } from "@remix-run/react";
import { useState } from "react";
import "./styles.css"
import { useUser } from "~/contexts/user/userContext";
import api from "~/services/api";

type ModalWinLoseProps = {
    title?: string;
    message?: string;
    isVisible?: boolean;
    onClose?: () => void;
    type: 'win' | 'lose';
}

export default function ModalWinLose({
    title = "Game Over",
    message = "try again",
    isVisible,
    onClose,
    type = 'lose'
}: ModalWinLoseProps) {

    const navigate = useNavigate();
    const { userData } = useUser();
    const [isCreatingLobby, setIsCreatingLobby] = useState(false);

    const [showModalInternal, setShowModalInternal] = useState(true);

    const showModal = isVisible !== undefined ? isVisible : showModalInternal;

    const closeModal = () => {
        if (onClose) {
            onClose();
        } else {
            setShowModalInternal(false);
        }
    };

    const goToLobby = async () => {
        setIsCreatingLobby(true);
        const lobbyData = {
            level: 1,
            map: "desert"
        };

        try {
            const response = await api.post(`/rest/users/${userData?.userId}/matches`, lobbyData);
            console.log("response", response.data);
            navigate(`/createlobby?code=${response.data.code}`);
        } catch (error) {
            console.error("Error creating new lobby:", error);
            const err = (error as Error | { response?: { data?: { message?: string }, statusText?: string }, request?: unknown });
            if ('response' in err && err.response) {
                console.error(`Server error: ${err.response.data?.message || err.response.statusText}`);
            } else if ('request' in err && err.request) {
                console.error("Network error: Unable to reach the server");
            } else {
                console.error(`Error: ${error}`);
            }
            setIsCreatingLobby(false);
        }

        navigate("/createlobby")
    }

    const playAgain = async () => {
        setIsCreatingLobby(true);
        const lobbyData = {
            level: 1,
            map: "desert"
        };

        try {
            const response = await api.post(`/rest/users/${userData?.userId}/matches`, lobbyData);
            console.log("response", response.data);
            navigate(`/createlobby?code=${response.data.code}`);
        } catch (error) {
            console.error("Error creating new lobby:", error);
            const err = (error as Error | { response?: { data?: { message?: string }, statusText?: string }, request?: unknown });
            if ('response' in err && err.response) {
                console.error(`Server error: ${err.response.data?.message || err.response.statusText}`);
            } else if ('request' in err && err.request) {
                console.error("Network error: Unable to reach the server");
            } else {
                console.error(`Error: ${error}`);
            }
            setIsCreatingLobby(false);
        }
    }

    return (
        <>
            {showModal && (
                <div
                    className="modal-overlay"
                    onClick={closeModal}
                    onKeyDown={(e) => e.key === 'Escape' && closeModal()}
                    aria-modal="true"
                    tabIndex={-1}
                >
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h2 className="modal-title">{title}</h2>
                        </div>

                        <div className="modal-body">
                            <p className="modal-message">{message}</p>
                        </div>

                        <div className="modal-buttons-container">
                            {type === 'win' ? (
                                <>
                                    <button
                                        type="button"
                                        className="modal-button modal-button-win"
                                        onClick={playAgain}
                                        disabled={isCreatingLobby}
                                    >
                                        {isCreatingLobby ? 'Creating...' : 'Play again'}
                                    </button>

                                    <button
                                        type="button"
                                        className="modal-button modal-button-back"
                                        onClick={goToLobby}
                                        disabled={isCreatingLobby}
                                    >
                                        Volver al lobby
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        className="modal-button modal-button-lose"
                                        onClick={playAgain}
                                        disabled={isCreatingLobby}
                                    >
                                        {isCreatingLobby ? 'Creating...' : 'Play again'}
                                    </button>
                                    <button
                                        type="button"
                                        className="modal-button modal-button-back"
                                        onClick={goToLobby}
                                        disabled={isCreatingLobby}
                                    >
                                        Volver al lobby
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}