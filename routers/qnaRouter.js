const express = require('express');
const {requireDBUser} = require('../services/user')
const {requireAuthCheck} = require('../routers/auth')
const {getQna, getQnas, addQna, deleteQna} = require('../services/userQnAService')
const qnaRouter = express.Router();
qnaRouter.use(express.json());
qnaRouter.use(requireAuthCheck);
qnaRouter.use(requireDBUser);


qnaRouter.get("/:id", async (req, res)=>{
    const qna_id = req.params.id;
    const refresh =req.refresh;
    const access = req.access;
    const qna = getQna(access, refresh, qna_id);

    if(qna != null){
        console.log("R GET qna: ", qna);
        res.status(200).json(qna);
    }else{
        console.log("FAILED R GET qna")
        res.status(500).json({message:"failed to get qna"})
    }
})
qnaRouter.put("/", async (req,res)=>{
    const qid = req.body.qid;
    const aid = req.body.aid;
    const sid = req.body.sid;
    const refresh =req.refresh;
    const access = req.access;
    const qna = addQna(access, refresh,qid, aid, sid);

    if(qna != null){
        console.log("R PUT qna: ", qna);
        res.status(200).json(qna);
    }else{
        console.log("FAILED R PUT qna")
        res.status(500).json({message:"failed to PUT qna"})
    }
})



module.exports = qnaRouter;