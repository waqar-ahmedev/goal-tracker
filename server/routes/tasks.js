const express = require("express");
const router = express.Router();
const supabase = require("../supabase");
const { getAuth } = require("@clerk/express");

router.post("/", async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Not signed in" });

  const { goal_id, title } = req.body;
  if (!goal_id || !title) {
    return res.status(400).json({ error: "goal_id and title are required" });
  }

  // Verify the goal belongs to this user before attaching a task to it
  const { data: goal } = await supabase
    .from("goals")
    .select("id")
    .eq("id", goal_id)
    .eq("user_id", userId)
    .single();

  if (!goal) return res.status(403).json({ error: "Goal not found" });

  const { data, error } = await supabase
    .from("tasks")
    .insert({ goal_id, user_id: userId, title })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

router.get("/", async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Not signed in" });

  // goal_id is optional: with it, return that goal's tasks; without it,
  // return all of the user's tasks (used by the dashboard's single fetch).
  const { goal_id } = req.query;

  let query = supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (goal_id) query = query.eq("goal_id", goal_id);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.patch("/:id", async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Not signed in" });

  const { is_done } = req.body;
  if (typeof is_done !== "boolean") {
    return res.status(400).json({ error: "is_done must be a boolean" });
  }

  const { data, error } = await supabase
    .from("tasks")
    .update({ is_done })
    .eq("id", req.params.id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Task not found" });
  res.json(data);
});

module.exports = router;
