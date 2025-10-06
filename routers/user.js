const express = require('express');
const {requireAuthCheck} = require('../routers/auth');
const {getUser, requireDBUser,updateUser} = require('../services/user')

const userRouter = express.Router();
userRouter.use(express.json());
userRouter.use(requireAuthCheck);
userRouter.get("/",requireDBUser, async(req,res)=>{
    const db_user = req.db_user;
    if(db_user!=null){
        res.status(200).json({user:db_user})
    }else{
        res.status(200).json({message:"user is null", user:null})
    }
})
userRouter.put("/update", requireDBUser, async (req, res) => {
  try {
    const access_token = req.cookies["access-token"];
    const refresh_token = req.cookies["refresh-token"];
    const { name: newName, profile_img: newProfile } = req.body;
    const db_user = req.db_user;

    // --- Basic checks ---
    if (!db_user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!access_token || !refresh_token) {
      return res.status(401).json({ message: "Missing tokens" });
    }

    // --- Input validation ---
    if (typeof newName !== "string" || newName.trim().length === 0) {
      return res.status(400).json({ message: "Invalid name" });
    }

    if (
      newProfile &&
      typeof newProfile !== "string"
      // optionally ensure it's a base64-encoded data URL
      && !/^data:image\/[a-zA-Z]+;base64,/.test(newProfile)
    ) {
      return res.status(400).json({ message: "Invalid image data" });
    }
    // if(newProfile.length===0&&newProfile===""){
    //     newProfile = req.db_user.profile_img;
    // }
    // --- Call the update function ---
    const updatedUser = await updateUser(
      db_user.auth_id,
      access_token,
      refresh_token,
      newName,
      newProfile
    );

    if (!updatedUser) {
      return res.status(500).json({ message: "Failed to update user" });
    }

    return res.status(200).json({ user: updatedUser });
  } catch (err) {
    console.error("Error updating user:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});
module.exports = {userRouter}