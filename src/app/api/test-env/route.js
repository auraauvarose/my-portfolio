// src/app/api/test-env/route.js
// File SEMENTARA untuk debug — hapus setelah AI berfungsi

export async function GET() {
  const key = process.env.GEMINI_API_KEY;

  let geminiOk = false;
  let geminiError = '';
  let geminiReply = '';

  if (key) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: 'Halo, balas dengan: OK' }] }],
            generationConfig: { maxOutputTokens: 10 },
          }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        geminiOk = true;
        geminiReply = data?.candidates?.[0]?.content?.parts?.[0]?.text || '(kosong)';
      } else {
        geminiError = data?.error?.message || `HTTP ${res.status}`;
      }
    } catch (e) {
      geminiError = e.message;
    }
  }

  return Response.json({
    hasKey: !!key,
    keyPreview: key ? key.slice(0, 10) + '...' : 'NOT FOUND',
    geminiOk,
    geminiReply,
    geminiError: geminiError || null,
  });
}