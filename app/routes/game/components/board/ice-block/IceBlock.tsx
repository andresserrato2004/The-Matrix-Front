// src/components/IceBlock.tsx
import { useFreezeFrames } from "~/hooks/useFreezeFrames";
import type { BoardCell } from "~/contexts/game/types/types";
import "./IceBlock.css";

export default function IceBlock({ blockInformation }: { blockInformation: BoardCell }) {
  const { frozen, coordinates } = blockInformation;

  const freezeImage = useFreezeFrames(
    frozen,
    "/game-screen/board/ice-block/ice-block.webp"
  );

  const src = freezeImage ?? "/game-screen/board/ice-block/iceblock-.webp";

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
