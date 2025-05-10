import { useRef, useEffect, useState } from "react";
import type { SpriteSheetInfo, Frame } from "~/types/animation";
import type { BoardCell } from "~/types/types";
import { loadSprite } from "~/utils/spriteLoader";

export default function SpriteEnemy({ enemyInformation }: { enemyInformation: BoardCell, styles: any }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tick, setTick] = useState(0);
  const [spriteData, setSpriteData] = useState<SpriteSheetInfo | null>(null);

  const type = enemyInformation.character?.type?.toLowerCase();
  const animKey = enemyInformation.character?.orientation || "down";

  // Carga el sprite JSON (una sola vez por tipo gracias a la caché)
  useEffect(() => {
    if (!type) return;
    loadSprite(type).then(setSpriteData).catch(console.error);
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
        position: "absolute",
        left: `${enemyInformation.coordinates.x * frame.w}px`,
        top: `${enemyInformation.coordinates.y * frame.h}px`,
        imageRendering: "pixelated"
      }}
    />
  );
}
