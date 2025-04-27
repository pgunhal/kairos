const axios = require('axios');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
exports.generateReplyContent = async (content) => {
    try {
     
      const prompt = `
Write a professional networking email that replies to the email below, based on the content of the email.

Guidelines:
- Be concise, polite, motivated.
- Keep under 100 words.
- Suggest a quick coffee chat or call (or act upon an invitation)
- Do NOT directly ask for referral.
- Use natural professional tone.

Output only email body (no subject again).

Below is the email:
` + content;
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: "mistralai/mistral-7b-instruct",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7
        },
        {
          headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "HTTP-Referer": "http://localhost:3000",
            "Content-Type": "application/json"
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('OpenRouter API error:', error.response?.data || error.message);
      throw new Error('Failed to generate email');
    }
  };