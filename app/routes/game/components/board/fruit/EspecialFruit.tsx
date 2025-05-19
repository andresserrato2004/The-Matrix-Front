import { useFreezeFrames } from "~/hooks/useFreezeFrames";
import type { BoardCell, EspecialFruitInformation } from "../../../../../types/types";
import "./Fruit.css";

type FruitProps = {
  fruitInformation: EspecialFruitInformation;
};

export default function EspecialFruit({ fruitInformation }: FruitProps) {

  const { coordinates } = fruitInformation;


  const src = "/fruits/especial.webp";

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
