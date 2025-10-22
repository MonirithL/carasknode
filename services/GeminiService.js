const {GoogleGenAI} = require("@google/genai")
const Model = "gemini-2.5-flash"
const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_API_KEY,
});

async function getText() {
  const prompt = `Generate a JSON array of 3 careers that I might fit and 2 might not fit.
Each career should be an object with the following keys:
- "title": name of the job(string)
- "fit": true or false meaning fit or not fit (boolean)
- "reasons": give an array of reasons that why i might fit( array of string)

Return ONLY the JSON array, with no extra text, explanation, or markdown formatting.`;

  try {
    const response = await ai.models.generateContent({
      model: Model,
      contents: prompt,
      config:{"response_mime_type": "application/json"}
    });

    if (response && response.text && response.text.length > 0) {
        try{
            const text = response.text.replace(/```json|```/g, "").trim();
            const json_text = JSON.parse(text);
            return ({result:json_text})
        }catch(error){
            console.log("GEMINI is NOT json ",error)
        }
      return response.text
    } else {
      return "Gemini returned empty response";
    }
  } catch (error) {
    console.error("Gemini error:", error);
    return "Gemini not working";
  }
}
async function getRecommended(careerText, alreadyDoing) {
  const prompt = `Generate a JSON array of 6 strings.
Each strings should be 2 to 5 words max. They are about things that user can do to improve their ability toward a certain career.
the career is ${careerText}.
and they already did ${JSON.stringify(alreadyDoing)}

Note that there should be 6 recommended items of type string returned!
Return ONLY the JSON array, with no extra text, explanation, or markdown formatting.`;

  try {
    const response = await ai.models.generateContent({
      model: Model,
      contents: prompt,
      config:{"response_mime_type": "application/json"}
    });

    if (response && response.text && response.text.length > 0) {
        try{
            const text = response.text.replace(/```json|```/g, "").trim();
            const json_text = JSON.parse(text);
            return ({result:json_text})
        }catch(error){
            console.log("GEMINI is NOT json RC ",error)
        }
      return response.text
    } else {
      return "Gemini returned empty response RC";
    }
  } catch (error) {
    console.error("Gemini error RC:", error);
    return "Gemini not working RC";
  }
}

async function genResult(qna_full){
  // const basePrompt = "Generate a JSON array of 6 careers that a person might fit and another 3 careers that they should avoid with 3 reasons why and why not. They answered some questions like below."
  const prompt = `This is a Q&A pair of the person:
  ${JSON.stringify(qna_full, null, 2)}
  
  Output requirement: should have an array of 9 careers with 6 being good and 3 being bad for the person, in the format of:
  {
    "title":"job title(string)",
    "description":"short 8-10 words description of the job(string)",
    "fit": true(boolean),
    "reasons":[
        "reason1(string)", "reason2(string)", "reason3(string)"
    ]
  }
  * fit should always be of boolean type
  * the title or careers should be ordered from best to worst
  *"job title", true and reason1, reason2, reason3 are examples. Each reason should be maximum words of 8 words.

  Return only the JSON, with no extra text, explanation,, or markdown formatting.`;
  // try {
  //   const response = await ai.models.generateContent({
  //     model: Model,
  //     contents: prompt,
  //     config:{"response_mime_type": "application/json"}
  //   });

  //   if (response && response.text && response.text.length > 0) {
  //       try{
  //           const text = response.text.replace(/```json|```/g, "").trim();
  //           const json_text = JSON.parse(text);
  //           return ({result:json_text})
  //       }catch(error){
  //           console.log("GEMINI genResult NOT json ",error)
  //       }
  //     return response.text
  //   } else {
  //     return "Gemini returned empty response";
  //   }
  // } catch (error) {
  //   console.error("Gemini error:", error);
  //   return "Gemini not gen Result working";
  // }
    const delay = (ms) => new Promise((res) => setTimeout(res, ms));
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: Model,
        contents: prompt,
        config: { response_mime_type: "application/json" },
      });

      if (!response?.text || response.text.length === 0) {
        console.warn(`⚠️ Attempt ${attempt}: Empty response, retrying...`);
        await delay(200);
        continue;
      }

      const text = response.text.replace(/```json|```/g, "").trim();

      try {
        const jsonText = JSON.parse(text);
        return { result: jsonText }; // success, only return on valid JSON
      } catch {
        console.warn(`⚠️ Attempt ${attempt}: Invalid JSON, retrying...`);
        await delay(200);
      }
    } catch (error) {
      console.error(`❌ Attempt ${attempt}: Gemini error, retrying...`, error);
      await delay(200);
    }
  }

  return { error: "Failed to generate valid JSON after 3 attempts" };
}

async function genExplore(termsArr){
  const prompt = `Generate and array of careers that fit search array below and Please generate it QUICKLY and not too much word, try to get it on first try:
  ${JSON.stringify(termsArr)}
  
  Output requirement: should have an array of 10 careers and a prompt for users to do next;
  {
    prompter:"some prompt about 3-6, example: 'try adding your experience', 'what is your hobby?'....",
    careers: [
    "title":"job title(string)",
    "description":"short 3-6 words description of the job(string)",
    "requirements":[
        "requirement1(string)", "requirement2(string)"
    ]
  }
  * the title or careers should be ordered from best mataching to worst
  

  Return only the JSON, with no extra text, explanation, or markdown formatting.`
  try {
    const response = await ai.models.generateContent({
      model: Model,
      contents: prompt,
      config:{"response_mime_type": "application/json"}
    });

    if (response && response.text && response.text.length > 0) {
        try{
            const text = response.text.replace(/```json|```/g, "").trim();
            const json_text = JSON.parse(text);
            return (json_text)
        }catch(error){
            console.log("GEMINI genResult NOT json ",error)
        }
      return response.text
    } else {
      return "Gemini returned empty response";
    }
  } catch (error) {
    console.error("Gemini error:", error);
    return "Gemini not gen Explore working";
  }
}
async function genSeemore(title, goal, qnaArrays, tasksArr) {
  const safeTitle = title ?? "Unknown Title";
  const safeGoalCareer = goal?.career ?? null;
  const safeQna = Array.isArray(qnaArrays) ? qnaArrays : [];
  const safeTasks = Array.isArray(tasksArr) ? tasksArr : [];
  const hasGoal = !!goal;

  const prompt = `
Given this data:
- QnA: ${JSON.stringify(safeQna, null, 2)}
- Goal: ${safeGoalCareer ?? "null"}
- Target: ${safeTitle}
- Completed Tasks: ${JSON.stringify(safeTasks)}

Generate JSON in this exact format:
{
  "title": "${safeTitle}",
  "goal": ${safeGoalCareer ? `"${safeGoalCareer}"` : null},
  "description": "Short description for ${safeTitle}",
  "whyFit": ${hasGoal ? "string[]" : "null"},
  "whyNotFit": ${hasGoal ? "string[]" : "null"},
  "requirements": "string[]",
  "transitioning": ${hasGoal ? "string[]" : "null"},
  "transitioning_diff": ${hasGoal ? "string" : "null"}
}

Rules:
- If goal is null → whyFit, whyNotFit, transitioning, transitioning_diff = null.
- Each list: 3–6 short items (4–6 words max).
- transitioning_diff ∈ ["seamless","easy","medium","hard","very hard"].
- Requirements: measurable.
- Tasks must not repeat items from Completed Tasks.
- Return **only JSON**, no markdown or text.
`;

  const delay = (ms) => new Promise(res => setTimeout(res, ms));
  const maxRetries = 10;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: Model,
        contents: prompt,
        config: { response_mime_type: "application/json" },
      });

      if (!response?.text || response.text.length === 0) {
        console.warn(`⚠️ Attempt ${attempt}: Empty response, retrying...`);
        await delay(500);
        continue;
      }

      const text = response.text.replace(/```json|```/g, "").trim();

      try {
        const jsonText = JSON.parse(text);
        return jsonText; // success
      } catch {
        console.warn(`⚠️ Attempt ${attempt}: Invalid JSON, retrying...`);
        await delay(500);
      }

    } catch (error) {
      console.error(`❌ Attempt ${attempt}: Gemini generation failed, retrying...`, error);
      await delay(500);
    }
  }

  return { error: "Failed to generate valid JSON after 10 attempts" };
}



module.exports = {getText, genResult, getRecommended,genExplore, genSeemore}