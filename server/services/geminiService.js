const axios = require('axios');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

exports.generateEmailContent = async (role, company, userProfile, tone = 'friendly') => {
  try {
    const { senderName, senderLinkedIn, senderEmail, senderPhone } = userProfile;

    const prompt = `
You are writing a networking email for a student named ${senderName}.

The student wants to reach out to a professional working at [Company] about a [Role] opportunity.

Guidelines:
- Be polite, concise, professional, and under 100 words.
- Assume the recipient works at [Company] in a related field.
- **Do not** directly ask for a referral, but the goal is to build rapport for one.
- Mention that the student would appreciate a short conversation or coffee chat.
- End with an invitation to connect.

Insert where appropriate:
- LinkedIn: ${senderLinkedIn}
- Email: ${senderEmail}
- Phone: ${senderPhone} (optional, can omit if feels unnatural)

Keep the placeholders [Company], [Role], [JobTitle] in place.

Use {{name}} for recipient name and {{senderName}} for student's name.

Only write the email body (no subject).
`;

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: "mistralai/mistral-7b-instruct",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7
      },
      {
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": "http://localhost:8003",
          "Content-Type": "application/json"
        }
      }
    );

    const emailText = response.data.choices[0].message.content;
    return emailText;
  } catch (error) {
    console.error('OpenRouter API error:', error.response?.data || error.message);
    throw new Error('Failed to generate email');
  }
};
