import type { BoardCell } from "~/types/types";

export default function Rock({ blockInformation, styles, cellSize }: { blockInformation: BoardCell, styles:any, cellSize: number }) {
  const src = "/game-screen/board/rocks/rock.webp";
  const blockWidth = Number.parseFloat(styles.width) * 0.90;
  const blockHeight = Number.parseFloat(styles.height) * 0.90;
  const delta = cellSize * 0.30;

  return (
    <div
      className="rock"
      style={{
        width: `${blockWidth}px`,
        height: `${blockHeight}px`,
        top: delta,
        right: 0,
        position: "relative",
      }}
    >
      <img src={src} alt="rock" 
      style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
