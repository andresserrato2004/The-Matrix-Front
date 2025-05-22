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
import IceCream from "../game/components/board/ice-cream/IceCream";


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
                        Instructions
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '20px 0' }}>
                        <div style={{ textAlign: 'center', marginTop: 16 }}>
                            Move the ice cream <b>up</b> <span style={{ fontSize: 24, marginRight: 8 }}>⬆️</span>
                            and <b>down</b> <span style={{ fontSize: 24, marginRight: 8 }}>⬇️</span>
                        </div>
                        <div style={{ textAlign: 'center', marginTop: 16 }}>
                            Change the flavour <b>left</b> <span style={{ fontSize: 24, marginRight: 8 }}>⬅️</span>
                            and <b>right</b> <span style={{ fontSize: 24, marginRight: 8 }}>➡️</span>
                        </div>
                        <div style={{ textAlign: 'center', marginTop: 16 }}>
                            <kbd style={{
                                padding: "4px 16px",
                                borderRadius: "6px",
                                border: "1px solid #bbb",
                                background: "rgb(32, 123, 241)",
                                fontWeight: "bold",
                                fontSize: "1.1em",
                                marginRight: 8,
                                boxShadow: "0 1px 2px #ccc"
                            }}>Space</kbd>
                            to <b>power</b> the ice cream
                        </div>
                    </div>
                    <Button
                        variant="secondary"
                        size="large"
                        onClick={() => setShowScoreModal(false)}
                        style={{ marginTop: "24px" }}
                    >
                        Exit
                    </Button>
                </div>
            </Modal>
        </div>
    );
}