import { useState, useEffect } from "react";

export default function SettingsScreen({ setScreen }) {
    const [numQuestions, setNumQuestions] = useState(10);
    const difficulties = ["Easy", "Medium", "Hard"];
    const [selectedDifficulties, setSelectedDifficulties] = useState(difficulties);
    const [error, setError] = useState("");
    const [useTimer, setUseTimer] = useState(false);
    const [quizSettings, setQuizSettings] = useState(null);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const savedSettings = sessionStorage.getItem("quizSettings");
        if (savedSettings) {
            const parsed = JSON.parse(savedSettings);
            setNumQuestions(parsed.limit || 10);
            setSelectedDifficulties(parsed.difficulties || difficulties);
            setUseTimer(parsed.useTimer || false);
            setQuizSettings(parsed);
        }
    }, []);

    const toggleDifficulty = (difficulty) => {
        setSelectedDifficulties((prev) => {
            const isSelected = prev.includes(difficulty);

            if (isSelected && prev.length === 1) {
                setError("At least one difficulty must be selected.");
                return prev;
            } 
            
            setError("");
        
            return isSelected
                ? prev.filter((d) => d !== difficulty)
                : [...prev, difficulty];
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (selectedDifficulties.length === 0) {
        setError("Please select at least one difficulty.");
        return;
        }

        setError("");
        
        const settings = {
            limit: numQuestions,
            difficulties: selectedDifficulties,
            useTimer
        }
        console.log(settings);
        // Save settings
        setSaved(true);
        setQuizSettings(settings);
        sessionStorage.setItem("quizSettings", JSON.stringify(settings));

        setTimeout(() => {
            setSaved(false);
        }, 2000);
    };

    return (
        <div className="settings-container">
        <h2>Settings</h2>
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
                    value={numQuestions}
                    onChange={(e) => {
                        const value = e.target.value;
                        if (value === "") setNumQuestions("");
                        else setNumQuestions(Number(value));
                        }}
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
                            selectedDifficulties.includes(difficulty) ? "selected" : ""
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
                    {/* <label htmlFor="use-timer"> Timer? </label>
                    <input 
                        type="checkbox"
                        id="use-timer"
                        checked={useTimer}
                        onChange={(e) => setUseTimer(e.target.checked)}
                    /> */}
                </div>

                <button className="save-settings" type="submit">Save Settings</button>
            </form>
        </div>
        {saved ? (<p className="noti-text"> settings saved! </p>) : null}
        <button id="settings-home" onClick={() => setScreen("home")}>Home</button>
        </div>
    );
}
