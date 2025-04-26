// server/utils/contactFetcher.js
const axios = require('axios');

exports.fetchContactsFromFastAPI = async (query) => {
  try {
    const response = await axios.get(`http://localhost:8005/contacts/${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching contacts from FastAPI:', error.message);
    throw new Error('Failed to fetch contacts');
  }
};
