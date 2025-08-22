import { useState, useEffect } from 'react';
import ResultsScreen from './ResultsScreen';

export default function QuizScreen({ questions, setScreen}) {
    const [currIndex, setCurrIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [quizDone, setQuizDone] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [viewResults, setViewResults] = useState(false);

    useEffect(() => {
        setCurrIndex(0);
        setScore(0);
        setQuizDone(false);
        setSelectedAnswer(null);
        setIsCorrect(null);
    }, [questions]);

    if (!questions.length) return <p>Loading questions...</p>;

    const handleAnswer = (choice) => {
        const current = questions[currIndex];
        const correct = choice === current.correct_answer;

        setSelectedAnswer(choice);
        setIsCorrect(correct);
        if (correct) setScore((prev) => prev + 1);

        // Save answers
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
    };

    const handleNext = () => {
        setSelectedAnswer(null);
        setIsCorrect(null);

        if (currIndex + 1 < questions.length) {
        setCurrIndex(currIndex + 1);
        } else {
        setQuizDone(true);
        }
    };

    if (quizDone) {
        return viewResults ? (
            <ResultsScreen
                answers={answers}
                onBack={() => {
                    setScreen('home');
                }}
            />
        ) : (
            <div className='results-container'>
                <h2>Quiz Complete!</h2>
                <p>
                    You scored {score} out of {questions.length} (
                    {Math.round((score / questions.length) * 100)}%)
                </p>
                <div className='results-button-container'>
                    <button className='home-button'
                    onClick={() => {
                        setScreen('home');
                    }}
                    >
                    Home
                    </button>
                    <button onClick={() => setViewResults(true)}>View Results</button>
                </div>
                </div>
            );
        }

    const current = questions[currIndex];

    return (
        <div className='quiz-container'>
        <button
            onClick={() => {
            setScreen('home');
            }}
            className='quit-button'
        >
            Home
        </button>
        <h2>Question {currIndex + 1}</h2>
        <p>{current.question}</p>
        <div>
            {current.choices.map((choice, i) => {
            const isSelected = choice === selectedAnswer;
            const isAnswer = selectedAnswer !== null;

            return (
                <button
                className='button-choices'
                key={i}
                onClick={() => handleAnswer(choice)}
                disabled={isAnswer}
                style={{
                    display: 'block',
                    margin: '10px 0',
                    padding: '10px',
                    backgroundColor: isAnswer
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

        {selectedAnswer !== null && (
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
