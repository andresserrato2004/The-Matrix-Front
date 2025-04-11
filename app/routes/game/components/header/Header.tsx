import ScoreCounter from "./score-counter/ScoreCounter";
import Timer from "./timer/Timer";
import "./Header.css";

interface HeaderProps {
  isRunning: boolean;
  setIsRunning: (isRunning: boolean) => void;
  fruitsCounter: number;
  minutes: number;
  seconds: number;
  musicOn: boolean;
  setMusicOn: (musicOn: boolean) => void;
  soundEffectsOn: boolean;
  setSoundEffectsOn: (soundEffectsOn: boolean) => void;
}

export default function Header({
  isRunning, setIsRunning,
  fruitsCounter,
  minutes,
  seconds,
  musicOn, setMusicOn,
  soundEffectsOn, setSoundEffectsOn
}: HeaderProps) {

  return (
    <div className="header">
      {/* Scores */}
      <ScoreCounter score={fruitsCounter} playerNumber={1} />

      {/* Timer */}
      <Timer isRunning={isRunning} minutes={minutes} seconds={seconds} />

      {/* Settings buttons */}
      <div className="settings-buttons-container">
        <button type="button" aria-label="Reiniciar">
          <img src="/game-screen/header/settings/retry.webp" alt="Reiniciar" />
        </button>
        <button
          type="button"
          aria-label={isRunning ? "Pausar" : "Reanudar"}
          onClick={() => setIsRunning(!isRunning)}
        >
          <img
            src={isRunning
              ? "/game-screen/header/settings/pause.webp"
              : "/game-screen/header/settings/continue.webp"
            }
            alt="Pausar/Reanudar"
          />
        </button>
        <button
          type="button"
          aria-label="Musica"
          onClick={() => setMusicOn(!musicOn)}
        >
          <img
            src={musicOn
              ? "/game-screen/header/settings/music.webp"
              : "/game-screen/header/settings/no-music.webp"
            }
            alt="musica"
          />
        </button>
        <button
          type="button"
          aria-label="Efectos de sonido"
          onClick={() => setSoundEffectsOn(!soundEffectsOn)}
        >
          <img
            src={soundEffectsOn
              ? "/game-screen/header/settings/effects.webp"
              : "/game-screen/header/settings/no-effects.webp"
            }
            alt="Efectos de sonido"
          />
        </button>
      </div>
    </div>
  );
}
