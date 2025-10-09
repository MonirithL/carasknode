const {GoogleGenAI} = require("@google/genai")
const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_API_KEY,
});

async function getText() {
  const prompt = `Generate a JSON array of 3 careers that I might fit and 3 that I might not fit if I am good at math, not very athletic, know a bit about construction.
Each career should be an object with the following keys:
- "title": name of the job(string)
- "fit": true or false meaning fit or not fit (boolean)
- "reasons": give an array of reasons that why i might fit( array of string)

Return ONLY the JSON array, with no extra text, explanation, or markdown formatting.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
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

async function genResult(qna_full){
  const basePrompt = "Generate a JSON array of 6 careers that a person might fit and another 3 careers that they should avoid with 3 reasons why and why not. They answered some questions like below."
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

  Return only the JSON, with no extra text, explanation,, or markdown formatting.`
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config:{"response_mime_type": "application/json"}
    });

    if (response && response.text && response.text.length > 0) {
        try{
            const text = response.text.replace(/```json|```/g, "").trim();
            const json_text = JSON.parse(text);
            return ({result:json_text})
        }catch(error){
            console.log("GEMINI genResult NOT json ",error)
        }
      return response.text
    } else {
      return "Gemini returned empty response";
    }
  } catch (error) {
    console.error("Gemini error:", error);
    return "Gemini not gen Result working";
  }
}

module.exports = {getText, genResult}