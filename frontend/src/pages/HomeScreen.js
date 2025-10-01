import { useNavigate } from "react-router-dom";

export default function HomeScreen() {
  const navigate = useNavigate();

  return (
    <div className='home-wrapper'>
      <div className='home-container'>
        <div className='home-header'>
          <h1>Trivia</h1>
          <p>Test your trivia knowledge</p>
        </div>
        <div className='button-container'>
          <button id='play-button' onClick={() => navigate('/quiz')}>
            Play
          </button>
          <button id='play-together-button' onClick={() => navigate('/multiplayer')}>
            Play Together
          </button>
          <button id='settings-button' onClick={() => navigate('/settings')}>
            Preferences
          </button>
        </div>
      </div>
        <footer className="credits">
          <p>Trivia data provided by&nbsp;
            <a href="https://the-trivia-api.com/" target="_blank" rel="noopener noreferrer">The Trivia API</a>
          </p>
        </footer>
    </div>
  );
}
