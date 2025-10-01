import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";

const GameSocketContext = createContext(null);

const socket = io(
  process.env.NODE_ENV === "development"
    ? "http://localhost:4000"
    : process.env.REACT_APP_SERVER_API
);

export function GameSocketProvider({ children }) {
    const [name, setName] = useState("");
    const [players, setPlayers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [room, setRoom] = useState("");
    const [roomName, setRoomName] = useState("");
    const [inGame, setInGame] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [serverTimerInfo, setServerTimerInfo] = useState({ startTime: null, duration: null });
    const [allPlayersFinished, setAllPlayersFinished] = useState(false);
    const [winner, setWinner] = useState(null);

    useEffect(() => {
        socket.on("receiveMessage", (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        socket.on("updatePlayerCount", (playersList) => {
            setPlayers(playersList);
        });

        socket.on("gameStarted", ({ questions, settings }) => {
            setInGame(true);
            setQuestions(questions);
            sessionStorage.setItem("quizSettings", JSON.stringify(settings));
        });

        socket.on("startTimer", ({ startTime, duration }) => {
            setServerTimerInfo({ startTime, duration: duration / 1000 });
        });

        socket.on("allPlayersFinished", ({ winner, players }) => {
            setAllPlayersFinished(true);
            setPlayers(players);
            setWinner(winner);
        });

        socket.on("nextQuestionStarted", () => {
            setAllPlayersFinished(false);
        });

        socket.on("gameRestarted", () => {
            setInGame(false);
            setAllPlayersFinished(false);
            setQuestions([]);
            setServerTimerInfo({ startTime: null, duration: null });
            setWinner(null);
        })

        return () => {
            socket.off("receiveMessage");
            socket.off("updatePlayerCount");
            socket.off("gameStarted");
            socket.off("startTimer");
            socket.off("allPlayersFinished");
            socket.off("nextQuestionStarted");
            socket.off("gameRestarted");
        };
    }, []);

    const setUsername = useCallback(
        (name) => {
        if (socket) {
            socket.emit("setName", name);
            setName(name);
            localStorage.setItem("playerName", name);
        }
    });

    const sendMessage = useCallback(
        (msg) => {
        if (socket) {
            socket.emit("sendMessage", msg);
        } else {
            console.log("NO SOCKET");
        }
    });

    const createRoom = useCallback(
        (playerName) => {
        if (socket) {
            socket.emit("createRoom", { name: playerName }, (res) => {
                joinRoom(res.roomID, res.name);
            });
        }
    });

    const joinRoom = useCallback(
        (roomName, playerName, callback) => {
        if (socket) {
            setUsername(playerName);
            socket.emit("joinRoom", { roomID: roomName, name: playerName }, (res) => {
            if (!res.error) {
                setRoom(res.roomID);
                setName(res.name);
                sessionStorage.setItem("isHost", res.host ? "true" : "false");
            }
            if (callback) callback(res);
            });
        }
    });

    const fetchQuestions = useCallback((settings, callback) => {
        socket.emit("getQuestions", { settings }, (res) => {
        if (res.success) {
            console.log("questions fetched", res.questions.length);
        }
        if (callback) callback(res);
        });
    });

    const startGame = useCallback((roomID, questions, settings) => {
        socket.emit("startGame", { roomID, questions, settings });
    });

    const updateScore = useCallback(
        (roomID, playerName, points, callback) => {
        socket.emit("updateScore", { roomID, playerName, points }, (res) => {
            if (res.success) {
                setPlayers(res.players);
            }
            if (callback) callback(res);
        });
    });

    const leaveRoom = useCallback(() => {
        if (socket) {
            socket.emit("leaveRoom", { roomID: room });
            setRoom("");
            setRoomName("");
            setPlayers([]);
            setMessages([]);
            setInGame(false);
            setQuestions([]);
            setServerTimerInfo({ startTime: null, duration: null });
            setAllPlayersFinished(false);
            setWinner(null);
            sessionStorage.removeItem("isHost");
        }
    });

    const finishQuestion = useCallback((roomID, duration) => {
        socket.emit("playerChoseAnswer", { roomID, duration });
    });

    const resetGame = (roomID) => {
        setAllPlayersFinished(false);
        socket.emit("resetGameState", { roomID });
    };

    return (
        <GameSocketContext.Provider
        value={{
            name,
            players,
            messages,
            room,
            roomName,
            inGame,
            questions,
            serverTimerInfo,
            allPlayersFinished,
            setUsername,
            sendMessage,
            createRoom,
            joinRoom,
            leaveRoom,
            fetchQuestions,
            startGame,
            updateScore,
            setQuestions,
            setRoom,
            finishQuestion,
            setInGame,
            resetGame,
            winner,
        }}
        >
        {children}
        </GameSocketContext.Provider>
    );
}

export function useGameSocket() {
    const context = useContext(GameSocketContext);
    if (!context) {
        throw new Error("useGameSocket must be used within a GameSocketProvider");
    }
    return context;
}
