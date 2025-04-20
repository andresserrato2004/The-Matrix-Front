import FruitSelector from "./fruitSelector/FruitSelector";
import { useFruitBar } from "../../../../contexts/game/FruitBar/FruitBarContext";
import "./FruitBar.css";

interface FruitBarProps {
  fruits: string[];
  selectedFruit: string;
}

export default function FruitBar({ fruits, selectedFruit }: FruitBarProps) {

  const { state, dispatch } = useFruitBar();

  return (
    <div className="fruit-bar">
      <div className="fruit-bar-container">
        <img
          src="/game-screen/footer/fruit-bar.webp"
          alt="Barra de frutas"
          className="fruit-bar-image"
        />
        <div className="fruit-items-container">
          {state.fruits.map((fruit) => (
            <div key={fruit} className="fruit-item">
              <FruitSelector fruitName={fruit} actualFruit={state.actualFruit} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
