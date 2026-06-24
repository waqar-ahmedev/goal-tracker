require("dotenv").config();
const express = require("express");
const goals = require("./routes/goals");
const app = express();
const PORT = 3000;

app.use(express.json());
app.use("/api/goals", goals);
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
