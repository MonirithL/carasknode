const express = require('express');
const {requireAuthCheck} = require('./auth')
const {requireDBUser} = require('../services/user')
const {addProgress,getProgress,getProgresses, deleteProgress,updateProgress} = require('../services/userProgressService')

const progressRouter = express.Router();
progressRouter.use(express.json());
progressRouter.use(requireAuthCheck)
progressRouter.use(requireDBUser)

//get all, for now get by id is useless
progressRouter.get("/", async (req, res)=>{
    const {access, refresh} = req;
    const progresses = await getProgresses(access, refresh);
    if(progresses!=null){
        console.log("GET PROGRESSES OK");
        res.status(200).json(progresses);
    }else{
        console.log("GET PROGRESSES FAILED");
        res.status(500).json({message:"failed to get progresses"})
    }

})
progressRouter.post("/", async (req, res)=>{
    const {access, refresh} = req;
    const {gid, text} = req.body;
    const addProg = await addProgress(access, refresh, text, gid);
    if(addProg!=null){
        console.log("ADD PROGRESS OK");
        res.status(200).json(addProg);
    }else{
        console.log("ADD PROGRESS FAILED");
        res.status(500).json({message:"failed to add progress"})
    }
})
progressRouter.put("/", async (req, res)=>{
    const {access, refresh} = req;
    const {completed, pid} = req.body;
    const updateProg = await updateProgress(access, refresh,pid, completed);
    if(updateProg!=null){
        console.log("UPDATE PROGRESS OK");
        res.status(200).json(updateProg);
    }else{
        console.log("UPDATE PROGRESS FAILED");
        res.status(500).json({message:"failed to UPDATE progress"})
    }
})
progressRouter.delete("/", async (req, res)=>{
    const {access, refresh} = req;
    const {pid} = req.body;
    const deleted = await deleteProgress(access, refresh,pid);
    if(deleted!=null){
        console.log("DELETE PROGRESS OK");
        res.status(200).json(deleted);
    }else{
        console.log("DELETE PROGRESS FAILED");
        res.status(500).json({message:"failed to DELETE progress"})
    }
})






module.exports = progressRouter