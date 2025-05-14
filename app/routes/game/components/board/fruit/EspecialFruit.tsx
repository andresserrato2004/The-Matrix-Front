import "./Fruit.css";

// src/components/Fruit.tsx
import { useFreezeFrames } from "~/hooks/useFreezeFrames";
import type { BoardCell } from "../../../../../types/types";
import "./Fruit.css";
import Sign from "../sign/Sign";

type FruitProps = {
  fruitInformation: BoardCell;
};

export default function EspecialFruit({ fruitInformation }: FruitProps) {

  const { frozen, coordinates } = fruitInformation;

  const freezeImage = useFreezeFrames(
    frozen,
    "/fruits/especial-frozen.webp"
  );

  const src = freezeImage ?? "/fruits/especial.webp";

  if (fruitInformation.frozen) return (
    <div
      className="fruit"
      style={{
        left: `${coordinates.x * 40}px`,
        top: `${coordinates.y * 40 * 0}px`,
      }}
      >
        <Sign x={fruitInformation.coordinates.x} y={fruitInformation.coordinates.y} styles={{ left: `${coordinates.x * 40}px`, top: `${coordinates.y * 40}px` }} sign="exclamation">

        </Sign>
      </div>
  );

  return (
    <div
      className="fruit"
      style={{
        left: `${coordinates.x * 40}px`,
        top: `${coordinates.y * 40}px`,
      }}
    >
      <img src={src} alt={"Especial Fruit"} />
    </div>
  );
}
