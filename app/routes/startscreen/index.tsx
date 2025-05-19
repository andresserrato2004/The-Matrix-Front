import { useNavigate } from "@remix-run/react";
import { useState } from "react";
import { useUser } from "../../contexts/user/userContext";
import api from "../../services/api";
import "./styles.css";
import { useUsers } from "~/contexts/UsersContext";
import Button from "~/components/shared/Button";
import Modal from '~/components/modal/Modal';
import "~/components/modal/styles.css";
import { useMsal } from "@azure/msal-react";


interface ApiError {
    response?: {
        data?: {
            message?: string;
        };
        statusText?: string;
    };
    request?: unknown;
    message?: string;
}

export function MicrosoftLoginButton() {
    const { instance, accounts } = useMsal();

    const handleLogin = () => {
        instance.loginPopup({
            scopes: ["User.Read"],
        });
    };

    return (
        <>
            <Button
                variant="primary"
                size="large"
                onClick={handleLogin}
                className="microsoft-login-btn"
                style={{
                    background: "linear-gradient(90deg, #1a2a6c, #b21f1f, #fdbb2d)",
                    color: "#fff",
                    border: "2px solid #ffd700",
                    borderRadius: "12px",
                    fontWeight: "bold",
                    fontSize: "1.1rem",
                    boxShadow: "0 4px 16px rgba(26,42,108,0.15)",
                    marginTop: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                }}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" style={{ marginRight: 8 }}>
                    <rect x="1" y="1" width="10" height="10" fill="#F35325" />
                    <rect x="13" y="1" width="10" height="10" fill="#81BC06" />
                    <rect x="1" y="13" width="10" height="10" fill="#05A6F0" />
                    <rect x="13" y="13" width="10" height="10" fill="#FFBA08" />
                </svg>
                Iniciar sesión con Microsoft
            </Button>
            {accounts.length > 0 && (
                <div>
                    Sesión iniciada como: <b>{accounts[0].username}</b>
                </div>
            )}
        </>
    );
}

export default function StartScreen() {
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const { setUserData, userData } = useUser();
    const { state: usersState, dispatch: usersDispatch } = useUsers();
    const [showScoreModal, setShowScoreModal] = useState(false);

    const handleStartGame = async () => {
        console.log("handleStartGame");
        setError("");
        try {
            console.log("handleStartGame - Before API call");
            const response = await api.post("/rest/users", {}, {
                withCredentials: false,
            });

            const userId = response?.data?.userId;
            if (userId) {
                if (typeof setUserData !== 'function') {
                    setError("Internal error: setUserData not available");
                    return;
                }

                console.log("handleStartGame - Setting userId:", userId);
                setUserData(userId);
                usersDispatch({
                    type: "SET_MAIN_USER",
                    payload: {
                        ...usersState.mainUser,
                        id: userId,
                    },
                });

                // Navigate to the lobby
                navigate("/joinscreen");
                console.log("hola:", userData?.userId);
            } else {
                console.error("Invalid response data:", response.data);
                setError("Invalid response from server: Missing userId");
            }
        }
        catch (error) {
            console.error("Error in handleStartGame:", error);
            const apiError = error as ApiError;

            if (apiError.response) {
                setError(`Server error: ${apiError.response.data?.message || apiError.response.statusText}`);
            } else if (apiError.request) {
                setError("Network error: Unable to reach the server");
            } else {
                setError(`Error: ${apiError.message || 'Unknown error occurred'}`);
            }
        }
    };

    return (
        <div className="start-screen">
            <img className="logoImage" src="/image.png" alt="Logo" />
            <div className="start-screen__menu">
                <div className="button-panel">
                    <Button
                        variant="primary"
                        size="large"
                        onClick={handleStartGame}
                    >
                        Start Game
                    </Button>
                    <Button
                        variant="secondary"
                        size="large"
                        onClick={() => setShowScoreModal(true)}
                    >
                        Help
                    </Button>
                    <MicrosoftLoginButton />
                </div>
            </div>
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {/* Modal de los helados */}
            <Modal
                isOpen={showScoreModal}
                onClose={() => setShowScoreModal(false)}
                bgImage=""
                className="icecream-modal"
                blurAmount="0px"
            >
                <div className="icecream-modal-content">
                    <h2 style={{
                        color: "#bfa13a",
                        fontWeight: "bold",
                        fontSize: "1.5rem",
                        marginBottom: "10px",
                        textShadow: "0 2px 8px #fff6"
                    }}>
                        Ice Cream Score
                    </h2>
                    <div className="icecream-score-icons">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <img
                                key={`icecream-cone-svg-${i}-${Date.now()}`}
                                src="/assets/ice-cream-cone.svg"
                                alt="ice cream"
                                className="icecream-cone"
                                style={{ opacity: 0.25 }}
                            />
                        ))}
                    </div>
                    <div className="icecream-score-bottom">
                        <img src="/assets/poob.svg" alt="poop" className="icecream-poop left" />
                        <img src="/assets/poob.svg" alt="poop" className="icecream-poop right" />
                    </div>
                    <Button
                        variant="secondary"
                        size="large"
                        onClick={() => setShowScoreModal(false)}
                        style={{ marginTop: "24px" }}
                    >
                        Salir
                    </Button>
                </div>
            </Modal>
        </div>
    );
}