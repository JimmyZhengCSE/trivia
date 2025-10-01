import { useState, useEffect, useRef } from "react";

export default function Timer({ duration, onTimeUp, isRunning = true, pause = false, selectedChoice, setStartTime, syncedStartTime = null, coopMode = false }) {
    const [timeLeft, setTimeLeft] = useState(duration);
    const intervalRef = useRef(null);

    // Solo
    useEffect(() => {
        if (!coopMode) {
            setTimeLeft(duration)
            setStartTime(Date.now());
        }
    }, [selectedChoice, duration, setStartTime]);

    // Coop
    useEffect(() => {
        if (coopMode && syncedStartTime && isRunning) {
            const now = Date.now();
            const elapsed = Math.floor((now - syncedStartTime) / 1000);
            const newTimeLeft = Math.max(duration - elapsed, 0);
            setTimeLeft(newTimeLeft);
            setStartTime(syncedStartTime);
        }
    }, [syncedStartTime, coopMode, duration, setStartTime])

    useEffect(() => {
        if (!isRunning || pause) return;

        // If time is up, call onTimeUp
        if (timeLeft <= 0) {
            clearInterval(intervalRef.current);
            onTimeUp();
            return;
        }

        intervalRef.current = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(intervalRef.current);
    }, [isRunning, timeLeft, pause]);

    return (
        <div className="timer">
            <p>⏰ Time Left: {timeLeft}s</p>
            <div
                className="timer-bar"
                style={{
                    width: "100%",
                    height: "8px",
                    background: timeLeft > 5 ? "green" : "red",
                    animation: isRunning && !pause
                        ? `shrink ${duration}s linear forwards`
                        : 'none',
                }}
            />
        </div>
    );
}
