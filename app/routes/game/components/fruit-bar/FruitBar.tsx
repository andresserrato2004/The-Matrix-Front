import FruitSelector from "./fruitSelector/FruitSelector";
import "./FruitBar.css";

interface FruitBarProps {
  fruits: string[];
  selectedFruit: string;
}

export default function FruitBar({ fruits, selectedFruit }: FruitBarProps) {
  return (
    <div className="fruit-bar">
      <div className="fruit-bar-container">
        <img
          src="/game-screen/footer/fruit-bar.webp"
          alt="Barra de frutas"
          className="fruit-bar-image"
        />
        <div className="fruit-items-container">
          {fruits.map((fruit) => (
            <div key={fruit} className="fruit-item">
              <FruitSelector fruitName={fruit} actualFruit={selectedFruit} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
