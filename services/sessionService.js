const {createSupabaseWithToken} = require('../cores/supabase')
const TABLE = 'session';
async function getSession(access, refresh, aid){
    const db = createSupabaseWithToken(access, refresh);

    const {data: session, error} = await db.from(TABLE)
    .select('*')
    .eq("id", aid)
    .single();

    if(error){
        console.log("GET 1 session err: ", error);
        return null;
    }else{
        console.log("GET 1 session OKAY");
        return session
    }
    
}
async function getSessions(access, refresh){
    const db = createSupabaseWithToken(access, refresh);

    const {data: sessions, error} = await db.from(TABLE)
    .select('*')
    .eq("completed", true);

    if(error){
        console.log("GET q sessions err: ", error);
        return null;
    }else{
        console.log("GET q sessions OKAY");
        return sessions
    }
    
}

async function addSession(access, refresh){
    const db = createSupabaseWithToken(access, refresh);
    const {data,error} = await db.from(TABLE)
    .insert([{}]).select("*");
    if(error){
        console.log("INSERT session err: ", error)
        return null;
    }else{
        console.log("INSERT session OKAY: ", JSON.stringify(data))
        return data[0];
    }
}
async function completeSession(access, refresh, sid){
    const db = createSupabaseWithToken(access, refresh);
    const {data,error} = await db.from(TABLE)
    .update({
        completed:true
    }).eq("id", sid)
    .select("*")
    .maybeSingle();
    if(error){
        console.log("Complete session session err: ", error)
        return null;
    }else{
        console.log("Complete session OKAY: ", JSON.stringify(data))
        return data;
    }
}

async function deleteSession(access, refresh, sid){
    const db = createSupabaseWithToken(access, refresh);
    const {data:deleted, error} = await db.from(TABLE)
    .delete()
    .eq("id", sid)
    .select();

    if(error){
        console.log("DELETE session err: ", error)
        return null;
    }else{
        console.log("DELETE session OKAY: ", JSON.stringify(deleted))
        return deleted;
    }
}

async function getLastCompletedSession(access, refresh){

    const db = createSupabaseWithToken(access, refresh);

    const {data: session, error} = await db.from(TABLE)
    .select('*')
    .eq('completed', true)
    .order('created_at', {ascending:false})
    .limit(1)
    .maybeSingle();

    if(error){
        console.log("GET 1 last competed session err: ", error);
        return null;
    }else{
        console.log("GET 1 lcs session OKAY");
        return session
    }

}
module.exports = {getSession, getSessions, addSession, deleteSession, completeSession, getLastCompletedSession}