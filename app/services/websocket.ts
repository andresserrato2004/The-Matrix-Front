const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || "ws://localhost:3000";

let ws: WebSocket | null = null;
let messageQueue: any[] = []; // Queue to store messages when WebSocket is not ready

export function createWebSocketConnection(path = ""): WebSocket {
    const wsUrl = `${WS_BASE_URL}${path}`;
    ws = new WebSocket(wsUrl);
    console.log("WEBSOKET WebSocket:", wsUrl);

    ws.onopen = () => {
        console.log("WebSocket abierto:", wsUrl);

        // Send all queued messages
        while (messageQueue.length > 0) {
            const message = messageQueue.shift();
            ws.send(JSON.stringify(message));
            console.log("Queued message sent:", message);
        }
    };

    ws.onclose = (event) => {
        console.log("WebSocket cerrado:", event);
    };

    // ws.onmessage = (event) => {
    //     try {
    //         const message = JSON.parse(event.data);
    //         console.log("Received message:", message);

    //         if (message.message === 'match-found' && message.match && message.match.id) {
    //             console.log("Match found ID:", message.match.id);
    //         }
    //     } catch (error) {
    //         console.error("Error parsing WebSocket message:", error);
    //     }
    // };

    ws.onerror = (error) => {
        console.error("Error en WebSocket:", error);
    };

    return ws;
}

// Function to send messages through WebSocket
export function sendMessage(message: any): void {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
        console.log("Message sent:", message);
    } else {
        console.warn("WebSocket not connected. Message queued:", message);
        messageQueue.push(message); // Queue the message for later
    }
}

// Function to close the WebSocket connection
export function closeWebSocket(): void {
    if (ws) {
        ws.close();
        ws = null;
        console.log("WebSocket connection closed manually");
    }
}

export { ws };