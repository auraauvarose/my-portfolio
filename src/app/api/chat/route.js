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

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API Key tidak ditemukan' }, { status: 500 });
    }

    // Normalisasi input: dukung kedua format
    // - frontend lama: { messages: [{ role, content }, ...] }
    // - frontend baru (opsional): { history, userMsg } already in Gemini format
    let contents = null;
    if (Array.isArray(body.messages)) {
      const messages = body.messages;
      const history = messages.slice(0, -1)
        .filter(m => m?.role && m?.content)
        .map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: String(m.content) }],
        }));
      const lastMsg = messages[messages.length - 1];
      if (!lastMsg?.content) {
        return NextResponse.json({ reply: 'Pesan kosong, coba lagi.' }, { status: 400 });
      }
      contents = [...history, { role: 'user', parts: [{ text: String(lastMsg.content) }] }];
    } else if (Array.isArray(body.history) && body.userMsg) {
      contents = [...body.history, body.userMsg];
    } else {
      return NextResponse.json({ error: 'Payload tidak dikenali' }, { status: 400 });
    }

    const systemText = 'Kamu adalah asisten AI pribadi bernama "AI Aura" di portofolio Aura Auvarose. Jawab ramah, singkat, dan membantu. Gunakan bahasa yang sama dengan pertanyaan.';

    const model = process.env.GEMINI_MODEL || 'gemini-1.5';
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemText }] },
          contents,
          generationConfig: { maxOutputTokens: 800, temperature: 0.7 }
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      const errMsg = data?.error?.message || '';
      // In development show full error details to help debugging
      if (process.env.NODE_ENV !== 'production' && data?.error) {
        return NextResponse.json({ reply: data.error.message || `Error ${res.status}`, error: data.error }, { status: res.status });
      }
      if (res.status === 429 || errMsg.includes('quota') || errMsg.includes('RESOURCE_EXHAUSTED')) {
        return NextResponse.json({ reply: '⏳ AI sedang istirahat sebentar karena terlalu banyak permintaan. Coba lagi nanti.' });
      }
      if (res.status === 400 || res.status === 403) {
        return NextResponse.json({ reply: '🔑 Konfigurasi AI bermasalah. Hubungi admin.' });
      }
      return NextResponse.json({ reply: `❌ Error ${res.status}. Coba lagi nanti.` });
    }

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) {
      return NextResponse.json({ reply: 'Maaf, AI tidak merespons. Coba pertanyaan lain!' });
    }

    return NextResponse.json({ reply: reply.trim() }, { status: 200 });

  } catch (error) {
    console.error("Error backend:", error);
    return NextResponse.json({ error: 'Gagal memproses request' }, { status: 500 });
  }
}
