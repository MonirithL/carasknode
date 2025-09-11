const express = require("express");
const router = express.Router();
// need passport oauth, jwt

router.get("/", (req,res)=>{
    // check auth->role
})

router.post(`/login`,(req,res)=>{
    // takes password, email
    res.send("from testing")
})
router.post(`/register`,(req,res)=>{
    // takes password, email, username, confirm password
    res.send("from testing")
})


module.exports = router