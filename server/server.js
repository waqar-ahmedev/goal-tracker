require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { clerkMiddleware } = require("@clerk/express");
const goals = require("./routes/goals");
const tasks = require("./routes/tasks");
const logs = require("./routes/logs");
const app = express();
const PORT = 3000;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(clerkMiddleware());
app.use(express.json());
app.use("/api/goals", goals);
app.use("/api/tasks", tasks);
app.use("/api/logs", logs);
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
