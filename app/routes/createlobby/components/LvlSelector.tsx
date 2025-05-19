import type React from "react";
import "./lvlSelector.css";

type LvlSelectorProps = {
    levels?: number;
    onSelect: (level: number) => void;
    onBack: () => void;
    onSettings?: () => void;
    unlockedLevels?: number;
};

export const LvlSelector: React.FC<LvlSelectorProps> = ({
    levels = 5,
    onSelect,
    onBack,
    onSettings,
    unlockedLevels = 5,
}) => {
    return (
        <div className="lvl-selector-bg">
            <div className="lvl-selector-header">

            </div>
            <div className="lvl-selector-grid">
                {Array.from({ length: levels }, (_, i) => {
                    const level = i + 1;
                    const locked = level > unlockedLevels;
                    return (
                        <button
                            key={level}
                            className={`lvl-btn${locked ? " locked" : ""}`}
                            onClick={() => !locked && onSelect(level)}
                            disabled={locked}
                            type="button"
                        >
                            {level}
                        </button>
                    );
                })}
            </div>
            <div className="lvl-selector-footer">
                <button className="lvl-selector-back" onClick={onBack} aria-label="Back" type="button">
                    <span role="img" aria-label="back">⬅️</span>
                </button>
            </div>
        </div>
    );
};

export default LvlSelector; 