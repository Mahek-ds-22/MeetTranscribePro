const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const path = require("path");
require("dotenv").config();

const { initDatabase } = require("./database");
const errorHandler = require("./middleware/errorHandler");

const profileRoutes = require("./routes/profiles");
const transcriptRoutes = require("./routes/transcripts");
const attendeesRoutes = require("./routes/attendees");
const tasksRoutes = require("./routes/tasks");
const summaryRoutes = require("./routes/summary");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.static(path.join(__dirname, "..", "frontend")));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.use("/api/profiles", profileRoutes);
app.use("/api/transcripts", transcriptRoutes);
app.use("/api/attendees", attendeesRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/summary", summaryRoutes);

app.use(errorHandler);

async function start() {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();
