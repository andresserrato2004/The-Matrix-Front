import { useNavigate } from "@remix-run/react";
import { useState } from "react";
import { useUser } from "../../contexts/user/userContext";
import api from "../../services/api";
import "./styles.css";
import { useUsers } from "~/contexts/UsersContext";
import Button from "~/components/shared/Button";

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

export default function StartScreen() {
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const { setUserData, userData } = useUser();
    const { state: usersState, dispatch: usersDispatch } = useUsers();

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
                <img className="menuImage" src="/parte_cafe.png" alt="menu" />
                <div className="start-screen__buttons">
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
                        onClick={() => navigate("/help")}
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
        </div>
    );
}