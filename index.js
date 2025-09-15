const express = require('express');
const path = require('path')
const fs = require("fs");
const cors = require('cors');
const cookieParser = require('cookie-parser');

const {authRouter} = require(`./auth`);
const userRouter = require('./user');

const app = express();
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}))
app.use("/auth", authRouter);
app.use('/user', userRouter);
const PORT = 3000;


app.get('/', (req, res, ) => {
  res.send("First message before hello b")
})

app.get("/logs", (req, res) => {
  const filePath = path.join(__dirname, "logs/combined_log.json");

  try {
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Log not available" });
    }

    const raw = fs.readFileSync(filePath, "utf-8").trim();

    if (!raw) {
      return res.status(404).json({ error: "Log not available" });
    }

    const logs = raw.split("\n").map(line => JSON.parse(line));
    res.json(logs);

  } catch (err) {
    console.error("Error reading logs:", err.message);
    res.status(500).json({ error: "Log not available" });
  }
});

app.listen(PORT, ()=>{
    console.log(`index js listening on port http://localhost:${PORT}/`);
})

