const express = require("express");
const logger = require('../services/logger')
const jwt = require('jsonwebtoken');
const {create_guest, get_guest} = require('../services/cache_guest');
const {anonSupabase} = require('../cores/supabase')
const{createUser, requireDBUser} = require('../services/user')

const authRouter = express.Router();
authRouter.use(express.json());

const SECRET = process.env.JWT_SECRET;
// need passport oauth, jwt
const SET_HTTPS = process.env.NODE_ENV === 'production';
const SAMESITE = process.env.NODE_ENV == 'production'?"none":"lax";


async function requireAuthCheck(req, res, next) {
    console.log("--------Start running auth check: ")
    if(req.cookies['guest_access_token'] && !req.cookies['access-token']){
        let guest_payload;
        try{
            guest_payload = jwt.verify(req.cookies['guest_access_token'], SECRET);
            console.log("           Guest jwt is okay!")
            const guest = await get_guest(guest_payload.id);
            console.log("           Comparing guest in db!")
            if (!guest) {
                console.log("------No guest! clearing cookie")
                res.clearCookie('guest_access_token', { httpOnly: true, secure: SET_HTTPS, sameSite: SAMESITE });
                return res.status(401).json({ error: "Session expired, please log in again" });
            }
            console.log("------------------is guest! Continue")
            req.user = guest;
            return next();
        }catch(err){
            console.log("------cannot verify jwt, clearing cookie")
            res.clearCookie('guest_access_token', { httpOnly: true, secure: SET_HTTPS, sameSite: SAMESITE });
            return res.status(401).json({ error: "Session expired, please log in again" });
        }
    }else{
        const accessToken = req.cookies['access-token'];
        const refreshToken = req.cookies['refresh-token'];
        if(!accessToken || !refreshToken){
            return res.status(401).json({error:"no session found"});
        }
        const {data, error} = await anonSupabase.auth.getUser(accessToken);
        if(error && refreshToken){
            const { data, re_error: refreshError } = await anonSupabase.auth.refreshSession({refresh_token:refreshToken});
            if(refreshError || !data.session){
                return res.status(401).json({ error: "Session expired, please log in again" });
            }
            res.cookie('access-token', data.session.access_token,{
                httpOnly: true,
                secure:SET_HTTPS,
            })
            res.cookie('refresh-token', data.session.refresh_token,{
                httpOnly: true,
                secure:SET_HTTPS,
            })
            user = data.session.user;
        }else if(error && !refreshToken){
            return res.status(401).json({ error: "Cannot reach supabase Client" });
        }
        req.user = data.user;
        return next();
    }
    
}

authRouter.get("/guest", async (req, res)=>{

        const guest = await create_guest();
        const guest_access_token = jwt.sign(guest,SECRET, {expiresIn:"1h"});
        res.cookie('guest_access_token', guest_access_token,{ httpOnly: true, secure: SET_HTTPS, sameSite: SAMESITE });
        res.status(200).json({message:"Signed in as Guest"});
    
    
})

authRouter.get("/check", requireAuthCheck, async (req,res)=>{
    res.status(200).json({user: req.user});
})

authRouter.post(`/login/password`,async (req,res)=>{
    const {email,password} = req.body;
    const {error, data} = await anonSupabase.auth.signInWithPassword({email,password});
    if (error) {
    logger.warn("Supabase login error: " + error.message);
    return res.status(500).json({ message: "Server error" });
    }

    if (!data.session) {
        logger.warn("Login failed, session not created. Email confirmed? " + data.user?.email_confirmed_at);
        return res.status(401).json({ message: "Unauthorized or email not confirmed" });
    }

    // Safe to set cookies
    res.cookie('access-token', data.session.access_token, { httpOnly: true, secure: SET_HTTPS });
    res.cookie('refresh-token', data.session.refresh_token, { httpOnly: true, secure: SET_HTTPS });
    res.status(200).json({ message: "User authorized" });
})

//this doesnt seem to use?
authRouter.get(`/login/google`, async (req, res)=>{
    const next = req.query.next ?? "/";

  const redirectTo = encodeURIComponent(`http://localhost:5173/auth/callback?next=${encodeURIComponent(next)}`);
    console.log("login google")
  const url =
    `${process.env.SUPABASE_URL}/auth/v1/authorize` +
    `?provider=google` +
    `&redirect_to=${redirectTo}`;

  res.redirect(url);
})

authRouter.post(`/register`,async (req,res)=>{
    const {email,password} = req.body;
    logger.info("user of email: "+email+", registering");
    const {error:errorSU, data:dataSU} = await anonSupabase.auth.signUp({email, password});
    if(errorSU){
        logger.error("Error registering new user: "+email);
        return res.status(400).json({error:"Sign up failed"});
    }

    const auth_id = dataSU.user.id;
    const supabase_email = dataSU.user.email;
    const name = dataSU.user.user_metadata.full_name || dataSU.user.email.split("@")[0];
    const isUserAdded = await createUser(auth_id, name, supabase_email);
    if(isUserAdded){
        console.log(JSON.stringify(isUserAdded))
    }
    // console.log(JSON.stringify(dataSU))
    res.cookie('access-token', dataSU.session.access_token, { httpOnly: true, secure: SET_HTTPS });
    res.cookie('refresh-token', dataSU.session.refresh_token, { httpOnly: true, secure: SET_HTTPS });
    res.status(200).json({"message":"Please confirm your email address!"})
})


authRouter.post("/callback",async (req, res) => {
    //TO_DO create user if not exists
    //sole purpose is to set token
    console.log("CALLBACK STARTOK")
    const { accessToken, refreshToken } = req.body;
    const {data:{user}, error} = await anonSupabase.auth.getUser(accessToken);
    const auth_id = user.id;
    const supabase_email = user.email;
    const name = user.user_metadata.full_name || user.email.split("@")[0];
    const isUserAdded = await createUser(auth_id, name, supabase_email);
    if(isUserAdded){
        
    }
  if (!accessToken || !refreshToken) {
    console.log("CALLBACK NO TOKENS")
    return res.sendStatus(400);
  }

  // Set HttpOnly cookies
  res.cookie("access-token", accessToken, { httpOnly: true, secure: SET_HTTPS, sameSite: SAMESITE });
  res.cookie("refresh-token", refreshToken, { httpOnly: true, secure: SET_HTTPS, sameSite: SAMESITE });
  res.status(200).send("okay");
});

authRouter.get('/logout', requireAuthCheck, (req,res)=>{
    console.log("logout")
    if(req.cookies['access-token']){
        res.clearCookie('access-token', { httpOnly: true, secure: SET_HTTPS, sameSite: SAMESITE });
    }
    if(req.cookies['refresh-token']){
        res.clearCookie('refresh-token', { httpOnly: true, secure: SET_HTTPS, sameSite: SAMESITE });
    }
    if(req.cookies['guest_access_token']){
        res.clearCookie('guest_access_token', { httpOnly: true, secure: SET_HTTPS, sameSite: SAMESITE });
    }
    res.status(200).json({ message: 'Logged out successfully' });
})
authRouter.get("/logout/guest", requireAuthCheck, (req, res)=>{
    if(req.cookies['access-token']){
        res.clearCookie('access-token', { httpOnly: true, secure: SET_HTTPS, sameSite: SAMESITE });
        res.status(200).json({message:"Logout guest successful"})
    }else{
        res.status(404).json({message:"You are not a guest!"})
    }
    
    
})
module.exports = {authRouter, requireAuthCheck}