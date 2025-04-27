import { useEffect, useState } from "react";
import { ws } from "~/services/websocket";
import type {Character, BoardCell, Item } from "../../../../../contexts/game/types/types";
import "./IceBlock.css";

export default function IceBlock({ blockInformation }: { blockInformation: BoardCell }) {

  return (
    <div
      className="ice-block"
      style={{
        left: `${blockInformation.x * 40}px`,
        top: `${blockInformation.y * 40}px`,
      }}
    >
      <img src={"/assets/iceblock-.webp"} alt={"Ice Block"} />
    </div>
  );
}
