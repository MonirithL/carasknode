const express = require('express');
const {requireAuthCheck} = require('./auth')
const { getResultBySessionID} = require('../services/userResultService')


const resultRouter = express.Router();
resultRouter.use(express.json());
resultRouter.use(requireAuthCheck)


resultRouter.get("/:id", async (req, res)=>{
    const {access, refresh} = req;
    const session_id = req.params.id;
    console.log("Grbsid: ", session_id)
    const prevResult = await getResultBySessionID(access, refresh, session_id);
    if(prevResult!=null){
            console.log("SENDING RESULT")
            res.status(200).json(prevResult);
    }else{
        res.status(404).json({error:"GET :id result not found"});
    }
    
})

module.exports = resultRouter