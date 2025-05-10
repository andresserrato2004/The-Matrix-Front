import type { BoardCell } from "~/types/types";

export default function GifEnemy({ enemyInformation, styles }: { enemyInformation: BoardCell, styles:any }) {

  const path = `/game-screen/board/enemy/${enemyInformation.character?.type}/${enemyInformation.character?.orientation}.webp`;
  const width = enemyInformation.character?.orientation === "left" || enemyInformation.character?.orientation === "right" ? styles.width*0.5 : styles.width;
  const height = enemyInformation.character?.orientation === "left" || enemyInformation.character?.orientation === "right" ? styles.height*0.7 : styles.height;
  return (
    <div
      className="GifEnemy"
      style={{
      width,  
      height
      }}>
      <img
      src={path}
      alt={`${enemyInformation.character?.type} Enemy`}
      style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
