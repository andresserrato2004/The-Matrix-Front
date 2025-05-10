import type { Character, BoardCell, Item } from "../../../../../contexts/game/types/types";

export default function Troll({ trollInformation }: { trollInformation: BoardCell }) {

  return (
    <div
      className="troll"
      style={
        {
          width: "50px",
          height: "50px",
        }}>
      <img src={"/game-screen/board/enemy/troll/Trolls_moving_up.webp"} alt={"Troll Enemy"} />
    </div>
  );
}
