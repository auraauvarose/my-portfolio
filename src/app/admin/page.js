"use client";
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isDark, setIsDark] = useState(true);
  const [activeTab, setActiveTab] = useState('certs');
  const [isLoading, setIsLoading] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [certForm, setCertForm] = useState({ image_url: '', title: '', issuer: '' });
  const [certFile, setCertFile] = useState(null);
  const [certFilePreview, setCertFilePreview] = useState('');
  const [certUploadMode, setCertUploadMode] = useState('url');
  const [certSuccess, setCertSuccess] = useState('');
  const [editingCert, setEditingCert] = useState(null);
  const certFileRef = useRef();
  const [projects, setProjects] = useState([]);
  const [projForm, setProjForm] = useState({ title: '', description: '', tech_stack: '', github_url: '', demo_url: '', image_url: '' });
  const [projFile, setProjFile] = useState(null);
  const [projFilePreview, setProjFilePreview] = useState('');
  const [projUploadMode, setProjUploadMode] = useState('url');
  const [projSuccess, setProjSuccess] = useState('');
  const [editingProj, setEditingProj] = useState(null);
  const projFileRef = useRef();
  const [comments, setComments] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [viewCount, setViewCount] = useState(0);
  // Appearance
  const [themeColor, setThemeColor] = useState('#d4eb00');
  const [bgTheme, setBgTheme] = useState('default');
  const [fontChoice, setFontChoice] = useState('fraunces');
  const [settingsSaved, setSettingsSaved] = useState('');
  // Music
  const [musicUrl, setMusicUrl] = useState('https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3');
  const [musicFile, setMusicFile] = useState(null);
  const [musicUploading, setMusicUploading] = useState(false);
  const [musicSuccess, setMusicSuccess] = useState('');
  const musicFileRef = useRef();
  // User photos
  const [userPhotos, setUserPhotos] = useState([]);
  const [photoSuccess, setPhotoSuccess] = useState('');

  const d = isDark;

  const THEMES = [
    { id: 'lime',     name: 'Lime',       color: '#d4eb00', desc: 'Original · Energik' },
    { id: 'cyan',     name: 'Cyber Blue', color: '#00d4ff', desc: 'Modern · Tech' },
    { id: 'rose',     name: 'Rose',       color: '#ff6b9d', desc: 'Soft · Feminine' },
    { id: 'emerald',  name: 'Emerald',    color: '#00e676', desc: 'Fresh · Natural' },
    { id: 'minimal',  name: 'Minimal',    color: '#e0e0e0', desc: 'Clean · Simpel' },
    { id: 'violet',   name: 'Violet',     color: '#a855f7', desc: 'Bold · Kreatif' },
    { id: 'orange',   name: 'Sunset',     color: '#fb923c', desc: 'Warm · Energik' },
    { id: 'gold',     name: 'Gold',       color: '#fbbf24', desc: 'Premium · Mewah' },
    { id: 'red',      name: 'Red Hot',    color: '#f43f5e', desc: 'Berani · Dramatis' },
    { id: 'indigo',   name: 'Indigo',     color: '#6366f1', desc: 'Deep · Profesional' },
  ];

  const BG_THEMES = [
    { id: 'default', name: 'Gelap / Terang',    darkBg:'#111110', lightBg:'#ffffff',  desc:'Classic original' },
    { id: 'warm',    name: 'Coklat / Krem',     darkBg:'#1a1410', lightBg:'#f5f0e8', desc:'Warm editorial' },
    { id: 'navy',    name: 'Navy / Krim',       darkBg:'#0d1117', lightBg:'#fdf6e3', desc:'Dev / GitHub vibes' },
    { id: 'forest',  name: 'Hutan / Putih',     darkBg:'#0d1a0f', lightBg:'#f0f7f0', desc:'Natural · Fresh' },
    { id: 'slate',   name: 'Batu Tulis / Perak',darkBg:'#0f1117', lightBg:'#f8f9fb', desc:'Cool · Profesional' },
    { id: 'mocha',   name: 'Mocha / Krem',      darkBg:'#1c1510', lightBg:'#faf3e8', desc:'Coffee · Cozy' },
    { id: 'midnight',name: 'Midnight / Lavender',darkBg:'#0a0a14', lightBg:'#f0eeff', desc:'Night · Mystis' },
    { id: 'rose_bg', name: 'Mawar / Blush',     darkBg:'#180d12', lightBg:'#fff0f4', desc:'Romantic · Soft' },
  ];

  const FONTS = [
    { id: 'fraunces',  name: 'Editorial',    heading: 'Fraunces',           body: 'Plus Jakarta Sans', desc: 'Serif elegan · Editorial' },
    { id: 'playfair',  name: 'Klasik',       heading: 'Playfair Display',   body: 'Inter',             desc: 'Serif klasik · Bersih' },
    { id: 'space',     name: 'Teknologi',    heading: 'Space Grotesk',      body: 'Space Grotesk',     desc: 'Geometric · Tech vibes' },
    { id: 'syne',      name: 'Avant-Garde',  heading: 'Syne',               body: 'DM Sans',           desc: 'Display bold · Kontemporer' },
    { id: 'cormorant', name: 'Elegan',       heading: 'Cormorant Garamond', body: 'Lato',              desc: 'High fashion · Halus' },
  ];

  const DEFAULT_MUSIC = 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3';

  useEffect(() => {
    const bg = d ? '#111110' : '#ffffff';
    document.documentElement.style.background = bg;
    document.body.style.background = bg;
    document.body.style.margin = '0';
    document.body.style.padding = '0';
  }, [d]);

  const saveSetting = async (key, value) => {
    await supabase.from('settings').upsert({ key, value }, { onConflict: 'key' });
  };
  const toast = (setter, msg) => { setter(msg); setTimeout(() => setter(''), 2500); };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'aura200788') { setIsAuthenticated(true); fetchAll(); }
    else setLoginError('Password salah.');
  };

  const fetchAll = async () => {
    setIsLoading(true);
    const [c, p, cm, vw, vi, st] = await Promise.all([
      supabase.from('certificates').select('*').order('created_at', { ascending: false }),
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('comments').select('*').order('created_at', { ascending: false }),
      supabase.from('views').select('count').eq('slug', 'home').single(),
      supabase.from('visitors').select('*').order('visited_at', { ascending: false }).limit(200),
      supabase.from('settings').select('key,value'),
      supabase.from('user_photos').select('*').order('created_at',{ascending:false}),
    ]);
    if (c.data) setCertificates(c.data);
    if (p.data) setProjects(p.data);
    if (cm.data) setComments(cm.data);
    if (vw.data) setViewCount(vw.data.count);
    if (vi.data) setVisitors(vi.data);
    // user_photos - index 6
    const up = await supabase.from('user_photos').select('*').order('created_at',{ascending:false});
    if (up.data) setUserPhotos(up.data);
    if (st.data) st.data.forEach(row => {
      if (row.key === 'theme_color') setThemeColor(row.value);
      if (row.key === 'bg_theme') setBgTheme(row.value);
      if (row.key === 'font_choice') setFontChoice(row.value);
      if (row.key === 'music_url') setMusicUrl(row.value);
    });
    setIsLoading(false);
  };

  const uploadFile = async (file, bucket) => {
    const ext = file.name.split('.').pop();
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(name, file, { upsert: false });
    if (error) throw error;
    return supabase.storage.from(bucket).getPublicUrl(name).data.publicUrl;
  };

  // ── CERT ──
  const handleCertSubmit = async (e) => {
    e.preventDefault(); setIsLoading(true);
    try {
      let url = certForm.image_url;
      if (certUploadMode === 'file' && certFile) url = await uploadFile(certFile, 'certificates');
      if (!url) { alert('Masukkan URL atau pilih file.'); setIsLoading(false); return; }
      if (editingCert) {
        await supabase.from('certificates').update({ ...certForm, image_url: url }).eq('id', editingCert.id);
        toast(setCertSuccess, '✓ Sertifikat diperbarui!');
      } else {
        await supabase.from('certificates').insert([{ ...certForm, image_url: url }]);
        toast(setCertSuccess, '✓ Sertifikat ditambahkan!');
      }
      resetCertForm();
      const { data } = await supabase.from('certificates').select('*').order('created_at', { ascending: false });
      if (data) setCertificates(data);
    } catch (err) { alert('Upload gagal: ' + err.message); }
    setIsLoading(false);
  };
  const resetCertForm = () => { setCertForm({ image_url: '', title: '', issuer: '' }); setCertFile(null); setCertFilePreview(''); setEditingCert(null); if (certFileRef.current) certFileRef.current.value = ''; };
  const startEditCert = (cert) => { setEditingCert(cert); setCertForm({ image_url: cert.image_url, title: cert.title||'', issuer: cert.issuer||'' }); setCertUploadMode('url'); setCertFilePreview(cert.image_url); window.scrollTo({top:0,behavior:'smooth'}); };
  const handleDeleteCert = async (id) => {
    if (!confirm('Hapus sertifikat ini?')) return;
    await supabase.from('certificates').delete().eq('id', id);
    const { data } = await supabase.from('certificates').select('*').order('created_at', { ascending: false });
    if (data) setCertificates(data);
  };

  // ── PROJECT ──
  const handleProjSubmit = async (e) => {
    e.preventDefault(); if (!projForm.title) return; setIsLoading(true);
    try {
      let url = projForm.image_url;
      if (projUploadMode === 'file' && projFile) url = await uploadFile(projFile, 'projects');
      if (editingProj) {
        await supabase.from('projects').update({ ...projForm, image_url: url }).eq('id', editingProj.id);
        toast(setProjSuccess, '✓ Proyek diperbarui!');
      } else {
        await supabase.from('projects').insert([{ ...projForm, image_url: url }]);
        toast(setProjSuccess, '✓ Proyek ditambahkan!');
      }
      resetProjForm();
      const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      if (data) setProjects(data);
    } catch (err) { alert('Upload gagal: ' + err.message); }
    setIsLoading(false);
  };
  const resetProjForm = () => { setProjForm({ title:'', description:'', tech_stack:'', github_url:'', demo_url:'', image_url:'' }); setProjFile(null); setProjFilePreview(''); setEditingProj(null); if (projFileRef.current) projFileRef.current.value=''; };
  const startEditProj = (proj) => { setEditingProj(proj); setProjForm({ title:proj.title||'', description:proj.description||'', tech_stack:proj.tech_stack||'', github_url:proj.github_url||'', demo_url:proj.demo_url||'', image_url:proj.image_url||'' }); setProjUploadMode('url'); setProjFilePreview(proj.image_url||''); window.scrollTo({top:0,behavior:'smooth'}); };
  const handleDeleteProj = async (id) => {
    if (!confirm('Hapus proyek ini?')) return;
    await supabase.from('projects').delete().eq('id', id);
    const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    if (data) setProjects(data);
  };

  // ── COMMENTS ──
  const handleDeleteComment = async (id) => {
    if (!confirm('Hapus komentar ini?')) return;
    await supabase.from('comments').delete().eq('id', id);
    const { data } = await supabase.from('comments').select('*').order('created_at', { ascending: false });
    if (data) setComments(data);
  };
  const handleDeleteAllComments = async () => {
    if (!confirm('Hapus SEMUA komentar?')) return;
    await supabase.from('comments').delete().neq('id', 0);
    setComments([]);
  };

  // ── VIEWS ──
  const handleResetViews = async () => {
    if (!confirm('Reset counter ke 0?')) return;
    await supabase.from('views').update({ count: 0 }).eq('slug', 'home');
    setViewCount(0);
  };

  // ── VISITORS ──
  const handleClearVisitors = async () => {
    if (!confirm('Hapus semua riwayat kunjungan?')) return;
    await supabase.from('visitors').delete().neq('id', 0);
    setVisitors([]);
  };
  const getDeviceIcon = (ua='') => /mobile|android|iphone|ipad/i.test(ua)?'📱':'🖥️';
  const getBrowser = (ua='') => /edg/i.test(ua)?'Edge':/chrome/i.test(ua)?'Chrome':/firefox/i.test(ua)?'Firefox':/safari/i.test(ua)?'Safari':'Browser lain';
  const getOS = (ua='') => /windows/i.test(ua)?'Windows':/android/i.test(ua)?'Android':/iphone|ipad/i.test(ua)?'iOS':/mac/i.test(ua)?'macOS':/linux/i.test(ua)?'Linux':'OS lain';

  // ── APPEARANCE ──
  const handleThemeChange = async (color) => { setThemeColor(color); await saveSetting('theme_color', color); toast(setSettingsSaved, '✓ Warna tersimpan!'); };
  const handleBgThemeChange = async (id) => { setBgTheme(id); await saveSetting('bg_theme', id); toast(setSettingsSaved, '✓ Background tersimpan!'); };
  const handleFontChange = async (id) => { setFontChoice(id); await saveSetting('font_choice', id); toast(setSettingsSaved, '✓ Font tersimpan!'); };

  // ── MUSIC ──
  const handleMusicUpload = async () => {
    if (!musicFile) return;
    setMusicUploading(true);
    try {
      const url = await uploadFile(musicFile, 'certificates');
      await saveSetting('music_url', url);
      setMusicUrl(url);
      setMusicFile(null);
      if (musicFileRef.current) musicFileRef.current.value = '';
      toast(setMusicSuccess, '✓ Music berhasil diupload!');
    } catch (err) { alert('Upload music gagal: ' + err.message); }
    setMusicUploading(false);
  };
  const handleMusicDefault = async () => {
    await saveSetting('music_url', DEFAULT_MUSIC);
    setMusicUrl(DEFAULT_MUSIC);
    toast(setMusicSuccess, '✓ Music direset ke default!');
  };

  // ── USER PHOTOS ──
  const handleApprovePhoto = async (id) => {
    await supabase.from('user_photos').update({approved:true}).eq('id',id);
    const {data} = await supabase.from('user_photos').select('*').order('created_at',{ascending:false});
    if (data) setUserPhotos(data);
    toast(setPhotoSuccess, '✓ Foto disetujui!');
  };
  const handleRejectPhoto = async (id) => {
    if (!confirm('Hapus foto ini?')) return;
    await supabase.from('user_photos').delete().eq('id',id);
    const {data} = await supabase.from('user_photos').select('*').order('created_at',{ascending:false});
    if (data) setUserPhotos(data);
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Fraunces:opsz,wght@9..144,900&display=swap');
    *,*::before,*::after{box-sizing:border-box;}
    html{margin:0;padding:0;width:100%;scrollbar-width:none;}
    html::-webkit-scrollbar{display:none;}
    body{margin:0;padding:0;width:100%;}
    .aw{--acc:#d4eb00;--ink:#f0efe8;--ink2:#909088;--ink3:#555550;--bg:#111110;--bg2:#1c1c1a;--bd:rgba(255,255,255,0.07);--shadow:rgba(0,0,0,0.3);--danger:rgba(239,68,68,0.1);--danger-bd:rgba(239,68,68,0.3);font-family:'Plus Jakarta Sans',sans-serif;background:var(--bg);color:var(--ink);min-height:100vh;}
    .aw.light{--acc:#d4eb00;--ink:#1a1a1a;--ink2:#555555;--ink3:#999999;--bg:#ffffff;--bg2:#f4f4f0;--bd:rgba(0,0,0,0.09);--shadow:rgba(0,0,0,0.07);}
    .anav{position:fixed;top:0;left:0;right:0;z-index:50;background:var(--bg);border-bottom:1px solid var(--bd);transition:background .3s;}
    .anav-in{max-width:1200px;margin:0 auto;padding:0 32px;height:60px;display:flex;align-items:center;justify-content:space-between;gap:12px;}
    .alogo{font-family:'Fraunces',serif;font-size:20px;font-weight:900;color:var(--ink);text-decoration:none;}
    .alogo em{font-style:normal;color:var(--acc);}
    .anav-right{display:flex;align-items:center;gap:8px;}
    .badge{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--ink2);padding:4px 10px;border:1px solid var(--bd);background:var(--bg2);border-radius:100px;}
    .btn-site{padding:6px 14px;background:transparent;border:1px solid var(--bd);color:var(--ink2);border-radius:100px;font-family:inherit;font-size:12px;font-weight:700;text-decoration:none;display:flex;align-items:center;gap:4px;transition:all .2s;}
    .btn-site:hover{color:var(--ink);border-color:var(--acc);}
    .btn-th{padding:6px 14px;border:1px solid var(--bd);background:var(--bg2);color:var(--ink);border-radius:100px;font-family:inherit;font-size:12px;font-weight:700;transition:all .2s;}
    .btn-th:hover{border-color:var(--acc);}
    .awrap{max-width:1200px;margin:0 auto;padding:0 32px;}
    .lbar{position:fixed;top:60px;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--acc),transparent);background-size:200% 100%;animation:shimmer 1.2s ease infinite;z-index:100;}
    @keyframes shimmer{0%{background-position:200% 0;}100%{background-position:-200% 0;}}
    /* LOGIN */
    .login-outer{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;}
    .login-card{width:100%;max-width:400px;padding:44px 36px;background:var(--bg2);border:1px solid var(--bd);border-radius:22px;}
    .l-eye{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:var(--ink2);margin-bottom:10px;}
    .l-title{font-family:'Fraunces',serif;font-size:38px;font-weight:900;line-height:.95;letter-spacing:-.02em;color:var(--ink);margin:0 0 28px;}
    .l-title em{font-style:italic;font-weight:400;color:var(--ink2);}
    .fl{display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--ink2);margin-bottom:6px;}
    .fi{width:100%;padding:13px 15px;background:var(--bg);border:1.5px solid var(--bd);color:var(--ink);border-radius:11px;font-family:inherit;font-size:15px;letter-spacing:3px;outline:none;transition:border-color .2s;margin-bottom:12px;}
    .fi:focus{border-color:var(--acc);}
    .l-err{padding:10px 13px;border-radius:10px;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);color:#dc2626;font-size:12px;font-weight:600;margin-bottom:12px;}
    .btn-login{width:100%;padding:14px;background:var(--ink);color:var(--bg);border:none;border-radius:11px;font-family:inherit;font-size:14px;font-weight:700;letter-spacing:.04em;transition:all .2s;}
    .btn-login:hover{transform:translateY(-2px);box-shadow:0 8px 24px var(--shadow);}
    /* DASH */
    .dash-hdr{padding-top:80px;padding-bottom:32px;border-bottom:1px solid var(--bd);}
    .d-eye{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:var(--ink2);margin-bottom:8px;}
    .d-title{font-family:'Fraunces',serif;font-size:clamp(28px,4vw,48px);font-weight:900;line-height:.95;letter-spacing:-.02em;color:var(--ink);margin:0;}
    .d-title em{font-style:italic;font-weight:400;color:var(--ink2);}
    /* STATS */
    .dstats{display:grid;grid-template-columns:repeat(4,1fr);border-bottom:1px solid var(--bd);}
    .dstat{padding:24px 0;text-align:center;border-right:1px solid var(--bd);}
    .dstat:last-child{border-right:none;}
    .dstat-n{font-family:'Fraunces',serif;font-size:32px;font-weight:900;color:var(--ink);line-height:1;margin-bottom:4px;}
    .dstat-l{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--ink2);}
    .dstat-action{margin-top:8px;}
    .btn-reset{padding:4px 11px;background:var(--danger);border:1px solid var(--danger-bd);color:#dc2626;border-radius:100px;font-family:inherit;font-size:10px;font-weight:700;transition:all .2s;}
    .btn-reset:hover{background:#ef4444;color:white;border-color:#ef4444;}
    /* TABS */
    .tabs{display:flex;gap:0;border-bottom:1px solid var(--bd);margin-top:28px;overflow-x:auto;}
    .tab-btn{padding:12px 20px;background:transparent;border:none;font-family:inherit;font-size:13px;font-weight:700;color:var(--ink2);border-bottom:2px solid transparent;margin-bottom:-1px;transition:all .2s;white-space:nowrap;}
    .tab-btn:hover{color:var(--ink);}
    .tab-btn.active{color:var(--ink);border-bottom-color:var(--acc);}
    .tab-count{display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;border-radius:100px;background:var(--bg2);font-size:10px;font-weight:700;color:var(--ink2);margin-left:6px;padding:0 4px;}
    .tab-btn.active .tab-count{background:var(--acc);color:#0d0d0d;}
    /* PANEL */
    .panel{padding:28px 0;border-bottom:1px solid var(--bd);}
    .panel-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px;}
    .panel-title{font-family:'Fraunces',serif;font-size:20px;font-weight:900;color:var(--ink);margin:0;}
    .panel-edit-badge{display:flex;align-items:center;gap:7px;padding:5px 12px;background:rgba(212,235,0,.15);border:1px solid rgba(212,235,0,.4);border-radius:100px;font-size:10px;font-weight:700;color:var(--ink);}
    .panel-edit-badge span{width:6px;height:6px;border-radius:50%;background:var(--acc);}
    .upload-toggle{display:flex;gap:0;background:var(--bg2);border:1px solid var(--bd);border-radius:9px;overflow:hidden;width:fit-content;margin-bottom:14px;}
    .upload-opt{padding:7px 14px;font-family:inherit;font-size:11px;font-weight:700;border:none;background:transparent;color:var(--ink2);transition:all .2s;}
    .upload-opt.active{background:var(--ink);color:var(--bg);}
    .drop-zone{border:2px dashed var(--bd);border-radius:12px;padding:24px;text-align:center;transition:all .2s;position:relative;overflow:hidden;}
    .drop-zone:hover{border-color:var(--acc);background:rgba(212,235,0,.05);}
    .drop-zone input[type=file]{position:absolute;inset:0;opacity:0;width:100%;height:100%;}
    .drop-zone-icon{font-size:26px;margin-bottom:8px;}
    .drop-zone-text{font-size:13px;font-weight:600;color:var(--ink2);}
    .drop-zone-sub{font-size:11px;color:var(--ink3);margin-top:3px;}
    .file-preview{width:100%;max-height:140px;object-fit:cover;border-radius:9px;margin-top:10px;border:1px solid var(--bd);}
    .fgrid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
    .fgrid-full{grid-column:1/-1;}
    .fla{display:block;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--ink2);margin-bottom:6px;}
    .fin,.fta{width:100%;padding:12px 14px;background:var(--bg2);border:1.5px solid var(--bd);color:var(--ink);border-radius:10px;font-family:inherit;font-size:13px;outline:none;transition:border-color .2s;}
    .fin::placeholder,.fta::placeholder{color:var(--ink3);}
    .fin:focus,.fta:focus{border-color:var(--acc);}
    .fta{height:80px;resize:vertical;}
    .factions{display:flex;align-items:center;gap:8px;margin-top:14px;flex-wrap:wrap;}
    .btn-add{padding:11px 22px;background:var(--ink);color:var(--bg);border:none;border-radius:10px;font-family:inherit;font-size:12px;font-weight:700;transition:all .2s;}
    .btn-add:hover:not(:disabled){transform:translateY(-2px);}
    .btn-add:disabled{opacity:0.5;}
    .btn-add.em{background:var(--acc);color:#0d0d0d;}
    .btn-cancel{padding:11px 16px;background:transparent;border:1px solid var(--bd);color:var(--ink2);border-radius:10px;font-family:inherit;font-size:12px;font-weight:700;transition:all .2s;}
    .btn-cancel:hover{border-color:var(--ink);color:var(--ink);}
    .toast{display:flex;align-items:center;gap:7px;padding:10px 14px;border-radius:9px;background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.25);color:#16a34a;font-size:12px;font-weight:600;}
    /* ITEMS */
    .items-grid{padding:24px 0;display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px;}
    .empty-st{padding:50px 24px;text-align:center;border:1px dashed var(--bd);border-radius:18px;color:var(--ink2);font-size:13px;grid-column:1/-1;}
    .ac-card{background:var(--bg2);border:1.5px solid var(--bd);border-radius:16px;overflow:hidden;transition:border-color .2s;}
    .ac-card:hover{border-color:var(--acc);}
    .ac-thumb{aspect-ratio:16/10;overflow:hidden;background:var(--bg);}
    .ac-thumb img{width:100%;height:100%;object-fit:cover;transition:transform .4s;}
    .ac-card:hover .ac-thumb img{transform:scale(1.04);}
    .ac-thumb-empty{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:36px;color:var(--bd);}
    .ac-foot{padding:12px 14px;}
    .ac-title{font-size:13px;font-weight:700;color:var(--ink);margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .ac-sub{font-size:11px;color:var(--ink2);}
    .ac-actions{display:flex;gap:6px;margin-top:10px;}
    .btn-edit{flex:1;padding:7px;background:var(--acc);color:#0d0d0d;border:none;border-radius:8px;font-family:inherit;font-size:11px;font-weight:700;}
    .btn-del{flex:1;padding:7px;background:var(--danger);border:1px solid var(--danger-bd);color:#dc2626;border-radius:8px;font-family:inherit;font-size:11px;font-weight:700;transition:all .2s;}
    .btn-del:hover{background:#ef4444;color:white;border-color:#ef4444;}
    /* COMMENTS */
    .comments-list{display:flex;flex-direction:column;gap:10px;padding:20px 0;}
    .comment-item{padding:14px 16px;background:var(--bg2);border:1.5px solid var(--bd);border-radius:14px;display:flex;align-items:flex-start;justify-content:space-between;gap:12px;}
    .comment-item-body{flex:1;min-width:0;}
    .comment-name{font-size:13px;font-weight:700;color:var(--ink);margin-bottom:4px;}
    .comment-msg{font-size:13px;color:var(--ink2);line-height:1.55;margin-bottom:5px;word-break:break-word;}
    .comment-dt{font-size:10px;font-weight:600;color:var(--ink3);text-transform:uppercase;letter-spacing:.08em;}
    .comment-del{padding:6px 11px;background:var(--danger);border:1px solid var(--danger-bd);color:#dc2626;border-radius:8px;font-family:inherit;font-size:11px;font-weight:700;flex-shrink:0;transition:all .2s;}
    .comment-del:hover{background:#ef4444;color:white;border-color:#ef4444;}
    .sec-actions{display:flex;gap:8px;margin-bottom:16px;align-items:center;flex-wrap:wrap;}
    .sec-label{font-size:13px;font-weight:600;color:var(--ink2);}
    /* VISITORS */
    .vis-list{display:flex;flex-direction:column;gap:8px;padding:16px 0;}
    .vis-item{padding:14px 16px;background:var(--bg2);border:1.5px solid var(--bd);border-radius:14px;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:14px;}
    .vis-icon{font-size:22px;}
    .vis-info{min-width:0;}
    .vis-device{font-size:13px;font-weight:700;color:var(--ink);margin-bottom:3px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
    .vis-badge{padding:2px 8px;border-radius:100px;font-size:10px;font-weight:700;}
    .vis-badge.mob{background:rgba(59,130,246,.1);color:#3b82f6;border:1px solid rgba(59,130,246,.2);}
    .vis-badge.desk{background:rgba(34,197,94,.1);color:#16a34a;border:1px solid rgba(34,197,94,.2);}
    .vis-meta{font-size:11px;color:var(--ink3);display:flex;gap:12px;flex-wrap:wrap;}
    .vis-time{font-size:11px;font-weight:600;color:var(--ink3);text-align:right;white-space:nowrap;}
    /* APPEARANCE GRID */
    .theme-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-bottom:24px;}
    .bg-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-bottom:24px;}
    .font-list{display:flex;flex-direction:column;gap:10px;}
    .music-section{background:var(--bg2);border:1px solid var(--bd);border-radius:16px;padding:20px;}
    .music-url-display{font-size:11px;color:var(--ink3);margin-top:8px;word-break:break-all;padding:8px 12px;background:var(--bg);border:1px solid var(--bd);border-radius:8px;}
    @media(max-width:768px){
      .awrap,.anav-in{padding-left:16px;padding-right:16px;}
      .fgrid{grid-template-columns:1fr;}
      .dstats{grid-template-columns:1fr 1fr;}
      .dstat:nth-child(2){border-right:none;}
      .dstat:nth-child(4){border-right:none;}
      .items-grid{grid-template-columns:1fr 1fr;}
      .theme-grid,.bg-grid{grid-template-columns:repeat(3,1fr);}
      .vis-item{grid-template-columns:auto 1fr;}
      .vis-time{display:none;}
    }
  `;

  if (!isAuthenticated) return (
    <>
      <style>{css}</style>
      <div className={`aw${d?'':' light'}`}>
        <nav className="anav">
          <div className="anav-in">
            <a href="/" className="alogo"><em>A.</em></a>
            <div className="anav-right">
              <span className="badge">Admin</span>
              <button className="btn-th" onClick={()=>setIsDark(!d)}>{d?'☀ Light':'🌙 Dark'}</button>
            </div>
          </div>
        </nav>
        <div className="login-outer">
          <form onSubmit={handleLogin} className="login-card">
            <p className="l-eye">// Akses Terbatas</p>
            <h1 className="l-title">Ruang<br/><em>Admin</em></h1>
            <label className="fl">Password</label>
            <input type="password" placeholder="Masukkan password..." value={password} onChange={e=>{setPassword(e.target.value);setLoginError('');}} className="fi" required/>
            {loginError && <div className="l-err">⚠ {loginError}</div>}
            <button type="submit" className="btn-login">Masuk ke Dashboard →</button>
          </form>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{css}</style>
      <div className={`aw${d?'':' light'}`} style={{'--acc':themeColor}}>
        <nav className="anav">
          <div className="anav-in">
            <a href="/" className="alogo"><em>A.</em></a>
            <div className="anav-right">
              <a href="/" className="btn-site">← Site</a>
              <span className="badge">Dashboard</span>
              <button className="btn-th" onClick={()=>setIsDark(!d)}>{d?'☀ Light':'🌙 Dark'}</button>
            </div>
          </div>
        </nav>
        {isLoading && <div className="lbar"/>}

        <div className="awrap">
          <div className="dash-hdr">
            <p className="d-eye">// Panel Kontrol</p>
            <h1 className="d-title">Dashboard <em>Admin</em></h1>
          </div>

          {/* STATS */}
          <div className="dstats">
            <div className="dstat"><div className="dstat-n">{certificates.length}</div><div className="dstat-l">Sertifikat</div></div>
            <div className="dstat"><div className="dstat-n">{projects.length}</div><div className="dstat-l">Proyek</div></div>
            <div className="dstat"><div className="dstat-n">{comments.length}</div><div className="dstat-l">Komentar</div></div>
            <div className="dstat">
              <div className="dstat-n">{viewCount}</div>
              <div className="dstat-l">Kunjungan</div>
              <div className="dstat-action"><button className="btn-reset" onClick={handleResetViews}>Reset → 0</button></div>
            </div>
          </div>

          {/* TABS */}
          <div className="tabs">
            {[
              {id:'certs',label:'Sertifikat',count:certificates.length},
              {id:'projects',label:'Proyek',count:projects.length},
              {id:'comments',label:'Komentar',count:comments.length},
              {id:'visitors',label:'Pengunjung',count:visitors.length},
              {id:'appearance',label:'Tampilan',count:null},
              {id:'photos',label:'Foto Komunitas',count:userPhotos.filter(p=>!p.approved).length||null},
            ].map(t=>(
              <button key={t.id} className={`tab-btn${activeTab===t.id?' active':''}`} onClick={()=>setActiveTab(t.id)}>
                {t.label}{t.count!==null && <span className="tab-count">{t.count}</span>}
              </button>
            ))}
          </div>

          {/* ── SERTIFIKAT ── */}
          {activeTab==='certs' && (
            <>
              <div className="panel">
                <div className="panel-head">
                  <h2 className="panel-title">{editingCert?'Edit Sertifikat':'Upload Sertifikat Baru'}</h2>
                  {editingCert && <div className="panel-edit-badge"><span/>Edit: {editingCert.title||'Sertifikat'}</div>}
                </div>
                <div className="upload-toggle">
                  <button className={`upload-opt${certUploadMode==='url'?' active':''}`} onClick={()=>setCertUploadMode('url')} type="button">🔗 URL</button>
                  <button className={`upload-opt${certUploadMode==='file'?' active':''}`} onClick={()=>setCertUploadMode('file')} type="button">📁 Upload</button>
                </div>
                <form onSubmit={handleCertSubmit}>
                  <div className="fgrid">
                    <div><label className="fla">Judul *</label><input type="text" placeholder="Web Development Certificate" value={certForm.title} onChange={e=>setCertForm({...certForm,title:e.target.value})} className="fin" required/></div>
                    <div><label className="fla">Diterbitkan Oleh *</label><input type="text" placeholder="Dicoding Indonesia" value={certForm.issuer} onChange={e=>setCertForm({...certForm,issuer:e.target.value})} className="fin" required/></div>
                    <div className="fgrid-full">
                      {certUploadMode==='url'
                        ? <><label className="fla">URL Gambar</label><input type="url" placeholder="https://..." value={certForm.image_url} onChange={e=>setCertForm({...certForm,image_url:e.target.value})} className="fin"/>{certForm.image_url&&<img src={certForm.image_url} className="file-preview" onError={e=>e.target.style.display='none'}/>}</>
                        : <><label className="fla">File Gambar</label><div className="drop-zone"><input type="file" ref={certFileRef} accept="image/*,.pdf" onChange={e=>{const f=e.target.files[0];if(!f)return;setCertFile(f);setCertFilePreview(URL.createObjectURL(f));}}/>{!certFilePreview?<><div className="drop-zone-icon">📄</div><div className="drop-zone-text">Klik atau drag file</div><div className="drop-zone-sub">JPG, PNG, PDF</div></>:<img src={certFilePreview} className="file-preview"/>}</div>{certFile&&<div style={{fontSize:'11px',color:'var(--ink2)',marginTop:'6px'}}>📎 {certFile.name}</div>}</>
                      }
                    </div>
                  </div>
                  <div className="factions">
                    <button type="submit" className={`btn-add${editingCert?' em':''}`} disabled={isLoading}>{isLoading?'Menyimpan...':editingCert?'✓ Simpan':'Tambahkan →'}</button>
                    {editingCert&&<button type="button" className="btn-cancel" onClick={resetCertForm}>Batal</button>}
                    {certSuccess&&<div className="toast">{certSuccess}</div>}
                  </div>
                </form>
              </div>
              <div className="items-grid">
                {certificates.length===0?<div className="empty-st">Belum ada sertifikat.</div>:certificates.map(cert=>(
                  <div key={cert.id} className="ac-card">
                    <div className="ac-thumb">{cert.image_url?<img src={cert.image_url} alt={cert.title}/>:<div className="ac-thumb-empty">📜</div>}</div>
                    <div className="ac-foot">
                      <div className="ac-title">{cert.title||'Sertifikat'}</div>
                      <div className="ac-sub">{cert.issuer||'—'}</div>
                      <div className="ac-actions">
                        <button className="btn-edit" onClick={()=>startEditCert(cert)}>✏ Edit</button>
                        <button className="btn-del" onClick={()=>handleDeleteCert(cert.id)}>🗑 Hapus</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── PROYEK ── */}
          {activeTab==='projects' && (
            <>
              <div className="panel">
                <div className="panel-head">
                  <h2 className="panel-title">{editingProj?'Edit Proyek':'Tambah Proyek Baru'}</h2>
                  {editingProj&&<div className="panel-edit-badge"><span/>Edit: {editingProj.title}</div>}
                </div>
                <div className="upload-toggle">
                  <button className={`upload-opt${projUploadMode==='url'?' active':''}`} onClick={()=>setProjUploadMode('url')} type="button">🔗 URL</button>
                  <button className={`upload-opt${projUploadMode==='file'?' active':''}`} onClick={()=>setProjUploadMode('file')} type="button">📁 Upload</button>
                </div>
                <form onSubmit={handleProjSubmit}>
                  <div className="fgrid">
                    <div><label className="fla">Nama Proyek *</label><input type="text" placeholder="E-commerce API" value={projForm.title} onChange={e=>setProjForm({...projForm,title:e.target.value})} className="fin" required/></div>
                    <div><label className="fla">Tech Stack (pisah koma)</label><input type="text" placeholder="Node.js, Express" value={projForm.tech_stack} onChange={e=>setProjForm({...projForm,tech_stack:e.target.value})} className="fin"/></div>
                    <div className="fgrid-full"><label className="fla">Deskripsi</label><textarea placeholder="Jelaskan proyek..." value={projForm.description} onChange={e=>setProjForm({...projForm,description:e.target.value})} className="fta"/></div>
                    <div><label className="fla">Link GitHub</label><input type="url" placeholder="https://github.com/..." value={projForm.github_url} onChange={e=>setProjForm({...projForm,github_url:e.target.value})} className="fin"/></div>
                    <div><label className="fla">Link Demo</label><input type="url" placeholder="https://..." value={projForm.demo_url} onChange={e=>setProjForm({...projForm,demo_url:e.target.value})} className="fin"/></div>
                    <div className="fgrid-full">
                      {projUploadMode==='url'
                        ? <><label className="fla">URL Thumbnail</label><input type="url" placeholder="https://..." value={projForm.image_url} onChange={e=>setProjForm({...projForm,image_url:e.target.value})} className="fin"/>{projForm.image_url&&<img src={projForm.image_url} className="file-preview" onError={e=>e.target.style.display='none'}/>}</>
                        : <><label className="fla">File Thumbnail</label><div className="drop-zone"><input type="file" ref={projFileRef} accept="image/*" onChange={e=>{const f=e.target.files[0];if(!f)return;setProjFile(f);setProjFilePreview(URL.createObjectURL(f));}}/>{!projFilePreview?<><div className="drop-zone-icon">🖼</div><div className="drop-zone-text">Klik atau drag gambar</div></>:<img src={projFilePreview} className="file-preview"/>}</div></>
                      }
                    </div>
                  </div>
                  <div className="factions">
                    <button type="submit" className={`btn-add${editingProj?' em':''}`} disabled={isLoading}>{isLoading?'Menyimpan...':editingProj?'✓ Simpan':'Tambahkan →'}</button>
                    {editingProj&&<button type="button" className="btn-cancel" onClick={resetProjForm}>Batal</button>}
                    {projSuccess&&<div className="toast">{projSuccess}</div>}
                  </div>
                </form>
              </div>
              <div className="items-grid">
                {projects.length===0?<div className="empty-st">Belum ada proyek.</div>:projects.map(proj=>(
                  <div key={proj.id} className="ac-card">
                    <div className="ac-thumb">{proj.image_url?<img src={proj.image_url} alt={proj.title}/>:<div className="ac-thumb-empty">{proj.title?proj.title[0]:'?'}</div>}</div>
                    <div className="ac-foot">
                      <div className="ac-title">{proj.title}</div>
                      <div className="ac-sub">{proj.description?.slice(0,50)}{proj.description?.length>50?'...':''}</div>
                      <div className="ac-actions">
                        <button className="btn-edit" onClick={()=>startEditProj(proj)}>✏ Edit</button>
                        <button className="btn-del" onClick={()=>handleDeleteProj(proj.id)}>🗑 Hapus</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── KOMENTAR ── */}
          {activeTab==='comments' && (
            <div style={{padding:'20px 0'}}>
              <div className="sec-actions">
                <span className="sec-label">{comments.length} komentar masuk</span>
                {comments.length>0&&<button className="btn-reset" onClick={handleDeleteAllComments}>🗑 Hapus Semua</button>}
              </div>
              {comments.length===0
                ? <div className="empty-st">Belum ada komentar.</div>
                : <div className="comments-list">
                  {comments.map(c=>(
                    <div key={c.id} className="comment-item">
                      <div className="comment-item-body">
                        <div className="comment-name">{c.name}</div>
                        <div className="comment-msg">{c.message}</div>
                        <div className="comment-dt">{new Date(c.created_at).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'})}</div>
                      </div>
                      <button className="comment-del" onClick={()=>handleDeleteComment(c.id)}>🗑</button>
                    </div>
                  ))}
                </div>
              }
            </div>
          )}

          {/* ── PENGUNJUNG ── */}
          {activeTab==='visitors' && (
            <div style={{padding:'20px 0'}}>
              <div className="sec-actions">
                <span className="sec-label">{visitors.length} kunjungan tercatat</span>
                {visitors.length>0&&<button className="btn-reset" onClick={handleClearVisitors}>🗑 Hapus Semua</button>}
              </div>
              {visitors.length===0
                ? <div className="empty-st">Belum ada data pengunjung.</div>
                : <div className="vis-list">
                  {visitors.map((v,i)=>{
                    const mob=/mobile|android|iphone|ipad/i.test(v.user_agent||'');
                    const model = v.device_model || '';
                    return(
                      <div key={v.id||i} className="vis-item">
                        <div className="vis-icon">{getDeviceIcon(v.user_agent)}</div>
                        <div className="vis-info">
                          <div className="vis-device">
                            <span style={{fontWeight:700,color:'var(--ink)'}}>{getBrowser(v.user_agent)}</span>
                            {' · '}{getOS(v.user_agent)}
                            {model&&<span style={{color:'var(--acc)',fontWeight:700,fontSize:'11px',marginLeft:'6px',padding:'1px 7px',background:'var(--bg)',border:'1px solid var(--bd)',borderRadius:'100px'}}>📱 {model}</span>}
                            <span className={`vis-badge ${mob?'mob':'desk'}`}>{mob?'Mobile':'Desktop'}</span>
                          </div>
                          <div className="vis-meta">
                            {v.screen_size&&<span>🖥 {v.screen_size}</span>}
                            {v.language&&<span>🌐 {v.language}</span>}
                            {v.timezone&&<span>🕐 {v.timezone}</span>}
                            {v.referrer&&v.referrer!=='direct'&&<span>↩ {v.referrer.replace(/https?:\/\//,'').split('/')[0]}</span>}
                          </div>
                        </div>
                        <div className="vis-time">{new Date(v.visited_at).toLocaleString('id-ID',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div>
                      </div>
                    );
                  })}
                </div>
              }
            </div>
          )}

          {/* ── TAMPILAN ── */}
          {activeTab==='appearance' && (
            <div style={{padding:'24px 0'}}>
              {settingsSaved && <div className="toast" style={{marginBottom:'16px'}}>{settingsSaved}</div>}

              {/* ACCENT COLOR */}
              <div className="panel">
                <div className="panel-head">
                  <h2 className="panel-title">🎨 Warna Aksen</h2>
                  <span style={{fontSize:'12px',color:'var(--ink2)'}}>Tersimpan Otomatis</span>
                </div>
                <div className="theme-grid">
                  {THEMES.map(t=>(
                    <button key={t.id} onClick={()=>handleThemeChange(t.color)} style={{padding:'16px 10px',border:`2px solid ${themeColor===t.color?t.color:'var(--bd)'}`,borderRadius:'16px',background:'var(--bg2)',outline:'none',position:'relative',transition:'all .2s'}}>
                      <div style={{width:'44px',height:'44px',borderRadius:'50%',background:t.color,margin:'0 auto 10px',boxShadow:`0 4px 16px ${t.color}55`}}/>
                      <div style={{fontFamily:'inherit',fontSize:'12px',fontWeight:'700',color:'var(--ink)',marginBottom:'3px'}}>{t.name}</div>
                      <div style={{fontFamily:'inherit',fontSize:'10px',color:'var(--ink3)'}}>{t.desc}</div>
                      {themeColor===t.color&&<div style={{position:'absolute',top:'8px',right:'8px',width:'18px',height:'18px',borderRadius:'50%',background:t.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',fontWeight:'700',color:'#000'}}>✓</div>}
                    </button>
                  ))}
                </div>
              </div>

              {/* BG THEME */}
              <div className="panel">
                <div className="panel-head">
                  <h2 className="panel-title">🌙 Warna Background</h2>
                </div>
                <div className="bg-grid">
                  {BG_THEMES.map(t=>(
                    <button key={t.id} onClick={()=>handleBgThemeChange(t.id)} style={{padding:'14px 10px',border:`2px solid ${bgTheme===t.id?themeColor:'var(--bd)'}`,borderRadius:'16px',background:'var(--bg2)',outline:'none',transition:'all .2s',position:'relative'}}>
                      <div style={{display:'flex',gap:'6px',justifyContent:'center',marginBottom:'10px'}}>
                        <div style={{width:'28px',height:'28px',borderRadius:'50%',background:t.darkBg,border:'1px solid rgba(255,255,255,.15)'}}/>
                        <div style={{width:'28px',height:'28px',borderRadius:'50%',background:t.lightBg,border:'1px solid rgba(0,0,0,.15)'}}/>
                      </div>
                      <div style={{fontFamily:'inherit',fontSize:'11px',fontWeight:'700',color:'var(--ink)',marginBottom:'3px'}}>{t.name}</div>
                      <div style={{fontFamily:'inherit',fontSize:'10px',color:'var(--ink3)'}}>{t.desc}</div>
                      {bgTheme===t.id&&<div style={{position:'absolute',top:'8px',right:'8px',width:'16px',height:'16px',borderRadius:'50%',background:themeColor,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'9px',fontWeight:'700',color:'#000'}}>✓</div>}
                    </button>
                  ))}
                </div>
              </div>

              {/* FONT */}
              <div className="panel">
                <div className="panel-head"><h2 className="panel-title">🔤 Gaya Font</h2></div>
                <div className="font-list">
                  {FONTS.map(f=>(
                    <button key={f.id} onClick={()=>handleFontChange(f.id)} style={{padding:'16px 20px',border:`2px solid ${fontChoice===f.id?themeColor:'var(--bd)'}`,borderRadius:'16px',background:'var(--bg2)',display:'grid',gridTemplateColumns:'1fr auto',alignItems:'center',gap:'16px',textAlign:'left',transition:'all .2s',outline:'none'}}>
                      <div>
                        <div style={{fontFamily:`'${f.heading}',serif`,fontSize:'22px',fontWeight:'700',color:'var(--ink)',marginBottom:'4px',letterSpacing:'-.5px'}}>{f.name} — Aa Bb Cc</div>
                        <div style={{fontFamily:`'${f.body}',sans-serif`,fontSize:'12px',color:'var(--ink2)'}}>{f.heading} + {f.body} · {f.desc}</div>
                      </div>
                      <div style={{width:'28px',height:'28px',borderRadius:'50%',border:`2px solid ${fontChoice===f.id?themeColor:'var(--bd)'}`,background:fontChoice===f.id?themeColor:'transparent',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',color:'#000',fontWeight:'700',flexShrink:0,transition:'all .2s'}}>
                        {fontChoice===f.id?'✓':''}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* MUSIC */}
              <div className="panel">
                <div className="panel-head"><h2 className="panel-title">🎵 Music Background</h2></div>
                <div className="music-section">
                  <div style={{marginBottom:'16px'}}>
                    <div style={{fontSize:'12px',fontWeight:'700',color:'var(--ink2)',marginBottom:'6px'}}>Music saat ini:</div>
                    <div className="music-url-display">{musicUrl === DEFAULT_MUSIC ? '🎵 Default — Pixabay Lo-fi' : musicUrl}</div>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
                    {/* Upload custom */}
                    <div>
                      <label className="fla">Upload Music Kustom (MP3)</label>
                      <div className="drop-zone" style={{marginBottom:'10px'}}>
                        <input type="file" ref={musicFileRef} accept="audio/mpeg,audio/mp3,audio/*" onChange={e=>setMusicFile(e.target.files[0]||null)}/>
                        {!musicFile
                          ? <><div className="drop-zone-icon">🎵</div><div className="drop-zone-text">Klik atau drag file MP3</div><div className="drop-zone-sub">Max 10MB</div></>
                          : <><div className="drop-zone-icon">✅</div><div className="drop-zone-text">{musicFile.name}</div><div className="drop-zone-sub">{(musicFile.size/1024/1024).toFixed(1)} MB</div></>
                        }
                      </div>
                      <div className="factions">
                        <button className="btn-add" onClick={handleMusicUpload} disabled={!musicFile||musicUploading}>{musicUploading?'Mengupload...':'⬆ Upload & Simpan'}</button>
                        <button className="btn-cancel" onClick={handleMusicDefault}>↺ Reset ke Default</button>
                        {musicSuccess&&<div className="toast">{musicSuccess}</div>}
                      </div>
                    </div>
                    <div style={{padding:'12px 14px',background:'var(--bg)',border:'1px solid var(--bd)',borderRadius:'10px',fontSize:'12px',color:'var(--ink2)',lineHeight:'1.6'}}>
                      <strong style={{color:'var(--ink)'}}>ℹ️ Catatan:</strong> Pastikan bucket <code>music</code> sudah dibuat di Supabase Storage dengan akses public. Atau gunakan tombol "Reset ke Default" untuk kembali ke musik bawaan.
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ── FOTO KOMUNITAS ── */}
          {activeTab==='photos' && (
            <div style={{padding:'24px 0'}}>
              {photoSuccess && <div className="toast" style={{marginBottom:'16px'}}>{photoSuccess}</div>}
              <div className="panel">
                <div className="panel-head">
                  <h2 className="panel-title">📸 Foto Komunitas</h2>
                  <span style={{fontSize:'12px',color:'var(--ink2)'}}>Foto dikirim pengunjung, perlu persetujuanmu</span>
                </div>
                {userPhotos.length === 0 && <div className="empty-st">Belum ada foto yang dikirim.</div>}
                <div className="items-grid">
                  {userPhotos.map(photo=>(
                    <div key={photo.id} className="ac-card" style={{border: photo.approved?'2px solid rgba(34,197,94,.4)':'2px solid var(--bd)'}}>
                      <div className="ac-thumb">
                        {photo.image_url ? <img src={photo.image_url} alt={photo.sender_name}/> : <div className="ac-thumb-empty">📷</div>}
                      </div>
                      <div className="ac-foot">
                        <div className="ac-title">{photo.sender_name||'Anonim'}{photo.instagram&&<span style={{fontSize:'10px',color:'var(--acc)',marginLeft:'6px'}}>@{photo.instagram}</span>}</div>
                        <div className="ac-sub">{photo.caption?.slice(0,50)||''}</div>
                        <div style={{fontSize:'10px',color:'var(--ink3)',marginTop:'4px'}}>{new Date(photo.created_at).toLocaleDateString('id-ID')}</div>
                        {photo.approved
                          ? <div style={{fontSize:'11px',fontWeight:'700',color:'#16a34a',marginTop:'6px'}}>✓ Disetujui</div>
                          : <div className="ac-actions">
                              <button className="btn-edit" style={{background:'rgba(34,197,94,.1)',color:'#16a34a',borderColor:'rgba(34,197,94,.3)'}} onClick={()=>handleApprovePhoto(photo.id)}>✓ Setujui</button>
                              <button className="btn-del" onClick={()=>handleRejectPhoto(photo.id)}>🗑 Tolak</button>
                            </div>
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}