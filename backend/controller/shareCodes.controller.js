



const BASE_URL = process.env.BASE_URL || "http://localhost:5173";
  const codeSnippets = new Map();
    export default codeSnippets;
export const fetchcode = (req, res) => {
    try {
        const { room } = req.params;

        
        if (!room || typeof room !== "string") {
            return res.status(400).json({ error: "Invalid room parameter" });
        }

        const roomData = codeSnippets.get(room);

        if (!roomData || Date.now() > roomData.expiryTime) {
            codeSnippets.delete(room); 
            return res.status(404).json({ error: "Code expired or not found" });
        }

        res.json({ code: roomData.code });
    } 
    catch (error) {
        console.error(`Error in fetchcode controller: ${error.message}`);
        res.status(500).json({ error: "Internal server error" });
    }
};




export const share=(req,res)=>{
    try{
        const room = Math.random().toString(36).substring(7);
        const expiryTime = Date.now() + 24 * 60 * 60 * 1000; // 24-hour expiration

        codeSnippets.set(room, { code: "", expiryTime });

        res.json({ url: `${BASE_URL}/${room}` });
    }
    catch(error){
        console.error(`Error in share controller : ${error.message}`);
        res.status(500).json({error : "Internal server error"});
    }
}

export const cleanupExpiredRooms = () => {
    const now = Date.now();
    for (const [room, { expiryTime }] of codeSnippets) {
      if (now > expiryTime) {
        codeSnippets.delete(room);
      }
    }
  };

