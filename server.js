import express from "express";
import fs from "fs";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_KEY = process.env.ADMIN_KEY || "amirxan001";

// log fayl
const LOG_FILE = "./logs.json";
if (!fs.existsSync(LOG_FILE)) fs.writeFileSync(LOG_FILE, "{}");

function readLogs() {
  return JSON.parse(fs.readFileSync(LOG_FILE));
}

function writeLogs(data) {
  fs.writeFileSync(LOG_FILE, JSON.stringify(data, null, 2));
}

// 🔐 API (masalan ism ma’nosi)
app.get("/api/ism", (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const logs = readLogs();

  if (!logs[ip]) {
    logs[ip] = { count: 0, last_use: null };
  }

  logs[ip].count += 1;
  logs[ip].last_use = new Date().toISOString();
  writeLogs(logs);

  res.json({
    name: req.query.name || "Ali",
    meaning: "Yuksak, buyuk"
  });
});

// 👁️‍🗨️ ADMIN PANEL (faqat sen)
app.get("/admin", (req, res) => {
  if (req.query.key !== ADMIN_KEY) {
    return res.status(403).send("❌ Ruxsat yo‘q");
  }

  const logs = readLogs();

  let html = `
  <h2>📊 API STATISTIKA</h2>
  <table border="1" cellpadding="8">
    <tr>
      <th>IP</th>
      <th>So‘rov soni</th>
      <th>Oxirgi ishlatish</th>
    </tr>
  `;

  for (let ip in logs) {
    html += `
      <tr>
        <td>${ip}</td>
        <td>${logs[ip].count}</td>
        <td>${logs[ip].last_use}</td>
      </tr>
    `;
  }

  html += "</table>";
  res.send(html);
});

app.listen(PORT, () => {
  console.log("Server ishlayapti");
});
