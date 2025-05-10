import "./IceCream.css";
import type { UserInformation } from "~/types/types";

export default function IceCream(props: UserInformation) {
  const imgPath = props.state === "alive" ? `/ice-creams/${props.flavour}/${props.direction}.png`: `/ice-creams/${props.flavour}/dead.png`;

  return (
    <div className="IceCream" style={{ left: `${props.position.y * 40}px`, top: `${props.position.x * 40}px` }}>
      <img src={imgPath} alt={`Player ${props.name}`} />
    </div>
  );
}
  