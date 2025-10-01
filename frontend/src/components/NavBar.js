import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useGameSocket } from "../hooks/useGameSocket";

export default function NavBar() {
    const { leaveRoom } = useGameSocket();
    const { code } = useParams();
    const [name, setName] = useState("");

    useEffect(() => {
        const playerName = localStorage.getItem("playerName");
        if (playerName) {
            setName(playerName);
        }
    }, []);

    return (
        <nav className="nav-container">
            <Link to="/" 
                onClick={() => { 
                    leaveRoom();
                }} 
                className="nav-home"
            > 
                Home 
            </Link>
            <span className="nav-room-code"> Room: {code} </span>
            <span className="nav-username"> {name} </span>
        </nav>
    );
}
