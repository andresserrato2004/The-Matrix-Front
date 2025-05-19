import type { SpriteSheetInfo } from "~/types/animation";

const spriteCache: Record<string, SpriteSheetInfo> = {};

export async function loadSprite(type: string): Promise<SpriteSheetInfo> {
  const key = type.toLowerCase();

  if (spriteCache[key]) return spriteCache[key];

  try {
    const response = await fetch(`/game-screen/board/enemy/${key}/${key}.json`);
    if (!response.ok) throw new Error(`No se pudo cargar /game-screen/board/enemy/${key}/${key}.json`);
    const data = await response.json();
    spriteCache[key] = data;
    return data;
  } catch (error) {
    console.error(`Error cargando el sprite ${key}.json`, error);
    throw error;
  }
}

