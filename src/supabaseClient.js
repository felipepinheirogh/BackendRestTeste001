// src/supabaseClient.js
import fetch from 'node-fetch';

// const SUPABASE_URL = 'https://rigjmzuqlpzxbvsyrsqo.supabase.co';
// const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpZ2ptenVxbHB6eGJ2c3lyc3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4OTAxMjksImV4cCI6MjA2NjQ2NjEyOX0.MdbKZkdinux2ZjXdXC3K-7DlJumWR2K1-u1y4maaOM0'; // ⚠️
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Variáveis de ambiente SUPABASE_URL e SUPABASE_KEY são obrigatórias');
}

export async function supabaseRequest(method, endpoint, body = null) {
  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  const options = {
    method,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation' // Retorna os dados no POST, PATCH
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || 'Erro na requisição ao Supabase');
    }

    return {
      status: response.status,
      data,
    };
  } catch (error) {
    throw new Error(`Erro no supabaseRequest: ${error.message}`);
  }
}

// // src/supabaseClient.js
// import fetch from 'node-fetch';

// const SUPABASE_URL = 'https://rigjmzuqlpzxbvsyrsqo.supabase.co';
// const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpZ2ptenVxbHB6eGJ2c3lyc3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4OTAxMjksImV4cCI6MjA2NjQ2NjEyOX0.MdbKZkdinux2ZjXdXC3K-7DlJumWR2K1-u1y4maaOM0'; // ⚠️ Use variável de ambiente em produção

// export async function supabaseRequest(method, endpoint, body = null) {
//   const options = {
//     method,
//     headers: {
//       apikey: SUPABASE_KEY,
//       Authorization: `Bearer ${SUPABASE_KEY}`,
//       'Content-Type': 'application/json',
//       Prefer: 'return=representation', // 🔥 Retorna o objeto após INSERT
//     },
//   };

//   if (body) options.body = JSON.stringify(body);

//   const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
//   const res = await fetch(url, options);

//   const text = await res.text();
//   let data = null;

//   if (text?.trim()) {
//     try {
//       data = JSON.parse(text);
//     } catch (err) {
//       throw new Error(`Erro ao parsear JSON: ${err.message}\nResposta: ${text}`);
//     }
//   }

//   return { status: res.status, data };
// }
