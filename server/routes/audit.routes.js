import express from "express";
import Audit from "../models/Audit.js";

const router = express.Router();

// Save audit log
router.post("/", async (req, res) => {
  try {
    const audit = await Audit.create(req.body);
    res.status(201).json(audit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get audit logs
router.get("/", async (req, res) => {
  const logs = await Audit.find().sort({ createdAt: -1 });
  res.json(logs);
});

export default router;
