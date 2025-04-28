import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

declare module "@remix-run/node" {
  interface Future {
    v3_singleFetch: true;
  }
}

export default defineConfig(({ mode }) => {
  // Carga las variables de entorno según el modo
  const env = loadEnv(mode, process.cwd(), '');
  
  // Obtiene el puerto desde las variables de entorno o usa 3000 como valor por defecto
  const port = parseInt(env.PORT || env.VITE_PORT || '3005', 10);
  
  console.log(`Starting Vite server on port ${port}`);
  
  return {
    plugins: [
      remix({
        future: {
          v3_fetcherPersist: true,
          v3_relativeSplatPath: true,
          v3_throwAbortReason: true,
          v3_singleFetch: true,
          v3_lazyRouteDiscovery: true,
        },
      }),
      tsconfigPaths(),
    ],
    server: {
      port: port,
      strictPort: true, // Falla si el puerto está en uso en lugar de buscar otro
    },
  };
});