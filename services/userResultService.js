const {createSupabaseWithToken} = require('../cores/supabase')
const TABLE = 'result';
async function getResult(access, refresh, rid){
    const db = createSupabaseWithToken(access, refresh);

    const {data: Result, error} = await db.from(TABLE)
    .select('*')
    .eq("id", rid)
    .single();

    if(error){
        console.log("GET 1 Result err: ", error);
        return null;
    }else{
        console.log("GET 1 Result OKAY");
        return Result
    }
    
}
async function getLastResult(access, refresh){
    const db = createSupabaseWithToken(access, refresh);

    const {data: Result, error} = await db.from(TABLE)
    .select('*')
    .order('created_at', {ascending:false})
    .limit(1)
    .single();

    if(error){
        console.log("GET last Result err: ", error);
        return null;
    }else{
        console.log("GET last Result OKAY");
        return Result
    }
    
}
async function getResults(access, refresh){
    const db = createSupabaseWithToken(access, refresh);

    const {data: Results, error} = await db.from(TABLE)
    .select('*');

    if(error){
        console.log("GET q Results err: ", error);
        return null;
    }else{
        console.log("GET q Results OKAY");
        return Results
    }
    
}

async function getResultBySessionID(access, refresh, sid){
    console.log("Grbsid: ", sid)
    const db = createSupabaseWithToken(access, refresh);

    const { data: existing, error: selectError } = await db
    .from(TABLE)
    .select("*")
    .eq("session_id", sid)
    .maybeSingle();

    if (selectError) {
        console.log("SELECT existing result error:", selectError);
        return null;
    }

    if (existing) {
        console.log("Result already exists for session:", sid);
        return existing; 
    }
}

async function addResult(access, refresh, sid, result){
    const db = createSupabaseWithToken(access, refresh);

    const { data: existing, error: selectError } = await db
    .from(TABLE)
    .select("*")
    .eq("session_id", sid)
    .maybeSingle();

    if (selectError) {
        console.log("SELECT existing result error:", selectError);
        return null;
    }

    if (existing) {
        console.log("Result already exists for session:", sid);
        return existing; 
    }



    const {data,error} = await db.from(TABLE)
    .insert([{
        session_id: sid,
        result_json:result
    }]).select("*");
    if(error){
        console.log("INSERT Result err: ", error)
        return null;
    }else{
        console.log("INSERT Result OKAY: ", JSON.stringify(data))
        return data;
    }
}

async function deleteResult(access, refresh, rid){
    const db = createSupabaseWithToken(access, refresh);
    const {data:deleted, error} = await db.from(TABLE)
    .delete()
    .eq("id", rid)
    .select();

    if(error){
        console.log("DELETE Result err: ", error)
        return null;
    }else{
        console.log("DELETE Result OKAY: ", JSON.stringify(deleted))
        return deleted;
    }
}
module.exports = {getResult, getResults, addResult, deleteResult, getLastResult,getResultBySessionID}