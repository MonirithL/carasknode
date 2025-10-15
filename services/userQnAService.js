const {createSupabaseWithToken} = require('../cores/supabase');
const { getAnswer } = require('./answerService');
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
        qid: qid,
        aid: aid,
        session_id: sid
    }]).select("id");
    if(error){
        console.log("INSERT Qna err: ", error)
        return null;
    }else{
        console.log("INSERT Qna OKAY: ", JSON.stringify(data))
        return data;
    }
}

async function deleteQna(access, refresh, qid){
    const db = createSupabaseWithToken(access, refresh);
    const {data:deleted, error} = await db.from(TABLE)
    .delete()
    .eq("id", qid)
    .select();

    if(error){
        console.log("DELETE Qna err: ", error)
        return null;
    }else{
        console.log("DELETE Qna OKAY: ", JSON.stringify(deleted))
        return deleted;
    }
}

async function getQnaBySessionId(access, refresh, sid){
    const db = createSupabaseWithToken(access, refresh);

    
  const { data: Qnas, error } = await db.from(TABLE)
    .select(`
      id,
      session_id,
      qid,
      aid,
      created_at,
      questionText:question(questionText)
    `)
    .eq("session_id", sid)
    .order("created_at", { ascending: false });

  if (error) {
    console.log("GET q Qnas err:", error);
    return null;
  }

  const mapped = await Promise.all(
    Qnas.map(async (q) => {
      const answerData = await getAnswer(q.aid);

      return {
        id: q.id,
        session_id: q.session_id,
        qid: q.qid,
        aid: q.aid,
        created_at: q.created_at,
        questionText: q.questionText.questionText,
        answerText: answerData?.answerText ?? null,
      };
    })
  );

  console.log("GET q Qnas OKAY:", JSON.stringify(mapped));
  return mapped;
}
module.exports = {getQna, getQnas, addQna, deleteQna, getQnaBySessionId}