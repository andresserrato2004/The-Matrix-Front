import type { BoardCell } from "../../../../../contexts/game/types/types";
import "./Fruit.css";

type FruitProps = {
  fruitInformation: BoardCell;
  subtype: string;
};

export default function Fruit({ fruitInformation, subtype }: FruitProps) {
  return (
    <div
      className="fruit"
      style={{
        height: "40px",
        width: "40px",
      }}
    >
      <img src={`/fruits/${subtype}.webp`} alt={`Fruit ${subtype}`} />
    </div>
  );
}
