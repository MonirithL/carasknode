const express = require('express');
const {requireAuthCheck} = require('../routers/auth')
const {requireDBUser} = require('../services/user')
const {getGoal, addGoal,updateGoal} = require('../services/userGoalService')


const goalRouter = express.Router();
goalRouter.use(requireAuthCheck);
goalRouter.use(express.json())


goalRouter.get("/", async (req, res)=>{
    const {access, refresh} = req;
    const goal = await getGoal(access,refresh);
    res.status(200).json(goal);
})
goalRouter.post("/", async (req, res)=>{
    const {access, refresh} = req;
    const career_title = req.body.career_title;
    const goal = await addGoal(access, refresh, career_title);
    if(goal!=null){
        res.status(200).json(goal);
    }else{
        res.status(500).json({error:"cant add goal"})
    }
})
goalRouter.put("/", async (req, res)=>{
    const {access, refresh} = req;
    const {career_title, gid} = req.body;
    const newGoal = await updateGoal(access,refresh, gid, career_title);
    if(newGoal!=null){
        res.status(200).json(newGoal);
    }else{
        res.status(500).json({newGoal:"cant update goal"})
    }
})




module.exports = goalRouter