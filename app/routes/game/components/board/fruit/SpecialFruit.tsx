import type { BoardCell } from "~/types/types";
import Sign from "../sign/Sign";
import "./Fruit.css";

type FruitProps = {
  fruitInformation: BoardCell;
};

export default function SpecialFruit({ fruitInformation }: FruitProps) {

  const src = "/fruits/especial.webp";
  const { coordinates } = fruitInformation;

  if (fruitInformation.frozen) return (
    <div
      className="fruit"
      style={{
        left: `${coordinates.x * 40}px`,
        top: `${coordinates.y * 40 * 0}px`,
      }}
      >
        <Sign x={fruitInformation.coordinates.x} y={fruitInformation.coordinates.y} 
          styles={{ left: `${coordinates.x * 40}px`, top: `${coordinates.y * 40}px` }} 
          sign="exclamation" />
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
