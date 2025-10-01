import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { BackButton } from "../components/Buttons";

export default function MultiplayerScreen() {
    const navigate = useNavigate();
    return (
        <div className="home-wrapper">
            <div className='home-container'>
                <div className='button-container'>
                <button id='play-button' onClick={() => navigate('/host')}>
                    Host
                </button>
                <button id='settings-button' onClick={() => navigate('/join')}>
                    Join
                </button>
                </div>
            </div>
            <BackButton />
        </div>
    )
}
