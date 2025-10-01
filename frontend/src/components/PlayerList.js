import { useEffect } from 'react';
// import useGameSocket from '../hooks/useGameSocket'
import { useGameSocket } from '../hooks/useGameSocket';

export default function PlayerList() {
    const { players } = useGameSocket();

    return (
        <div className="players-container">
            <h3>👥 Players ({players.length})</h3>
            <table className="player-list">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Username</th>
                        <th>Score</th>
                    </tr>
                </thead>
                <tbody>
                    {players
                        .sort((a, b) => b.score - a.score)
                        .map((player, index) => (
                            <tr key={player.id}>
                                <td>{index + 1}</td>
                                <td>{player.username}</td>
                                <td>{player.score}</td>
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    );
}
