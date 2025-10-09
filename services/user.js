const {createSupabaseService, createSupabaseWithToken} = require('../cores/supabase')

async function requireDBUser(req,res,next){
    const token = req.cookies['access-token'];
    const refresh = req.cookies['refresh-token'];
     if (!token || !refresh) {
      return res.status(401).json({ error: "Missing authentication tokens" });
    }

    if(token && refresh){
        const user_auth_id = req.user?.id;
        console.log("(ReqDBuser)IMPORTANT: ", user_auth_id)
        const db_user = await getUser(user_auth_id, token, refresh);
        req.db_user = db_user;
        if(db_user!=null){
          req.access = token;
          req.refresh = refresh;
        }else{
          return res.status(403).json({ error: "Invalid or unknown user" });
        }
        return next();
    }else{
        req.db_user = null;
        return next();
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
    // console.log('User already exists:', existingUser);
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

  console.log('Inserted user:', data.id);
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
        console.log("s.getUser: ", JSON.stringify(user.id))
        return user;
    }
}

async function updateUser(auth_id, token, refresh, usernameN, profile_imgN) {
  const supabase = createSupabaseWithToken(token, refresh);

  // build update object dynamically
  const updateObj= {};
  if (usernameN) updateObj.name = usernameN;
  if (profile_imgN) updateObj.profile_img = profile_imgN;

  if (Object.keys(updateObj).length === 0) {
    // nothing to update
    return null;
  }

  const { data, error } = await supabase
    .from("dataUser")
    .update(updateObj)
    .eq("auth_id", auth_id)
    .select();

  if (error) {
    console.log("UPDATE USER ERR: ", error);
    return null;
  } else {
    return data;
  }
}

module.exports = {createUser, getUser, requireDBUser, updateUser}