import ScoreCounter from "./score-counter/ScoreCounter";
import Timer from "./timer/Timer";
import "./Header.css";
import { useHeader } from "~/contexts/game/Header/HeaderContext";
import { useGameWebSocket } from "~/contexts/game/GameWebSocketProvider";
import ModalWinLose from "../modalWinLose";

export default function Header() {
  const { state, dispatch } = useHeader();
  const { sendMessage } = useGameWebSocket();

  const togglePause = () => {
    dispatch({ type: "SET_IS_RUNNING", payload: !state.isRunning });
    sendMessage({ type: state.isRunning ? "pause" : "resume", payload: "" });
  };

  const handleResume = () => {
    dispatch({ type: "SET_IS_RUNNING", payload: true });
    sendMessage({ type: "resume", payload: "" });
  };

  return (
    <>
      <div className="header">
        {/* Scores */}
        <ScoreCounter score={state.score} playerNumber={1} />

        {/* Timer */}
        <Timer isRunning={state.isRunning} minutes={state.minutes} seconds={state.seconds} />

        {/* Settings buttons */}
        <div className="settings-buttons-container">
          <button type="button" aria-label="Reiniciar">
            <img src="/game-screen/header/settings/retry.webp" alt="Reiniciar" />
          </button>
          <button
            type="button"
            aria-label={state.isRunning ? "Pausar" : "Reanudar"}
            onClick={togglePause}
          >
            <img
              src={state.isRunning
                ? "/game-screen/header/settings/pause.webp"
                : "/game-screen/header/settings/continue.webp"
              }
              alt="Pausar/Reanudar"
            />
          </button>
          <button
            type="button"
            aria-label="Musica"
            onClick={() => dispatch({ type: "SET_MUSIC", payload: !state.musicOn })}
          >
            <img
              src={state.musicOn
                ? "/game-screen/header/settings/music.webp"
                : "/game-screen/header/settings/no-music.webp"
              }
              alt="musica"
            />
          </button>
          <button
            type="button"
            aria-label="Efectos de sonido"
            onClick={() => dispatch({ type: "SET_SOUND_EFFECTS", payload: !state.soundEffectsOn })}
          >
            <img
              src={state.soundEffectsOn
                ? "/game-screen/header/settings/effects.webp"
                : "/game-screen/header/settings/no-effects.webp"
              }
              alt="Efectos de sonido"
            />
          </button>
        </div>
      </div>

      <ModalWinLose
        type="pause"
        isVisible={!state.isRunning}
        onResume={handleResume}
      />
    </>
  );
}
