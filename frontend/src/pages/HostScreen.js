import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"
import { BackButton } from "../components/Buttons";
import { useGameSocket } from "../hooks/useGameSocket";

export default function HostScreen() {
    const navigate = useNavigate();
    const { createRoom, room } = useGameSocket();
    const [playerName, setPlayerName] = useState("");
    const [hasError, setHasError] = useState(false);

    const handleCreateRoom = (e) => {
        e.preventDefault();
        if (playerName) {
            createRoom(playerName);
        }
        else {
            setHasError(true);
        }
    }

    useEffect(() => {
        if (room) {
            navigate(`/game/${room}`);
        }
    }, [room]);

    return (
        <div className="container">
            <div className="form-wrapper">
                <form>
                    <input 
                        className="form-input-name" 
                        placeholder=" name"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                    />
                    <button type="submit" onClick={handleCreateRoom}> Create Room </button>
                </form>
                {hasError ? <div> Field cannot be blank! </div> : null}
            </div>
            <BackButton />
        </div>
    )
}
