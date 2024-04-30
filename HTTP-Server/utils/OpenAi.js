const { default: OpenAI } = require("openai/index.js");
require('dotenv').config();

async function queryGPT(systemContent , userContent){
    try {
        const openai = new OpenAI({
            apiKey:process.env.OPENAI_API_KEY,
        });
    
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-0125",
            messages: [
                {
                    "role": "system",
                    "content": systemContent,
                },
                {
                    "role": "user",
                    "content": userContent
                }
            ],
            temperature: 0.8,
            max_tokens: 4095,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        });
      
        //return JSON.stringify(response.choices[0].message.content);
        return response.choices[0].message.content;
        
    } catch (error) {
        throw error;
        
    }
  
}module.exports = {
    queryGPT,
}