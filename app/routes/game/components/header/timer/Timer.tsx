import { useState, useEffect } from "react";
import "./Timer.css";

type TimerProps = {
  isRunning: boolean;
  minutes: number;
  seconds: number;
};

export default function Timer({ isRunning, minutes, seconds}: TimerProps) {
  const frames = [
    "/game-screen/header/clock/clock-0.webp",
    "/game-screen/header/clock/clock-1.webp",
    "/game-screen/header/clock/clock-2.webp",
    "/game-screen/header/clock/clock-3.webp",
    "/game-screen/header/clock/clock-4.webp",
    "/game-screen/header/clock/clock-5.webp",
    "/game-screen/header/clock/clock-6.webp",
    "/game-screen/header/clock/clock-7.webp",
  ];

  const digitsRoute = "/game-screen/header/digits/digit-";
  const [clockFrame, setClockFrame] = useState(0);

  // Animación del reloj
  useEffect(() => {
    if (!isRunning) return;
    const frameInterval = setInterval(() => {
      setClockFrame((prev) => (prev + 1) % frames.length);
    }, 80);
    return () => clearInterval(frameInterval);
  }, [isRunning]);


  // Obtener dígitos individuales
  const tensMinutes = Math.floor(minutes / 10);
  const onesMinutes = minutes % 10;
  const tensSeconds = Math.floor(seconds / 10);
  const onesSeconds = seconds % 10;

  return (
    <div className="time-container">
      <img src={frames[clockFrame]} alt="Reloj animado" className="clock-animation" />
      <img className="clock-digits" src={`${digitsRoute}${tensMinutes}.webp`} alt={`Minutos decena: ${tensMinutes}`} />
      <img className="clock-digits" src={`${digitsRoute}${onesMinutes}.webp`} alt={`Minutos unidad: ${onesMinutes}`} />
      <img className="clock-digits" src="/game-screen/header/digits/colon.webp" alt="Dos puntos" />
      <img className="clock-digits" src={`${digitsRoute}${tensSeconds}.webp`} alt={`Segundos decena: ${tensSeconds}`} />
      <img className="clock-digits" src={`${digitsRoute}${onesSeconds}.webp`} alt={`Segundos unidad: ${onesSeconds}`} />
    </div>
  );
}