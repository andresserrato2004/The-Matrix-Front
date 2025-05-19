import type { BoardCell, EspecialFruitInformation } from "~/types/types";
import "./Fruit.css";

type FruitProps = {
  fruitInformation: EspecialFruitInformation;
};

export default function EspecialFruit({ fruitInformation }: FruitProps) {

  if (!fruitInformation || !fruitInformation.coordinates ) {
    return null;
  };

  const src = "/fruits/especial.webp";
  const { coordinates } = fruitInformation;

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
