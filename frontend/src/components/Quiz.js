import { useState, useEffect, useRef } from 'react';
import ResultsScreen from '../pages/ResultsScreen';
import Timer from './Timer';
import { useNavigate } from 'react-router-dom';
// import useGameSocket from '../hooks/useGameSocket';
import { useGameSocket } from '../hooks/useGameSocket';

export default function Quiz( {questions, inCoop, roomCode}) {
    const { updateScore, serverTimerInfo, allPlayersFinished, finishQuestion, resetGame, winner } = useGameSocket();
    const [currIndex, setCurrIndex] = useState(0);
    const [questionsCorrect, setQuestionsCorrect] = useState(0);
    const [score, setScore] = useState(0);
    const [quizDone, setQuizDone] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [viewResults, setViewResults] = useState(false);
    const [hasAnswered, setHasAnswered] = useState(false);
    const [useTimer, setUseTimer] = useState(() => {
        const savedSettings = sessionStorage.getItem("quizSettings");
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                if (parsed && typeof parsed === 'object') {
                    return parsed.useTimer ?? true;
                }
            } catch (err) {
                console.error("Failed to parse savedSettings:", err);
            }
        }
        return true;
    });
    const [duration, setDuration] = useState(() => {
        const savedSettings = sessionStorage.getItem("quizSettings");
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                if (parsed && typeof parsed === 'object') {
                    return parsed.duration ?? 10;
                }
            } catch (err) {
                console.error("Failed to parse savedSettings:", err);
            }
        }
        return 10;
    });
    const [isHost, setIsHost] = useState(() => {
        return sessionStorage.getItem("isHost") === "true";
    })
    

    const startTimeRef = useRef(null);
    const [pauseTimer, setPauseTimer] = useState(false);
    const [countdown, setCountdown] = useState(null);
    const finalDuration = inCoop && serverTimerInfo?.duration ? serverTimerInfo.duration : duration;
    const navigate = useNavigate();

    useEffect(() => {
        setCurrIndex(0);
        setQuestionsCorrect(0);
        setQuizDone(false);
        setSelectedAnswer(null);
        setIsCorrect(null);
    }, [questions]);

    useEffect(() => {
        if (countdown === null) return;

        if (countdown === 0) {
            setPauseTimer(false);
            setCountdown(null);
            handleNext();
            return;
        }

        const timerId = setTimeout(() => {
            setCountdown(countdown - 1);
        }, 1000);

        return () => clearTimeout(timerId);
    }, [countdown]);

    // Co-op all player finished
    useEffect(() => {
        if (!inCoop) return;

        if (allPlayersFinished) {
            setPauseTimer(true);
            setCountdown(3);
        }
    }, [allPlayersFinished]);

    if (!questions.length) return <p>Loading questions...</p>;

    const recordAnswer = (choice) => {
        const current = questions[currIndex];
        const correct = choice === current.correct_answer;

        setAnswers((prev) => [
            ...prev,
            {
                question: current.question,
                selected: choice,
                correct: current.correct_answer,
                isCorrect: correct,
                choices: current.choices,
            },
        ]);

        if (correct) setQuestionsCorrect((prev) => prev + 1);
    }

    const handleAnswer = (choice) => {
        setHasAnswered(true);
        console.log("Handled answer", choice);
        const current = questions[currIndex];
        
        const correct = choice === current.correct_answer;
        setSelectedAnswer(choice);
        setIsCorrect(correct);
        recordAnswer(choice);
        setPauseTimer(true);
        
        if (useTimer && inCoop) {
            handleScore(correct);
            finishQuestion(roomCode, duration);
        }
        else if (useTimer) {
            handleScore(correct);
            setCountdown(3);
        }
    };

    const handleNext = () => {
        setHasAnswered(false);
        setSelectedAnswer(null);
        setIsCorrect(null);
        
        if (currIndex + 1 < questions.length) {
            setCurrIndex(currIndex + 1);
        } 
        else {
            setQuizDone(true);
        }
    };

    const handleScore = (correct) => {
        if (!correct) return;

        const endTime = Date.now();

        const elapsedTime = endTime - startTimeRef.current;

        const maxTime = finalDuration * 1000;
        const clampedTime = Math.min(elapsedTime, maxTime);
        const points = Math.round(Math.max(0, 100 - (clampedTime / maxTime) * 100));
        if (inCoop) {
            const playerName = localStorage.getItem("playerName");
            if (playerName && roomCode) {
                updateScore(roomCode, playerName, points);
            }
        } else {
            setScore((prev) => prev + points);
        }
    };


    if (quizDone) {
        if (viewResults) return <ResultsScreen answers={answers} />;
        
        return (
            <div className='results-container'>
                <h2>Quiz Complete!</h2>
                <p>
                    You scored {questionsCorrect} out of {questions.length} (
                    {Math.round((questionsCorrect / questions.length) * 100)}%)
                </p>
                <div className='results-button-container'>
                    {!inCoop ? (
                        <>
                            <button onClick={() => setViewResults(true)}>View Results</button>
                            <button onClick={() => navigate('/settings')}>Edit Settings</button>
                        </>
                    ) : (
                        <div className="coop-info-container">
                            <p> Player {winner.username} wins with {winner.score} points!🎉🎉</p>
                            {isHost && <button onClick={() => resetGame(roomCode)}> Play Again </button>}
                            {!isHost && <p className='typewriter'> Waiting for host to play again... </p>}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    const current = questions[currIndex];

    return (
        <div className='quiz-container'>
            <h2>Question {currIndex + 1}</h2>
            <p>{current.question}</p>
            <div>
                {current.choices.map((choice, i) => {
                const isSelected = choice === selectedAnswer;

                return (
                    <button
                    className='button-choices'
                    key={i}
                    onClick={() => handleAnswer(choice)}
                    disabled={hasAnswered}
                    style={{
                        display: 'block',
                        margin: '10px 0',
                        padding: '10px',
                        backgroundColor: hasAnswered
                        ? choice === current.correct_answer
                            ? 'lightgreen'
                            : isSelected
                            ? 'lightcoral'
                            : ''
                        : '',
                    }}
                    >
                    {String.fromCharCode(65 + i)}. {choice}
                    </button>
                );
                })}
            </div>

            {!inCoop && <p className='quiz-score'> Qs Correct: {questionsCorrect} Points: {score}</p>}
            
            {hasAnswered && useTimer && (
                <p style={{ marginTop: '20px', fontWeight: 'bold' }}>
                    {countdown !== null ? `Next question in ${countdown}` : 'Waiting for other players'}...
                </p>
            )}

            {useTimer && 
                <Timer 
                    key={currIndex}
                    duration={finalDuration}
                    isRunning={!quizDone && !pauseTimer}
                    pause = {pauseTimer}
                    onTimeUp={() => {
                        if (selectedAnswer === null) {
                            console.log("Time up check");
                            handleAnswer(null);
                        }
                    }}
                    selectedChoice={selectedAnswer}
                    setStartTime={(time) => {
                        startTimeRef.current = time;
                    }}
                    coopMode={inCoop}
                    syncedStartTime={serverTimerInfo.startTime}
                />
            }

            {selectedAnswer !== null && !useTimer && !inCoop && (
                <div style={{ marginTop: '20px' }}>
                <p>{isCorrect ? '✅ Correct!' : '❌ Incorrect!'}</p>
                <button onClick={handleNext}>
                    {currIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                </button>
                </div>
            )}
        </div>
    );
}
