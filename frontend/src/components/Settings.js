import { useState } from "react";

const defaultQuizSettings = {
    limit: 10,
    difficulties: ["Easy", "Medium", "Hard"],
    useTimer: true,
    duration: 10,
};

function getParsedQuizSettings() {
    try {
        const saved = sessionStorage.getItem("quizSettings");
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed && typeof parsed === "object") {
                return { ...defaultQuizSettings, ...parsed };
            }
        }
    } catch (err) {
        console.error("Failed to parse quizSettings:", err);
    }
    return defaultQuizSettings;
}

export default function Settings({ buttonText = "Save Settings", onAction, inCoop = false }) {
    const [quizSettings, setQuizSettings] = useState(() => {
        const initial = getParsedQuizSettings();
        return inCoop ? { ...initial, useTimer: true } : initial;
    });
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");
    const [isHost, setIsHost] = useState(() => localStorage.getItem("isHost") === "true");

    const difficulties = ["Easy", "Medium", "Hard"];

    const toggleDifficulty = (difficulty) => {
        setQuizSettings((prev) => {
            const current = prev.difficulties;
            const isSelected = current.includes(difficulty);

            if (isSelected && current.length === 1) {
                setError("At least one difficulty must be selected.");
                return prev;
            }

            setError("");

            const updatedDifficulties = isSelected
                ? current.filter((d) => d !== difficulty)
                : [...current, difficulty];

            return {
                ...prev,
                difficulties: updatedDifficulties,
            };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (quizSettings.difficulties.length === 0) {
            setError("Please select at least one difficulty.");
            return;
        }

        setError("");
        sessionStorage.setItem("quizSettings", JSON.stringify(quizSettings));

        if (onAction) onAction(quizSettings);

        if (buttonText === "Save Settings") {
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        }
    };

    return (
        <div className="settings-container">
            <div className="settings-options-container">
                <form onSubmit={handleSubmit} className="game-settings">
                    <div className="questions-option">
                        <label htmlFor="num-questions">Number of Questions: </label>
                        <input
                            type="number"
                            id="num-questions"
                            name="numQuestions"
                            min="1"
                            max="50"
                            value={quizSettings.limit}
                            onChange={(e) =>
                                setQuizSettings((prev) => ({
                                    ...prev,
                                    limit: Number(e.target.value),
                                }))
                            }
                        />
                    </div>

                    <div className="difficulty-option">
                        <p>Difficulty:</p>
                        <div className="difficulty-button-group">
                            {difficulties.map((difficulty) => (
                                <button
                                    type="button"
                                    key={difficulty}
                                    className={`toggle-button ${
                                        quizSettings.difficulties.includes(difficulty)
                                            ? "selected"
                                            : ""
                                    }`}
                                    onClick={() => toggleDifficulty(difficulty)}
                                >
                                    {difficulty}
                                </button>
                            ))}
                        </div>
                        {error && <p className="error-text">{error}</p>}
                    </div>

                    <div className="timer-option">
                        <label htmlFor="use-timer"> Timer? </label>
                        <input
                            type="checkbox"
                            id="use-timer"
                            checked={quizSettings.useTimer}
                            disabled={inCoop}
                            onChange={(e) =>
                                setQuizSettings((prev) => ({
                                    ...prev,
                                    useTimer: e.target.checked,
                                }))
                            }
                        />
                    </div>

                    {quizSettings.useTimer && (
                        <div className="duration-option">
                            <label htmlFor="duration">Time per question (seconds): </label>
                            <input
                                type="number"
                                id="duration"
                                name="duration"
                                min="5"
                                max="60"
                                value={quizSettings.duration}
                                onChange={(e) =>
                                    setQuizSettings((prev) => ({
                                        ...prev,
                                        duration: Number(e.target.value),
                                    }))
                                }
                            />
                        </div>
                    )}

                    {isHost && <button className="save-settings" type="submit">{buttonText}</button>}
                </form>
            </div>
            {saved && <p className="noti-text">Settings saved!</p>}
        </div>
    );
}
