import { useState, useEffect } from "react";
import { ws } from "~/services/websocket";
import type {Character, BoardCell, Item } from "../types/types";

export default function Troll({trollInformation}: {trollInformation: BoardCell}) {

  return (
    <div className="troll" style={{ left: `${trollInformation.x * 40}px`, top: `${trollInformation.y * 40}px` }}>
      <img src={"/assets/enemy-troll.webp"} alt={"Troll Enemy"} />
    </div>
  );
}
