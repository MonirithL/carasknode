const {createSupabaseWithToken} = require('../cores/supabase')
const TABLE = 'qna';
async function getQna(access, refresh, qid){
    const db = createSupabaseWithToken(access, refresh);

    const {data: Qna, error} = await db.from(TABLE)
    .select('*')
    .eq("id", qid)
    .single();

    if(error){
        console.log("GET 1 Qna err: ", error);
        return null;
    }else{
        console.log("GET 1 Qna OKAY");
        return Qna
    }
    
}
async function getQnas(access, refresh){
    const db = createSupabaseWithToken(access, refresh);

    const {data: Qnas, error} = await db.from(TABLE)
    .select('*');

    if(error){
        console.log("GET q Qnas err: ", error);
        return null;
    }else{
        console.log("GET q Qnas OKAY");
        return Qnas
    }
    
}

async function addQna(access, refresh, qid, aid, sid){
    const db = createSupabaseWithToken(access, refresh);
    const {data,error} = await db.from(TABLE)
    .insert([{
        question_id: qid,
        answer_id, aid,
        session_id, sid
    }]).select("id");
    if(error){
        console.log("INSERT Qna err: ", error)
        return null;
    }else{
        console.log("INSERT Qna OKAY: ", JSON.stringify(data))
        return data;
    }
}

async function deleteQna(access, refresh, sid){
    const db = createSupabaseWithToken(access, refresh);
    const {data:deleted, error} = await db.from(TABLE)
    .delete()
    .eq("id", sid)
    .select();

    if(error){
        console.log("DELETE Qna err: ", error)
        return null;
    }else{
        console.log("DELETE Qna OKAY: ", JSON.stringify(deleted))
        return deleted;
    }
}
module.exports = {getQna, getQnas, addQna, deleteQna}