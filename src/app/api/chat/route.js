// Letakkan file ini di: src/app/api/chat/route.js
// API key TIDAK pernah keluar ke browser - aman 100%

export async function POST(request) {
  try {
    const { messages } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: 'API key tidak ditemukan' }, { status: 500 });
    }

    // Build Gemini history from messages array
    const history = messages.slice(0, -1).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const lastMsg = messages[messages.length - 1];

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: 'Kamu adalah asisten AI pribadi di portofolio Aura Auvarose, mahasiswa Informatika semester 1 dari Indonesia. Kamu ramah, singkat, dan membantu. Jawab dalam bahasa yang sama dengan pertanyaan (Indonesia/Inggris). Info tentang Aura: belajar Python, JavaScript, Next.js, Supabase, Git, Linux. Fokus pada logika pemrograman dan konsisten belajar setiap malam.'
            }]
          },
          contents: [
            ...history,
            { role: 'user', parts: [{ text: lastMsg.content }] }
          ],
          generationConfig: { maxOutputTokens: 800, temperature: 0.7 },
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error('Gemini error:', data);
      return Response.json({ error: data.error?.message || 'Gemini error' }, { status: res.status });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Tidak ada respons.';
    return Response.json({ reply });

  } catch (err) {
    console.error('Route error:', err);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}