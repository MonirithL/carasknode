const express = require('express');
const {requireAuthCheck} = require('./auth')
const {requireDBUser} = require('../services/user')
const {addResult, getResultBySessionID} = require('../services/userResultService')
const {getText, genResult,getRecommended} = require('../services/GeminiService')
const {completeSession} = require('../services/sessionService')
const geminiRouter = express.Router();

geminiRouter.use(express.json())
geminiRouter.use(requireAuthCheck)


geminiRouter.post("/make-result", async (req, res)=>{
    const qas = req.body.qas;
    const result_json = await genResult(qas);
    console.log("CALLED GUEST")

    if(result_json != null){
        console.log("R POST gen Result: ", result_json);
        res.status(200).json({id:null, result_json:result_json});
    }else{
        console.log("FAILED R gen Result")
        res.status(500).json({message:"failed to gen Result"})
    }
})
geminiRouter.post("/make-result/user", requireDBUser, async (req, res)=>{
    console.log("CALLED MAKE RESULT USER")
    const access = req.access;
    const refresh = req.refresh;
    const session_id = req.body.session_id;
    const qas = req.body.qas;

    if(session_id){
        const prevResult = await getResultBySessionID(access, refresh, session_id);
        if(prevResult!=null){
            console.log("SENDING OLD RESULT")
            res.status(200).json(prevResult);
        }
    }


    const result_json = await genResult(qas);
    console.log("taking in: ", result_json, " session: ", session_id)
    if(result_json != null && session_id){
        const result = await addResult(access, refresh, session_id, result_json);
        if(result!=null){
            console.log("ADDED RESULT FOR USER");
            const completed = await completeSession(access, refresh, session_id);

            res.status(200).json({result,completed:completed.id??null});
        }else{
            console.log("FAILED POST gen result insert result db")
            res.status(500).json({message:"failed to gen Result insert result db"})
        }        
    }else{
        console.log("FAILED R gen Result ", session_id)
        res.status(500).json({message:"failed to gen Result"})
    }
})

geminiRouter.post("/recommended", async (req, res)=>{
    console.log("STARTED RECS")
    const {careerText, alreadyDoneArr} = req.body;
    const result_json = await getRecommended(careerText, alreadyDoneArr);
    console.log("CALLED GET REC GEMINI")

    if(result_json != null){
        console.log("R POST GET REC GEMINI: ", result_json);
        res.status(200).json(result_json);
    }else{
        console.log("FAILED R GET REC GEMINI")
        res.status(500).json({message:"failed to gen Result"})
    }
})

//post("/explore")


module.exports = geminiRouter;