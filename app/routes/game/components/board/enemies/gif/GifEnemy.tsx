import type { BoardCell } from "~/types/types";

export default function GifEnemy({ enemyInformation, styles }: { enemyInformation: BoardCell, styles:any }) {

  const isStopped = enemyInformation.character?.enemyState === "stopped";
  const basePath = `/game-screen/board/enemy/${enemyInformation.character?.type}/`;
  const path = isStopped ? "stopped.webp" : `${enemyInformation.character?.orientation}.webp`;
  const fullPath = `${basePath}${path}`;
  const width = enemyInformation.character?.orientation === "left" || enemyInformation.character?.orientation === "right" ? styles.width*0.5 : styles.width;
  const height = enemyInformation.character?.orientation === "left" || enemyInformation.character?.orientation === "right" ? styles.height*0.7 : styles.height;
  
  if(enemyInformation.character?.enemyState === "stopped") console.log("estado del enemigo",enemyInformation.character?.enemyState);

  return (
    <div
      className="GifEnemy"
      style={{
      width,  
      height
      }}>
      <img
      src={fullPath}
      alt={`${enemyInformation.character?.type} Enemy`}
      style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
