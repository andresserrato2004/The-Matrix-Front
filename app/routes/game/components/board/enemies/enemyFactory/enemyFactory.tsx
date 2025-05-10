// components/EnemyFactory.tsx
import GifEnemy from "../gif/GifEnemy";
import SpriteEnemy from "../sprite/SpriteEnemy";
import type { BoardCell } from "~/types/types";
import { enemyRenderMap } from "~/types/enemyTypes";

export default function EnemyFactory({
  enemyInformation,
  styles,
}: {
  enemyInformation: BoardCell;
  styles: any;
}) {
  const type = enemyInformation.character?.type?.toLowerCase();

  const renderType = type ? enemyRenderMap[type] : undefined;

  if (renderType === "gif") {
    return <GifEnemy enemyInformation={enemyInformation} styles={styles} />;
  }

  // Si no hay tipo o no está mapeado, usa SpriteEnemy por defecto
  return <SpriteEnemy enemyInformation={enemyInformation} styles={styles}/>;
}
