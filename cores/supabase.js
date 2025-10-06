const {createClient} = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_API_KEY
);
//export supabse with cookie client, see test js
function createSupabaseWithToken(access_token, refresh_token){
    const userSupabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_API_KEY,
    {
      global: {
        headers: { Authorization: `Bearer ${access_token}` },
      },
    }
  );
  userSupabase.auth.setSession(access_token=access_token,refresh_token=refresh_token)
  return userSupabase
}

function createSupabaseService(){
    const supabase = createClient(
      process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
    )
    return supabase;
}
module.exports = {anonSupabase: supabase, createSupabaseWithToken, createSupabaseService}