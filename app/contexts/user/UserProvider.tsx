import { UserProvider } from "./userContext";
import type { ReactNode } from "react";
// Este componente debe envolver a tus rutas/componentes de la aplicación

export function UserProviders({ children }: { children: ReactNode }) {
    return (
        <UserProvider>
            {children}
        </UserProvider>
    );
}