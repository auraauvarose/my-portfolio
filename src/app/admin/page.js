"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isDark, setIsDark] = useState(true);
  const [activeTab, setActiveTab] = useState('certs'); // 'certs' | 'projects'
  const [isLoading, setIsLoading] = useState(false);

  // Certs state
  const [certificates, setCertificates] = useState([]);
  const [certForm, setCertForm] = useState({ image_url: '', title: '', issuer: '' });
  const [certSuccess, setCertSuccess] = useState(false);

  // Projects state
  const [projects, setProjects] = useState([]);
  const [projForm, setProjForm] = useState({ title: '', description: '', tech_stack: '', github_url: '', demo_url: '', image_url: '' });
  const [projSuccess, setProjSuccess] = useState(false);

  const d = isDark;

  useEffect(() => {
    document.documentElement.style.background = d ? '#111110' : '#f7f6f1';
    document.body.style.background = d ? '#111110' : '#f7f6f1';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
  }, [d]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'aura123') {
      setIsAuthenticated(true);
      setLoginError('');
      fetchAll();
    } else {
      setLoginError('Password salah. Coba lagi.');
    }
  };

  const fetchAll = async () => {
    setIsLoading(true);
    const [certsRes, projsRes] = await Promise.all([
      supabase.from('certificates').select('*').order('created_at', { ascending: false }),
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
    ]);
    if (certsRes.data) setCertificates(certsRes.data);
    if (projsRes.data) setProjects(projsRes.data);
    setIsLoading(false);
  };

  const handleAddCert = async (e) => {
    e.preventDefault();
    if (!certForm.image_url) return;
    setIsLoading(true);
    await supabase.from('certificates').insert([certForm]);
    setCertForm({ image_url: '', title: '', issuer: '' });
    setCertSuccess(true);
    setTimeout(() => setCertSuccess(false), 3000);
    const { data } = await supabase.from('certificates').select('*').order('created_at', { ascending: false });
    if (data) setCertificates(data);
    setIsLoading(false);
  };

  const handleDeleteCert = async (id) => {
    if (confirm('Yakin mau hapus sertifikat ini?')) {
      await supabase.from('certificates').delete().eq('id', id);
      const { data } = await supabase.from('certificates').select('*').order('created_at', { ascending: false });
      if (data) setCertificates(data);
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!projForm.title) return;
    setIsLoading(true);
    await supabase.from('projects').insert([projForm]);
    setProjForm({ title: '', description: '', tech_stack: '', github_url: '', demo_url: '', image_url: '' });
    setProjSuccess(true);
    setTimeout(() => setProjSuccess(false), 3000);
    const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    if (data) setProjects(data);
    setIsLoading(false);
  };

  const handleDeleteProject = async (id) => {
    if (confirm('Yakin mau hapus proyek ini?')) {
      await supabase.from('projects').delete().eq('id', id);
      const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      if (data) setProjects(data);
    }
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,900;1,9..144,400;1,9..144,700&display=swap');
    *,*::before,*::after{box-sizing:border-box;}
    html,body{margin:0;padding:0;width:100%;}
    body{cursor:url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="cyan" stroke="white" stroke-width="1.5"><path d="M3 3l7 17 2.5-7.5L20 10z"/></svg>'),auto;}
    a,button{cursor:url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="magenta" stroke="white" stroke-width="1.5"><path d="M3 3l7 17 2.5-7.5L20 10z"/></svg>'),pointer;}

    .aw{
      --acc:#d4eb00;--acc-bg:rgba(212,235,0,0.1);
      --ink:#0d0d0d;--ink2:#717171;--ink3:#aaaaaa;
      --bg:#f7f6f1;--bg2:#eeeee8;--bd:rgba(0,0,0,0.08);
      font-family:'Plus Jakarta Sans',sans-serif;
      background:var(--bg);color:var(--ink);min-height:100vh;width:100%;
      transition:background 0.4s,color 0.4s;
    }
    .aw.dark{
      --ink:#f0efe8;--ink2:#888880;--ink3:#555550;
      --bg:#111110;--bg2:#1c1c1a;--bd:rgba(255,255,255,0.07);
    }

    /* NAV */
    .anav{position:fixed;top:0;left:0;right:0;z-index:50;background:var(--bg);border-bottom:1px solid var(--bd);transition:background 0.4s;}
    .anav-in{max-width:1140px;margin:0 auto;padding:0 48px;height:64px;display:flex;align-items:center;justify-content:space-between;}
    .alogo{font-family:'Fraunces',serif;font-size:22px;font-weight:900;color:var(--ink);text-decoration:none;letter-spacing:-0.5px;}
    .alogo em{font-style:normal;color:var(--acc);}
    .alogo-badge{font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--ink2);padding:4px 12px;border:1px solid var(--bd);background:var(--bg2);border-radius:100px;}
    .anav-right{display:flex;align-items:center;gap:10px;}
    .btn-site{padding:8px 18px;background:transparent;border:1px solid var(--bd);color:var(--ink2);border-radius:100px;font-family:inherit;font-size:12px;font-weight:700;text-decoration:none;display:flex;align-items:center;gap:4px;transition:all 0.2s;}
    .btn-site:hover{color:var(--ink);border-color:var(--ink);}
    .btn-theme-a{padding:8px 18px;border:1px solid var(--bd);background:var(--bg2);color:var(--ink);border-radius:100px;font-family:inherit;font-size:12px;font-weight:700;transition:all 0.2s;}
    .btn-theme-a:hover{transform:translateY(-1px);}

    .awrap{max-width:1140px;margin:0 auto;padding:0 48px;}

    /* LOADING BAR */
    .lbar{position:fixed;top:64px;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--acc),transparent);background-size:200% 100%;animation:shimmer 1.2s ease infinite;z-index:100;}
    @keyframes shimmer{0%{background-position:200% 0;}100%{background-position:-200% 0;}}

    /* LOGIN */
    .login-outer{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;}
    .login-card{width:100%;max-width:440px;padding:52px 44px;background:var(--bg2);border:1px solid var(--bd);border-radius:24px;animation:up 0.5s ease;}
    .l-eyebrow{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:var(--ink2);margin-bottom:12px;}
    .l-title{font-family:'Fraunces',serif;font-size:44px;font-weight:900;line-height:0.95;letter-spacing:-0.02em;color:var(--ink);margin:0 0 32px;}
    .l-title em{font-style:italic;font-weight:400;color:var(--ink2);}
    .f-label{display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--ink2);margin-bottom:8px;}
    .f-input{width:100%;padding:15px 18px;background:var(--bg);border:1px solid var(--bd);color:var(--ink);border-radius:14px;font-family:inherit;font-size:15px;letter-spacing:3px;outline:none;transition:border-color 0.2s,box-shadow 0.2s;margin-bottom:16px;}
    .f-input::placeholder{letter-spacing:0;color:var(--ink3);}
    .f-input:focus{border-color:var(--ink);box-shadow:0 0 0 3px var(--acc-bg);}
    .l-error{display:flex;align-items:center;gap:8px;padding:12px 16px;border-radius:12px;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);color:#dc2626;font-size:13px;font-weight:600;margin-bottom:16px;}
    .btn-submit{width:100%;padding:16px;background:var(--ink);color:var(--bg);border:none;border-radius:14px;font-family:inherit;font-size:14px;font-weight:700;letter-spacing:0.04em;transition:all 0.2s;}
    .btn-submit:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.15);}

    /* DASH HEADER */
    .dash-hdr{padding-top:96px;padding-bottom:48px;border-bottom:1px solid var(--bd);}
    .d-eyebrow{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:var(--ink2);margin-bottom:10px;}
    .d-title{font-family:'Fraunces',serif;font-size:clamp(36px,5vw,60px);font-weight:900;line-height:0.95;letter-spacing:-0.02em;color:var(--ink);margin:0;}
    .d-title em{font-style:italic;font-weight:400;color:var(--ink2);}

    /* STATS */
    .dstats{display:grid;grid-template-columns:repeat(4,1fr);border-bottom:1px solid var(--bd);}
    .dstat{padding:32px 0;text-align:center;border-right:1px solid var(--bd);animation:up 0.5s ease both;}
    .dstat:last-child{border-right:none;}
    .dstat-n{font-family:'Fraunces',serif;font-size:40px;font-weight:900;color:var(--ink);line-height:1;margin-bottom:4px;}
    .dstat-l{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--ink2);}

    /* TABS */
    .tabs{display:flex;gap:0;border-bottom:1px solid var(--bd);margin-top:40px;}
    .tab-btn{
      padding:16px 32px;background:transparent;border:none;
      font-family:inherit;font-size:14px;font-weight:700;
      color:var(--ink2);letter-spacing:0.04em;
      border-bottom:2px solid transparent;margin-bottom:-1px;
      transition:all 0.2s;
    }
    .tab-btn:hover{color:var(--ink);}
    .tab-btn.active{color:var(--ink);border-bottom-color:var(--acc);}
    .tab-count{
      display:inline-flex;align-items:center;justify-content:center;
      width:22px;height:22px;border-radius:100px;
      background:var(--bg2);font-size:11px;font-weight:700;
      color:var(--ink2);margin-left:8px;
    }
    .tab-btn.active .tab-count{background:var(--acc);color:#0d0d0d;}

    /* PANEL */
    .panel{padding:44px 0;border-bottom:1px solid var(--bd);}
    .panel-title{font-family:'Fraunces',serif;font-size:24px;font-weight:900;color:var(--ink);margin:0 0 24px;letter-spacing:-0.01em;}

    /* FORMS */
    .form-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
    .form-full{grid-column:1/-1;}
    .fg{margin-bottom:0;}
    .fl{display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--ink2);margin-bottom:8px;}
    .fi,.ft{width:100%;padding:14px 16px;background:var(--bg2);border:1px solid var(--bd);color:var(--ink);border-radius:12px;font-family:inherit;font-size:14px;outline:none;transition:border-color 0.2s,box-shadow 0.2s;}
    .fi::placeholder,.ft::placeholder{color:var(--ink3);}
    .fi:focus,.ft:focus{border-color:var(--ink);box-shadow:0 0 0 3px var(--acc-bg);}
    .ft{height:100px;resize:vertical;}
    .form-actions{display:flex;align-items:center;gap:12px;margin-top:20px;}
    .btn-add{padding:14px 28px;background:var(--ink);color:var(--bg);border:none;border-radius:12px;font-family:inherit;font-size:13px;font-weight:700;transition:all 0.2s;}
    .btn-add:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.15);}
    .btn-add:disabled{opacity:0.6;}
    .success-toast{display:flex;align-items:center;gap:8px;padding:12px 16px;border-radius:12px;background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.2);color:#16a34a;font-size:13px;font-weight:600;animation:up 0.3s ease;}

    /* GRID */
    .items-grid{padding:40px 0;display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px;}

    /* CERT CARD */
    .ac-card{background:var(--bg2);border:1px solid var(--bd);border-radius:20px;overflow:hidden;animation:up 0.4s ease both;transition:transform 0.2s;}
    .ac-card:hover{transform:translateY(-3px);}
    .ac-thumb{aspect-ratio:16/10;overflow:hidden;position:relative;}
    .ac-thumb img{width:100%;height:100%;object-fit:cover;transition:filter 0.3s;}
    .ac-card:hover .ac-thumb img{filter:brightness(0.5);}
    .ac-overlay{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.2s;}
    .ac-card:hover .ac-overlay{opacity:1;}
    .btn-del{padding:10px 20px;background:#ef4444;color:white;border:none;border-radius:100px;font-family:inherit;font-size:12px;font-weight:700;display:flex;align-items:center;gap:6px;transition:background 0.2s;}
    .btn-del:hover{background:#dc2626;}
    .ac-foot{padding:14px 18px;}
    .ac-foot-title{font-size:14px;font-weight:700;color:var(--ink);margin-bottom:3px;}
    .ac-foot-issuer{font-size:12px;color:var(--ink2);}

    /* PROJECT CARD */
    .ap-card{background:var(--bg2);border:1px solid var(--bd);border-radius:20px;overflow:hidden;animation:up 0.4s ease both;transition:transform 0.2s;}
    .ap-card:hover{transform:translateY(-3px);}
    .ap-thumb{aspect-ratio:16/9;overflow:hidden;position:relative;background:var(--bg);}
    .ap-thumb img{width:100%;height:100%;object-fit:cover;transition:filter 0.3s;}
    .ap-card:hover .ap-thumb img{filter:brightness(0.5);}
    .ap-thumb-empty{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-family:'Fraunces',serif;font-size:40px;font-weight:900;color:var(--bd);}
    .ap-overlay{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.2s;}
    .ap-card:hover .ap-overlay{opacity:1;}
    .ap-body{padding:16px 18px;}
    .ap-title{font-size:15px;font-weight:700;color:var(--ink);margin-bottom:6px;}
    .ap-desc{font-size:12px;color:var(--ink2);line-height:1.5;margin-bottom:10px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
    .ap-stack{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:10px;}
    .ap-chip{padding:3px 10px;background:var(--bg);border:1px solid var(--bd);border-radius:100px;font-size:10px;font-weight:700;color:var(--ink3);}
    .ap-links{display:flex;gap:8px;}
    .ap-link{font-size:11px;font-weight:700;color:var(--ink2);text-decoration:none;padding:5px 10px;border:1px solid var(--bd);border-radius:100px;transition:all 0.2s;}
    .ap-link:hover{color:var(--ink);border-color:var(--ink);}

    /* EMPTY */
    .empty-state{padding:80px;text-align:center;border:1px dashed var(--bd);border-radius:20px;color:var(--ink2);font-size:14px;grid-column:1/-1;}

    /* ANIMATIONS */
    @keyframes up{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}

    /* RESPONSIVE */
    @media(max-width:768px){
      .awrap{padding:0 20px;}
      .anav-in{padding:0 20px;}
      .form-grid{grid-template-columns:1fr;}
      .dstats{grid-template-columns:1fr 1fr;}
      .dstat:nth-child(2){border-right:none;}
      .dstat:nth-child(4){border-right:none;}
      .tabs{overflow-x:auto;}
    }
  `;

  // ── LOGIN ──
  if (!isAuthenticated) {
    return (
      <>
        <style>{css}</style>
        <div className={`aw${d ? ' dark' : ''}`}>
          <nav className="anav">
            <div className="anav-in">
              <a href="/" className="alogo">Aura<em>.</em></a>
              <div className="anav-right">
                <span className="alogo-badge">Admin</span>
                <button className="btn-theme-a" onClick={() => setIsDark(!d)}>{d ? '☀ Light' : '🌙 Dark'}</button>
              </div>
            </div>
          </nav>
          <div className="login-outer">
            <form onSubmit={handleLogin} className="login-card">
              <p className="l-eyebrow">Akses Terbatas</p>
              <h1 className="l-title">Ruang<br /><em>Admin</em></h1>
              <label className="f-label">Password</label>
              <input type="password" placeholder="Masukkan password..." value={password} onChange={e => { setPassword(e.target.value); setLoginError(''); }} className="f-input" required />
              {loginError && <div className="l-error">⚠ {loginError}</div>}
              <button type="submit" className="btn-submit">Masuk ke Dashboard →</button>
            </form>
          </div>
        </div>
      </>
    );
  }

  // ── DASHBOARD ──
  return (
    <>
      <style>{css}</style>
      <div className={`aw${d ? ' dark' : ''}`}>

        <nav className="anav">
          <div className="anav-in">
            <a href="/" className="alogo">Aura<em>.</em></a>
            <div className="anav-right">
              <a href="/" className="btn-site">← Lihat Site</a>
              <span className="alogo-badge">Dashboard</span>
              <button className="btn-theme-a" onClick={() => setIsDark(!d)}>{d ? '☀ Light' : '🌙 Dark'}</button>
            </div>
          </div>
        </nav>

        {isLoading && <div className="lbar" />}

        <div className="awrap">

          {/* HEADER */}
          <div className="dash-hdr">
            <p className="d-eyebrow">// Panel Kontrol</p>
            <h1 className="d-title">Dashboard<br /><em>Admin</em></h1>
          </div>

          {/* STATS */}
          <div className="dstats">
            {[
              { n: certificates.length, l: 'Sertifikat' },
              { n: projects.length, l: 'Proyek' },
              { n: 'Aktif', l: 'Status DB' },
              { n: 'Supabase', l: 'Backend' },
            ].map((s, i) => (
              <div key={i} className="dstat" style={{ animationDelay: `${i * 0.07}s` }}>
                <div className="dstat-n">{s.n}</div>
                <div className="dstat-l">{s.l}</div>
              </div>
            ))}
          </div>

          {/* TABS */}
          <div className="tabs">
            <button className={`tab-btn${activeTab === 'certs' ? ' active' : ''}`} onClick={() => setActiveTab('certs')}>
              Sertifikat <span className="tab-count">{certificates.length}</span>
            </button>
            <button className={`tab-btn${activeTab === 'projects' ? ' active' : ''}`} onClick={() => setActiveTab('projects')}>
              Proyek <span className="tab-count">{projects.length}</span>
            </button>
          </div>

          {/* ── TAB: SERTIFIKAT ── */}
          {activeTab === 'certs' && (
            <>
              <div className="panel">
                <h2 className="panel-title">Upload Sertifikat Baru</h2>
                <form onSubmit={handleAddCert}>
                  <div className="form-grid">
                    <div className="fg">
                      <label className="fl">Judul Sertifikat *</label>
                      <input type="text" placeholder="Cth: Sertifikat Web Development" value={certForm.title} onChange={e => setCertForm({ ...certForm, title: e.target.value })} className="fi" required />
                    </div>
                    <div className="fg">
                      <label className="fl">Diterbitkan Oleh *</label>
                      <input type="text" placeholder="Cth: Dicoding Indonesia" value={certForm.issuer} onChange={e => setCertForm({ ...certForm, issuer: e.target.value })} className="fi" required />
                    </div>
                    <div className="fg form-full">
                      <label className="fl">URL Gambar Sertifikat *</label>
                      <input type="url" placeholder="https://example.com/cert.jpg" value={certForm.image_url} onChange={e => setCertForm({ ...certForm, image_url: e.target.value })} className="fi" required />
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn-add" disabled={isLoading}>Tambahkan →</button>
                    {certSuccess && <div className="success-toast">✓ Sertifikat berhasil ditambahkan!</div>}
                  </div>
                </form>
              </div>

              <div className="items-grid">
                {certificates.length === 0 ? (
                  <div className="empty-state">Belum ada sertifikat.</div>
                ) : (
                  certificates.map((cert, i) => (
                    <div key={cert.id} className="ac-card" style={{ animationDelay: `${i * 0.05}s` }}>
                      <div className="ac-thumb">
                        <img src={cert.image_url} alt={cert.title} />
                        <div className="ac-overlay">
                          <button onClick={() => handleDeleteCert(cert.id)} className="btn-del">🗑 Hapus</button>
                        </div>
                      </div>
                      <div className="ac-foot">
                        <div className="ac-foot-title">{cert.title || 'Sertifikat'}</div>
                        <div className="ac-foot-issuer">{cert.issuer || '—'}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {/* ── TAB: PROYEK ── */}
          {activeTab === 'projects' && (
            <>
              <div className="panel">
                <h2 className="panel-title">Tambah Proyek Baru</h2>
                <form onSubmit={handleAddProject}>
                  <div className="form-grid">
                    <div className="fg">
                      <label className="fl">Nama Proyek *</label>
                      <input type="text" placeholder="Cth: E-commerce API" value={projForm.title} onChange={e => setProjForm({ ...projForm, title: e.target.value })} className="fi" required />
                    </div>
                    <div className="fg">
                      <label className="fl">Tech Stack (pisah koma)</label>
                      <input type="text" placeholder="Node.js, Express, PostgreSQL" value={projForm.tech_stack} onChange={e => setProjForm({ ...projForm, tech_stack: e.target.value })} className="fi" />
                    </div>
                    <div className="fg form-full">
                      <label className="fl">Deskripsi</label>
                      <textarea placeholder="Jelaskan proyek ini secara singkat..." value={projForm.description} onChange={e => setProjForm({ ...projForm, description: e.target.value })} className="ft" />
                    </div>
                    <div className="fg">
                      <label className="fl">Link GitHub</label>
                      <input type="url" placeholder="https://github.com/..." value={projForm.github_url} onChange={e => setProjForm({ ...projForm, github_url: e.target.value })} className="fi" />
                    </div>
                    <div className="fg">
                      <label className="fl">Link Demo / Live</label>
                      <input type="url" placeholder="https://..." value={projForm.demo_url} onChange={e => setProjForm({ ...projForm, demo_url: e.target.value })} className="fi" />
                    </div>
                    <div className="fg form-full">
                      <label className="fl">URL Thumbnail Gambar</label>
                      <input type="url" placeholder="https://example.com/screenshot.jpg" value={projForm.image_url} onChange={e => setProjForm({ ...projForm, image_url: e.target.value })} className="fi" />
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn-add" disabled={isLoading}>Tambahkan →</button>
                    {projSuccess && <div className="success-toast">✓ Proyek berhasil ditambahkan!</div>}
                  </div>
                </form>
              </div>

              <div className="items-grid">
                {projects.length === 0 ? (
                  <div className="empty-state">Belum ada proyek.</div>
                ) : (
                  projects.map((proj, i) => {
                    const stack = proj.tech_stack ? proj.tech_stack.split(',').map(s => s.trim()) : [];
                    return (
                      <div key={proj.id} className="ap-card" style={{ animationDelay: `${i * 0.05}s` }}>
                        <div className="ap-thumb">
                          {proj.image_url
                            ? <img src={proj.image_url} alt={proj.title} />
                            : <div className="ap-thumb-empty">{proj.title ? proj.title[0] : '?'}</div>
                          }
                          <div className="ap-overlay">
                            <button onClick={() => handleDeleteProject(proj.id)} className="btn-del">🗑 Hapus</button>
                          </div>
                        </div>
                        <div className="ap-body">
                          <div className="ap-title">{proj.title}</div>
                          {proj.description && <div className="ap-desc">{proj.description}</div>}
                          {stack.length > 0 && (
                            <div className="ap-stack">{stack.map(s => <span key={s} className="ap-chip">{s}</span>)}</div>
                          )}
                          <div className="ap-links">
                            {proj.github_url && <a href={proj.github_url} target="_blank" rel="noopener noreferrer" className="ap-link">GitHub ↗</a>}
                            {proj.demo_url && <a href={proj.demo_url} target="_blank" rel="noopener noreferrer" className="ap-link">Demo ↗</a>}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
}