// src/components/Fruit.tsx
import { useFreezeFrames } from "~/hooks/useFreezeFrames";
import type { BoardCell } from "../../../../../types/types";
import "./Fruit.css";

type FruitProps = {
  fruitInformation: BoardCell;
  subtype: string;
};

export default function Fruit({ fruitInformation, subtype }: FruitProps) {

  const { frozen, coordinates } = fruitInformation;

  const freezeImage = useFreezeFrames(
    frozen,
    `/fruits/frozen-${subtype}.webp`
  );

  const src = freezeImage ?? `/fruits/${subtype}.webp`;

  if (fruitInformation.frozen) return null;

  return (
    <div
      className="fruit"
      style={{
        left: `${coordinates.x * 40}px`,
        top: `${coordinates.y * 40}px`,
      }}
    >
      <img src={src} alt={`Fruit ${subtype}`} />
    </div>
  );
}
