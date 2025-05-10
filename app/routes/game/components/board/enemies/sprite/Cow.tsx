import { useRef, useEffect, useState } from "react";
import type { SpriteSheetInfo, Animation, Frame } from "~/types/types/animation";
import type { BoardCell } from "~/types/types/types"; 
import spriteData from "./cow.json";

export default function Cow({ cow }: { cow: BoardCell }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tick, setTick] = useState(0);

  // El nombre de la animación según la orientación:
  const animKey = cow.character?.orientation || "down";
  const anim: Animation = (spriteData as SpriteSheetInfo).animations[animKey];

  // Avanza frame según fps
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(prev => prev + 1);
    }, 1000 / anim.fps);
    return () => clearInterval(interval);
  }, [anim.fps]);

  // Dibuja en canvas
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    const frame: Frame = anim.frames[tick % anim.frames.length];
    const img = new Image();
    img.src = (spriteData as SpriteSheetInfo).imageUrl;
    img.onload = () => {
      // limpia y dibuja
      ctx.clearRect(0, 0, frame.w, frame.h);
      ctx.drawImage(
        img,
        frame.x, frame.y, frame.w, frame.h,  // región origen
        0, 0, frame.w, frame.h               // destino en canvas
      );
    };
  }, [tick, anim]);

  // Posiciona el canvas sobre el tablero:
  return (
    <canvas
      ref={canvasRef}
      width={anim.frames[0].w}
      height={anim.frames[0].h}
      style={{
        position: "absolute",
        left:   `${cow.coordinates.x * anim.frames[0].w}px`,
        top:    `${cow.coordinates.y * anim.frames[0].h}px`,
        imageRendering: "pixelated"
      }}
    />
  );
}
