const express = require('express');
require('dotenv').config();
const {createClient} = require('@supabase/supabase-js');
const router = express.Router();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_API_KEY
);

const dummy = {"username":"testdummy", "password":"randompassword"};


router.get("/add", async (req,res)=>{
    const {error, data} = await supabase.from("testusers").insert(dummy).select();
    if(error){
        res.json({"Error":error})
    }else{
        res.json({"data":data})
    }
})

router.get("/", async (req,res)=>{
    const {error, data} = await supabase.from("testusers").select("*");
    if(error){
        res.json({"Error":error})
    }else{
        res.json({"data":data})
    }
})

module.exports = router