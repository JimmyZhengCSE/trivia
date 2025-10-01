export default function Results({ answers }) {
  return (
    <div className="review-container">
      <h3>Review Answers</h3>
      {answers.map((ans, index) => {
        const skipped = ans.selected === null;
        const correct = ans.isCorrect;
        
        let statusLabel = "";
        let statusColor = "";
        if (skipped) {
          statusLabel = "Skipped ⏭️";
          statusColor = "#f0ad4e";
        } else if (correct) {
          statusLabel = "Correct ✅";
          statusColor = "#5cb85c";
        } else {
          statusLabel = "Incorrect ❌";
          statusColor = "#d9534f";
        }

        return (
          <div
            key={index}
            className="review-question"
            style={{
              border: `2px solid ${statusColor}`,
              borderRadius: "10px",
              padding: "15px",
              marginBottom: "20px",
              backgroundColor: skipped
                ? "#fff3cd"
                : correct
                ? "#dff0d8"
                : "#f8d7da",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>
                Q{index + 1}: {ans.question}
              </strong>
              <span
                style={{
                  fontWeight: "bold",
                  color: "white",
                  backgroundColor: statusColor,
                  padding: "3px 8px",
                  borderRadius: "5px",
                }}
              >
                {statusLabel}
              </span>
            </div>

            <ul className="review-choices" style={{ marginTop: "10px" }}>
              {ans.choices.map((choice, i) => (
                <li
                  key={i}
                  style={{
                    backgroundColor:
                      choice === ans.correct
                        ? "green"
                        : choice === ans.selected && !ans.isCorrect
                        ? "red"
                        : "transparent",
                    padding: "6px 10px",
                    margin: "5px 0",
                    borderRadius: "6px",
                    listStyle: "none",
                  }}
                >
                  {String.fromCharCode(65 + i)}. {choice}
                  {choice === ans.correct ? " ✅" : ""}
                  {choice === ans.selected && choice !== ans.correct ? " ❌" : ""}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
