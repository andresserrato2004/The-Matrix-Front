import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import { MsalProvider } from "@azure/msal-react";
import { PublicClientApplication } from "@azure/msal-browser";
//import { msalConfig } from "./msalConfig";

import "./tailwind.css";
import { UserProvider } from "./contexts/user/userContext";
import { UsersProvider } from "./contexts/UsersContext";
import { GameWebSocketProvider } from "./contexts/game/GameWebSocketProvider";
import { HeaderProvider } from "./contexts/game/Header/HeaderContext";
import { BoardProvider } from "./contexts/game/Board/BoardContext";
import { FruitBarProvider } from "./contexts/game/FruitBar/FruitBarContext";

//const msalInstance = new PublicClientApplication(msalConfig);

export const links: LinksFunction = () => [
	{ rel: "preconnect", href: "https://fonts.googleapis.com" },
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous",
	},
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
	},
];

export default function App() {
	return (
		//<MsalProvider instance={msalInstance}>
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body style={{}}>
				<UserProvider>
					<UsersProvider>
						<HeaderProvider>
							<BoardProvider>
								<FruitBarProvider>
									<GameWebSocketProvider>
										<Outlet />
									</GameWebSocketProvider>
								</FruitBarProvider>
							</BoardProvider>
						</HeaderProvider>
					</UsersProvider>
				</UserProvider>
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
		//</MsalProvider>
	);
}
