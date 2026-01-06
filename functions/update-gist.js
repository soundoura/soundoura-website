const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { content } = JSON.parse(event.body);
    if (!content) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Content is required' }) };
    }

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GIST_ID = process.env.GIST_ID;

    if (!GITHUB_TOKEN || !GIST_ID) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Server configuration error' }) };
    }

    const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Netlify-Function'
      },
      body: JSON.stringify({ files: { 'data.txt': { content: content } } })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { statusCode: response.status, body: JSON.stringify({ error: 'Failed to update gist', details: errorText }) };
    }

    const data = await response.json();
    return { statusCode: 200, body: JSON.stringify({ success: true, message: 'Gist updated successfully!', url: data.html_url }) };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error', details: error.message }) };
  }
};
