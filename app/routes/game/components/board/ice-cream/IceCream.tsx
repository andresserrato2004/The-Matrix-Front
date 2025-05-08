import { useState, useEffect, useMemo } from "react";
import "./IceCream.css";
import type { UserInformation } from "~/contexts/game/types/types";

export default function IceCream(props: UserInformation) {
  const [isMoving, setIsMoving] = useState(false);
  const [prevPosition, setPrevPosition] = useState(props.position);

  // Memoize the image path to prevent unnecessary recalculations
  const imgPath = useMemo(() =>
    props.state === "alive"
      ? `/ice-creams/${props.flavour}/${props.direction}.png`
      : `/ice-creams/${props.flavour}/dead.png`,
    [props.state, props.flavour, props.direction]
  );

  useEffect(() => {
    if (prevPosition.x !== props.position.x || prevPosition.y !== props.position.y) {
      setIsMoving(true);
      const timer = setTimeout(() => setIsMoving(false), 200);
      setPrevPosition(props.position);
      return () => clearTimeout(timer);
    }
  }, [props.position, prevPosition]);

  // Memoize the style object to prevent unnecessary recalculations
  const style = useMemo(() => ({
    left: `${props.position.y * 40}px`,
    top: `${props.position.x * 40}px`,
    transform: `scale(${isMoving ? 1 : 0.9})`
  }), [props.position.x, props.position.y, isMoving]);

  return (
    <div
      className={`IceCream ${isMoving ? 'moving' : ''}`}
      style={style}
    >
      <img src={imgPath} alt={`Player ${props.name}`} />
    </div>
  );
}
