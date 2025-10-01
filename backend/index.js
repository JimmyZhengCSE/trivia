const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { 
    cors: { 
        origin: [
            "http://localhost:3000",
            process.env.CLIENT_ORIGIN,
        ],
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
        credentials: true
    }
});

const generateRoomID = () => {
    return Math.random().toString(36).substring(2,7);
}

const fetchQuestions = async (settings = {}) => {
    const {
        limit = 10,
        difficulties = ["easy", "medium", "hard"]
    } = settings;
    const url = 'https://the-trivia-api.com/v2/questions';

    const res = await axios.get(url, {
        params: {
            limit: limit ?? 10,
            difficulties: (Array.isArray(difficulties) && difficulties.length > 0
                ? difficulties
                : ["easy", "medium", "hard"]
            ).map(d => d.toLowerCase()).join(',')
        }
    });
    const data = res.data;

    const scrambleQs = data.map(q => {
        // const choices = [...q.incorrectAnswers, q.correctAnswer];
        const choices = shuffle([...q.incorrectAnswers, q.correctAnswer]);
        return {
            question: q.question.text,
            correct_answer: q.correctAnswer,
            choices
        };
    });
    return scrambleQs;
}

// Fisher-Yates shuffle
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function sortPlayersByScore(roomID) {
    rooms[roomID].players.sort((a, b) => b.score - a.score);
}

const rooms = {};
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on('setName', (username) => {
        socket.username = username;
        console.log(`${socket.id} is now ${socket.username}!`)
    });

    socket.on("createRoom", ({ name }, callback) => {
        const roomID = generateRoomID();
        socket.roomID = roomID

        rooms[roomID] = {
            hostID: socket.id,
            players: [],
        }
        callback && callback({ roomID, name });
    })

    socket.on("joinRoom", ({roomID, name}, callback) => {
        if (!rooms[roomID]) {
            return callback({ error: `Room ${roomID} does not exist` });
        }

        socket.join(roomID);
        socket.roomID = roomID;

        const playerIndex = rooms[roomID].players.findIndex(p => p.id === socket.id);
        if (playerIndex !== -1) {
            rooms[roomID].players[playerIndex].username = socket.username
        }
        else {
            rooms[roomID].players.push({
                id: socket.id,
                username: socket.username,
                score: 0,
                finished: false
            });
        }

        const isHost = rooms[roomID].hostID === socket.id;

        callback && callback({ roomID, name, host: isHost});
        io.to(roomID).emit("updatePlayerCount", rooms[roomID].players);
        io.to(roomID).emit("receiveMessage", {
            username: 'System',
            message: `${socket.username} has joined the room.`
        });
    });

    socket.on("sendMessage", (message) => {
        const roomID = socket.roomID;
        io.to(roomID).emit("receiveMessage", {
            username: socket.username,
            message,
        });
    });

    socket.on("getQuestions", async ({ settings }, callback) => {
        try {
            const questionsList = await fetchQuestions(settings);
            callback && callback({ success: true, questions: questionsList });
        } catch (error) {
            console.error("Error fetching questions:", error);
            callback && callback({ success: false, error: "Failed to fetch questions" });
        }
    })

    socket.on("startGame", ({ roomID, questions, settings } ) => {
        io.to(roomID).emit("gameStarted", { questions, settings });

        // Small timeout to await mount
        setTimeout(() => {  
            io.to(roomID).emit("startTimer", {
                startTime: Date.now(),
                duration: settings.duration * 1000,
            });
        }, 500);
    })


    socket.on("playerChoseAnswer", ({ roomID, duration }) => {
        const room = rooms[roomID];
        if (!room) return;

        const player = room.players.find(p => p.username === socket.username);
        if (player) {
            player.finished = true;
        }

        const allFinished = room.players.every(p => p.finished);

        if (allFinished) {
            const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);
            const winner = sortedPlayers[0];
            io.to(roomID).emit("allPlayersFinished", {
                winner: {
                    username: winner.username,
                    score: winner.score
                },
                players: room.players
            });
            room.players.forEach(p => p.finished = false);
            
            setTimeout(() => {
                io.to(roomID).emit("nextQuestionStarted");
                io.to(roomID).emit("startTimer", {
                    startTime: Date.now(),
                    duration: duration * 1000,
                });
            }, 3000);
        }
    });


    socket.on("updateScore", ({ roomID, playerName, points }, callback) => {
        const player = rooms[roomID].players.find(player => player.username === playerName);
        if (!player) {
            console.error(`Player ${playerName} not found in room ${roomID}`);
            return callback({ success: false, error: "Player not found" });
        }
        player.score += points;
        
        sortPlayersByScore(roomID);
        callback({ success: true, players: rooms[roomID].players })

    });

    socket.on("resetGameState", ({ roomID }) => {
        const room = rooms[roomID];
        if (!room) return;

        room.players = room.players.map(player => ({
            ...player,
            score: 0,
            finished: false
        }));

        io.to(roomID).emit("updatePlayerCount", room.players);
        io.to(roomID).emit("gameRestarted");
    });

    socket.on("leaveRoom", ({ roomID }) => {
        socket.leave(roomID);

        socket.to(roomID).emit("playerLeft", {
            socketId: socket.id,
            roomID,
        });

        const playerIndex = rooms[roomID].players.findIndex(p => p.id === socket.id);
        if (playerIndex !== -1) {
            rooms[roomID].players.splice(playerIndex, 1);
        }
        
        io.to(roomID).emit("updatePlayerCount", rooms[roomID].players);
        io.to(roomID).emit("receiveMessage", {
            username: 'System',
            message: `${socket.username} has left the room.`
        });
    })

});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
