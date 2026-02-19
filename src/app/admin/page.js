"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [certificates, setCertificates] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isDark, setIsDark] = useState(true);
  const [addSuccess, setAddSuccess] = useState(false);

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
      fetchCertificates();
    } else {
      setLoginError('Password salah. Coba lagi.');
    }
  };

  const fetchCertificates = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('certificates').select('*').order('created_at', { ascending: false });
    if (data) setCertificates(data);
    setIsLoading(false);
  };

  const handleAddCertificate = async (e) => {
    e.preventDefault();
    if (!newImageUrl) return;
    setIsLoading(true);
    await supabase.from('certificates').insert([{ image_url: newImageUrl }]);
    setNewImageUrl('');
    setAddSuccess(true);
    setTimeout(() => setAddSuccess(false), 3000);
    fetchCertificates();
  };

  const handleDelete = async (id) => {
    if (confirm('Yakin mau hapus sertifikat ini?')) {
      await supabase.from('certificates').delete().eq('id', id);
      fetchCertificates();
    }
  };

  const sharedStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,900;1,9..144,400;1,9..144,700&display=swap');

    *, *::before, *::after { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; width: 100%; }

    body {
      cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="cyan" stroke="white" stroke-width="1.5"><path d="M3 3l7 17 2.5-7.5L20 10z"/></svg>'), auto;
    }
    a, button {
      cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="magenta" stroke="white" stroke-width="1.5"><path d="M3 3l7 17 2.5-7.5L20 10z"/></svg>'), pointer;
    }

    .aw {
      --acc: #d4eb00;
      --acc-bg: rgba(212,235,0,0.1);
      --ink: #0d0d0d;
      --ink2: #717171;
      --ink3: #aaaaaa;
      --bg: #f7f6f1;
      --bg2: #eeeee8;
      --bd: rgba(0,0,0,0.08);
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: var(--bg);
      color: var(--ink);
      min-height: 100vh;
      width: 100%;
      transition: background 0.4s, color 0.4s;
    }
    .aw.dark {
      --ink: #f0efe8;
      --ink2: #888880;
      --ink3: #555550;
      --bg: #111110;
      --bg2: #1c1c1a;
      --bd: rgba(255,255,255,0.07);
    }

    /* ── NAV ── */
    .anav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 50;
      background: var(--bg); border-bottom: 1px solid var(--bd);
      transition: background 0.4s, border-color 0.4s;
    }
    .anav-in {
      max-width: 1140px; margin: 0 auto; padding: 0 48px;
      height: 64px; display: flex; align-items: center; justify-content: space-between;
    }
    .alogo {
      font-family: 'Fraunces', serif; font-size: 22px; font-weight: 900;
      color: var(--ink); text-decoration: none; letter-spacing: -0.5px;
    }
    .alogo em { font-style: normal; color: var(--acc); }
    .alogo-badge {
      font-size: 10px; font-weight: 700; letter-spacing: 0.1em;
      text-transform: uppercase; color: var(--ink2);
      padding: 4px 12px; border: 1px solid var(--bd);
      background: var(--bg2); border-radius: 100px;
    }
    .anav-right { display: flex; align-items: center; gap: 12px; }
    .theme-btn-a {
      padding: 8px 18px; border: 1px solid var(--bd);
      background: var(--bg2); color: var(--ink);
      border-radius: 100px; font-family: inherit;
      font-size: 12px; font-weight: 700; transition: all 0.2s;
    }
    .theme-btn-a:hover { transform: translateY(-1px); }

    .awrap { max-width: 1140px; margin: 0 auto; padding: 0 48px; }

    /* ── LOGIN ── */
    .login-outer {
      min-height: 100vh; display: flex;
      align-items: center; justify-content: center;
    }
    .login-card {
      width: 100%; max-width: 440px;
      padding: 52px 44px;
      background: var(--bg2);
      border: 1px solid var(--bd);
      border-radius: 24px;
      animation: up 0.5s ease;
    }
    .login-eyebrow {
      font-size: 11px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.12em; color: var(--ink2); margin-bottom: 12px;
    }
    .login-title {
      font-family: 'Fraunces', serif; font-size: 44px;
      font-weight: 900; line-height: 0.95; letter-spacing: -0.02em;
      color: var(--ink); margin: 0 0 32px;
    }
    .login-title em { font-style: italic; font-weight: 400; color: var(--ink2); }
    .login-label {
      display: block; font-size: 11px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.1em;
      color: var(--ink2); margin-bottom: 8px;
    }
    .login-input {
      width: 100%; padding: 15px 18px;
      background: var(--bg); border: 1px solid var(--bd); color: var(--ink);
      border-radius: 14px; font-family: inherit; font-size: 15px;
      letter-spacing: 3px; outline: none;
      transition: border-color 0.2s, box-shadow 0.2s; margin-bottom: 16px;
    }
    .login-input::placeholder { letter-spacing: 0; color: var(--ink3); }
    .login-input:focus { border-color: var(--ink); box-shadow: 0 0 0 3px var(--acc-bg); }
    .login-error {
      display: flex; align-items: center; gap: 8px;
      padding: 12px 16px; border-radius: 12px;
      background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
      color: #dc2626; font-size: 13px; font-weight: 600; margin-bottom: 16px;
    }
    .login-btn {
      width: 100%; padding: 16px; background: var(--ink); color: var(--bg);
      border: none; border-radius: 14px; font-family: inherit;
      font-size: 14px; font-weight: 700; letter-spacing: 0.04em; transition: all 0.2s;
    }
    .login-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.15); }

    /* ── DASHBOARD ── */
    .dash-header {
      padding-top: 100px; padding-bottom: 52px;
      border-bottom: 1px solid var(--bd);
    }
    .dash-eyebrow {
      font-size: 11px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.12em; color: var(--ink2); margin-bottom: 10px;
    }
    .dash-title {
      font-family: 'Fraunces', serif;
      font-size: clamp(40px, 5vw, 64px); font-weight: 900;
      line-height: 0.95; letter-spacing: -0.02em; color: var(--ink); margin: 0;
    }
    .dash-title em { font-style: italic; font-weight: 400; color: var(--ink2); }

    /* ── STATS BAR ── */
    .dash-stats {
      display: grid; grid-template-columns: repeat(3,1fr);
      border-bottom: 1px solid var(--bd);
    }
    .dstat {
      padding: 32px 0; text-align: center;
      border-right: 1px solid var(--bd); animation: up 0.5s ease both;
    }
    .dstat:last-child { border-right: none; }
    .dstat-n {
      font-family: 'Fraunces', serif; font-size: 40px; font-weight: 900;
      color: var(--ink); line-height: 1; margin-bottom: 4px;
    }
    .dstat-l { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--ink2); }

    /* ── ADD SECTION ── */
    .add-sec { padding: 52px 0; border-bottom: 1px solid var(--bd); }
    .add-eyebrow {
      font-size: 11px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.12em; color: var(--ink2); margin-bottom: 10px;
    }
    .add-title {
      font-family: 'Fraunces', serif; font-size: 28px; font-weight: 900;
      color: var(--ink); margin: 0 0 28px; letter-spacing: -0.01em;
    }
    .add-form { display: flex; gap: 12px; align-items: flex-end; }
    .add-input-wrap { flex: 1; }
    .add-label {
      display: block; font-size: 11px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.1em;
      color: var(--ink2); margin-bottom: 8px;
    }
    .add-input {
      width: 100%; padding: 15px 18px;
      background: var(--bg2); border: 1px solid var(--bd); color: var(--ink);
      border-radius: 14px; font-family: inherit; font-size: 14px; outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .add-input::placeholder { color: var(--ink3); }
    .add-input:focus { border-color: var(--ink); box-shadow: 0 0 0 3px var(--acc-bg); }
    .add-btn {
      padding: 15px 28px; background: var(--ink); color: var(--bg);
      border: none; border-radius: 14px; font-family: inherit;
      font-size: 13px; font-weight: 700; white-space: nowrap;
      transition: all 0.2s;
    }
    .add-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.15); }
    .add-btn:disabled { opacity: 0.6; }
    .add-success {
      display: flex; align-items: center; gap: 8px;
      padding: 14px 18px; border-radius: 12px;
      background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.2);
      color: #16a34a; font-size: 13px; font-weight: 600; margin-top: 12px;
      animation: up 0.3s ease;
    }

    /* ── CERTS SECTION ── */
    .certs-sec { padding: 52px 0 80px; }
    .certs-head {
      display: flex; justify-content: space-between; align-items: flex-end;
      margin-bottom: 32px;
    }
    .certs-title {
      font-family: 'Fraunces', serif; font-size: 28px; font-weight: 900;
      color: var(--ink); margin: 0; letter-spacing: -0.01em;
    }
    .certs-count {
      font-family: 'Fraunces', serif; font-size: 48px; font-weight: 900;
      color: var(--bd); line-height: 1;
    }

    .admin-cert-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
    }
    .admin-cert-card {
      background: var(--bg2); border: 1px solid var(--bd);
      border-radius: 20px; overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
      animation: up 0.4s ease both;
    }
    .admin-cert-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.1); }
    .admin-cert-img { aspect-ratio: 16/10; overflow: hidden; position: relative; }
    .admin-cert-img img { width: 100%; height: 100%; object-fit: cover; transition: filter 0.3s; }
    .admin-cert-card:hover .admin-cert-img img { filter: brightness(0.5); }
    .admin-cert-overlay {
      position: absolute; inset: 0;
      display: flex; align-items: center; justify-content: center;
      opacity: 0; transition: opacity 0.2s;
    }
    .admin-cert-card:hover .admin-cert-overlay { opacity: 1; }
    .del-btn {
      padding: 10px 20px; background: #ef4444; color: white;
      border: none; border-radius: 100px; font-family: inherit;
      font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 6px;
      transition: background 0.2s; backdrop-filter: blur(4px);
    }
    .del-btn:hover { background: #dc2626; }
    .admin-cert-foot {
      padding: 14px 18px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .admin-cert-foot p { font-size: 13px; font-weight: 600; color: var(--ink); margin: 0; }
    .admin-cert-foot span { font-size: 11px; color: var(--ink3); }

    /* Loading bar */
    .loading-bar {
      position: fixed; top: 64px; left: 0; right: 0; height: 2px;
      background: linear-gradient(90deg, transparent, var(--acc), transparent);
      background-size: 200% 100%;
      animation: shimmer 1.2s ease infinite;
      z-index: 100;
    }
    @keyframes shimmer { 0%{background-position:200% 0;} 100%{background-position:-200% 0;} }

    /* Empty */
    .empty-certs {
      grid-column: 1/-1; padding: 80px; text-align: center;
      border: 1px dashed var(--bd); border-radius: 20px;
      color: var(--ink2); font-size: 14px;
    }

    /* ANIMATIONS */
    @keyframes up { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }

    /* RESPONSIVE */
    @media (max-width: 768px) {
      .awrap { padding: 0 20px; }
      .anav-in { padding: 0 20px; }
      .add-form { flex-direction: column; }
      .add-btn { width: 100%; }
      .dash-stats { grid-template-columns: 1fr 1fr; }
      .dstat:nth-child(2) { border-right: none; }
    }
  `;

  // ── LOGIN VIEW ──
  if (!isAuthenticated) {
    return (
      <>
        <style>{sharedStyles}</style>
        <div className={`aw${d ? ' dark' : ''}`}>
          <nav className="anav">
            <div className="anav-in">
              <a href="/" className="alogo">Aura<em>.</em></a>
              <div className="anav-right">
                <span className="alogo-badge">Admin</span>
                <button className="theme-btn-a" onClick={() => setIsDark(!d)}>
                  {d ? '☀ Light' : '🌙 Dark'}
                </button>
              </div>
            </div>
          </nav>

          <div className="login-outer">
            <form onSubmit={handleLogin} className="login-card">
              <p className="login-eyebrow">Akses Terbatas</p>
              <h1 className="login-title">Ruang<br /><em>Admin</em></h1>

              <label className="login-label">Password</label>
              <input
                type="password"
                placeholder="Masukkan password..."
                value={password}
                onChange={e => { setPassword(e.target.value); setLoginError(''); }}
                className="login-input"
                required
              />

              {loginError && (
                <div className="login-error">⚠ {loginError}</div>
              )}

              <button type="submit" className="login-btn">
                Masuk ke Dashboard →
              </button>
            </form>
          </div>
        </div>
      </>
    );
  }

  // ── DASHBOARD VIEW ──
  return (
    <>
      <style>{sharedStyles}</style>
      <div className={`aw${d ? ' dark' : ''}`}>

        {/* NAV */}
        <nav className="anav">
          <div className="anav-in">
            <a href="/" className="alogo">Aura<em>.</em></a>
            <div className="anav-right">
              <span className="alogo-badge">Dashboard Admin</span>
              <button className="theme-btn-a" onClick={() => setIsDark(!d)}>
                {d ? '☀ Light' : '🌙 Dark'}
              </button>
            </div>
          </div>
        </nav>

        {isLoading && <div className="loading-bar" />}

        {/* HEADER */}
        <div className="awrap">
          <div className="dash-header">
            <p className="dash-eyebrow">// Panel Kontrol</p>
            <h1 className="dash-title">
              Certificate<br /><em>Manager</em>
            </h1>
          </div>

          {/* STATS */}
          <div className="dash-stats">
            {[
              { n: certificates.length, l: 'Total Sertifikat' },
              { n: 'Aktif', l: 'Status Database' },
              { n: 'Supabase', l: 'Backend' },
            ].map((s, i) => (
              <div key={i} className="dstat" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="dstat-n">{s.n}</div>
                <div className="dstat-l">{s.l}</div>
              </div>
            ))}
          </div>

          {/* ADD SECTION */}
          <div className="add-sec">
            <p className="add-eyebrow">Tambah Baru</p>
            <h2 className="add-title">Upload Sertifikat</h2>
            <form onSubmit={handleAddCertificate}>
              <div className="add-form">
                <div className="add-input-wrap">
                  <label className="add-label">URL Gambar</label>
                  <input
                    type="url"
                    placeholder="https://example.com/certificate.jpg"
                    value={newImageUrl}
                    onChange={e => setNewImageUrl(e.target.value)}
                    className="add-input"
                    required
                  />
                </div>
                <button type="submit" className="add-btn" disabled={isLoading}>
                  Tambahkan →
                </button>
              </div>
            </form>
            {addSuccess && (
              <div className="add-success">✓ Sertifikat berhasil ditambahkan!</div>
            )}
          </div>

          {/* CERTS GRID */}
          <div className="certs-sec">
            <div className="certs-head">
              <div>
                <p className="add-eyebrow">Koleksi</p>
                <h2 className="certs-title">Sertifikat Tersimpan</h2>
              </div>
              <span className="certs-count">0{certificates.length}</span>
            </div>

            <div className="admin-cert-grid">
              {certificates.length === 0 ? (
                <div className="empty-certs">
                  Belum ada sertifikat. Tambahkan melalui form di atas.
                </div>
              ) : (
                certificates.map((cert, i) => (
                  <div key={cert.id} className="admin-cert-card" style={{ animationDelay: `${i * 0.06}s` }}>
                    <div className="admin-cert-img">
                      <img src={cert.image_url} alt="Sertifikat" />
                      <div className="admin-cert-overlay">
                        <button onClick={() => handleDelete(cert.id)} className="del-btn">
                          🗑 Hapus
                        </button>
                      </div>
                    </div>
                    <div className="admin-cert-foot">
                      <p>Sertifikat #{i + 1}</p>
                      <span>ID: {String(cert.id).slice(0,8)}...</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </>
  );
}