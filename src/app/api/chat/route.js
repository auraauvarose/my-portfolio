// // src/app/api/chat/route.js

// export async function POST(request) {
//   try {
//     let body;
//     try { body = await request.json(); }
//     catch { return Response.json({ error: 'Request tidak valid' }, { status: 400 }); }

//     const { messages } = body;
//     if (!messages || !Array.isArray(messages) || messages.length === 0) {
//       return Response.json({ error: 'messages tidak valid' }, { status: 400 });
//     }

//     const apiKey = process.env.GEMINI_API_KEY;
//     if (!apiKey) {
//       return Response.json({ reply: '⚙️ AI belum dikonfigurasi. Hubungi admin.' });
//     }

//     const history = messages.slice(0, -1)
//       .filter(m => m?.role && m?.content)
//       .map(m => ({
//         role: m.role === 'assistant' ? 'model' : 'user',
//         parts: [{ text: String(m.content) }],
//       }));

//     const lastMsg = messages[messages.length - 1];
//     if (!lastMsg?.content) {
//       return Response.json({ reply: 'Pesan kosong, coba lagi.' });
//     }

//     const geminiRes = await fetch(
//       `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
//       {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           systemInstruction: {
//             parts: [{ text: `Kamu adalah asisten AI pribadi bernama "AI Aura" di portofolio Aura Auvarose, mahasiswa Informatika semester 1 dari Indonesia. Kepribadian kamu ramah, singkat, dan sedikit kasual. Jawab dalam bahasa yang sama dengan pertanyaan. Info Aura: belajar Python, JavaScript, Node.js, Next.js, Supabase, Git, Linux (Fedora). Goals: jadi software architect, bangun startup, kontribusi ke komunitas IT.` }]
//           },
//           contents: [
//             ...history,
//             { role: 'user', parts: [{ text: String(lastMsg.content) }] }
//           ],
//           generationConfig: { maxOutputTokens: 600, temperature: 0.75 },
//         }),
//       }
//     );

//     const data = await geminiRes.json();

//     if (!geminiRes.ok) {
//       const errMsg = data?.error?.message || '';
//       // Quota exceeded — pesan ramah ke user
//       if (geminiRes.status === 429 || errMsg.includes('quota') || errMsg.includes('RESOURCE_EXHAUSTED')) {
//         return Response.json({ reply: '⏳ AI sedang istirahat sebentar karena terlalu banyak permintaan. Coba lagi dalam 1 menit ya!' });
//       }
//       // API key invalid
//       if (geminiRes.status === 400 || geminiRes.status === 403) {
//         return Response.json({ reply: '🔑 Konfigurasi AI bermasalah. Hubungi admin.' });
//       }
//       return Response.json({ reply: `❌ Error ${geminiRes.status}. Coba lagi nanti.` });
//     }

//     const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
//     if (!reply) {
//       return Response.json({ reply: 'Maaf, AI tidak merespons. Coba pertanyaan lain!' });
//     }

//     return Response.json({ reply: reply.trim() });

//   } catch (err) {
//     console.error('Route error:', err);
//     return Response.json({ reply: '❌ Server error. Coba lagi nanti.' }, { status: 500 });
//   }
// }

// // perbaikan final


import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { history, userMsg } = body;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'API Key tidak ditemukan' }, { status: 500 });
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: 'Kamu adalah asisten AI pribadi di portofolio Aura Auvarose, mahasiswa S1 Informatika dari Indonesia yang tangguh. Jawab dengan ramah, padat, dan sangat membantu.' }]
          },
          contents: [...history, userMsg],
          generationConfig: { maxOutputTokens: 800, temperature: 0.7 }
        })
      }
    );

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error("Error backend:", error);
    return NextResponse.json({ error: 'Gagal memproses request' }, { status: 500 });
  }
}