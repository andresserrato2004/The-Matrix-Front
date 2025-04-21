import { useNavigate } from "@remix-run/react";
import { useState } from "react";
import { useUser } from "../../contexts/user/userContext";
import api from "../../services/api";
import "./styles.css";
import { useUsers } from "~/contexts/UsersContext";

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

            if (response.data && response.data.userId) {
                const userId = response.data.userId;

                if (typeof setUserData !== 'function') {
                    setError("Internal error: setUserData not available");
                    return;
                }

                console.log("handleStartGame - Setting userId:", userId);
                setUserData(userId);
                usersDispatch({ type: "SET_MAIN_USER", payload: { ...usersState.mainUser, id: userId } });

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
            const Error = (error as any);

            if (Error.response) {
                setError(`Server error: ${Error.response.data?.message || Error.response.statusText}`);
            } else if (Error.request) {
                setError("Network error: Unable to reach the server");
            } else {
                setError(`Error: ${Error.message}`);
            }
        }
    };


    return (
        <div className="start-screen">
            <img className="logoImage" src="/Bad_Ice_Cream.webp" alt="Logo" />
            <div className="start-screen__menu">
                <img className="menuImage" src="/parte_cafe.png" alt="menu" />
                <div className="start-screen__buttons">
                    <button
                        className="start-screen__button"
                        onClick={handleStartGame}
                    >
                        Start Game
                    </button>
                    <button className="start-screen__button" onClick={() => navigate("/help")}>
                        help
                    </button>
                </div>
            </div>
        </div>
    );
}