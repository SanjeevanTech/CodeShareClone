import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import CodeEditor from "./components/CodeEditor";
import ThemeToggle from "./components/ThemeToggle";
import ShareModal from "./components/ShareModal";
import themeClasses from "./utils/themeClasses";

const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const Home = () => {
    const [code, setCode] = useState("");
    const [shareUrl, setShareUrl] = useState("");
    const [room, setRoom] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [theme, setTheme] = useState("dark");

    useEffect(() => {
        const path = window.location.pathname.split("/")[1];
        if (path) {
            setRoom(path);
            fetch(`${backendUrl}/code/${path}`)
                .then((response) => response.json())
                .then((data) => {
                    setCode(data.code);
                    socket.emit("joinRoom", path);
                })
                .catch((error) => console.error("Error fetching code:", error));
        }
    }, []);

    useEffect(() => {
        socket.on("codeUpdate", (newCode) => setCode(newCode));
        return () => socket.off("codeUpdate");
    }, [room]);

    const handleInputChange = (e) => {
        const newCode = e.target.value;
        setCode(newCode);
        if (room) socket.emit("codeUpdate", { room, code: newCode });
    };

    const handleShare = async () => {
        try {
            const response = await fetch(`${backendUrl}/share`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, room }),
            });
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            setShareUrl(`${window.location.origin}/${room}`);
            setIsModalOpen(true);
        } catch (error) {
            console.error("Error sharing code:", error);
        }
    };

    return (
        <div className={`min-h-screen ${themeClasses[theme].bg} ${themeClasses[theme].text} flex flex-col items-center`}>
            <ThemeToggle theme={theme} onChange={(e) => setTheme(e.target.value)} />
            <CodeEditor code={code} onChange={handleInputChange} theme={themeClasses[theme]} />
            <button onClick={handleShare} className={themeClasses[theme].buttonBg}>Share</button>
            {isModalOpen && <ShareModal shareUrl={shareUrl} theme={themeClasses[theme]} onClose={() => setIsModalOpen(false)} onCopy={() => navigator.clipboard.writeText(shareUrl)} />}
        </div>
    );
};

export default Home;
