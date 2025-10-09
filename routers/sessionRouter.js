const express = require('express');
const {requireAuthCheck} = require('../routers/auth')
const {requireDBUser} = require('../services/user')
const {getSession, getSessions, addSession, deleteSession} = require('../services/sessionService')

const sessionRouter = express.Router();
sessionRouter.use(express.json());
sessionRouter.use(requireAuthCheck)
sessionRouter.use(requireDBUser)

sessionRouter.get("/:id", async (req, res)=>{
    const session_id = req.params.id;
    const access = req.access;
    const refresh = req.refresh;
    const session = await getSession(access, refresh,session_id);
    if(session != null){
        console.log("R GET Session: ", session);
        res.status(200).json(session);
    }else{
        console.log("FAILED R GET session")
        res.status(500).json({message:"failed to get session"})
    }
})

sessionRouter.put("/", async (req, res)=>{
    console.log("IMPORTANT CHECK")
    const access = req.access;
    const refresh = req.refresh;
    const session = await addSession(access, refresh);
    if(session != null){
        console.log("R PUT Session: ", session);
        res.status(200).json(session);
    }else{
        res.status(500).json({message:"failed to create session"})
    }
})

sessionRouter.get("/", async (req, res)=>{
    const access = req.access;
    const refresh = req.refresh;
    const sessions = await getSessions(access, refresh);
    if(sessions != null){
        console.log("R GET Sessions: ", sessions.length);
        res.status(200).json(sessions);
    }else{
        console.log("FAILED R GET sessions")
        res.status(500).json({message:"failed to get sessions"})
    }
})
sessionRouter.delete("/delete", async (req, res)=>{
    console.log("Delete session user qna")
    const access = req.access;
    const refresh = req.refresh;
    const sid = req.body.sid;
    const sessions = await deleteSession(access, refresh,sid);
    if(sessions != null){
        console.log("R GET Sessions: ", sessions);
        res.status(200).json(sessions);
    }else{
        console.log("FAILED R DEL session")
        res.status(500).json({message:"failed to DEL session"})
    }
})





module.exports = sessionRouter;