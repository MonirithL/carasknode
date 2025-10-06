const {createSupabaseService, createSupabaseWithToken} = require('../cores/supabase')

async function requireUserId(req,res,next){
    const token = req.cookies['access-token'];
    const refresh = req.cookies['refresh-token'];
    if(token && refresh){
        const user_auth_id = req.user.id;
        console.log(user_auth_id);
        const db_user = await getUser(user_auth_id, token, refresh);
        req.db_user = db_user;
        return next();
    }else{
        req.db_user = null;
        return next;
    }
    
}


async function createUser(id, fullname, email) {
  const supabase = createSupabaseService();

  // 1. Check if user already exists
  const { data: existingUser, error: fetchError } = await supabase
    .from('dataUser')
    .select('*')
    .or(`auth_id.eq.${id},email.eq.${email}`)
    .limit(1)
    .single(); 

  if (fetchError && fetchError.code !== 'PGRST116') { // ignore "no rows" error
    console.error('Error checking user existence:', fetchError);
    return null;
  }

  if (existingUser) {
    console.log('User already exists:', existingUser);
    return existingUser; // return existing user, don't insert
  }

  // 2. Insert new user if none exists
  const { data, error } = await supabase
    .from('dataUser')
    .insert([
      {
        auth_id: id,
        name: fullname,
        email: email,
        profile_img: null,
      },
    ])
    .select();

  if (error) {
    console.error('Error inserting user:', error);
    return null;
  }

  console.log('Inserted user:', data);
  return data;
}

async function deleteUser(){
    //remove user
}
async function getUser( auth_id,token, refresh){
    const supabase = createSupabaseWithToken(token, refresh);
    //now we get user
    //after getting users=> return it
    const { data: user, error: fetchError } = await supabase
    .from('dataUser')
    .select('*')
    .eq(`auth_id`, auth_id)
    .maybeSingle()
    if(fetchError){
        console.log("failed getting user", fetchError);
        return null;
    }else{
        console.log("s.getUser: ", JSON.stringify(user))
        return user;
    }
}

async function updateUser() {
    //get new users info then update it
    //
}

module.exports = {createUser, getUser, requireUserId}