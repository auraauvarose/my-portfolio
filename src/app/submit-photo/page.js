"use client";
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import BackgroundCanvas from '@/components/animations/BackgroundCanvas';

export default function SubmitPhoto() {
  const [form, setForm] = useState({ name: '', caption: '', instagram: '' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  // Custom Appearance Settings
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('default_theme');
      if (saved) return saved === 'dark';
    }
    return true;
  });
  const [themeColor, setThemeColor] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme_color') || '#d4eb00';
    }
    return '#d4eb00';
  });
  const [bgTheme, setBgTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('bg_theme') || 'default';
    }
    return 'default';
  });
  const [fontChoice, setFontChoice] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('font_choice') || 'fraunces';
    }
    return 'fraunces';
  });
  const [bgAnimation, setBgAnimation] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('bg_animation') || 'none';
    }
    return 'none';
  });
  const [pageReady, setPageReady] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data: settingsData } = await supabase.from('settings').select('key,value');
        if (settingsData) {
          settingsData.forEach(row => {
            if (row.key === 'theme_color' && row.value) { setThemeColor(row.value); localStorage.setItem('theme_color', row.value); }
            if (row.key === 'bg_theme' && row.value) { setBgTheme(row.value); localStorage.setItem('bg_theme', row.value); }
            if (row.key === 'font_choice' && row.value) { setFontChoice(row.value); localStorage.setItem('font_choice', row.value); }
            if (row.key === 'default_theme' && row.value) { setIsDark(row.value === 'dark'); localStorage.setItem('default_theme', row.value); }
            if (row.key === 'bg_animation' && row.value) { setBgAnimation(row.value); localStorage.setItem('bg_animation', row.value); }
          });
        }
      } catch (e) {
        console.error("Gagal memuat pengaturan tema:", e);
      }
      setPageReady(true);
    };
    loadSettings();
  }, []);

  const handleBack = (e) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      if (document.referrer && document.referrer.includes(window.location.host)) {
        window.history.back();
      } else {
        window.location.href = '/gallery';
      }
    }
  };

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

  const BG_THEMES = {
    default:  { darkBg:'#111110', darkBg2:'#1c1c1a', lightBg:'#ffffff',  lightBg2:'#f4f4f0' },
    warm:     { darkBg:'#1a1410', darkBg2:'#271e14', lightBg:'#f5f0e8',  lightBg2:'#ece5d5' },
    navy:     { darkBg:'#0d1117', darkBg2:'#161b22', lightBg:'#fdf6e3',  lightBg2:'#f0e8cc' },
    forest:   { darkBg:'#0d1a0f', darkBg2:'#142518', lightBg:'#f0f7f0',  lightBg2:'#dceadc' },
    slate:    { darkBg:'#0f1117', darkBg2:'#181c27', lightBg:'#f8f9fb',  lightBg2:'#eaedf2' },
    mocha:    { darkBg:'#1c1510', darkBg2:'#2a1e14', lightBg:'#faf3e8',  lightBg2:'#ede0cc' },
    midnight: { darkBg:'#0a0a14', darkBg2:'#12121f', lightBg:'#f0eeff',  lightBg2:'#e3ddff' },
    rose_bg:  { darkBg:'#180d12', darkBg2:'#25101a', lightBg:'#fff0f4',  lightBg2:'#ffe0ea' },
    ash:      { darkBg:'#141414', darkBg2:'#1f1f1f', lightBg:'#f5f5f5',  lightBg2:'#ebebeb' },
    obsidian: { darkBg:'#0c0c0c', darkBg2:'#181818', lightBg:'#fffde8',  lightBg2:'#fff9cc' },
    aurora:   { darkBg:'#060d14', darkBg2:'#0d1a24', lightBg:'#e8fff9',  lightBg2:'#ccfff0' },
    sangria:  { darkBg:'#1a0a0a', darkBg2:'#2a1010', lightBg:'#fff3ee',  lightBg2:'#ffe5d8' },
    dusk:     { darkBg:'#120d06', darkBg2:'#1e1508', lightBg:'#fff8f0',  lightBg2:'#ffecda' },
    sage_olive:         { darkBg:'#1A2517', darkBg2:'#243320', lightBg:'#ACC8A2',  lightBg2:'#9ab891' },
    pumpkin_charcoal:   { darkBg:'#233D4C', darkBg2:'#1a2e39', lightBg:'#FD802E',  lightBg2:'#ffe0cc' },
    honey_black:        { darkBg:'#171717', darkBg2:'#202020', lightBg:'#E3C586',  lightBg2:'#d4b06a' },
    periwinkle_violet:  { darkBg:'#544470', darkBg2:'#3e3354', lightBg:'#DBD5F2',  lightBg2:'#ccc4eb' },
    cyberpunk:          { darkBg:'#0b0914', darkBg2:'#151226', lightBg:'#fff0fa',  lightBg2:'#ffe3f4' },
    nordic:             { darkBg:'#0b1016', darkBg2:'#141b25', lightBg:'#f0f5fa',  lightBg2:'#e1ecf5' },
    matcha:             { darkBg:'#0e150f', darkBg2:'#18231a', lightBg:'#f4f8f4',  lightBg2:'#e5efe5' },
    dracula:            { darkBg:'#13141f', darkBg2:'#1a1c2c', lightBg:'#f2f3f9',  lightBg2:'#e2e5f3' },
    sakura:             { darkBg:'#1a0f14', darkBg2:'#28161f', lightBg:'#fff3f6',  lightBg2:'#ffe3eb' },
  };

  const FONTS = {
    fraunces:  { heading: "'Fraunces',serif",           body: "'Plus Jakarta Sans',sans-serif" },
    playfair:  { heading: "'Playfair Display',serif",   body: "'Inter',sans-serif" },
    space:     { heading: "'Space Grotesk',sans-serif",  body: "'Space Grotesk',sans-serif" },
    syne:      { heading: "'Syne',sans-serif",          body: "'DM Sans',sans-serif" },
    cormorant: { heading: "'Cormorant Garamond',serif",  body: "'Lato',sans-serif" },
    sugo:      { heading: "'Bebas Neue',sans-serif",     body: "'Inter',sans-serif" },
    wildcat:   { heading: "'Teko',sans-serif",           body: "'Nunito',sans-serif" },
    sugarpie:  { heading: "'Pacifico',cursive",          body: "'Plus Jakarta Sans',sans-serif" },
    tan:       { heading: "'Libre Caslon Display',serif", body: "'Libre Caslon Text',serif" },
    monospace: { heading: "'JetBrains Mono',monospace",   body: "'Fira Code',monospace" },
    retro:     { heading: "'Press Start 2P',cursive",    body: "'VT323',monospace" },
    luxury:    { heading: "'Cinzel',serif",              body: "'Crimson Text',serif" }
  };

  const activeBg = BG_THEMES[bgTheme] || BG_THEMES.default;
  const currentBg = isDark ? activeBg.darkBg : activeBg.lightBg;
  const currentBg2 = isDark ? activeBg.darkBg2 : activeBg.lightBg2;

  const curFont = FONTS[fontChoice] || FONTS.fraunces;
  const fontBody = curFont.body;
  const fontHeading = curFont.heading;

  return (
    <div style={{
      minHeight:'100vh', background: currentBg, color: isDark ? '#f0efe8' : '#1a1a1a',
      fontFamily: fontBody,
      display:'flex', flexDirection:'column',
      transition: 'background 0.3s, color 0.3s',
      position: 'relative',
    }}>
      <style>{`
        :root {
          --acc: var(--accent-color, ${themeColor});
          --acc-33: color-mix(in srgb, var(--acc) 20%, transparent);
          --acc-55: color-mix(in srgb, var(--acc) 33%, transparent);
        }
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,900;1,9..144,400;1,9..144,700&family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=Inter:wght@400;600;700&family=Space+Grotesk:wght@400;600;700;800&family=Syne:wght@700;800&family=DM+Sans:wght@400;500;700&family=Cormorant+Garamond:ital,wght@0,700;1,400&family=Lato:wght@400;700&family=Bebas+Neue&family=Teko:wght@400;600;700&family=Pacifico&family=Libre+Caslon+Display&family=Libre+Caslon+Text:wght@400;700&family=Nunito:wght@400;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        a{color:inherit;}

        .sp-nav{
          display:flex;align-items:center;justify-content:space-between;
          padding:0 32px;height:60px;border-bottom:1px solid ${isDark ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.07)'};
          position:sticky;top:0;background:${currentBg};z-index:10;
          backdrop-filter:blur(12px);
          transition: background 0.3s, border-color 0.3s;
        }
        .sp-logo{font-family:${fontHeading};font-size:20px;font-weight:700;
          text-decoration:none;color:${isDark ? '#f0efe8' : '#1a1a1a'};letter-spacing:-.5px;
          transition: color 0.3s;}
        .sp-logo em{font-style:normal;color:var(--acc);}
        .sp-back{
          font-size:12px;font-weight:700;color:${isDark ? '#909088' : '#555555'};text-decoration:none;
          display:flex;align-items:center;gap:6px;transition:all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          padding: 8px 18px; border: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'};
          background: ${currentBg2}; border-radius: 100px;
        }
        .sp-back:hover{
          color:${isDark ? '#f0efe8' : '#1a1a1a'};
          border-color: var(--acc);
          transform: translateX(-4px);
        }

        .sp-hero{
          padding:64px 32px 40px;text-align:center;max-width:560px;margin:0 auto;
          position: relative; z-index: 2;
        }
        .sp-eyebrow{font-size:11px;font-weight:800;letter-spacing:.15em;text-transform:uppercase;
          color:var(--acc);margin-bottom:12px;}
        .sp-h1{font-family:${fontHeading};font-size:clamp(32px,6vw,52px);font-weight:700;
          line-height:1.05;color:${isDark ? '#f0efe8' : '#1a1a1a'};margin-bottom:12px;
          transition: color 0.3s;}
        .sp-h1 em{font-style:italic;font-weight:400;color:${isDark ? '#909088' : '#555555'};}
        .sp-sub{font-size:14px;color:${isDark ? '#909088' : '#555555'};line-height:1.65;
          transition: color 0.3s;}

        .sp-card{
          max-width:520px;margin:0 auto 60px;padding:0 24px;
          position: relative; z-index: 2;
        }
        .sp-form{display:flex;flex-direction:column;gap:14px;}

        .sp-label{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;
          color:${isDark ? '#909088' : '#555555'};margin-bottom:6px;display:block;}
        .sp-input{
          width:100%;padding:12px 16px;background:${currentBg2};border:1px solid ${isDark ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.1)'};
          border-radius:10px;font-family:inherit;font-size:14px;color:${isDark ? '#f0efe8' : '#1a1a1a'};outline:none;
          transition: all 0.3s;
        }
        .sp-input:focus{border-color:var(--acc);}
        .sp-input::placeholder{color:${isDark ? '#555550' : '#b0b0a8'};}

        .sp-dropzone{
          border:2px dashed ${isDark ? 'rgba(255,255,255,.15)' : 'rgba(0,0,0,.15)'};border-radius:14px;
          padding:32px 20px;text-align:center;cursor:pointer;transition:all 0.2s;
          background:${currentBg2};position:relative;
        }
        .sp-dropzone:hover,.sp-dropzone.drag{border-color:var(--acc);background:${currentBg2};filter: brightness(1.05);}
        .sp-drop-icon{font-size:36px;margin-bottom:10px;}
        .sp-drop-text{font-size:13px;color:${isDark ? '#909088' : '#555555'};font-weight:600;}
        .sp-drop-sub{font-size:11px;color:${isDark ? '#555550' : '#b0b0a8'};margin-top:4px;}
        .sp-file-input{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%;}

        .sp-preview{
          position:relative;border-radius:14px;overflow:hidden;aspect-ratio:4/3;background:${currentBg2};
        }
        .sp-preview img{width:100%;height:100%;object-fit:cover;}
        .sp-preview-remove{
          position:absolute;top:8px;right:8px;width:28px;height:28px;border-radius:50%;
          background:rgba(0,0,0,.7);border:none;color:#fff;font-size:14px;cursor:pointer;
          display:flex;align-items:center;justify-content:center;
        }

        .sp-submit{
          width:100%;padding:15px;background:var(--acc);color:#0d0d0d;border:none;
          border-radius:12px;font-family:inherit;font-size:15px;font-weight:800;
          cursor:pointer;transition:all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .sp-submit:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 24px var(--acc-55);}
        .sp-submit:disabled{opacity:.5;cursor:not-allowed;}

        .sp-error{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);
          border-radius:10px;padding:12px 16px;font-size:13px;color:#f87171;font-weight:600;}

        .sp-success{
          text-align:center;padding:60px 24px;max-width:440px;margin:60px auto;
          position: relative; z-index: 2;
        }
        .sp-success-icon{font-size:64px;margin-bottom:20px;}
        .sp-success-h{font-family:${fontHeading};font-size:28px;font-weight:700;margin-bottom:10px;color:${isDark ? '#f0efe8' : '#1a1a1a'};}
        .sp-success-p{font-size:14px;color:${isDark ? '#909088' : '#555555'};line-height:1.65;margin-bottom:24px;}
        .sp-success-btn{
          display:inline-block;padding:12px 24px;background:var(--acc);color:#0d0d0d;
          border-radius:100px;font-weight:800;font-size:13px;text-decoration:none;
          box-shadow:0 4px 12px var(--acc-33);transition:all .25s;
        }
        .sp-success-btn:hover{transform:translateY(-2px);box-shadow:0 8px 20px var(--acc-55);}

        .sp-footer{
          margin-top:auto;padding:20px 32px;border-top:1px solid ${isDark ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.07)'};
          text-align:center;font-size:12px;color:${isDark ? '#555550' : '#b0b0a8'};
          position: relative; z-index: 2;
          transition: border-color 0.3s;
        }
        .sp-footer a{color:${isDark ? '#909088' : '#555555'};text-decoration:none;font-weight:700;}
        .sp-footer a:hover{color:var(--acc);}

        .sp-info{background:${currentBg2};border:1px solid ${isDark ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.07)'};border-radius:12px;
          padding:14px 16px;font-size:12px;color:${isDark ? '#909088' : '#555555'};line-height:1.6;
          transition: all 0.3s;}
        .sp-info strong{color:${isDark ? '#f0efe8' : '#1a1a1a'};}

        @media(max-width:480px){
          .sp-nav{padding:0 16px;}
          .sp-hero{padding:40px 16px 28px;}
          .sp-card{padding:0 16px;}
        }
      `}</style>

      {pageReady && (
        <BackgroundCanvas bgAnimation={bgAnimation} themeColor={themeColor} isDark={isDark} />
      )}

      {/* NAV */}
      <nav className="sp-nav">
        <a href="/" className="sp-logo">aura<em>a</em>uvarose</a>
        <a href="/gallery" onClick={handleBack} className="sp-back">← Kembali</a>
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
          <a href="/gallery" className="sp-success-btn">Lihat Galeri →</a>
        </div>
      )}

      <footer className="sp-footer">
        <a href="/">auraauvarose.vercel.app</a> · Galeri Komunitas
      </footer>
    </div>
  );
}