const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running...");
});

let auditLogs = [];

app.post("/api/reconcile", (req, res) => {
  const records = req.body;

  let matched = [];
  let unmatched = [];
  let duplicates = [];

  const seen = new Set();

  records.forEach((row) => {
    const key = row.transaction_id;

    // Duplicate check
    if (seen.has(key)) {
      duplicates.push(row);
      auditLogs.push({
        action: "DUPLICATE",
        record: row,
        time: new Date()
      });
      return;
    }

    seen.add(key);

    // Matching logic
    if (row.amount > 0 && row.reference) {
      matched.push(row);
      auditLogs.push({
        action: "MATCHED",
        record: row,
        time: new Date()
      });
    } else {
      unmatched.push(row);
      auditLogs.push({
        action: "UNMATCHED",
        record: row,
        time: new Date()
      });
    }
  });

  res.json({
    matched,
    unmatched,
    duplicates,
    auditLogs
  });
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});