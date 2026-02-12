import express from "express";
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 3000;

// ================== BASIC AUTH ==================
const ADMIN_USER = "amirxan";
const ADMIN_PASS = "001";

// faqat /admin uchun himoya
app.use("/admin", (req, res, next) => {
  const auth = req.headers.authorization;

  if (!auth) {
    res.set("WWW-Authenticate", "Basic");
    return res.status(401).send("🔐 Login kerak");
  }

  const base64 = auth.split(" ")[1];
  const [user, pass] = Buffer.from(base64, "base64")
    .toString()
    .split(":");

  if (user !== ADMIN_USER || pass !== ADMIN_PASS) {
    return res.status(403).send("❌ Xato login yoki parol");
  }

  next();
});

// ================== LOG FILE ==================
const LOG_FILE = "./logs.json";

// agar log fayl bo‘lmasa yaratadi
if (!fs.existsSync(LOG_FILE)) {
  fs.writeFileSync(LOG_FILE, "{}");
}

function readLogs() {
  return JSON.parse(fs.readFileSync(LOG_FILE, "utf-8"));
}

function writeLogs(data) {
  fs.writeFileSync(LOG_FILE, JSON.stringify(data, null, 2));
}

// ================== API (ISM MA’NOSI) ==================
app.get("/api/ism", (req, res) => {
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket.remoteAddress;

  const logs = readLogs();

  if (!logs[ip]) {
    logs[ip] = {
      count: 0,
      first_use: new Date().toISOString(),
      last_use: null
    };
  }

  logs[ip].count += 1;
  logs[ip].last_use = new Date().toISOString();

  writeLogs(logs);

  res.json({
    ism: req.query.name || "Ali",
    manosi: "Yuksak, buyuk",
    status: "ok"
  });
});

// ================== ADMIN PANEL ==================
app.get("/admin", (req, res) => {
  const logs = readLogs();

  let rows = "";
  let i = 1;

  for (const ip in logs) {
    rows += `
      <tr>
        <td>${i++}</td>
        <td>${ip}</td>
        <td>${logs[ip].count}</td>
        <td>${logs[ip].first_use}</td>
        <td>${logs[ip].last_use}</td>
      </tr>
    `;
  }

  res.send(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>API Statistikasi</title>
  <style>
    body { font-family: Arial; background: #0f172a; color: #fff; }
    h2 { color: #38bdf8; }
    table {
      border-collapse: collapse;
      width: 100%;
      background: #020617;
    }
    th, td {
      border: 1px solid #334155;
      padding: 8px;
      text-align: center;
    }
    th {
      background: #1e293b;
    }
  </style>
</head>
<body>
  <h2>📊 API ISHLATILISH STATISTIKASI</h2>
  <table>
    <tr>
      <th>#</th>
      <th>IP manzil</th>
      <th>So‘rovlar soni</th>
      <th>Birinchi marta</th>
      <th>Oxirgi ishlatish</th>
    </tr>
    ${rows || "<tr><td colspan='5'>Hozircha ma’lumot yo‘q</td></tr>"}
  </table>
</body>
</html>
  `);
});

// ================== START ==================
app.listen(PORT, () => {
  console.log("✅ Server ishga tushdi");
});
