const {createSupabaseWithToken} = require('../cores/supabase')
const TABLE = 'progress';
async function getProgress(access, refresh, aid){
    const db = createSupabaseWithToken(access, refresh);

    const {data: Progress, error} = await db.from(TABLE)
    .select('*')
    .eq("id", aid)
    .single();

    if(error){
        console.log("GET 1 Progress err: ", error);
        return null;
    }else{
        console.log("GET 1 Progress OKAY");
        return Progress
    }
    
}
async function getProgresses(access, refresh){
    const db = createSupabaseWithToken(access, refresh);

    const {data: Progresss, error} = await db.from(TABLE)
    .select('*')
    .order('completed', { ascending: true })
    .order('created_at', {ascending:false});

    if(error){
        console.log("GET q Progresses err: ", error);
        return null;
    }else{
        console.log("GET q Progresses OKAY");
        return Progresss
    }
    
}

async function addProgress(access, refresh, item_name, gid){
    const db = createSupabaseWithToken(access, refresh);
    const {data,error} = await db.from(TABLE)
    .insert([{
        text:item_name,
        goal_id:gid
    }]).select("*").single();
    if(error){
        console.log("INSERT Progress err: ", error)
        return null;
    }else{
        console.log("INSERT Progress OKAY: ", JSON.stringify(data))
        return data;
    }
}

async function deleteProgress(access, refresh, sid){
    const db = createSupabaseWithToken(access, refresh);
    const {data:deleted, error} = await db.from(TABLE)
    .delete()
    .eq("id", sid)
    .select();

    if(error){
        console.log("DELETE Progress err: ", error)
        return null;
    }else{
        console.log("DELETE Progress OKAY: ", JSON.stringify(deleted))
        return deleted;
    }
}
async function updateProgress(access, refresh, pid, completed) {
    const db = createSupabaseWithToken(access, refresh);
    const {data:progress, error} = await db.from(TABLE)
    .update({
        completed:completed
    }).eq('id', pid)
    .select()
    .single();
    if(error){
        console.log("UPDATE 1 progress err: ", error);
        return null;
    }else{
        console.log("UPDATE 1 progress OKAY: ", JSON.stringify(progress));
        return progress
    }
}

module.exports = {getProgress, getProgresses, addProgress, deleteProgress, updateProgress}