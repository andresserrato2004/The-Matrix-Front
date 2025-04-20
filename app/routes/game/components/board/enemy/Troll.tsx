import { useState, useEffect } from "react";
import { ws } from "~/services/websocket";
import type {Character, BoardCell, Item } from "../../../../../contexts/game/types/types";

export default function Troll({trollInformation}: {trollInformation: BoardCell}) {

  return (
    <div className="troll" style={{ left: `${trollInformation.x * 40}px`, top: `${trollInformation.y * 40}px` }}>
      <img src={"/game-screen/board/enemy/troll/Trolls_moving_up.webp"} alt={"Troll Enemy"} />
    </div>
  );
}
