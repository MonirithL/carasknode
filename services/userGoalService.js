const {createSupabaseWithToken} = require('../cores/supabase')
const TABLE = 'goal';
async function getGoal(access, refresh){
    const db = createSupabaseWithToken(access, refresh);

    const {data: Goal, error} = await db.from(TABLE)
    .select('*')
    .single();

    if(error){
        console.log("GET 1 Goal err: ", error);
        return null;
    }else{
        console.log("GET 1 Goal OKAY");
        return Goal
    }
    
}

async function updateGoal(access, refresh, gid, career) {
    const db = createSupabaseWithToken(access, refresh);
    const {data:Goal, error} = await db.from(TABLE)
    .update({
        career:career
    }).eq('id', gid)
    .select()
    .single();
    if(error){
        console.log("UPDATE 1 Goal err: ", error);
        return null;
    }else{
        console.log("UPDATE 1 Goal OKAY: ", JSON.stringify(Goal));
        return Goal
    }
}


async function addGoal(access, refresh, career){
    const db = createSupabaseWithToken(access, refresh);
    const {data,error} = await db.from(TABLE)
    .insert([{career:career}]).select().single();
    if(error){
        console.log("INSERT Goal err: ", error)
        return null;
    }else{
        console.log("INSERT Goal OKAY: ", JSON.stringify(data))
        return data;
    }
}

async function deleteGoal(access, refresh, sid){
    const db = createSupabaseWithToken(access, refresh);
    const {data:deleted, error} = await db.from(TABLE)
    .delete()
    .eq("id", sid)
    .select();

    if(error){
        console.log("DELETE Goal err: ", error)
        return null;
    }else{
        console.log("DELETE Goal OKAY: ", JSON.stringify(deleted))
        return deleted;
    }
}
module.exports = {getGoal, updateGoal, addGoal, deleteGoal}