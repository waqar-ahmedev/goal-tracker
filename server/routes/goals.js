const express = require("express");
const router = express.Router();
const supabase = require("../supabase");

const TEMP_USER_ID = "test-user-1";

router.post("/", async (req, res) => {
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
      user_id: TEMP_USER_ID,
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
  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", TEMP_USER_ID);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;
