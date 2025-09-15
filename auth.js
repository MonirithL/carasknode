const express = require("express");
const {createClient} = require('@supabase/supabase-js');
const logger = require('./logger')

require('dotenv').config();
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_API_KEY
);

const authRouter = express.Router();
authRouter.use(express.json());

// need passport oauth, jwt



async function requireAuthCheck(req, res, next) {
    console.log("RAN AUTH CHECK")
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
            secure:false,
        })
        res.cookie('refresh-token', data.session.refresh_token,{
            httpOnly: true,
            secure:false,
        })
        user = data.session.user;
    }
    req.user = user;
    next();
}

authRouter.get("/avatar/:userId", async (req, res) => {
  const avatarUrl = getAvatarUrlFromDB(req.params.userId); 
  const response = await fetch(avatarUrl);
  const buffer = await response.arrayBuffer();
  res.set("Content-Type", "image/jpeg");
  res.send(Buffer.from(buffer));
});

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
    res.cookie('access-token', data.session.access_token, { httpOnly: true, secure: false });
    res.cookie('refresh-token', data.session.refresh_token, { httpOnly: true, secure: false });
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
    const {errorSU, data} = await supabase.auth.signUp({email, password});
    if(errorSU){
        logger.error("Error registering new user: "+email);
        return res.status(400).json({error:"Sign up failed"});
    }
    res.status(200).json({"message":"Please confirm your email address!"})
})


authRouter.post("/callback", (req, res) => {
    //sole purpose is to set token
    const { accessToken, refreshToken } = req.body;
    console.log("CALLBACK STARTOK")

  if (!accessToken || !refreshToken) {
    console.log("CALLBACK NO TOKENS")
    return res.sendStatus(400);
  }

  // Set HttpOnly cookies
  res.cookie("access-token", accessToken, { httpOnly: true, secure: false, sameSite: "lax" });
  res.cookie("refresh-token", refreshToken, { httpOnly: true, secure: false, sameSite: "lax" });
  res.status(200).send("okay");
});

authRouter.post('/logout', requireAuthCheck, (req,res)=>{
    res.clearCookie('access-token', { httpOnly: true, secure: false, sameSite: 'lax' });
    res.clearCookie('refresh-token', { httpOnly: true, secure: false, sameSite: 'lax' });
    res.status(200).json({ message: 'Logged out successfully' });
})

module.exports = {authRouter, requireAuthCheck}