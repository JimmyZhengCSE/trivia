import { useNavigate } from 'react-router-dom'

export function BackButton() {
    const navigate = useNavigate();

    return (
        <div className="back-button-container">
            <button id="back-button" onClick={() => navigate(-1)}>
                Back
            </button>
        </div>
    )
}

export function HomeButton() {
    const navigate = useNavigate();

    return (
        <div className="home-button-container">
            <button id="home-button" onClick={() => navigate('/')}>
                Home
            </button>
        </div>
    )
}

export function PlayAgainButton() {
    return (
        <div>
            
        </div>
    )
}
