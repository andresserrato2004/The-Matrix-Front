import { useMsal } from "@azure/msal-react";
import Button from "~/components/shared/Button";
import { useNavigate, useSearchParams } from "@remix-run/react";
import { useUser } from "~/contexts/user/userContext";
import api from "~/services/api";
import "./styles.css";
import { useEffect } from "react";

export function MicrosoftLoginButton() {
    const { instance, accounts } = useMsal();
    const navigate = useNavigate();
    const { setUserData } = useUser();

    const handleLogin = () => {
        // Redirigir a la página de login de Microsoft con el puerto correcto
        const redirectUri = `${window.location.origin}/login`;
        window.location.href = `${import.meta.env.VITE_API_BASE_URL}/rest/login?redirect_uri=${encodeURIComponent(redirectUri)}`;
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
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { setUserData } = useUser();

    // Manejar la redirección después del login
    useEffect(() => {
        const handleRedirect = async () => {
            try {
                const code = searchParams.get('code');
                const state = searchParams.get('state');
                const sessionState = searchParams.get('session_state');

                if (code && state && sessionState) {
                    console.log("Received login callback with code:", code);
                    // Enviar el código al backend
                    const response = await api.post('/rest/redirect', {
                        code,
                        state,
                        session_state: sessionState,
                        redirect_uri: `${window.location.origin}/login`
                    });

                    // Guardar el token y la información del usuario
                    if (response.data.token) {
                        console.log("Received token from backend");
                        localStorage.setItem('token', response.data.token);

                        // Actualizar el contexto del usuario
                        setUserData({
                            ...response.data.user,
                            token: response.data.token
                        });

                        // Redirigir a la pantalla de inicio
                        navigate('/');
                    }
                }
            } catch (error) {
                console.error('Error during login redirect:', error);
            }
        };

        handleRedirect();
    }, [searchParams, navigate, setUserData]);

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