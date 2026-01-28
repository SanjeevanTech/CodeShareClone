import { useState } from "react";
import { useNavigate } from "react-router-dom";

const CodeshareHome = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");

  const handleShare = async () => {
    try {
      console.log("Sharing code:", code);
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
      console.log(`vercel backend url : ${backendUrl}`);
      const response = await fetch(`${backendUrl}/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }), // Send the code
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      // setShareUrl(data.url); // Assuming the backend returns a URL

      // Extract only the path from the full URL (e.g., /guqxya)
      const path = new URL(data.url).pathname;

      // Navigate to the generated room URL (path only)
      navigate(path); // Use React Router to navigate to the correct path
    } catch (error) {
      console.error("Error sharing code:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 text-white">
      <div className="w-full max-w-2xl bg-gray-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-6">Welcome to CodeShare</h1>

        {/* Description of the Web Application */}
        <div className="text-gray-300 text-center mb-8">
          <p className="mb-4">
            CodeShare is a real-time code-sharing platform that allows you to
            collaborate with others seamlessly. Whether you&apos;re working on a team
            project, teaching a coding class, or debugging with a friend,
            CodeShare makes it easy to share and edit code in real-time.
          </p>
          <p className="mb-4">
            Simply paste your code into the text area below, click &quot;Share Code
            Now,&quot; and share the generated URL with your collaborators. Everyone
            with the link can view and edit the code in real-time.
          </p>
          <p>
            Start sharing your code today and experience the power of real-time
            collaboration!
          </p>
        </div>



        {/* Code Input Area */}
        <textarea
          className="w-full h-40 p-4 mb-4 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          placeholder="Paste or type your code here..."
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="mt-6 w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-lg transition duration-300"
        >
          Share Code Now
        </button>


      </div>
    </div>
  );
};

export default CodeshareHome;