import Fruit from "./Fruit";
import SpecialFruit from "./SpecialFruit";
import type { BoardCell } from "~/types/types";

interface FruitFactoryProps {
  fruitInformation: BoardCell;
  subtype: string;
}

export default function FruitFactory({ fruitInformation, subtype }: FruitFactoryProps) {
  if (fruitInformation.item?.type === "specialfruit") {
    return <SpecialFruit fruitInformation={fruitInformation} />;
  }
  // Por defecto, retorna Fruit
  return <Fruit fruitInformation={fruitInformation} subtype={subtype} />;
}