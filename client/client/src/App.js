
// export default App;
import React, { useState, useEffect } from "react";
import { Editor } from "@monaco-editor/react";
import io from "socket.io-client";

const socket = io("http://localhost:3000");

function App() {
  const [code, setCode] = useState("// Start coding here");

  useEffect(() => {
    // Listen for updates from other users
    socket.on("codeChange", (newCode) => {
      setCode(newCode);
    });

    // Clean up the socket listener on component unmount
    return () => socket.off("codeChange");
  }, []);

  const handleEditorChange = (value) => {
    setCode(value);
    // Emit code changes to the server
    socket.emit("codeChange", value);
  };

  return (
    <div style={{ height: "100vh" }}>
      <Editor
        height="90vh"
        defaultLanguage="javascript"
        value={code}
        theme="vs-dark"
        onChange={handleEditorChange}
      />
    </div>
  );
}

export default App;
