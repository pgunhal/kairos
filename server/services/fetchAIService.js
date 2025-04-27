const axios = require('axios');

const FETCHAI_API_KEY = process.env.FETCHAI_API_KEY; // Load from env
const FETCHAI_ENDPOINT = 'https://api.fetch.ai/agentic/generate'; // example endpoint, replace if different

exports.generateEmailContent = async (role, company, tone) => {
  const prompt = `
You are an expert networker. Write a short, friendly networking email.
The candidate is interested in "${role}" roles at "${company}". The tone should be "${tone}".
Personalize it like you would on LinkedIn outreach.

Reply with only the email body.
`;

  try {
    const response = await axios.post(FETCHAI_ENDPOINT, {
      prompt,
      max_tokens: 400,
      temperature: 0.7,
    }, {
      headers: {
        'Authorization': `Bearer ${FETCHAI_API_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    return response.data.text; // Assuming Fetch.ai returns { text: "..." }

  } catch (error) {
    console.error('Fetch.ai generation failed:', error.response?.data || error.message);
    throw new Error('Failed to generate email with Fetch.ai');
  }
};
