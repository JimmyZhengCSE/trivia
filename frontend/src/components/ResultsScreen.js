export default function ResultsScreen({ answers, onBack }) {
  return (
    <div className='review-container'>
      <h3>Review Answers</h3>
      {answers.map((ans, index) => (
        <div key={index} className='review-question'>
          <strong>Q{index + 1}:</strong> {ans.question}
          <ul className="review-choices">
            {ans.choices.map((choice, i) => (
              <li
                key={i}
                style={{
                  color:
                    choice === ans.correct
                      ? 'green'
                      : choice === ans.selected
                      ? 'red'
                      : 'black',
                  fontWeight:
                    choice === ans.correct || choice === ans.selected ? 'bold' : 'normal',
                }}
              >
                {String.fromCharCode(65 + i)}. {choice}
                {choice === ans.correct ? ' ✅' : ''}
                {choice === ans.selected && choice !== ans.correct ? ' ❌' : ''}
              </li>
            ))}
          </ul>
          <hr />
        </div>
      ))}
      <button onClick={onBack}> Home </button>
    </div>
  );
}
