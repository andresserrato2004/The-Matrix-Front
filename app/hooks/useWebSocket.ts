import { useState, useEffect, useCallback } from 'react';
import { useUser } from '~/contexts/user/userContext';
import { createWebSocketConnection, ws } from '~/services/websocket';

export function useWebSocket(initialPath = "") {
    const { userData } = useUser();
    const [websocket, setWebsocket] = useState(ws);
    
    // Conectar inicialmente si se proporciona un path
    useEffect(() => {
        if (initialPath && !websocket) {
            try {
                const newWs = createWebSocketConnection(initialPath);
                setWebsocket(newWs);
            } catch (error) {
                console.error("Error en la conexión WebSocket inicial:", error);
            }
        }
        
        // Limpieza al desmontar (opcional)
        return () => {
            // No cerramos el socket automáticamente
            // ya que puede estar siendo usado en otras partes
        };
    }, [initialPath]);
    
    // Función para conectar a un path específico
    const connect = useCallback((path) => {
        try {
            if (!path) {
                console.error("No WebSocket path provided");
                return null;
            }
            
            const newWs = createWebSocketConnection(path);
            setWebsocket(newWs);
            return newWs;
        } catch (error) {
            console.error("Error connecting to WebSocket:", error);
            return null;
        }
    }, []);
    
    // Función para enviar mensajes
    const sendMessage = useCallback((message) => {
        if (websocket && websocket.readyState === WebSocket.OPEN) {
            websocket.send(JSON.stringify(message));
        } else {
            console.warn("WebSocket not connected. Message not sent:", message);
        }
    }, [websocket]);
    
    return {
        ws: websocket,
        connect,
        sendMessage
    };
}
