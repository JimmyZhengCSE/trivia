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

  useEffect(() => {
    if (screen == 'home') {
      const saved = sessionStorage.getItem("quizSettings");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (JSON.stringify(parsed) !== JSON.stringify(quizSettings)){
          setQuizSettings(parsed);
          console.log("1: ",quizSettings);
        }
      }
      fetchQuestions();
    }
  }, [screen, quizSettings]);

  const fetchQuestions = () => {    
    let url = 'http://localhost:8000/api/quiz';
    let options = {
      method: 'GET',
    };

    if (quizSettings) {
      options.method = 'POST';
      options.headers = {
        'Content-Type': 'application/json',
      };
      options.body = JSON.stringify(quizSettings)
    }
    fetch(url, options)
      .then((res) => res.json())
      .then((data) => setQuestions(data))
      .catch((err) => {
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
