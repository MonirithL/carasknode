const {createSupabaseService, createSupabaseWithToken} = require('../cores/supabase')
const TABLE = 'answer';
async function getAnswer(aid){
    const db = createSupabaseService();

    const {data: answer, error} = await db.from(TABLE)
    .select('*')
    .eq("id", aid)
    .single();

    if(error){
        console.log("GET 1 answer err: ", error);
        return null;
    }else{
        console.log("GET 1 answer OKAY");
        return answer
    }
    
}
async function getAnswers(qid){
    const db = createSupabaseService()

    const {data: answer, error} = await db.from(TABLE)
    .select('*')
    .eq("qid", qid);

    if(error){
        console.log("GET q answers err: ", error);
        return null;
    }else{
        console.log("GET q answers OKAY");
        return answer
    }
    
}

async function addAnswers(answers){
    const superDB = createSupabaseService();
    const {data,error} = await superDB.from(TABLE)
    .insert(answers).select("id");
    if(error){
        console.log("INSERT answers err: ", error)
        return null;
    }else{
        console.log("INSERT answers OKAY: ", JSON.stringify(data))
        return data;
    }
}

module.exports = {getAnswers, addAnswers, getAnswer}