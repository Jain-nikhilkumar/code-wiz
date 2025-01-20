// // Updated Backend server with advanced real-time collaboration, file management, and code execution
// const express = require("express");
// const http = require("http");
// const cors = require("cors");
// const { Server } = require("socket.io");
// const { v4: uuidv4 } = require("uuid");
// const Redis = require("ioredis");
// const Docker = require("dockerode");
// const fs = require("fs");

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"]
//   }
// });

// // Redis for real-time data synchronization
// const redis = new Redis();

// // Docker for isolated code execution
// const docker = new Docker();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Persistent file storage
// const storagePath = "./projects";
// if (!fs.existsSync(storagePath)) {
//   fs.mkdirSync(storagePath);
// }

// // Utility to save files and folders to disk
// const saveFile = (projectId, fileName, content) => {
//   const projectDir = `${storagePath}/${projectId}`;
//   if (!fs.existsSync(projectDir)) {
//     fs.mkdirSync(projectDir, { recursive: true });
//   }
//   fs.writeFileSync(`${projectDir}/${fileName}`, content);
// };

// const saveFolder = (projectId, folderName) => {
//   const folderPath = `${storagePath}/${projectId}/${folderName}`;
//   if (!fs.existsSync(folderPath)) {
//     fs.mkdirSync(folderPath, { recursive: true });
//   }
// };

// // In-memory storage for projects (enhanced with persistence)
// const projects = {};

// console.log(projects);
// // Socket.IO events
// io.on("connection", (socket) => {
//   console.log("A user connected", socket.id);

//   // Join a project room
//   socket.on("joinProject", (projectId) => {
//     socket.join(projectId);
//     console.log(`User ${socket.id} joined project ${projectId}`);

//     // Load project state from disk if not in memory
//     if (!projects[projectId]) {
//       const projectDir = `${storagePath}/${projectId}`;
//       if (fs.existsSync(projectDir)) {
//         const files = fs.readdirSync(projectDir, { withFileTypes: true });
//         projects[projectId] = { files: {} };
//         files.forEach((file) => {
//           if (file.isFile()) {
//             const content = fs.readFileSync(`${projectDir}/${file.name}`, "utf-8");
//             projects[projectId].files[file.name] = content;
//           } else if (file.isDirectory()) {
//             projects[projectId].files[`${file.name}/`] = null;
//           }
//         });
//       } else {
//         projects[projectId] = { files: {} };
//       }
//     }

//     // Sync project state
//     socket.emit("projectSync", { files: Object.keys(projects[projectId].files || {}) });
//   });

//   // Handle file updates
//   socket.on("updateFile", ({ projectId, fileName, content }) => {
//     if (!projects[projectId]) {
//       projects[projectId] = { files: {} };
//     }
//     projects[projectId].files[fileName] = content;

//     // Broadcast changes to other users in the project
//     socket.to(projectId).emit("fileUpdated", { fileName, content });

//     // Persist changes in Redis
//     redis.hset(projectId, fileName, content);

//     // Save file to disk
//     saveFile(projectId, fileName, content);
//   });

//   // Handle folder creation
//   socket.on("createFolder", ({ projectId, folderName }) => {
//     if (!projects[projectId]) {
//       projects[projectId] = { files: {} };
//     }
//     projects[projectId].files[`${folderName}/`] = null;

//     // Broadcast changes to other users in the project
//     socket.to(projectId).emit("folderCreated", { folderName });

//     // Save folder to disk
//     saveFolder(projectId, folderName);
//   });

//   // Execute code
//   socket.on("runCode", async ({ language, code }) => {
//     try {
//       const container = await docker.createContainer({
//         Image: `${language}:latest`,
//         Cmd: ["sh", "-c", `echo '${code}' | ${language}`],
//         Tty: false
//       });

//       await container.start();
//       const output = await container.logs({ stdout: true, stderr: true });
//       await container.remove();

//       socket.emit("codeOutput", output);
//     } catch (error) {
//       console.error(error);
//       socket.emit("codeOutput", `Error: ${error.message}`);
//     }
//   });

//   socket.on("disconnect", () => {
//     console.log("A user disconnected", socket.id);
//   });
// });

// // REST API to fetch project details
// app.get("/projects/:projectId", (req, res) => {
//   const { projectId } = req.params;
//   const projectDir = `${storagePath}/${projectId}`;
//   if (fs.existsSync(projectDir)) {
//     const files = fs.readdirSync(projectDir, { withFileTypes: true }).map((file) => ({
//       name: file.name,
//       isFolder: file.isDirectory(),
//       content: file.isFile() ? fs.readFileSync(`${projectDir}/${file.name}`, "utf-8") : null
//     }));
//     res.json({ projectId, files });
//   } else {
//     res.status(404).json({ message: "Project not found" });
//   }
// });

// // Start server
// const PORT = process.env.PORT || 3000;
// server.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });


// Backend server for Advanced Collaborative IDE
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");
const Y = require("yjs");
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PROJECTS_DIR = path.resolve(__dirname, "projects");
if (!fs.existsSync(PROJECTS_DIR)) {
  fs.mkdirSync(PROJECTS_DIR);
}

const yDocs = {};

app.use(cors());
app.use(express.json());

// Utility to initialize project structure
const initializeProject = (projectId) => {
  const projectPath = path.join(PROJECTS_DIR, projectId);
  if (!fs.existsSync(projectPath)) {
    fs.mkdirSync(projectPath);
  }
  return projectPath;
};

// REST API Endpoints
app.get("/projects", (req, res) => {
  const projects = fs.readdirSync(PROJECTS_DIR).map((project) => ({
    id: project,
    name: project,
  }));
  res.json(projects);
});

// Get files for a specific project
app.get("/projects/:projectId", (req, res) => {
  const { projectId } = req.params;
  const projectPath = path.join(PROJECTS_DIR, projectId);

  if (!fs.existsSync(projectPath)) {
    return res.status(404).json({ error: "Project not found" });
  }

  const files = fs.readdirSync(projectPath).map((file) => ({
    name: file,
    isDirectory: fs.lstatSync(path.join(projectPath, file)).isDirectory()
  }));

  res.json({ projectId, files });
});


// Create a new project
app.post("/projects", (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Project name is required" });
  }

  const projectId = name;
  const projectPath = initializeProject(projectId);

  fs.writeFileSync(path.join(projectPath, "README.md"), `# ${name}\n`);

  res.status(201).json({ id: projectId, name });
});


// Create a new file
app.post("/projects/:projectId/files", (req, res) => {
  const { projectId } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "File name is required" });
  }

  const projectPath = path.join(PROJECTS_DIR, projectId);

  if (!fs.existsSync(projectPath)) {
    return res.status(404).json({ error: "Project not found" });
  }

  const filePath = path.join(projectPath, name);

  if (fs.existsSync(filePath)) {
    return res.status(400).json({ error: "File already exists" });
  }

  fs.writeFileSync(filePath, "");
  res.status(201).json({ message: "File created" });
});




// Create a new folder
app.post("/projects/:projectId/folders", (req, res) => {
  const { projectId } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Folder name is required" });
  }

  const projectPath = path.join(PROJECTS_DIR, projectId);

  if (!fs.existsSync(projectPath)) {
    return res.status(404).json({ error: "Project not found" });
  }

  const folderPath = path.join(projectPath, name);

  if (fs.existsSync(folderPath)) {
    return res.status(400).json({ error: "Folder already exists" });
  }

  fs.mkdirSync(folderPath);
  res.status(201).json({ message: "Folder created" });
});

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);
  io.on("connection", (socket) => {
    socket.on("docUpdate", (update) => {
      Y.applyUpdate(yDoc, update);
      socket.to(roomId).emit("docUpdate", update, { binary: true });
    });
  });
  
  socket.on("joinFile", (roomId) => {
    socket.join(roomId);

    if (!yDocs[roomId]) {
      yDocs[roomId] = new Y.Doc();
    }

    const yDoc = yDocs[roomId];

    // Send the initial document state to the client
    socket.emit("docState", Y.encodeStateAsUpdate(yDoc));
    socket.on("awarenessUpdate", (awarenessData) => {
      socket.to(roomId).emit("awarenessUpdate", awarenessData);
    });
    provider.on("docState", (encodedState) => {
      console.log("Initial document state received");
      Y.applyUpdate(ydoc, encodedState);
    });

    

    // Handle incoming updates and broadcast to others
    socket.on("docUpdate", (update) => {
      Y.applyUpdate(yDoc, update); // Apply the update to the Y.Doc
      socket.to(roomId).emit("docUpdate", update); // Broadcast the update immediately
      console.log(`Update broadcasted to room: ${roomId}`);
  console.log(`Received update for room ${roomId}:`, update);
    });
    
    io.on("connection", (socket) => {
      socket.on("ping", () => {
        socket.emit("pong"); // Respond to keep the connection alive
      });
    });
    
    socket.on("joinFile", (roomId) => {
      socket.join(roomId);
      socket.to(roomId).emit("userJoined", { userId: socket.id });
    });
    
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
      socket.to(roomId).emit("userLeft", { userId: socket.id });
    });
    


    socket.on("disconnect", () => {
      console.log(`User ${socket.id} disconnected from room: ${roomId}`);
    });
  });
});









// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
