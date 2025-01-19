// Backend server with advanced real-time collaboration, file management, and code execution
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");
const Redis = require("ioredis");
const Docker = require("dockerode");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Redis for real-time data synchronization
const redis = new Redis();

// Docker for isolated code execution
const docker = new Docker();

// Middleware
app.use(cors());
app.use(express.json());

// Persistent file storage
const storagePath = "./projects";
if (!fs.existsSync(storagePath)) {
  fs.mkdirSync(storagePath);
}

// Utility to save files to disk
const saveFile = (projectId, fileName, content) => {
  const projectDir = `${storagePath}/${projectId}`;
  if (!fs.existsSync(projectDir)) {
    fs.mkdirSync(projectDir);
  }
  fs.writeFileSync(`${projectDir}/${fileName}`, content);
};

// In-memory storage for projects (enhanced with persistence)
const projects = {};

// Socket.IO events
io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  // Join a project room
  socket.on("joinProject", (projectId) => {
    socket.join(projectId);
    console.log(`User ${socket.id} joined project ${projectId}`);

    // Load project state from disk if not in memory
    if (!projects[projectId]) {
      const projectDir = `${storagePath}/${projectId}`;
      if (fs.existsSync(projectDir)) {
        const files = fs.readdirSync(projectDir);
        projects[projectId] = { files: {} };
        files.forEach((file) => {
          const content = fs.readFileSync(`${projectDir}/${file}`, "utf-8");
          projects[projectId].files[file] = content;
        });
      } else {
        projects[projectId] = { files: {} };
      }
    }

    // Sync project state
    socket.emit("projectSync", projects[projectId]);
  });

  // Handle file updates
  socket.on("updateFile", ({ projectId, fileName, content }) => {
    if (!projects[projectId]) {
      projects[projectId] = { files: {} };
    }
    projects[projectId].files[fileName] = content;

    // Broadcast changes to other users in the project
    socket.to(projectId).emit("fileUpdated", { fileName, content });

    // Persist changes in Redis
    redis.hset(projectId, fileName, content);

    // Save file to disk
    saveFile(projectId, fileName, content);
  });

  // Execute code
  socket.on("runCode", async ({ language, code }) => {
    try {
      const container = await docker.createContainer({
        Image: `${language}:latest`,
        Cmd: ["sh", "-c", `echo '${code}' | ${language}`],
        Tty: false
      });

      await container.start();
      const output = await container.logs({ stdout: true, stderr: true });
      await container.remove();

      socket.emit("codeOutput", output);
    } catch (error) {
      console.error(error);
      socket.emit("codeOutput", `Error: ${error.message}`);
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
  });
});

// REST API to fetch project details
app.get("/projects/:projectId", (req, res) => {
  const { projectId } = req.params;
  const projectDir = `${storagePath}/${projectId}`;
  if (fs.existsSync(projectDir)) {
    const files = fs.readdirSync(projectDir).map((file) => ({
      name: file,
      content: fs.readFileSync(`${projectDir}/${file}`, "utf-8")
    }));
    res.json({ projectId, files });
  } else {
    res.status(404).json({ message: "Project not found" });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
