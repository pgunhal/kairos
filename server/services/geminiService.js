const axios = require('axios');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
exports.generateEmailContent = async (role, company, user, alumni, tone = 'friendly', subject = '') => {
    try {
      const senderName = `${user.firstName} ${user.lastName}`;
      const senderLinkedIn = user.linkedinUrl || 'Not provided';
      const senderEmail = user.email || 'Not provided';
      const senderPhone = user.phone || '';
  
      const recipientName = alumni.name || '';
      const recipientCompany = alumni.company || '[Company]';
      const recipientRole = alumni.jobTitle || '[Role]';
  
      const prompt = `
Write a professional networking email from ${senderName} to ${recipientName}.

Context:
- Sender: ${senderName}
- University: ${user.university || 'Not provided'}
- Industry: ${user.industry || 'Not provided'}
- LinkedIn: ${senderLinkedIn}
- Email: ${senderEmail}
- Phone: ${senderPhone || 'optional'}

Recipient:
- Name: ${recipientName}
- Company: ${recipientCompany}
- Role: [JobTitle]

Email Subject: "${subject}"

Guidelines:
- Be concise, polite, motivated.
- Keep under 100 words.
- Suggest a quick coffee chat or call.
- Do NOT directly ask for referral.
- Use natural professional tone.
- Leave [Company], [Role], [JobTitle] placeholders.
- Use {{name}} for recipient, {{senderName}} for sender.

Output only email body (no subject again).

Tone: ${tone}
`;
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
            "HTTP-Referer": "http://localhost:8003",
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





  exports.editEmailContent = async (email, role, company, user, alumni, tone = 'friendly', subject = '') => {
    try {
      const senderName = `${user.firstName} ${user.lastName}`;
      const senderLinkedIn = user.linkedinUrl || 'Not provided';
      const senderEmail = user.email || 'Not provided';
      const senderPhone = user.phone || 'Not provided';
  
      const recipientName = alumni.name || 'Not provided';
      const recipientCompany = alumni.company || 'Not provided';
      const recipientRole = alumni.jobTitle || 'Not provided';
  
      const prompt = `
If something is not provided for the following prompt, adjust accordingly so that the email still reads well. 
Edit this professional networking email from ${senderName} to ${recipientName}.

Context:
- Sender: ${senderName}
- University: ${user.university || 'Not provided'}
- Industry: ${user.industry || 'Not provided'}
- LinkedIn: ${senderLinkedIn || 'Not provided'}
- Email: ${senderEmail || 'Not provided'}
- Phone: ${senderPhone || 'Not provided'}

Recipient:
- Name: ${recipientName}
- Company: ${recipientCompany}
- Role: ${recipientRole}

Email Subject: "${subject}"

Guidelines:
- DO NOT CHANGE THE WORKING OF THE ORIGINAL EMAIL IF NOT NEEDED. only edit anything in the email that doesn't read well or any 
variables that might slip through in the final email without being filled in or make it hard to read. 

Output only email body (no subject again).

Tone: ${tone}
The email starts below: 
` + email;
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
            "HTTP-Referer": "http://localhost:8003",
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
