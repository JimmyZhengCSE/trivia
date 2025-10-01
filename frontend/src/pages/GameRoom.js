import MessageBox from "../components/MessageBox"
import { useState, useEffect } from "react"
// import useGameSocket from "../hooks/useGameSocket"
import { useGameSocket } from "../hooks/useGameSocket";
import PlayerList from "../components/PlayerList";
import { useParams } from "react-router-dom";
import NavBar from "../components/NavBar";
import Settings from "../components/Settings";
import Quiz from "../components/Quiz"

export default function GameRoom() {
    const { fetchQuestions, inGame, startGame, questions, setQuestions } = useGameSocket();
    const { code } = useParams();
    const [isHost, setIsHost] = useState(() => {
        return sessionStorage.getItem("isHost") === "true";
    })
    const [questionsList, setQuestionsList] = useState([]);
    const [settings, setSettings] = useState(null);

    // Get Quiz Settings
    useEffect(() => {
        const savedSettings = sessionStorage.getItem("quizSettings");
        if (savedSettings) {
            setSettings(JSON.parse(savedSettings));
        }
    }, []);

    const handleStartGame = (settings) => {
        fetchQuestions(settings, (res) => {
            if (res.success) {
                startGame(code, res.questions, settings);
            }
            else {
                console.log(res.error)
            }
        })
    }

    return (
    <div>
        <NavBar />
        <div className="right-container">
            <PlayerList />
            <MessageBox />
        </div>

        {inGame ? (
            <>
                <Quiz questions={questions} inCoop={true} roomCode={code}/>
            </>
        ) : (
            isHost && <Settings buttonText={"Start Game"} onAction={handleStartGame} inCoop={true} />
        )}
    </div>
    );
}
