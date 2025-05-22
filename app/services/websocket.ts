const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || "ws://localhost:3000";

const ws: WebSocket | null = null;
const messageQueue: Message[] = []; // Queue to store messages when WebSocket is not ready

interface Message {
	message: string;
	[key: string]: unknown;
}


export function createWebSocketConnection(path = ""): WebSocket {
	const wsUrl = `${WS_BASE_URL}${path}`;
	const token = localStorage.getItem('token');
	
	const wsConnection = new WebSocket(wsUrl, token || undefined);

	console.log("WEBSOCKET WebSocket:", wsUrl);

	wsConnection.onopen = () => {
		console.log("WebSocket abierto:", wsUrl);

		// Send all queued messages
		while (messageQueue.length > 0) {
			const message = messageQueue.shift();
			if (ws) {
				ws.send(JSON.stringify(message));
				console.log("Queued message sent:", message);
			}
		}
	};

	wsConnection.onclose = (event) => {
		console.log("WebSocket cerrado:", event);
	};

	wsConnection.onerror = (error) => {
		console.error("Error en WebSocket:", error);
	};

	return wsConnection;
}

// Function to send messages through WebSocket
export function sendMessage(message: Message): void {
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
		console.log("WebSocket connection closed manually");
	}
}

export { ws };
