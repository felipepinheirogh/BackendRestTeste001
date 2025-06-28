import fetch from 'node-fetch';

const SUPABASE_URL = 'https://rigjmzuqlpzxbvsyrsqo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpZ2ptenVxbHB6eGJ2c3lyc3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4OTAxMjksImV4cCI6MjA2NjQ2NjEyOX0.MdbKZkdinux2ZjXdXC3K-7DlJumWR2K1-u1y4maaOM0';

export async function supabaseRequest(method, endpoint, body = null) {
  const options = {
    method,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
    },
  };
  if (body) options.body = JSON.stringify(body);

  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  const res = await fetch(url, options);

  const text = await res.text();
  let data = null;
  if (text?.trim()) {
    try {
      data = JSON.parse(text);
    } catch (err) {
      throw new Error(`Erro ao parsear JSON: ${err.message}\nResposta: ${text}`);
    }
  }

  return { status: res.status, data };
}
