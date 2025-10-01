import { useState } from "react";
// import useGameSocket from "../hooks/useGameSocket"
import { useGameSocket } from "../hooks/useGameSocket";

export default function MessageBox() {
    const { messages, sendMessage } = useGameSocket();
    const [newMessage, setNewMessage] = useState('');
    // const [messages, setMessages] = useState([
    //     { name: 'John', message: 'YO' },
    //     { name: 'Bob', message: 'Hi' },
    //     { name: 'Alex', message: 'BI' },
    //     { name: 'Bob', message: 'Sax' },
    //     { name: 'god', message: 'i' },
    //     { name: 'admin1', message: "really long message i don't know ohw this will look what if  i do this shit lmaoooo ok man"},
    //     { name: 'admin2', message: "really long message i don't know ohw this will look what if  i do this shit lmaoooo ok man"},
    //     { name: 'admin3', message: "really long message i don't know ohw this will look what if  i do this shit lmaoooo ok man"},
    //     { name: 'admi4', message: "really long message i don't know ohw this will look what if i do this shit lmaoooo ok man"},
    //     { name: 'admin6', message: "really long message i don't know ohw this will look what if  i do this shit lmaoooo ok man"},
    //     { name: 'admin8', message: "really long message i don't know ohw this will look what if  i do this shit lmaoooo ok man"},
    //     { name: 'admin9', message: "really long message i don't know ohw this will look what if  i do this shit lmaoooo ok man"},
    //     { name: 'admin0', message: "really long message i don't know ohw this will look what if  i do this shit lmaoooo ok man"},
    //     { name: 'admin00', message: "really long message i don't know ohw this will look what if  i do this shit lmaoooo ok man"},
    //     { name: 'admin002', message: "really long message i don't know ohw this will look what if  i do this shit lmaoooo ok man"},
    //     { name: 'admin003', message: "really long message i don't know ohw this will look what if  i do this shit lmaoooo ok man"},
    // ]);


    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage(newMessage.trim());
            setNewMessage('');
        }
    }

    // const handleSend = () => {
    //     if (newMessage.trim()) {
    //         sendMessage(newMessage.trim());
    //         setNewMessage('');
    //     }
    // };

    return (
        <div className="message-container">
            <h1 className="chat-header"> Chat </h1>
            <div className="chat-messages">
                {messages.map((msg, index) => (
                    <div className="chat-message" key={index}>
                        <strong>{msg.username}</strong>: {msg.message}
                    </div>
                
                ))}
            </div>
            <div className="message-input-wrapper">
                <textarea
                    className="message-input"
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type your message"
                />
                {/* <button className="send-message-button" onClick={handleSend}>Send</button> */}
            </div>
        </div>
    )
}
