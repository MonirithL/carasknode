const express = require('express');
const {requireAuthCheck} = require('../routers/auth');
const {getUser, requireUserId} = require('../services/user')

const userRouter = express.Router();
userRouter.use(express.json());
userRouter.use(requireAuthCheck);
userRouter.get("/",requireUserId, async(req,res)=>{
    const db_user = req.db_user;
    if(db_user!=null){
        res.status(200).json({user:db_user})
    }else{
        res.status(200).json({message:"user is null"})
    }
})

module.exports = {userRouter}