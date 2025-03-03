import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const socket = io(backendUrl);

const Home = () => {
    const [code, setCode] = useState('');
    const [shareUrl, setShareUrl] = useState('');
    const [room, setRoom] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [theme, setTheme] = useState('dark'); // Default to dark theme

    useEffect(() => {
        const path = window.location.pathname.split('/')[1];
        if (path) {
            setRoom(path);
            fetch(`${backendUrl}/code/${path}`)
                .then((response) => response.json())
                .then((data) => {
                    setCode(data.code);
                    socket.emit('joinRoom', path);
                })
                .catch((error) => console.error('Error fetching code:', error));
        }
    }, []);

    useEffect(() => {
        const handleCodeUpdate = (newCode) => setCode(newCode);
        socket.on('codeUpdate', handleCodeUpdate);
        return () => socket.off("codeUpdate", handleCodeUpdate);
    }, [room]);

    const handleInputChange = (e) => {
        const newCode = e.target.value;
        setCode(newCode);
        if (room) socket.emit('codeUpdate', { room, code: newCode });
    };

    const handleShare = async () => {
        try {
            const response = await fetch(`${backendUrl}/share`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, room })
            });
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            setShareUrl(`${window.location.origin}/${room}`);
            setIsModalOpen(true);
        } catch (error) {
            console.error('Error sharing code:', error);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        alert('URL copied to clipboard!');
    };

    const handleThemeChange = (e) => {
        setTheme(e.target.value);
    };

    // Theme-based class mappings
    const themeClasses = {
        dark: {
            bg: 'bg-[#1e1e1e]',
            text: 'text-[#d4d4d4]',
            headerBg: 'bg-[#007acc]',
            editorBg: 'bg-[#252526]',
            textareaBg: 'bg-[#1e1e1e]',
            textareaText: 'text-[#d4d4d4]',
            textareaBorder: 'border-[#3c3c3c]',
            buttonBg: 'bg-[#007acc] hover:bg-[#006bb3]',
            modalBg: 'bg-[#252526]',
            modalBorder: 'border-[#3c3c3c]',
            modalText: 'text-[#d4d4d4]',
            modalUrl: 'text-[#ce9178]',
            modalTitle: 'text-[#569cd6]',
            copyButton: 'bg-[#2a9d3e] hover:bg-[#258735]',
            closeButton: 'bg-[#c9504e] hover:bg-[#b34442]'
        },
        light: {
            bg: 'bg-gray-100',
            text: 'text-gray-900',
            headerBg: 'bg-blue-500',
            editorBg: 'bg-white',
            textareaBg: 'bg-gray-50',
            textareaText: 'text-gray-900',
            textareaBorder: 'border-gray-300',
            buttonBg: 'bg-blue-500 hover:bg-blue-600',
            modalBg: 'bg-white',
            modalBorder: 'border-gray-200',
            modalText: 'text-gray-900',
            modalUrl: 'text-blue-600',
            modalTitle: 'text-blue-700',
            copyButton: 'bg-green-500 hover:bg-green-600',
            closeButton: 'bg-red-500 hover:bg-red-600'
        }
    };

    const currentTheme = themeClasses[theme];

    return (
        <div className={`min-h-screen ${currentTheme.bg} ${currentTheme.text} 
        px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center justify-center transition-colors duration-300`}>
            {/* Theme toggle */}
            <div className="w-full max-w-4xl mb-4 flex justify-end">
                <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                        <input
                            type="radio"
                            value="dark"
                            checked={theme === 'dark'}
                            onChange={handleThemeChange}
                            className="form-radio text-blue-500 focus:ring-blue-500"
                        />
                        <span>Dark</span>
                    </label>
                    <label className="flex items-center space-x-2">
                        <input
                            type="radio"
                            value="light"
                            checked={theme === 'light'}
                            onChange={handleThemeChange}
                            className="form-radio text-blue-500 focus:ring-blue-500"
                        />
                        <span>Light</span>
                    </label>
                </div>
            </div>

            {/* Header bar */}
            <div className={`w-full max-w-4xl ${currentTheme.headerBg} py-2 px-4 rounded-t-xl shadow-md`}>
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-[#ff605c] rounded-full"></div>
                    <div className="w-3 h-3 bg-[#ffbd44] rounded-full"></div>
                    <div className="w-3 h-3 bg-[#00d364] rounded-full"></div>
                    <span className="text-sm font-medium">Code Sharing </span>
                </div>
            </div>

            {/* Main editor container */}
            <div className={`w-full max-w-4xl ${currentTheme.editorBg} rounded-b-xl shadow-lg space-y-6 p-4`}>
                <textarea
                    className={`w-full h-64 sm:h-80 lg:h-96 p-4 ${currentTheme.textareaText} 
                    ${currentTheme.textareaBg} rounded-lg border ${currentTheme.textareaBorder} 
                    resize-y focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200 font-mono text-sm`}
                    value={code}
                    onChange={handleInputChange}
                    placeholder="Type your code here..."
                />
                <button
                    onClick={handleShare}
                    className={`w-full sm:w-auto px-6 py-2 ${currentTheme.buttonBg} 
                    text-white font-semibold rounded-lg shadow-md transform hover:scale-105 transition-all duration-200`}
                >
                    Share Code
                </button>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div 
                        className={`${currentTheme.modalBg} ${currentTheme.modalText} p-6 rounded-xl shadow-2xl 
                        w-full max-w-md border ${currentTheme.modalBorder} transform scale-100 transition-all duration-300`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className={`text-lg font-semibold mb-4 ${currentTheme.modalTitle}`}>Share this URL</h2>
                        <p className={`${currentTheme.modalUrl} break-all mb-6 
                        ${theme === 'dark' ? 'bg-[#1e1e1e]' : 'bg-gray-100'} p-3 rounded-lg border 
                        ${currentTheme.textareaBorder}`}>{shareUrl}</p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={handleCopy}
                                className={`flex-1 px-4 py-2 ${currentTheme.copyButton} 
                                text-white font-semibold rounded-lg shadow-md hover:scale-105 transition-all duration-200`}
                            >
                                <ContentCopyIcon />
                            </button>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className={`flex-1 px-4 py-2 ${currentTheme.closeButton} 
                                text-white font-semibold rounded-lg shadow-md hover:scale-105 transition-all duration-200`}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;