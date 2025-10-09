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
const testRouter = require('./test')
const {userRouter} = require('./routers/user')
const geminiRouter = require('./routers/geminiRouter')
const sessionRouter = require('./routers/sessionRouter')
const qnaRouter = require('./routers/qnaRouter')
const questionRouter = require('./routers/questionRouter')

app.use(cookieParser());
app.use('/auth', authRouter);
app.use('/test', testRouter);
app.use('/user',userRouter);
app.use("/gemini", geminiRouter);
app.use("/session", sessionRouter);
app.use("/qna", qnaRouter);
app.use("/question", questionRouter);
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





if(process.env.NODE_ENV === "production"){
  https.createServer(
    {
      key: fs.readFileSync('./certs/192.168.201.52-key.pem'),
      cert: fs.readFileSync('./certs/192.168.201.52.pem')
    },
    app
  ).listen(PORT,RUNHOST,()=>console.log(`index js listening on port https://localhost:${PORT}/`));
}else{
  app.listen(PORT, RUNHOST,()=>{
      console.log(`index js listening on port http://localhost:${PORT}/`);
  })
}
// app.listen(PORT,()=>{
//     console.log(`index js listening on port http://localhost:${PORT}/`);
// })

