const express = require("express");
const router = express.Router();
const supabase = require("../supabase");
const { getAuth } = require("@clerk/express");

router.post("/", async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Not signed in" });

  const {
    title,
    why,
    horizon,
    start_date,
    target_date,
    hours_per_period,
    period,
  } = req.body;

  if (
    !title ||
    !horizon ||
    !start_date ||
    !target_date ||
    !hours_per_period ||
    !period
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const { data, error } = await supabase
    .from("goals")
    .insert({
      user_id: userId,
      title,
      why,
      horizon,
      start_date,
      target_date,
      hours_per_period,
      period,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

router.get("/", async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Not signed in" });

  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", userId);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;
