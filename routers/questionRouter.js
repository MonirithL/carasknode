const express = require('express');
const {requireAuthCheck} = require('../routers/auth');
const {getQuestion, getQuestions} = require('../services/questionService');
const {getAnswers} = require('../services/answerService')

const questionRouter = express.Router();
questionRouter.use(express.json());
questionRouter.use(requireAuthCheck);

// questionRouter.get("/:id", async (req, res)=>{
//     const qid = Number(req.params.id); 

//     const question = await getQuestion(qid);

//     if (!question) {
//         return res.status(404).json({ error: "Question not found" });
//     }

//     res.status(200).json(question);
// })

questionRouter.get("/basic", async(req,res)=>{
    const questions = await getQuestions();
    console.log("questions: ", JSON.stringify(questions))

    if(!questions){
        return res.status(404).json({error:"Question(s) not found"});
    }
    const questionsWithAnswers = await Promise.all(
        questions.map(async (q) => {
            console.log(JSON.stringify(q.id))
        const answers = await getAnswers(q.id); 
        return {
            ...q,
            answers: answers || [], // always an array
        };
        })
    );
    res.json(questionsWithAnswers);
})

module.exports = questionRouter