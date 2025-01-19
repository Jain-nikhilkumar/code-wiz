// Frontend for the world's most advanced collaborative IDE
import React, { useState, useEffect } from "react";
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
  PlayArrow,  
} from "@mui/icons-material";
import io from "socket.io-client";

const socket = io("http://192.168.69.203:3000");

function App() {
  const [code, setCode] = useState({});
  const [activeFile, setActiveFile] = useState(null);
  const [output, setOutput] = useState("");
  const [files, setFiles] = useState([]);
  const [theme, setTheme] = useState("vs-dark");
  const [openDialog, setOpenDialog] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newFolderDialog, setNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  useEffect(() => {
    socket.emit("joinProject", "default_project");

    socket.on("projectSync", (project) => {
      const receivedFiles = Array.isArray(project.files) ? project.files : [];
      setFiles(receivedFiles);
      setCode(project.files || {});
      setActiveFile(receivedFiles[0] || null);
    });

    socket.on("fileUpdated", ({ fileName, content }) => {
      setCode((prevCode) => ({ ...prevCode, [fileName]: content }));
    });

    socket.on("folderCreated", ({ folderName }) => {
      setFiles((prevFiles) => [...prevFiles, `${folderName}/`]);
    });

    return () => socket.off();
  }, []);

  const handleEditorChange = (value) => {
    if (activeFile) {
      const updatedCode = { ...code, [activeFile]: value };
      setCode(updatedCode);
      socket.emit("updateFile", {
        projectId: "default_project",
        fileName: activeFile,
        content: value,
      });
    }
  };

  const addNewFile = () => {
    if (newFileName.trim()) {
      const filePath = `${newFileName}`;
      setFiles([...files, filePath]);
      setCode({ ...code, [filePath]: "" });
      setActiveFile(filePath);
      setOpenDialog(false);
      setNewFileName("");
    }
  };

  const addNewFolder = () => {
    if (newFolderName.trim()) {
      const folderPath = `${newFolderName}/`;
      if (!files.includes(folderPath)) {
        setFiles([...files, folderPath]);
        socket.emit("createFolder", {
          projectId: "default_project",
          folderName: newFolderName,
        });
      }
      setNewFolderDialog(false);
      setNewFolderName("");
    }
  };

  const deleteFile = (fileName) => {
    setFiles(files.filter((file) => file !== fileName));
    const { [fileName]: _, ...remainingCode } = code;
    setCode(remainingCode);
    setActiveFile(files[0] || null);
  };

  const runCode = () => {
    if (activeFile) {
      socket.emit("runCode", {
        language: "javascript",
        code: code[activeFile],
      });
    }
  };

  useEffect(() => {
    socket.on("codeOutput", (result) => {
      setOutput(result);
    });
  }, []);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Advanced Collaborative IDE
          </Typography>
          <Tooltip title="Add New File">
            <IconButton color="inherit" onClick={() => setOpenDialog(true)}>
              <AddCircle />
            </IconButton>
          </Tooltip>
          <Tooltip title="Create New Folder">
            <IconButton color="inherit" onClick={() => setNewFolderDialog(true)}>
              <CreateNewFolder />
            </IconButton>
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

      {/* Main Layout */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* File Drawer */}
        <Drawer variant="permanent" anchor="left" sx={{ width: 80, flexShrink: 0 }}>
        <List sx={{ width: 80, overflow: "auto" }}> 
            {files.map((file) => (
              <ListItem
                button
                key={file}
                selected={file === activeFile}
                onClick={() => setActiveFile(file)}
              >
                <ListItemText primary={file} />
                <IconButton size="small" onClick={() => deleteFile(file)}>
                  <Delete fontSize="small" />
                </IconButton>
              </ListItem>
            ))}
          </List>
        </Drawer>

        {/* Code Editor */}
        <div style={{ flex: 2, margin: "1rem" }}>
          {activeFile ? (
            <Editor
              height="calc(100vh - 100px)"
              language="javascript"
              theme={theme}
              value={code[activeFile]}
              onChange={handleEditorChange}
              options={{
                minimap: { enabled: true },
                fontSize: 14,
                lineNumbers: "on",
                tabSize: 2,
                scrollBeyondLastLine: true,
              }}
            />
          ) : (
            <Typography variant="h6" style={{ textAlign: "center" }}>
              Select or create a file to start coding
            </Typography>
          )}
        </div>

        {/* Output Terminal */}
        <Box
          sx={{
            width: "30%",
            padding: "1rem",
            backgroundColor: "#282c34",
            color: "white",
            overflow: "auto",
          }}
        >
          <Typography variant="h6">Output</Typography>
          <Box
            sx={{
              padding: "1rem",
              border: "1px solid gray",
              height: "calc(100vh - 200px)",
              overflow: "auto",
            }}
          >
            {output}
          </Box>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={runCode}
            startIcon={<PlayArrow />}
          >
            Run Code
          </Button>
        </Box>
      </div>

      {/* New File Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
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
          <Button onClick={() => setOpenDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={addNewFile} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* New Folder Dialog */}
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
          <Button onClick={addNewFolder} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default App;
