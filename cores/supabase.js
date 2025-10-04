const {createClient} = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_API_KEY
);
//export supabse with cookie client, see test js
module.exports = {supabase}