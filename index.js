const express = require('express');

const authRouter = require(`./auth`);

const app = express();
app.use("/auth", authRouter);
const PORT = 3000;
app.get('/', (req, res, ) => {
  res.send("First message before hello b")
})

app.listen(PORT, ()=>{
    console.log(`index js listening on port http://localhost:${PORT}/`);
})