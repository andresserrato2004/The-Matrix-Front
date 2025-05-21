import { useMsal } from "@azure/msal-react";
import Button from "~/components/shared/Button";
import "./styles.css";

export function MicrosoftLoginButton() {
    const { instance, accounts } = useMsal();

    const handleLogin = () => {
        const loginUrl = `${import.meta.env.VITE_API_BASE_URL}/rest/login`;
        window.location.href = loginUrl;
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
                <svg width="24" height="24" viewBox="0 0 24 24" style={{ marginRight: 8 }} aria-label="Microsoft Logo" role="img">
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

export default function LoginScreen() {
    return (
        <div className="login-screen">
            <div className="login-screen__menu">
                <div className="button-panel">
                    <MicrosoftLoginButton />
                </div>
            </div>
        </div>
    );
} 