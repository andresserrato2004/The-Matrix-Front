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
    type: 'win' | 'lose' | 'pause' | 'reconnecting';
    onResume?: () => void;
}

export default function ModalWinLose({
    title = "Game Over",
    message = "try again",
    isVisible,
    onClose,
    type = 'lose',
    onResume
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

    const getModalContent = () => {
        switch (type) {
            case 'win':
                return {
                    title: "¡Victoria!",
                    message: "¡Felicidades! Has ganado la partida.",
                    buttons: (
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
                    )
                };
            case 'lose':
                return {
                    title: "Game Over",
                    message: "¡Inténtalo de nuevo!",
                    buttons: (
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
                    )
                };
            case 'pause':
                return {
                    title: "Pausa",
                    message: "El juego está en pausa",
                    buttons: (
                        <>
                            <button
                                type="button"
                                className="modal-button modal-button-resume"
                                onClick={onResume}
                            >
                                Continuar
                            </button>
                            <button
                                type="button"
                                className="modal-button modal-button-back"
                                onClick={goToLobby}
                            >
                                Salir
                            </button>
                        </>
                    )
                };
            case 'reconnecting':
                return {
                    title: "Reconectando",
                    message: "Intentando reconectar al servidor...",
                    buttons: (
                        <div className="reconnecting-spinner">
                            <div className="spinner"></div>
                            <p>Por favor, espera...</p>
                        </div>
                    )
                };
        }
    };

    const modalContent = getModalContent();

    return (
        <>
            {showModal && (
                <div
                    className="modal-overlay"
                    onClick={type === 'pause' ? closeModal : undefined}
                    onKeyDown={(e) => e.key === 'Escape' && type === 'pause' && closeModal()}
                    aria-modal="true"
                    tabIndex={-1}
                >
                    <div
                        className={`modal-content ${type}`}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h2 className="modal-title">{modalContent.title}</h2>
                        </div>

                        <div className="modal-body">
                            <p className="modal-message">{modalContent.message}</p>
                        </div>

                        <div className="modal-buttons-container">
                            {modalContent.buttons}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}