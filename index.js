const express = require('express');
const path = require('path')
const fs = require("fs");
const cors = require('cors');
const cookieParser = require('cookie-parser');
const https = require('https')
require('./services/cache_guest')

const RUNHOST = "0.0.0.0"

const app = express();
app.use(cors({
  origin: ['http://localhost:5173',"http://192.168.201.52:5173/"],
  credentials: true,
}))

const {authRouter} = require(`./routers/auth`);

const {userRouter} = require('./routers/user')
const geminiRouter = require('./routers/geminiRouter')
const sessionRouter = require('./routers/sessionRouter')
const qnaRouter = require('./routers/qnaRouter')
const questionRouter = require('./routers/questionRouter')
const goalRouter = require('./routers/userGoalRouter')
const resultRouter = require('./routers/userResultRouter')
const progressRouter = require('./routers/userProgressRouter')

app.use(cookieParser());
app.use('/api/auth', authRouter);

app.use('/api/user',userRouter);
app.use("/api/gemini", geminiRouter);
app.use("/api/session", sessionRouter);
app.use("/api/qna", qnaRouter);
app.use("/api/question", questionRouter);
app.use("/api/goal", goalRouter);
app.use("/api/result", resultRouter);
app.use("/api/progress", progressRouter);
const PORT = 3000;

app.use(express.static(path.join(__dirname, "dist")));
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});
app.get('/api/', (req, res, ) => {
  res.send("First message before hello b")
})

app.get("/api/logs", (req, res) => {
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





if(process.env.NODE_ENV === "production"){
  https.createServer(
    {
      key: fs.readFileSync(process.env.KEY),
      cert: fs.readFileSync(process.env.CERT)
    },
    app
  ).listen(PORT,()=>console.log(`index js listening on port https://localhost:${PORT}/`));
}else{
  app.listen(PORT, RUNHOST,()=>{
      console.log(`index js listening on port http://localhost:${PORT}/`);
  })
}


