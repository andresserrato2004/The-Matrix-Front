import { useEffect, useState } from "react";

export function useFreezeFrames(
  isFrozen: boolean,
  finalImage: string
): string | null {
  const frameCount = 8;
  const frameDuration = 250; // ms
  const framePath = (i: number) => `/game-screen/board/ice-block/frames/ice-block-${i}.webp`;

  const [frameIndex, setFrameIndex] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!isFrozen) {
      setFrameIndex(0);
      setDone(false);
      return;
    }

    const interval = setInterval(() => {
      setFrameIndex((prev) => {
        if (prev < frameCount - 1) return prev + 1;
        clearInterval(interval);
        setDone(true);
        return prev;
      });
    }, frameDuration);

    return () => clearInterval(interval);
  }, [isFrozen]);

  if (!isFrozen) return null;
  return done ? finalImage : framePath(frameIndex);
}
