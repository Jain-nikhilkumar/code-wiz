// // Frontend for the world's most advanced collaborative IDE
// import React, { useState, useEffect } from "react";
// import { Editor } from "@monaco-editor/react";
// import {
//   AppBar,
//   Toolbar,
//   Typography,
//   Box,
//   Button,
//   Drawer,
//   List,
//   ListItem,
//   ListItemText,
//   IconButton,
//   Tooltip,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField,
// } from "@mui/material";
// import {
//   AddCircle,
//   CreateNewFolder,
//   Delete,
//   SyncAlt,
//   PlayArrow,  
// } from "@mui/icons-material";
// import io from "socket.io-client";

// const socket = io("http://192.168.69.203:3000");

// function App() {
//   const [code, setCode] = useState({});
//   const [activeFile, setActiveFile] = useState(null);
//   const [output, setOutput] = useState("");
//   const [files, setFiles] = useState([]);
//   const [theme, setTheme] = useState("vs-dark");
//   const [openDialog, setOpenDialog] = useState(false);
//   const [newFileName, setNewFileName] = useState("");
//   const [newFolderDialog, setNewFolderDialog] = useState(false);
//   const [newFolderName, setNewFolderName] = useState("");

//   useEffect(() => {
//     socket.emit("joinProject", "default_project");

//     socket.on("projectSync", (project) => {
//       const receivedFiles = Array.isArray(project.files) ? project.files : [];
//       setFiles(receivedFiles);
//       setCode(project.files || {});
//       setActiveFile(receivedFiles[0] || null);
//     });

//     socket.on("fileUpdated", ({ fileName, content }) => {
//       setCode((prevCode) => ({ ...prevCode, [fileName]: content }));
//     });

//     socket.on("folderCreated", ({ folderName }) => {
//       setFiles((prevFiles) => [...prevFiles, `${folderName}/`]);
//     });

//     return () => socket.off();
//   }, []);

//   const handleEditorChange = (value) => {
//     if (activeFile) {
//       const updatedCode = { ...code, [activeFile]: value };
//       setCode(updatedCode);
//       socket.emit("updateFile", {
//         projectId: "default_project",
//         fileName: activeFile,
//         content: value,
//       });
//     }
//   };

//   const addNewFile = () => {
//     if (newFileName.trim()) {
//       const filePath = `${newFileName}`;
//       setFiles([...files, filePath]);
//       setCode({ ...code, [filePath]: "" });
//       setActiveFile(filePath);
//       setOpenDialog(false);
//       setNewFileName("");
//     }
//   };

//   const addNewFolder = () => {
//     if (newFolderName.trim()) {
//       const folderPath = `${newFolderName}/`;
//       if (!files.includes(folderPath)) {
//         setFiles([...files, folderPath]);
//         socket.emit("createFolder", {
//           projectId: "default_project",
//           folderName: newFolderName,
//         });
//       }
//       setNewFolderDialog(false);
//       setNewFolderName("");
//     }
//   };

//   const deleteFile = (fileName) => {
//     setFiles(files.filter((file) => file !== fileName));
//     const { [fileName]: _, ...remainingCode } = code;
//     setCode(remainingCode);
//     setActiveFile(files[0] || null);
//   };

//   const runCode = () => {
//     if (activeFile) {
//       socket.emit("runCode", {
//         language: "javascript",
//         code: code[activeFile],
//       });
//     }
//   };

//   useEffect(() => {
//     socket.on("codeOutput", (result) => {
//       setOutput(result);
//     });
//   }, []);

//   return (
//     <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
//       {/* Header */}
//       <AppBar position="static">
//         <Toolbar>
//           <Typography variant="h6" style={{ flexGrow: 1 }}>
//             Advanced Collaborative IDE
//           </Typography>
//           <Tooltip title="Add New File">
//             <IconButton color="inherit" onClick={() => setOpenDialog(true)}>
//               <AddCircle />
//             </IconButton>
//           </Tooltip>
//           <Tooltip title="Create New Folder">
//             <IconButton color="inherit" onClick={() => setNewFolderDialog(true)}>
//               <CreateNewFolder />
//             </IconButton>
//           </Tooltip>
//           <Tooltip title="Toggle Theme">
//             <IconButton
//               color="inherit"
//               onClick={() => setTheme(theme === "vs-dark" ? "light" : "vs-dark")}
//             >
//               <SyncAlt />
//             </IconButton>
//           </Tooltip>
//         </Toolbar>
//       </AppBar>

//       {/* Main Layout */}
//       <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
//         {/* File Drawer */}
//         <Drawer variant="permanent" anchor="left" sx={{ width: 80, flexShrink: 0 }}>
//         <List sx={{ width: 80, overflow: "auto" }}> 
//             {files.map((file) => (
//               <ListItem
//                 button
//                 key={file}
//                 selected={file === activeFile}
//                 onClick={() => setActiveFile(file)}
//               >
//                 <ListItemText primary={file} />
//                 <IconButton size="small" onClick={() => deleteFile(file)}>
//                   <Delete fontSize="small" />
//                 </IconButton>
//               </ListItem>
//             ))}
//           </List>
//         </Drawer>

//         {/* Code Editor */}
//         <div style={{ flex: 2, margin: "1rem" }}>
//           {activeFile ? (
//             <Editor
//               height="calc(100vh - 100px)"
//               language="javascript"
//               theme={theme}
//               value={code[activeFile]}
//               onChange={handleEditorChange}
//               options={{
//                 minimap: { enabled: true },
//                 fontSize: 14,
//                 lineNumbers: "on",
//                 tabSize: 2,
//                 scrollBeyondLastLine: true,
//               }}
//             />
//           ) : (
//             <Typography variant="h6" style={{ textAlign: "center" }}>
//               Select or create a file to start coding
//             </Typography>
//           )}
//         </div>

//         {/* Output Terminal */}
//         <Box
//           sx={{
//             width: "30%",
//             padding: "1rem",
//             backgroundColor: "#282c34",
//             color: "white",
//             overflow: "auto",
//           }}
//         >
//           <Typography variant="h6">Output</Typography>
//           <Box
//             sx={{
//               padding: "1rem",
//               border: "1px solid gray",
//               height: "calc(100vh - 200px)",
//               overflow: "auto",
//             }}
//           >
//             {output}
//           </Box>
//           <Button
//             variant="contained"
//             color="primary"
//             fullWidth
//             onClick={runCode}
//             startIcon={<PlayArrow />}
//           >
//             Run Code
//           </Button>
//         </Box>
//       </div>

//       {/* New File Dialog */}
//       <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
//         <DialogTitle>Add New File</DialogTitle>
//         <DialogContent>
//           <TextField
//             autoFocus
//             margin="dense"
//             label="File Name"
//             fullWidth
//             value={newFileName}
//             onChange={(e) => setNewFileName(e.target.value)}
//           />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpenDialog(false)} color="secondary">
//             Cancel
//           </Button>
//           <Button onClick={addNewFile} color="primary">
//             Add
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* New Folder Dialog */}
//       <Dialog open={newFolderDialog} onClose={() => setNewFolderDialog(false)}>
//         <DialogTitle>Create New Folder</DialogTitle>
//         <DialogContent>
//         <TextField
//             autoFocus
//             margin="dense"
//             label="Folder Name"
//             fullWidth
//             value={newFolderName}
//             onChange={(e) => setNewFolderName(e.target.value)}
//           />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setNewFolderDialog(false)} color="secondary">
//             Cancel
//           </Button>
//           <Button onClick={addNewFolder} color="primary">
//             Create
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </div>
//   );
// }

// export default App;


// Frontend for Advanced Collaborative IDE
import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { loader } from "@monaco-editor/react";
import { Editor } from "@monaco-editor/react";

import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import {
  AddCircle,
  CreateNewFolder,
  Delete,
  SyncAlt,
} from "@mui/icons-material";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

const socketURL = "ws://localhost:3000";
const socket = io(socketURL);

// Configure Monaco Editor loader
loader.config({
  paths: {
    vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.34.0/min/vs", // Update version if needed
  },
});
function App() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [code, setCode] = useState("");
  const [theme, setTheme] = useState("vs-white");
  const [projectDialog, setProjectDialog] = useState(false);
  const [newFileDialog, setNewFileDialog] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newProjectDialog, setNewProjectDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newFolderDialog, setNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  useEffect(() => {
    fetch("http://localhost:3000/projects")
      .then((res) => res.json())
      .then(setProjects);
  }, []);


  useEffect(() => {
    const interval = setInterval(() => {
      socket.emit("ping");
    }, 10000); // Ping every 10 seconds
  
    return () => clearInterval(interval);
  }, []);

  
  const handleProjectSelect = (projectId) => {
    setSelectedProject(projectId);
    fetch(`http://localhost:3000/projects/${projectId}`)
      .then((res) => res.json())
      .then((data) => setFiles(data.files));
  };

  const [activeUsers, setActiveUsers] = useState([]);

useEffect(() => {
  const   handleUserJoined = ({ userId }) => {
    setActiveUsers((prevUsers) => [...prevUsers, userId]);
  };

  const handleUserLeft = ({ userId }) => {
    setActiveUsers((prevUsers) => prevUsers.filter((id) => id !== userId));
  };

  socket.on("userJoined", handleUserJoined);
  socket.on("userLeft", handleUserLeft);

  return () => {
    socket.off("userJoined", handleUserJoined);
    socket.off("userLeft", handleUserLeft);
  };  
}, []);


// const handleFileSelect = (file) => {
//   setActiveFile(file);

//   if (file && file.name) {
//     const roomId = `${selectedProject}-${file.name}`;
//     const ydoc = new Y.Doc();
//     const provider = new WebsocketProvider(socketURL, roomId, ydoc);
//     const yText = ydoc.getText("monaco");

//     provider.on("status", (event) => {
//       console.log(`WebSocket status for ${roomId}:`, event.status);
//     });

//     yText.observe(() => {
//       setCode(yText.toString());
//     });

//     provider.awareness.setLocalStateField("user", {
//       name: `User-${Math.floor(Math.random() * 1000)}`,
//     });

   
//       provider.on("synced", () => {
//         console.log(`Synced with room: ${roomId}`);
//       });

//       // Listen for updates from the backend
//       provider.on("docUpdate", (update) => {
//         console.log("Update received from backend");
//         Y.applyUpdate(ydoc, update);
//       });

//       // Observe the Y.Doc for changes
//       yText.observe(() => {
//         console.log("Local Y.Doc updated");
//         setCode(yText.toString());
//       });


//     // Propagate local changes to Y.js
//     setCode((prevCode) => {
//       yText.delete(0, yText.length);
//       yText.insert(0, prevCode);
//       return prevCode;
//     });
//   }
// };


const handleFileSelect = (file) => {
  if (file && file.name) {
    const roomId = `${selectedProject}-${file.name}`;
    const ydoc = new Y.Doc();
    const provider = new WebsocketProvider(socketURL, roomId, ydoc);
    const yText = ydoc.getText("monaco");

    // Set up awareness to show user presence
    provider.awareness.setLocalStateField("user", {
      name: `User-${Math.floor(Math.random() * 1000)}`,
    });

    // Observe Y.Text changes and update the editor
    yText.observe((event) => {
      setCode(yText.toString());
    });

    // Sync the editor's initial content with Y.Text
    setCode((prevCode) => {
      yText.delete(0, yText.length);
      yText.insert(0, prevCode);
      return prevCode;
    });

    // Emit changes from the editor to Y.Text
    setActiveFile(file);
  }
};

  const createNewFile = () => {
    if (newFileName.trim()) {
      fetch(`http://localhost:3000/projects/${selectedProject}/files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newFileName }),
      })
        .then((res) => res.json())
        .then(() => {
          setFiles([...files, { name: newFileName, isDirectory: false }]);
          setNewFileDialog(false);
          setNewFileName("");
        });
    }
  };

  const createNewFolder = () => {
    if (newFolderName.trim()) {
      fetch(`http://localhost:3000/projects/${selectedProject}/folders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newFolderName }),
      })
        .then((res) => res.json())
        .then(() => {
          setFiles([...files, { name: `${newFolderName}/`, isDirectory: true }]);
          setNewFolderDialog(false);
          setNewFolderName("");
        });
    }
  };

  const createNewProject = () => {
    if (newProjectName.trim()) {
      fetch("http://localhost:3000/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newProjectName }),
      })
        .then((res) => res.json())
        .then((project) => {
          setProjects([...projects, project]);
          setNewProjectDialog(false);
          setNewProjectName("");
        });
    }
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Advanced Collaborative IDE
          </Typography>
          <Tooltip title="Create New Project">
            <Button
              variant="contained"
              color="primary"
              onClick={() => setNewProjectDialog(true)}
            >
              New Project
            </Button>
          </Tooltip>
          <Tooltip title="Select Project">
            <Button
              variant="contained"
              color="primary"
              onClick={() => setProjectDialog(true)}
            >
              Select Project
            </Button>
          </Tooltip>
          <Tooltip title="Toggle Theme">
            <IconButton
              color="inherit"
              onClick={() => setTheme(theme === "vs-dark" ? "light" : "vs-dark")}
            >
              <SyncAlt />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <div style={{ display: "flex", flex: 1 }}>
        <Drawer variant="permanent" anchor="left" style={{ width: "250px" }}>
          <List>
            {files.map((file) => (
              <ListItem
                button
                key={file.name}
                selected={file.name === activeFile?.name}
                onClick={() => handleFileSelect(file)}
              >
                <ListItemText primary={file.name} />
              </ListItem>
            ))}
            <ListItem>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddCircle />}
                onClick={() => setNewFileDialog(true)}
              >
                New File
              </Button>
            </ListItem>
            <ListItem>
              <Button
                variant="contained"
                color="primary"
                startIcon={<CreateNewFolder />}
                onClick={() => setNewFolderDialog(true)}
              >
                New Folder
              </Button>
            </ListItem>
          </List>
        </Drawer>

        
        <div style={{ flex: 1, padding: "1rem" }}>
          {activeFile ? (
            <Editor
              height="70vh"
              language="javascript"
              theme={theme}
              value={code}
              onChange={(newValue) => setCode(newValue)}
              options={{
                minimap: { enabled: true },
                fontSize: 14,
                lineNumbers: "on",
              }}
            />
          ) : (
            <Typography variant="h6" style={{ textAlign: "center" }}>
              Select or create a file to start coding
            </Typography>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={projectDialog} onClose={() => setProjectDialog(false)}>
        <DialogTitle>Select a Project</DialogTitle>
        <DialogContent>
          <List>
            {projects.map((project) => (
              <ListItem
                button
                key={project.id}
                onClick={() => {
                  handleProjectSelect(project.id);
                  setProjectDialog(false);
                }}
              >
                <ListItemText primary={project.name} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>

      <Dialog open={newProjectDialog} onClose={() => setNewProjectDialog(false)}>
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Project Name"
            fullWidth
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewProjectDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={createNewProject} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ padding: "0.5rem", backgroundColor: "#f5f5f5", borderBottom: "1px solid #ddd" }}>
  <Typography variant="subtitle2">Active Users:</Typography>
  {activeUsers.map((userId) => (
    <Typography key={userId} variant="body2">User: {userId}</Typography>
  ))}
</Box>

      <Dialog open={newFileDialog} onClose={() => setNewFileDialog(false)}>
        <DialogTitle>Add New File</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="File Name"
            fullWidth
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewFileDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={createNewFile} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={newFolderDialog} onClose={() => setNewFolderDialog(false)}>
        <DialogTitle>Create New Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Folder Name"
            fullWidth
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewFolderDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={createNewFolder} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
      
    </div>
  );
}

export default App;
