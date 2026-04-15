"use client";
import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export default function SubmitPhoto() {
  const [form, setForm] = useState({ name: '', caption: '', instagram: '' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 8 * 1024 * 1024) { setError('Ukuran file maksimal 8MB'); return; }
    setFile(f);
    setError('');
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) { const fakeEv = { target: { files: [f] } }; handleFile(fakeEv); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !form.name.trim()) { setError('Nama dan foto wajib diisi'); return; }
    setSubmitting(true); setError('');
    try {
      const ext = file.name.split('.').pop();
      const fname = `community_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from('certificates')
        .upload(fname, file, { upsert: false });
      if (uploadErr) throw uploadErr;
      const url = supabase.storage.from('certificates').getPublicUrl(fname).data.publicUrl;
      const { error: dbErr } = await supabase.from('user_photos').insert([{
        sender_name: form.name.trim(),
        caption: form.caption.trim() || null,
        instagram: form.instagram.trim() || null,
        image_url: url,
        approved: false,
      }]);
      if (dbErr) throw dbErr;
      setDone(true);
    } catch(err) {
      setError('Gagal mengirim: ' + err.message);
    }
    setSubmitting(false);
  };

  return (
    <div style={{
      minHeight:'100vh', background:'#0f0f0e', color:'#f0efe8',
      fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",
      display:'flex', flexDirection:'column',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Fraunces:ital,wght@0,700;1,400&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:#0f0f0e;}
        a{color:inherit;}

        .sp-nav{
          display:flex;align-items:center;justify-content:space-between;
          padding:0 32px;height:60px;border-bottom:1px solid rgba(255,255,255,.07);
          position:sticky;top:0;background:#0f0f0e;z-index:10;
          backdrop-filter:blur(12px);
        }
        .sp-logo{font-family:'Fraunces',serif;font-size:20px;font-weight:700;
          text-decoration:none;color:#f0efe8;letter-spacing:-.5px;}
        .sp-logo em{font-style:normal;color:#d4eb00;}
        .sp-back{font-size:12px;font-weight:700;color:#909088;text-decoration:none;
          display:flex;align-items:center;gap:6px;transition:color .2s;}
        .sp-back:hover{color:#f0efe8;}

        .sp-hero{
          padding:64px 32px 40px;text-align:center;max-width:560px;margin:0 auto;
        }
        .sp-eyebrow{font-size:11px;font-weight:800;letter-spacing:.15em;text-transform:uppercase;
          color:#d4eb00;margin-bottom:12px;}
        .sp-h1{font-family:'Fraunces',serif;font-size:clamp(32px,6vw,52px);font-weight:700;
          line-height:1.05;color:#f0efe8;margin-bottom:12px;}
        .sp-h1 em{font-style:italic;font-weight:400;color:#909088;}
        .sp-sub{font-size:14px;color:#909088;line-height:1.65;}

        .sp-card{
          max-width:520px;margin:0 auto 60px;padding:0 24px;
        }
        .sp-form{display:flex;flex-direction:column;gap:14px;}

        .sp-label{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;
          color:#909088;margin-bottom:6px;display:block;}
        .sp-input{
          width:100%;padding:12px 16px;background:#1c1c1a;border:1px solid rgba(255,255,255,.1);
          border-radius:10px;font-family:inherit;font-size:14px;color:#f0efe8;outline:none;
          transition:border-color .2s;
        }
        .sp-input:focus{border-color:#d4eb00;}
        .sp-input::placeholder{color:#555550;}

        .sp-dropzone{
          border:2px dashed rgba(255,255,255,.15);border-radius:14px;
          padding:32px 20px;text-align:center;cursor:pointer;transition:all .2s;
          background:#161615;position:relative;
        }
        .sp-dropzone:hover,.sp-dropzone.drag{border-color:#d4eb00;background:#1c1c1a;}
        .sp-drop-icon{font-size:36px;margin-bottom:10px;}
        .sp-drop-text{font-size:13px;color:#909088;font-weight:600;}
        .sp-drop-sub{font-size:11px;color:#555550;margin-top:4px;}
        .sp-file-input{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%;}

        .sp-preview{
          position:relative;border-radius:14px;overflow:hidden;aspect-ratio:4/3;background:#1c1c1a;
        }
        .sp-preview img{width:100%;height:100%;object-fit:cover;}
        .sp-preview-remove{
          position:absolute;top:8px;right:8px;width:28px;height:28px;border-radius:50%;
          background:rgba(0,0,0,.7);border:none;color:#fff;font-size:14px;cursor:pointer;
          display:flex;align-items:center;justify-content:center;
        }

        .sp-submit{
          width:100%;padding:15px;background:#d4eb00;color:#0d0d0d;border:none;
          border-radius:12px;font-family:inherit;font-size:15px;font-weight:800;
          cursor:pointer;transition:all .2s;
        }
        .sp-submit:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 24px rgba(212,235,0,.3);}
        .sp-submit:disabled{opacity:.5;cursor:not-allowed;}

        .sp-error{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);
          border-radius:10px;padding:12px 16px;font-size:13px;color:#f87171;font-weight:600;}

        .sp-success{
          text-align:center;padding:60px 24px;max-width:440px;margin:0 auto;
        }
        .sp-success-icon{font-size:64px;margin-bottom:20px;}
        .sp-success-h{font-family:'Fraunces',serif;font-size:28px;font-weight:700;margin-bottom:10px;}
        .sp-success-p{font-size:14px;color:#909088;line-height:1.65;margin-bottom:24px;}
        .sp-success-btn{
          display:inline-block;padding:12px 24px;background:#d4eb00;color:#0d0d0d;
          border-radius:100px;font-weight:800;font-size:13px;text-decoration:none;
        }

        .sp-footer{
          margin-top:auto;padding:20px 32px;border-top:1px solid rgba(255,255,255,.07);
          text-align:center;font-size:12px;color:#555550;
        }
        .sp-footer a{color:#909088;text-decoration:none;font-weight:700;}
        .sp-footer a:hover{color:#d4eb00;}

        .sp-info{background:#1c1c1a;border:1px solid rgba(255,255,255,.07);border-radius:12px;
          padding:14px 16px;font-size:12px;color:#909088;line-height:1.6;}
        .sp-info strong{color:#f0efe8;}

        @media(max-width:480px){
          .sp-nav{padding:0 16px;}
          .sp-hero{padding:40px 16px 28px;}
          .sp-card{padding:0 16px;}
        }
      `}</style>

      {/* NAV */}
      <nav className="sp-nav">
        <a href="/" className="sp-logo">aura<em>au</em>varose</a>
        <a href="/#gallery" className="sp-back">← Lihat Galeri</a>
      </nav>

      {!done ? (
        <>
          {/* HERO */}
          <div className="sp-hero">
            <p className="sp-eyebrow">📸 Galeri Komunitas</p>
            <h1 className="sp-h1">Kirim <em>Fotomu</em><br/>ke Sini</h1>
            <p className="sp-sub">
              Foto kamu akan ditampilkan di galeri setelah disetujui admin.
              Bisa foto selfie, bareng teman, atau momen apapun!
            </p>
          </div>

          {/* FORM */}
          <div className="sp-card">
            <form className="sp-form" onSubmit={handleSubmit}>

              {/* Info box */}
              <div className="sp-info">
                <strong>📋 Panduan singkat:</strong><br/>
                Foto bebas tema — selfie, bareng teman, dll. Format JPG/PNG, maksimal 8MB.
                Foto yang tidak sesuai akan ditolak admin.
              </div>

              {/* Name */}
              <div>
                <label className="sp-label">Nama kamu *</label>
                <input
                  className="sp-input"
                  placeholder="Masukkan namamu..."
                  value={form.name}
                  onChange={e=>setForm(f=>({...f,name:e.target.value}))}
                  required
                />
              </div>

              {/* Instagram */}
              <div>
                <label className="sp-label">Instagram (opsional)</label>
                <input
                  className="sp-input"
                  placeholder="@usernamemu"
                  value={form.instagram}
                  onChange={e=>setForm(f=>({...f,instagram:e.target.value}))}
                />
              </div>

              {/* Caption */}
              <div>
                <label className="sp-label">Caption (opsional)</label>
                <input
                  className="sp-input"
                  placeholder="Ceritain sedikit soal fotonya..."
                  value={form.caption}
                  onChange={e=>setForm(f=>({...f,caption:e.target.value}))}
                />
              </div>

              {/* Photo */}
              <div>
                <label className="sp-label">Foto * (JPG / PNG, maks 8MB)</label>
                {!preview ? (
                  <div
                    className="sp-dropzone"
                    onDrop={handleDrop}
                    onDragOver={e=>e.preventDefault()}
                    onDragEnter={e=>e.currentTarget.classList.add('drag')}
                    onDragLeave={e=>e.currentTarget.classList.remove('drag')}
                  >
                    <input
                      ref={fileRef}
                      className="sp-file-input"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFile}
                    />
                    <div className="sp-drop-icon">🖼️</div>
                    <div className="sp-drop-text">Klik atau seret foto ke sini</div>
                    <div className="sp-drop-sub">JPG, PNG — maksimal 8MB</div>
                  </div>
                ) : (
                  <div className="sp-preview">
                    <img src={preview} alt="Preview"/>
                    <button
                      type="button"
                      className="sp-preview-remove"
                      onClick={()=>{ setFile(null); setPreview(null); if(fileRef.current) fileRef.current.value=''; }}
                    >✕</button>
                  </div>
                )}
              </div>

              {error && <div className="sp-error">{error}</div>}

              <button
                type="submit"
                className="sp-submit"
                disabled={submitting || !file || !form.name.trim()}
              >
                {submitting ? 'Mengirim...' : '📤 Kirim Foto'}
              </button>

            </form>
          </div>
        </>
      ) : (
        <div className="sp-success">
          <div className="sp-success-icon">🎉</div>
          <h2 className="sp-success-h">Foto Terkirim!</h2>
          <p className="sp-success-p">
            Terima kasih sudah mengirim foto, <strong>{form.name}</strong>!<br/>
            Foto kamu sedang menunggu persetujuan admin dan akan segera muncul di galeri.
          </p>
          <a href="/#gallery" className="sp-success-btn">Lihat Galeri →</a>
        </div>
      )}

      <footer className="sp-footer">
        <a href="/">auraauvarose.vercel.app</a> · Galeri Komunitas
      </footer>
    </div>
  );
}