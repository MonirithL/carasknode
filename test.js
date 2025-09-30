const express = require("express");
const {createClient} = require('@supabase/supabase-js');

const router = express.Router();
router.use(express.json())

router.get("/", async (req, res) => {
  const token = req.cookies['access-token'];

  if (!token) {
    return res.status(401).json({ error: "Missing or invalid token" });
  }

  // Create a Supabase client that uses the user’s token
  const userSupabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_API_KEY,
    {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
    }
  );

  const { data, error } = await userSupabase.from("testquery").select("*");

  if (error) {
    return res.status(400).json({ error });
  }

  res.json({ data });
});


module.exports = router