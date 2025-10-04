const express = require("express");
const logger = require('../services/logger')
const jwt = require('jsonwebtoken');
const {create_guest, get_guest} = require('../services/cache_guest');
const {supabase} = require('../cores/supabase')


const authRouter = express.Router();
authRouter.use(express.json());

const SECRET = process.env.JWT_SECRET;
// need passport oauth, jwt
const SET_HTTPS = false;


async function requireAuthCheck(req, res, next) {
    console.log("RAN AUTH CHECK")
    if(req.cookies['guest_access_token'] && !req.cookies['access-token']){
        let guest_payload;
        try{
            guest_payload = jwt.verify(req.cookies['guest_access_token'], SECRET);
            const guest = get_guest(guest_payload.id);
            req.user = guest;
            return next();
        }catch(err){
            res.clearCookie('guest_access_token', { httpOnly: true, secure: SET_HTTPS, sameSite: 'lax' });
        }
    }else{
        const accessToken = req.cookies['access-token'];
        const refreshToken = req.cookies['refresh-token'];
        if(!accessToken || !refreshToken){
            return res.status(401).json({error:"no session found"});
        }
        const {data:{user}, error} = await supabase.auth.getUser(accessToken);
        if(error && refreshToken){
            const { data, re_error: refreshError } = await supabase.auth.refreshSession({refresh_token:refreshToken});
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
        }
        req.user = user;
        return next();
    }
    
}

authRouter.get("/guest", async (req, res)=>{

        const guest = await create_guest();
        const guest_access_token = jwt.sign(guest,SECRET, {expiresIn:"20m"});
        res.cookie('guest_access_token', guest_access_token,{ httpOnly: true, secure: SET_HTTPS, sameSite: "lax" });
        res.status(200).json({message:"Signed in as Guest"});
    
        res.status(400).json({message:"token already exists"})
    
})

authRouter.get("/", requireAuthCheck, async (req,res)=>{
    res.status(200).json({user: req.user});
})

authRouter.post(`/login/password`,async (req,res)=>{
    const {email,password} = req.body;
    const {error, data} = await supabase.auth.signInWithPassword({email,password});
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
authRouter.get(`/login/google`, async (req, res)=>{
    const next = req.query.next ?? "/";

  const redirectTo = encodeURIComponent(`http://localhost:5173/auth/callback?next=${encodeURIComponent(next)}`);

  const url =
    `${process.env.SUPABASE_URL}/auth/v1/authorize` +
    `?provider=google` +
    `&redirect_to=${redirectTo}`;

  res.redirect(url);
})

authRouter.post(`/register`,async (req,res)=>{
    const {email,password} = req.body;
    logger.info("user of email: "+email+", registering");
    const {error:errorSU, data:dataSU} = await supabase.auth.signUp({email, password});
    if(errorSU){
        logger.error("Error registering new user: "+email);
        return res.status(400).json({error:"Sign up failed"});
    }
    res.cookie('access-token', dataSU.session.access_token, { httpOnly: true, secure: SET_HTTPS });
    res.cookie('refresh-token', dataSU.session.refresh_token, { httpOnly: true, secure: SET_HTTPS });
    res.status(200).json({"message":"Please confirm your email address!"})
})


authRouter.post("/callback", (req, res) => {
    //sole purpose is to set token
    console.log("CALLBACK STARTOK")
    const { accessToken, refreshToken } = req.body;

  if (!accessToken || !refreshToken) {
    console.log("CALLBACK NO TOKENS")
    return res.sendStatus(400);
  }

  // Set HttpOnly cookies
  res.cookie("access-token", accessToken, { httpOnly: true, secure: SET_HTTPS, sameSite: "lax" });
  res.cookie("refresh-token", refreshToken, { httpOnly: true, secure: SET_HTTPS, sameSite: "lax" });
  res.status(200).send("okay");
});

authRouter.post('/logout', requireAuthCheck, (req,res)=>{
    console.log("logout")
    res.clearCookie('refresh-token', { httpOnly: true, secure: SET_HTTPS, sameSite: 'lax' });
    res.clearCookie('access-token', { httpOnly: true, secure: SET_HTTPS, sameSite: 'lax' });
    res.clearCookie('guest_access_token', { httpOnly: true, secure: SET_HTTPS, sameSite: 'lax' });
    res.status(200).json({ message: 'Logged out successfully' });
})

module.exports = {authRouter, requireAuthCheck}