import { useNavigate } from "@remix-run/react";
import { useState } from "react";
import "./styles.css"

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

    const [showModalInternal, setShowModalInternal] = useState(true);

    const showModal = isVisible !== undefined ? isVisible : showModalInternal;

    const closeModal = () => {
        if (onClose) {
            onClose();
        } else {
            setShowModalInternal(false);
        }
    };

    const goToLobby = () => {
        navigate("/createlobby")
    }

    const playAgain = () => {
        // aqui pa reiniciar el juego
        closeModal();

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
                                    >
                                        Play again
                                    </button>

                                    <button
                                        type="button"
                                        className="modal-button modal-button-back"
                                        onClick={goToLobby}
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
                                    >
                                        Play again
                                    </button>
                                    <button
                                        type="button"
                                        className="modal-button modal-button-back"
                                        onClick={goToLobby}
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