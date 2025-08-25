import { useState, useEffect } from 'react';
import HomeScreen from './components/HomeScreen';
import QuizScreen from './components/QuizScreen';
import SettingsScreen from './components/SettingsScreen';
import './App.css'

function App() {
  const [screen, setScreen] = useState('home');
  const [questions, setQuestions] = useState([]);
  
  const [quizSettings, setQuizSettings] = useState(() => {
    const saved = sessionStorage.getItem("quizSettings");
    return saved ? JSON.parse(saved): null;
  });

  // Fetch questions on first mount
  useEffect(() => {
    fetchQuestions();
  }, [])

  useEffect(() => {
    if (screen === 'home') {
      const saved = sessionStorage.getItem("quizSettings");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (JSON.stringify(parsed) !== JSON.stringify(quizSettings)){
          setQuizSettings(parsed);
        }
        else {
          fetchQuestions(quizSettings);
        }
      }
      else {
        fetchQuestions(null);
      }
    }
  }, [screen]);

  useEffect(() => {
    if (screen === 'home' && quizSettings) {
      fetchQuestions(quizSettings);
    }
  }, [quizSettings])

  const fetchQuestions = (settings) => {
    let url = 'https://the-trivia-api.com/v2/questions';

    if (settings) {
      const params = new URLSearchParams({
        limit: settings.limit,
        difficulties: settings.difficulties.map(d => d.toLowerCase()).join(','),
      });
      url += '?' + params.toString();
    }

    fetch(url)
      .then(res => res.json())
      .then(data => {
        const scrambleQs = data.map(q => {
          const choices = [...q.incorrectAnswers, q.correctAnswer];
          return {
            question: q.question.text,
            correct_answer: q.correctAnswer,
            choices: choices.sort(() => Math.random() - 0.5),
          };
        });
        setQuestions(scrambleQs);
      })
      .catch(err => {
        console.error('Failed to fetch questions:', err);
      });
};


  switch (screen) {
    case 'home':
      return <HomeScreen setScreen={setScreen} />;
    case 'quiz':
      return <QuizScreen questions={questions} setScreen={setScreen} />;
    case 'settings':
      return <SettingsScreen setScreen={setScreen} />;
    default:
      return null;
  }
}

export default App;
