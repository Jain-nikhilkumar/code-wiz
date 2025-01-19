// // src/CollaborativeEditor.js
// import React, { useEffect, useState } from 'react';

// const CollaborativeEditor = () => {
//   const [editorContent, setEditorContent] = useState('');
//   const [ws, setWs] = useState(null);

//   useEffect(() => {
//     const socket = new WebSocket('ws://localhost:3000');
//     setWs(socket);

//     socket.onmessage = (event) => {
//       const data = event.data;
//       setEditorContent(data); // Update editor content
//     };

//     return () => {
//       socket.close();
//     };
//   }, []);

//   const handleEditorChange = (event) => {
//     setEditorContent(event.target.value);
//     if (ws && ws.readyState === WebSocket.OPEN) {
//       ws.send(event.target.value);
//     }
//   };

//   return (
//     <div>
//       <textarea
//         value={editorContent}
//         onChange={handleEditorChange}
//         rows="20"
//         cols="80"
//       />
//     </div>
//   );
// };

// export default CollaborativeEditor;
// src/CollaborativeEditor.js
import React, { useEffect, useState } from 'react';

const CollaborativeEditor = () => {
  const [editorContent, setEditorContent] = useState('');
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:3000'); // Connect to the WebSocket server
    setWs(socket);

    // Listen for messages from the WebSocket server
    socket.onmessage = (event) => {
      const data = event.data;
      setEditorContent(data); // Update editor content
    };

    return () => {
      socket.close();
    };
  }, []);

  const handleEditorChange = (event) => {
    setEditorContent(event.target.value);
    // Send the updated content to the server
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(event.target.value);
    }
  };

  return (
    <div>
      <textarea
        value={editorContent}
        onChange={handleEditorChange}
        rows="20"
        cols="80"
      />
    </div>
  );
};

export default CollaborativeEditor;
