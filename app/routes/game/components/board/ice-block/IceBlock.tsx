import { useFreezeFrames } from "~/hooks/useFreezeFrames";
import type { BoardCell } from "~/types/types";
import "./IceBlock.css";

export default function IceBlock({ blockInformation, styles, cellSize }: { blockInformation: BoardCell, styles:any, cellSize: number }) {
  const { frozen, coordinates } = blockInformation;
  const path = "/game-screen/board/ice-block/Ice_Block.webp";
  const freezeImage = useFreezeFrames(
    frozen,
    path
  );
  const src = freezeImage ?? path;
  const blockWidth = Number.parseFloat(styles.width) * 1.4;
  const blockHeight = Number.parseFloat(styles.height) * 1.4;
  const delta = cellSize * 0.25;

  return (
    <div
      className="ice-block"
      style={{
        width: `${blockWidth}px`,
        height: `${blockHeight}px`,
        top: delta,
        right: delta,
        position: "relative",
      }}
    >
      <img src={src} alt="Ice Block" 
      style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
