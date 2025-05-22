import type { SpriteSheetInfo } from "~/types/animation";

const spriteCache: Record<string, SpriteSheetInfo> = {};

export async function loadSprite(type: string, category: "enemy" | "icecream" = "enemy"): Promise<SpriteSheetInfo> {
  const key = type.toLowerCase();
  const path = category === "enemy" ? 
    `/game-screen/board/${category}/${type.toLowerCase()}/${type.toLowerCase()}.json` :
    `/ice-creams/${type.toLowerCase()}/${type.toLowerCase()}.json`;

  if (spriteCache[key]) return spriteCache[key];

  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`No se pudo cargar el sprite ${path}`);
    const data = await response.json();
    spriteCache[key] = data;
    return data;
  } catch (error) {
    console.error(`Error cargando el sprite ${path}`, error);
    throw error;
  }
}