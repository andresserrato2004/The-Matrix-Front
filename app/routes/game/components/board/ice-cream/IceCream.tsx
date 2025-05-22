import { useRef, useEffect, useState } from "react";
import type { SpriteSheetInfo, Frame } from "~/types/animation";
import { loadSprite } from "~/utils/spriteLoader";
import type { UserInformation } from "~/types/types";
import "./IceCream.css";


export default function SpriteEnemy({ iceCreamInformation, styles }: { iceCreamInformation: UserInformation, styles: any }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tick, setTick] = useState(0);
  const [spriteData, setSpriteData] = useState<SpriteSheetInfo | null>(null);

  const type = iceCreamInformation.flavour.toLowerCase();
  const animKey = iceCreamInformation.state !== "alive" ? iceCreamInformation.state : iceCreamInformation.direction;
  const [prevPosition, setPrevPosition] = useState(iceCreamInformation.position);
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    if (prevPosition.x !== iceCreamInformation.position.x || prevPosition.y !== iceCreamInformation.position.y) {
      setIsMoving(true);
      const timer = setTimeout(() => setIsMoving(false), 200);
      setPrevPosition(iceCreamInformation.position);
      return () => clearTimeout(timer);
    }
  }, [iceCreamInformation.position, prevPosition]);

  // Carga el sprite JSON (una sola vez por tipo gracias a la caché)
  useEffect(() => {
    if (!type) return;
    loadSprite(type, "icecream").then(setSpriteData).catch(console.error);
  }, [type]);

  // Avanza frame según fps
  useEffect(() => {
    if (!spriteData) return;
    const anim = spriteData.animations[animKey];
    const interval = setInterval(() => {
      setTick(prev => prev + 1);
    }, 1000 / anim.fps);
    return () => clearInterval(interval);
  }, [spriteData, animKey]);

  // Dibuja en canvas
  useEffect(() => {
    if (!spriteData) return;
    const ctx = canvasRef.current?.getContext("2d");

    if (!ctx) return;

    const anim = spriteData.animations[animKey];
    const frame: Frame = anim.frames[tick % anim.frames.length];

    const img = new Image();
    img.src = spriteData.imageUrl;
    img.onload = () => {
      ctx.clearRect(0, 0, frame.w, frame.h);
      ctx.drawImage(img, frame.x, frame.y, frame.w, frame.h, 0, 0, frame.w, frame.h);
    };
  }, [tick, spriteData, animKey]);

  if (!spriteData) return null;

  const anim = spriteData.animations[animKey];
  const frame = anim.frames[0];

  return (
    <canvas
      ref={canvasRef}
      width={frame.w}
      height={frame.h}
      style={{
        ...styles,
        position: "relative",
        left: `${iceCreamInformation.position.x * 0}px`,
        top: `${iceCreamInformation.position.y * 1.2}px `,
        transition: "0.2s ease-in-out",
        zIndex: 1,
      }}
    />
  );
}

