export default function HomeScreen({ setScreen }) {
  return (
    <div className='home-wrapper'>
      <div className='home-container'>
        <div className='home-header'>
          <h1>Trivia</h1>
          <p>Test your trivia knowledge</p>
        </div>
        <div className='button-container'>
          <button id='play-button' onClick={() => setScreen('quiz')}>
            Start Quiz
          </button>
          <button id='settings-button' onClick={() => setScreen('settings')}>
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
