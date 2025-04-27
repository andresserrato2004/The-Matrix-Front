import { useEffect, useState } from "react";
import { ws } from "~/services/websocket";
import "./Fruit.css";
import type { BoardCell } from "../../../../../contexts/game/types/types";

type FruitProps = {
  fruitInformation: BoardCell;
  subtype: string;
};

export default function Fruit({ fruitInformation, subtype }: FruitProps) {
  return (
    <div
      className="fruit"
      style={{
        left: `${fruitInformation.x}px`,
        top: `${fruitInformation.y}px`,
        height: "50px",
        width: "50px",
      }}
    >
      <img src={`/fruits/${subtype}.webp`} alt={`Fruit ${subtype}`} />
    </div>
  );
}
