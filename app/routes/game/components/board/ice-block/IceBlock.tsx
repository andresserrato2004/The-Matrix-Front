// src/components/IceBlock.tsx
import { useFreezeFrames } from "~/hooks/useFreezeFrames";
import type { BoardCell } from "~/types/types";
import "./IceBlock.css";

export default function IceBlock({ blockInformation }: { blockInformation: BoardCell }) {
  const { frozen, coordinates } = blockInformation;
  const path = blockInformation.item? `/fruits/frozen-${blockInformation.item.type}.webp` : "/game-screen/board/ice-block/ice-block.webp";

  const freezeImage = useFreezeFrames(
    frozen,
    path
  );

  const src = freezeImage ?? path;

  return (
    <div
      className="ice-block"
      style={{
        left: `${coordinates.x * 40}px`,
        top: `${coordinates.y * 40}px`,
      }}
    >
      <img src={src} alt="Ice Block" />
    </div>
  );
}
