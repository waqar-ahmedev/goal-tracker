const express = require("express");
const router = express.Router();
const supabase = require("../supabase");
const { getAuth } = require("@clerk/express");

router.post("/", async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Not signed in" });

  const { goal_id, note, log_date } = req.body;
  const date = log_date || new Date().toISOString().split("T")[0];

  // Prevent logging the same goal twice on the same day
  if (goal_id) {
    const { data: existing } = await supabase
      .from("daily_logs")
      .select("id")
      .eq("user_id", userId)
      .eq("goal_id", goal_id)
      .eq("log_date", date)
      .single();

    if (existing) {
      return res.status(409).json({ error: "Already logged this goal today" });
    }
  }

  const { data, error } = await supabase
    .from("daily_logs")
    .insert({
      user_id: userId,
      goal_id: goal_id || null,
      log_date: date,
      note: note || null,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

router.get("/", async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Not signed in" });

  const { date } = req.query;

  let query = supabase
    .from("daily_logs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (date) query = query.eq("log_date", date);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;
