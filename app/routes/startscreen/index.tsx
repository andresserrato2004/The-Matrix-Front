import { useNavigate, useSearchParams } from "@remix-run/react";
import { useState, useEffect } from "react";
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

}

export default function StartScreen() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [error, setError] = useState("");
    const { setUserData, userData } = useUser();
    const { state: usersState, dispatch: usersDispatch } = useUsers();
    const [showScoreModal, setShowScoreModal] = useState(false);

    const handleAuthCode = async () => {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const sessionState = searchParams.get('session_state');

        console.log("code aqui :", code);
        if (code && state && sessionState) {
            try {
                const response = await api.get('/rest/redirect', {
                    params: {
                        code: code,
                    }
                });
                console.log("response aqui :", response?.data.accessToken);
                localStorage.setItem('token', response?.data.accessToken);
            } catch (error) {
                console.error('Error getting redirect:', error);
            }
        }
    };

    useEffect(() => {
        handleAuthCode();
    }, [searchParams]);

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