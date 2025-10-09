const {createSupabaseService, createSupabaseWithToken} = require('../cores/supabase')
const TABLE = "question";
async function getQuestion(qid){
    const db = createSupabaseService();

    const {data: question, error} = await db.from(TABLE)
    .select('*')
    .eq("id", qid)
    .single();

    if(error){
        console.log("GET 1 question err: ", error);
        return null;
    }else{
        console.log("GET 1 question OKAY");
        return question
    }
    
}

async function getQuestions(){
    const db = createSupabaseService();

    const { data: allIds, error } = await db.from(TABLE).select('id');
    if (error) return null;

    const randomIds = getUniqueRandomIdsFromArray(allIds.map(x => x.id), 18);

    const { data: questions, error: qErr } = await db.from(TABLE)
        .select('*')
        .in('id', randomIds);
    if(error){
        console.log("GET * question err: ", error);
        return null;
    }else{
        console.log("GET * question OKAY");
        return questions
    }
    
}

async function addQuestion(question, image, order, categ){
    const superDB = createSupabaseService();
    const {data,error} = await superDB.from(TABLE)
    .insert(
        [
            {
                question:question,
                image:image,
                order:order,
                categ:categ
            }
        ]
    ).select();
    if(error){
        console.log("INSERT Question err: ", error)
        return null;
    }else{
        console.log("INSERT Question OKAY: ", data.id)
        return data;
    }
}

function getUniqueRandomIdsFromArray(array, m) {
    const shuffled = array.slice(); // copy
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Fisher-Yates shuffle
    }
    return shuffled.slice(0, m);
}
module.exports = {getQuestions, addQuestion, getQuestion}