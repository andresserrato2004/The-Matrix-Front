import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [react(), tsconfigPaths()],
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: ["./test/setup.ts"],
		exclude: [
			"**/node_modules/**",
			"**/dist/**",
			"**/.{idea,git,cache,output,temp}/**",
			"**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress}.config.*",
			// Archivos específicos a ignorar
			".eslintrc.cjs",
			"cors-proxy.js",
			"postcss.config.js",
			"server.js",
			"tailwind.config.ts",
			"vite.config.ts",
			"vitest.config.ts",
			"app/entry.client.tsx",
			"app/entry.server.tsx",
			"app/graph.js",
			"app/index.js",
			"app/msalConfig.ts",
			"app/root.tsx",
			"app/server.ts",
			"app/contexts/game/GameWebSocketProvider.tsx",
			"app/routes/game/index.tsx",
			"app/config.ts",
			"app/routes/game/components/board/ice-cream/IceCream.tsx",
			// Servicios
			"app/services/**",
			"app/services/api.ts",
			"app/services/websocket.ts",
			// Build files
			"build/**",
			"build/client/**",
			"build/client/assets/**",
			"build/server/**",
			"build/server/assets/**",
			// Test files
			"test/routes/game/index.testss.tsx",
		],
		include: ["test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "lcov", "html"],
			exclude: [
				"node_modules/",
				"test/setup.ts",
				".eslintrc.cjs",
				"cors-proxy.js",
				"postcss.config.js",
				"server.js",
				"tailwind.config.ts",
				"vite.config.ts",
				"vitest.config.ts",
				"app/entry.client.tsx",
				"app/entry.server.tsx",
				"app/graph.js",
				"app/index.js",
				"app/msalConfig.ts",
				"app/root.tsx",
				"app/server.ts",
				// Servicios
				"app/services/**",
				// Build files
				"build/**",
				"build/client/**",
				"build/server/**",
				// Config files
				"app/config/**",
				"app/config/index.ts",
				// Game types and components
				"app/routes/game/**",
				"app/routes/game/index.tsx",
				"app/routes/game/meta.ts",
				"app/routes/game/components/board/enemy/**",
				"app/routes/game/components/board/enemy/Troll.tsx",
				"app/routes/game/components/board/fruit/**",
				"app/routes/game/components/board/fruit/Fruit.tsx",
				"app/routes/game/components/board/ice-block/**",
				"app/routes/game/components/board/ice-block/IceBlock.tsx",
				"app/routes/game/components/board/ice-cream/**",
				"app/routes/game/components/board/ice-cream/IceCream.tsx",
				// Contexts
				"app/contexts/game/types/**",
			],
			all: true,
			thresholds: {
				statements: 40,
				branches: 40,
				functions: 40,
				lines: 40,
			},
		},
	},
});
