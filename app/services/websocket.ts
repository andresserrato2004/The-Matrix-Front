const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || "ws://localhost:3000";

let ws: WebSocket | null = null;
const messageQueue: Message[] = []; // Queue to store messages when WebSocket is not ready

interface Message {
	message: string;
	[key: string]: unknown;
}

export function createWebSocketConnection(path = ""): WebSocket {
	const wsUrl = `${WS_BASE_URL}${path}`;
	const token = localStorage.getItem("token");

	const wsConnection = new WebSocket(wsUrl, token || undefined);

	//console.log("WEBSOCKET WebSocket:", wsUrl);
	//console.log("WebSocket connection:", wsConnection);
	//console.log("WebSocket readyState:", wsConnection.readyState);

	// Asignar la conexión inmediatamente
	ws = wsConnection;
	console.log("WebSocket asignado:", ws);

	wsConnection.onopen = () => {
		console.log("WebSocket abierto:", wsUrl);
		console.log(
			"WebSocket readyState después de abrir:",
			wsConnection.readyState,
		);
		console.log("WebSocket actual:", ws);

		// Send all queued messages
		console.log("Sending queued messages", messageQueue);
		while (messageQueue.length > 0) {
			const message = messageQueue.shift();
			if (ws && ws.readyState === WebSocket.OPEN) {
				ws.send(JSON.stringify(message));
				console.log("Queued message sent:", message);
			}
		}
	};

	wsConnection.onclose = (event) => {
		console.log("WebSocket cerrado:", event);
		ws = null;
		console.log("WebSocket después de cerrar:", ws);
	};

	wsConnection.onerror = (error) => {
		console.error("Error en WebSocket:", error);
		ws = null;
		console.log("WebSocket después de error:", ws);
	};

	return wsConnection;
}

// Function to send messages through WebSocket
export function sendMessage(message: Message): void {
	//console.log("WebSocket - Enviando mensaje:", message);
	//console.log("WebSocket - Estado:", ws?.readyState);
	//console.log("WebSocket - URL:", ws?.url);
	//console.log("WebSocket - Conexión:", ws);

	if (ws && ws.readyState === WebSocket.OPEN) {
		const messageString = JSON.stringify(message);
		console.log("WebSocket - Enviando mensaje:", {
			message: message,
			raw: messageString,
			readyState: ws.readyState,
		});
		ws.send(messageString);
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
