import { useState, useEffect } from 'react';
import HomeScreen from './pages/HomeScreen';
import QuizScreen from './pages/QuizScreen';
import SettingsScreen from './pages/SettingsScreen';
import MultiplayerScreen from './pages/MultiplayerScreen';
import HostScreen from './pages/HostScreen';
import JoinScreen from './pages/JoinScreen';
import GameRoom from './pages/GameRoom';
import './App.css'
import { Routes, Route, useLocation } from 'react-router-dom';
import { GameSocketProvider } from './hooks/useGameSocket';

function App() {
  const [questions, setQuestions] = useState([]);
  
  const [quizSettings, setQuizSettings] = useState(() => {
    const saved = sessionStorage.getItem("quizSettings");
    return saved ? JSON.parse(saved): null;
  });
  
  const location = useLocation();

  // Fetch questions on first mount
  useEffect(() => {
    fetchQuestions();
    localStorage.setItem("isHost", "true");
  }, [])

  // Fetch questions when quiz settings change or back at home screen
  useEffect(() => {
    if (location.pathname === '/') {
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
  }, [location.pathname, quizSettings]);

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

  return (
      <GameSocketProvider>
      <Routes>
        <Route path='/' element={<HomeScreen />}/>
        <Route path='/quiz' element={<QuizScreen questions={questions}/>}/>
        <Route path='/settings' element={<SettingsScreen />}/>
        <Route path='/multiplayer' element={<MultiplayerScreen />}/>
        <Route path='/host' element={<HostScreen />}/>
        <Route path='/join' element={<JoinScreen />}/>
        <Route path='/game/:code' element={<GameRoom />} />
      </Routes>
      </GameSocketProvider>
  )
}

export default App;
