import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface UserData {
    userId?: string;
    id?: string;
    username?: string;
    matchId?: string;
    position?: { x: number; y: number };
    direction?: string;
    imageUrl?: string;
    state?: string;
    [key: string]: any; // Para cualquier otra propiedad en la respuesta
}

// Define el tipo del contexto
interface UserContextType {
    userData: UserData | null;
    secondaryUserData: UserData | null; // Nuevo estado para el segundo usuario
    setUserData: (data: UserData | string | null) => void;
    setSecondaryUserData: (data: UserData | string | null) => void; // Nueva función para el segundo usuario
    isLoggedIn: boolean;
}

// Crea el contexto con valores predeterminados
const UserContext = createContext<UserContextType>({
    userData: null,
    secondaryUserData: null,
    setUserData: () => { },
    setSecondaryUserData: () => { },
    isLoggedIn: false
});

// Hook personalizado para usar el contexto de usuario
export const useUser = () => useContext(UserContext);

// Componente proveedor que envolverá tu aplicación
export function UserProvider({ children }: { children: ReactNode }) {
    // Estado para el primer usuario
    const [userData, setUserDataState] = useState<UserData | null>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('userData');
            return saved ? JSON.parse(saved) : null;
        }
        return null;
    });

    // Estado para el segundo usuario
    const [secondaryUserData, setSecondaryUserDataState] = useState<UserData | null>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('secondaryUserData');
            return saved ? JSON.parse(saved) : null;
        }
        return null;
    });

    // Función para actualizar el primer usuario
    const setUserData = (data: UserData | string | null) => {
        let newUserData: UserData | null = null;

        if (typeof data === 'string') {
            newUserData = { ...userData, userId: data };
        } else if (data && typeof data === 'object') {
            newUserData = { ...userData, ...data };
        }

        if (typeof window !== 'undefined') {
            if (newUserData) {
                localStorage.setItem('userData', JSON.stringify(newUserData));
            } else {
                localStorage.removeItem('userData');
            }
        }

        setUserDataState(newUserData);
    };

    // Función para actualizar el segundo usuario
    const setSecondaryUserData = (data: UserData | string | null) => {
        let newSecondaryUserData: UserData | null = null;

        if (typeof data === 'string') {
            newSecondaryUserData = { ...secondaryUserData, userId: data };
        } else if (data && typeof data === 'object') {
            newSecondaryUserData = { ...secondaryUserData, ...data };
        }

        if (typeof window !== 'undefined') {
            if (newSecondaryUserData) {
                localStorage.setItem('secondaryUserData', JSON.stringify(newSecondaryUserData));
            } else {
                localStorage.removeItem('secondaryUserData');
            }
        }

        setSecondaryUserDataState(newSecondaryUserData);
    };

    // Calcular si el usuario principal ha iniciado sesión
    const isLoggedIn = Boolean(userData && (userData.userId || userData.id));

    // Efecto para registrar cambios en los datos de usuario
    useEffect(() => {
        console.log("UserContext - userData changed:", userData);
        console.log("UserContext - secondaryUserData changed:", secondaryUserData);
    }, [userData, secondaryUserData]);

    // Valor del contexto construido con los datos actuales
    const contextValue = {
        userData,
        secondaryUserData,
        setUserData,
        setSecondaryUserData,
        isLoggedIn
    };

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
}