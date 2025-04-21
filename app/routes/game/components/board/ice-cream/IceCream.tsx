import { useEffect, useRef, useState } from "react";
import { ws, sendMessage } from "~/services/websocket";
import "./IceCream.css";
import type { UserInformation } from "~/contexts/game/types/types";

export default function IceCream(props: UserInformation) {
  const [direction, setDirection] = useState(props.direction); 


  return (
    <div className="IceCream" style={{ left: `${props.position.y * 40}px`, top: `${props.position.x * 40}px` }}>
      <img src={`/assets/player-${props.flavour}.webp`} alt={`Player ${props.id}`} />
    </div>
  );
}
