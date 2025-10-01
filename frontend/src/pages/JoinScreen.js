import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"
import { BackButton } from "../components/Buttons";
// import useGameSocket from "../hooks/useGameSocket";
import { useGameSocket } from "../hooks/useGameSocket";

export default function JoinScreen() {
    const navigate = useNavigate();
    const { joinRoom } = useGameSocket();
    const [roomName, setRoomName] = useState("");
    const [playerName, setPlayerName] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleJoinRoom = (e) => {
        e.preventDefault();
        if (!roomName || !playerName) {
            setErrorMessage("Fields cannot be blank!");
            return;
        } 

        joinRoom(roomName, playerName, (res) => {
            if (res.error) {
                setErrorMessage(res.error);
            }
            else {
                navigate(`/game/${roomName}`);
            }
        });
    }

    return (
        <div>
            <div className="form-wrapper">
                <form>
                    <input 
                        className="form-input-room" 
                        placeholder="Room ID"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                    />
                    <input 
                        className="form-input-name" 
                        placeholder=" name"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                    />
                    <button type="submit" onClick={handleJoinRoom}> Join Room </button>
                </form>
                {errorMessage && <p className="error">{errorMessage}</p>}
            </div>
            <BackButton />
        </div>
    )
}
