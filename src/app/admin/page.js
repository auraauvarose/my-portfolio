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

  // Certs
  const [certificates, setCertificates] = useState([]);
  const [certForm, setCertForm] = useState({ image_url: '', title: '', issuer: '' });
  const [certFile, setCertFile] = useState(null);
  const [certFilePreview, setCertFilePreview] = useState('');
  const [certUploadMode, setCertUploadMode] = useState('url');
  const [certSuccess, setCertSuccess] = useState('');
  const [editingCert, setEditingCert] = useState(null);
  const certFileRef = useRef();

  // Projects
  const [projects, setProjects] = useState([]);
  const [projForm, setProjForm] = useState({ title: '', description: '', tech_stack: '', github_url: '', demo_url: '', image_url: '' });
  const [projFile, setProjFile] = useState(null);
  const [projFilePreview, setProjFilePreview] = useState('');
  const [projUploadMode, setProjUploadMode] = useState('url');
  const [projSuccess, setProjSuccess] = useState('');
  const [editingProj, setEditingProj] = useState(null);
  const projFileRef = useRef();

  // Comments
  const [comments, setComments] = useState([]);

  // Visitors
  const [visitors, setVisitors] = useState([]);
  const [viewCount, setViewCount] = useState(0);

  const d = isDark;

  useEffect(() => {
    const bg = d ? '#111110' : '#ffffff';
    document.documentElement.style.background = bg;
    document.body.style.background = bg;
    document.body.style.margin = '0';
    document.body.style.padding = '0';
  }, [d]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'aura123') { setIsAuthenticated(true); fetchAll(); } // password login
    else setLoginError('Password salah.');
  };

  const fetchAll = async () => {
    setIsLoading(true);
    const [c, p, cm, vw, vi] = await Promise.all([
      supabase.from('certificates').select('*').order('created_at', { ascending: false }),
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('comments').select('*').order('created_at', { ascending: false }),
      supabase.from('views').select('count').eq('slug', 'home').single(),
      supabase.from('visitors').select('*').order('visited_at', { ascending: false }).limit(200),
    ]);
    if (c.data) setCertificates(c.data);
    if (p.data) setProjects(p.data);
    if (cm.data) setComments(cm.data);
    if (vw.data) setViewCount(vw.data.count);
    if (vi.data) setVisitors(vi.data);
    setIsLoading(false);
  };

  // ── Upload file ke Supabase Storage ──
  const uploadFile = async (file, bucket) => {
    const ext = file.name.split('.').pop();
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { data, error } = await supabase.storage.from(bucket).upload(name, file, { upsert: false });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(name);
    return urlData.publicUrl;
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
        setCertSuccess('✓ Sertifikat diperbarui!');
      } else {
        await supabase.from('certificates').insert([{ ...certForm, image_url: url }]);
        setCertSuccess('✓ Sertifikat ditambahkan!');
      }
      resetCertForm(); setTimeout(() => setCertSuccess(''), 3000);
      const { data } = await supabase.from('certificates').select('*').order('created_at', { ascending: false });
      if (data) setCertificates(data);
    } catch (err) { alert('Upload gagal: ' + err.message); }
    setIsLoading(false);
  };
  const resetCertForm = () => { setCertForm({ image_url: '', title: '', issuer: '' }); setCertFile(null); setCertFilePreview(''); setEditingCert(null); if (certFileRef.current) certFileRef.current.value = ''; };
  const startEditCert = (cert) => { setEditingCert(cert); setCertForm({ image_url: cert.image_url, title: cert.title || '', issuer: cert.issuer || '' }); setCertUploadMode('url'); setCertFilePreview(cert.image_url); window.scrollTo({ top: 0, behavior: 'smooth' }); };
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
        setProjSuccess('✓ Proyek diperbarui!');
      } else {
        await supabase.from('projects').insert([{ ...projForm, image_url: url }]);
        setProjSuccess('✓ Proyek ditambahkan!');
      }
      resetProjForm(); setTimeout(() => setProjSuccess(''), 3000);
      const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      if (data) setProjects(data);
    } catch (err) { alert('Upload gagal: ' + err.message); }
    setIsLoading(false);
  };
  const resetProjForm = () => { setProjForm({ title: '', description: '', tech_stack: '', github_url: '', demo_url: '', image_url: '' }); setProjFile(null); setProjFilePreview(''); setEditingProj(null); if (projFileRef.current) projFileRef.current.value = ''; };
  const startEditProj = (proj) => { setEditingProj(proj); setProjForm({ title: proj.title || '', description: proj.description || '', tech_stack: proj.tech_stack || '', github_url: proj.github_url || '', demo_url: proj.demo_url || '', image_url: proj.image_url || '' }); setProjUploadMode('url'); setProjFilePreview(proj.image_url || ''); window.scrollTo({ top: 0, behavior: 'smooth' }); };
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
    if (!confirm('Hapus SEMUA komentar? Tidak bisa dikembalikan!')) return;
    await supabase.from('comments').delete().neq('id', 0);
    setComments([]);
  };

  // ── VIEWS RESET ──
  const handleResetViews = async () => {
    if (!confirm('Reset counter pengunjung ke 0?')) return;
    await supabase.from('views').update({ count: 0 }).eq('slug', 'home');
    setViewCount(0);
  };

  // ── VISITORS ──
  const handleClearVisitors = async () => {
    if (!confirm('Hapus semua riwayat kunjungan device?')) return;
    await supabase.from('visitors').delete().neq('id', 0);
    setVisitors([]);
  };

  const onCertFileChange = (e) => { const f = e.target.files[0]; if (!f) return; setCertFile(f); setCertFilePreview(URL.createObjectURL(f)); };
  const onProjFileChange = (e) => { const f = e.target.files[0]; if (!f) return; setProjFile(f); setProjFilePreview(URL.createObjectURL(f)); };

  // ── DEVICE ICON helper ──
  const getDeviceIcon = (ua = '') => {
    if (/mobile|android|iphone|ipad/i.test(ua)) return '📱';
    if (/tablet/i.test(ua)) return '📟';
    return '🖥️';
  };
  const getBrowser = (ua = '') => {
    if (/edg/i.test(ua)) return 'Edge';
    if (/chrome/i.test(ua)) return 'Chrome';
    if (/firefox/i.test(ua)) return 'Firefox';
    if (/safari/i.test(ua)) return 'Safari';
    if (/opera/i.test(ua)) return 'Opera';
    return 'Browser lain';
  };
  const getOS = (ua = '') => {
    if (/windows/i.test(ua)) return 'Windows';
    if (/android/i.test(ua)) return 'Android';
    if (/iphone|ipad/i.test(ua)) return 'iOS';
    if (/mac/i.test(ua)) return 'macOS';
    if (/linux/i.test(ua)) return 'Linux';
    return 'OS lain';
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,900;1,9..144,400;1,9..144,700&display=swap');
    *,*::before,*::after{box-sizing:border-box;}
    html{margin:0;padding:0;width:100%;overflow-x:hidden;scrollbar-width:none;}
    html::-webkit-scrollbar{display:none;}
    body{margin:0;padding:0;width:100%;overflow-x:hidden;}

    .aw{
      --acc:#d4eb00;--acc-bg:rgba(212,235,0,0.1);
      --ink:#1a1a1a;--ink2:#555555;--ink3:#999999;
      --bg:#ffffff;--bg2:#f4f4f0;--bd:rgba(0,0,0,0.09);
      --shadow:rgba(0,0,0,0.07);--danger:rgba(239,68,68,0.1);--danger-bd:rgba(239,68,68,0.3);
      font-family:'Plus Jakarta Sans',sans-serif;
      background:var(--bg);color:var(--ink);min-height:100vh;width:100%;
      transition:background 0.4s,color 0.4s;
    }
    .aw.dark{
      --ink:#f0efe8;--ink2:#909088;--ink3:#555550;
      --bg:#111110;--bg2:#1c1c1a;--bd:rgba(255,255,255,0.07);
      --shadow:rgba(0,0,0,0.3);
    }

    .anav{position:fixed;top:0;left:0;right:0;z-index:50;background:var(--bg);border-bottom:1px solid var(--bd);backdrop-filter:blur(12px);transition:background 0.4s;}
    .anav-in{max-width:1200px;margin:0 auto;padding:0 32px;height:60px;display:flex;align-items:center;justify-content:space-between;gap:12px;}
    .alogo{font-family:'Fraunces',serif;font-size:20px;font-weight:900;color:var(--ink);text-decoration:none;}
    .alogo em{font-style:normal;color:var(--acc);}
    .anav-right{display:flex;align-items:center;gap:8px;}
    .badge{font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--ink2);padding:4px 10px;border:1px solid var(--bd);background:var(--bg2);border-radius:100px;}
    .btn-site{padding:6px 14px;background:transparent;border:1px solid var(--bd);color:var(--ink2);border-radius:100px;font-family:inherit;font-size:12px;font-weight:700;text-decoration:none;display:flex;align-items:center;gap:4px;transition:all 0.2s;}
    .btn-site:hover{color:var(--ink);border-color:var(--acc);}
    .btn-th{padding:6px 14px;border:1px solid var(--bd);background:var(--bg2);color:var(--ink);border-radius:100px;font-family:inherit;font-size:12px;font-weight:700;transition:all 0.2s;}
    .btn-th:hover{border-color:var(--acc);}

    .awrap{max-width:1200px;margin:0 auto;padding:0 32px;}

    .lbar{position:fixed;top:60px;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--acc),transparent);background-size:200% 100%;animation:shimmer 1.2s ease infinite;z-index:100;}
    @keyframes shimmer{0%{background-position:200% 0;}100%{background-position:-200% 0;}}

    /* LOGIN */
    .login-outer{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;}
    .login-card{width:100%;max-width:400px;padding:44px 36px;background:var(--bg2);border:1px solid var(--bd);border-radius:22px;}
    .l-eye{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:var(--ink2);margin-bottom:10px;}
    .l-title{font-family:'Fraunces',serif;font-size:38px;font-weight:900;line-height:0.95;letter-spacing:-0.02em;color:var(--ink);margin:0 0 28px;}
    .l-title em{font-style:italic;font-weight:400;color:var(--ink2);}
    .fl{display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--ink2);margin-bottom:6px;}
    .fi{width:100%;padding:13px 15px;background:var(--bg);border:1.5px solid var(--bd);color:var(--ink);border-radius:11px;font-family:inherit;font-size:15px;letter-spacing:3px;outline:none;transition:border-color 0.2s,box-shadow 0.2s;margin-bottom:12px;}
    .fi::placeholder{letter-spacing:0;color:var(--ink3);}
    .fi:focus{border-color:var(--acc);box-shadow:0 0 0 3px var(--acc-bg);}
    .l-err{padding:10px 13px;border-radius:10px;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);color:#dc2626;font-size:12px;font-weight:600;margin-bottom:12px;}
    .btn-login{width:100%;padding:14px;background:var(--ink);color:var(--bg);border:none;border-radius:11px;font-family:inherit;font-size:14px;font-weight:700;letter-spacing:0.04em;transition:all 0.2s;}
    .btn-login:hover{transform:translateY(-2px);box-shadow:0 8px 24px var(--shadow);}

    /* DASHBOARD */
    .dash-hdr{padding-top:80px;padding-bottom:32px;border-bottom:1px solid var(--bd);}
    .d-eye{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:var(--ink2);margin-bottom:8px;}
    .d-title{font-family:'Fraunces',serif;font-size:clamp(28px,4vw,48px);font-weight:900;line-height:0.95;letter-spacing:-0.02em;color:var(--ink);margin:0;}
    .d-title em{font-style:italic;font-weight:400;color:var(--ink2);}

    /* STATS */
    .dstats{display:grid;grid-template-columns:repeat(4,1fr);border-bottom:1px solid var(--bd);}
    .dstat{padding:24px 0;text-align:center;border-right:1px solid var(--bd);}
    .dstat:last-child{border-right:none;}
    .dstat-n{font-family:'Fraunces',serif;font-size:32px;font-weight:900;color:var(--ink);line-height:1;margin-bottom:4px;}
    .dstat-l{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--ink2);}
    .dstat-action{margin-top:8px;}
    .btn-reset{padding:4px 11px;background:var(--danger);border:1px solid var(--danger-bd);color:#dc2626;border-radius:100px;font-family:inherit;font-size:10px;font-weight:700;transition:all 0.2s;}
    .btn-reset:hover{background:#ef4444;color:white;border-color:#ef4444;}

    /* TABS */
    .tabs{display:flex;gap:0;border-bottom:1px solid var(--bd);margin-top:28px;overflow-x:auto;}
    .tab-btn{padding:12px 24px;background:transparent;border:none;font-family:inherit;font-size:13px;font-weight:700;color:var(--ink2);border-bottom:2px solid transparent;margin-bottom:-1px;transition:all 0.2s;white-space:nowrap;}
    .tab-btn:hover{color:var(--ink);}
    .tab-btn.active{color:var(--ink);border-bottom-color:var(--acc);}
    .tab-count{display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;border-radius:100px;background:var(--bg2);font-size:10px;font-weight:700;color:var(--ink2);margin-left:6px;padding:0 4px;}
    .tab-btn.active .tab-count{background:var(--acc);color:#0d0d0d;}

    /* PANEL */
    .panel{padding:28px 0;border-bottom:1px solid var(--bd);}
    .panel-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px;}
    .panel-title{font-family:'Fraunces',serif;font-size:20px;font-weight:900;color:var(--ink);margin:0;}
    .panel-edit-badge{display:flex;align-items:center;gap:7px;padding:5px 12px;background:rgba(212,235,0,0.15);border:1px solid rgba(212,235,0,0.4);border-radius:100px;font-size:10px;font-weight:700;color:var(--ink);}
    .panel-edit-badge span{width:6px;height:6px;border-radius:50%;background:var(--acc);}

    .upload-toggle{display:flex;gap:0;background:var(--bg2);border:1px solid var(--bd);border-radius:9px;overflow:hidden;width:fit-content;margin-bottom:14px;}
    .upload-opt{padding:7px 14px;font-family:inherit;font-size:11px;font-weight:700;border:none;background:transparent;color:var(--ink2);transition:all 0.2s;}
    .upload-opt.active{background:var(--ink);color:var(--bg);}

    .drop-zone{border:2px dashed var(--bd);border-radius:12px;padding:24px;text-align:center;transition:border-color 0.2s,background 0.2s;position:relative;overflow:hidden;}
    .drop-zone:hover{border-color:var(--acc);background:var(--acc-bg);}
    .drop-zone input[type=file]{position:absolute;inset:0;opacity:0;width:100%;height:100%;}
    .drop-zone-icon{font-size:26px;margin-bottom:8px;}
    .drop-zone-text{font-size:13px;font-weight:600;color:var(--ink2);}
    .drop-zone-sub{font-size:11px;color:var(--ink3);margin-top:3px;}
    .file-preview{width:100%;max-height:140px;object-fit:cover;border-radius:9px;margin-top:10px;border:1px solid var(--bd);}

    .fgrid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
    .fgrid-full{grid-column:1/-1;}
    .fla{display:block;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--ink2);margin-bottom:6px;}
    .fin,.fta{width:100%;padding:12px 14px;background:var(--bg2);border:1.5px solid var(--bd);color:var(--ink);border-radius:10px;font-family:inherit;font-size:13px;outline:none;transition:border-color 0.2s,box-shadow 0.2s;}
    .fin::placeholder,.fta::placeholder{color:var(--ink3);}
    .fin:focus,.fta:focus{border-color:var(--acc);box-shadow:0 0 0 3px var(--acc-bg);}
    .fta{height:80px;resize:vertical;}
    .factions{display:flex;align-items:center;gap:8px;margin-top:14px;flex-wrap:wrap;}
    .btn-add{padding:11px 22px;background:var(--ink);color:var(--bg);border:none;border-radius:10px;font-family:inherit;font-size:12px;font-weight:700;transition:all 0.2s;}
    .btn-add:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 6px 20px var(--shadow);}
    .btn-add:disabled{opacity:0.5;}
    .btn-add.em{background:var(--acc);color:#0d0d0d;}
    .btn-cancel{padding:11px 16px;background:transparent;border:1px solid var(--bd);color:var(--ink2);border-radius:10px;font-family:inherit;font-size:12px;font-weight:700;transition:all 0.2s;}
    .btn-cancel:hover{border-color:var(--ink);color:var(--ink);}
    .toast{display:flex;align-items:center;gap:7px;padding:10px 14px;border-radius:9px;background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.25);color:#16a34a;font-size:12px;font-weight:600;}

    /* ITEMS */
    .items-grid{padding:24px 0;display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px;}
    .empty-st{padding:50px 24px;text-align:center;border:1px dashed var(--bd);border-radius:18px;color:var(--ink2);font-size:13px;grid-column:1/-1;}

    .ac-card{background:var(--bg2);border:1.5px solid var(--bd);border-radius:16px;overflow:hidden;transition:border-color 0.2s,box-shadow 0.2s;}
    .ac-card:hover{border-color:var(--acc);box-shadow:0 6px 24px var(--shadow);}
    .ac-thumb{aspect-ratio:16/10;overflow:hidden;background:var(--bg);}
    .ac-thumb img{width:100%;height:100%;object-fit:cover;transition:transform 0.4s;}
    .ac-card:hover .ac-thumb img{transform:scale(1.04);}
    .ac-thumb-empty{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-family:'Fraunces',serif;font-size:36px;font-weight:900;color:var(--bd);}
    .ac-foot{padding:12px 14px;}
    .ac-title{font-size:13px;font-weight:700;color:var(--ink);margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .ac-sub{font-size:11px;color:var(--ink2);}
    .ac-actions{display:flex;gap:6px;margin-top:10px;}
    .btn-edit{flex:1;padding:7px;background:var(--acc);color:#0d0d0d;border:none;border-radius:8px;font-family:inherit;font-size:11px;font-weight:700;transition:opacity 0.2s;}
    .btn-edit:hover{opacity:0.8;}
    .btn-del{flex:1;padding:7px;background:var(--danger);border:1px solid var(--danger-bd);color:#dc2626;border-radius:8px;font-family:inherit;font-size:11px;font-weight:700;transition:all 0.2s;}
    .btn-del:hover{background:#ef4444;color:white;border-color:#ef4444;}

    /* COMMENTS */
    .comments-list{display:flex;flex-direction:column;gap:10px;padding:20px 0;}
    .comment-item{padding:14px 16px;background:var(--bg2);border:1.5px solid var(--bd);border-radius:14px;display:flex;align-items:flex-start;justify-content:space-between;gap:12px;transition:border-color 0.2s;}
    .comment-item:hover{border-color:var(--bd);}
    .comment-item-body{flex:1;min-width:0;}
    .comment-name{font-size:13px;font-weight:700;color:var(--ink);margin-bottom:4px;}
    .comment-msg{font-size:13px;color:var(--ink2);line-height:1.55;margin-bottom:5px;word-break:break-word;}
    .comment-dt{font-size:10px;font-weight:600;color:var(--ink3);text-transform:uppercase;letter-spacing:0.08em;}
    .comment-del{padding:6px 11px;background:var(--danger);border:1px solid var(--danger-bd);color:#dc2626;border-radius:8px;font-family:inherit;font-size:11px;font-weight:700;white-space:nowrap;flex-shrink:0;transition:all 0.2s;}
    .comment-del:hover{background:#ef4444;color:white;border-color:#ef4444;}
    .sec-actions{display:flex;gap:8px;margin-bottom:16px;align-items:center;flex-wrap:wrap;}
    .sec-label{font-size:13px;font-weight:600;color:var(--ink2);}

    /* VISITORS */
    .vis-list{display:flex;flex-direction:column;gap:8px;padding:16px 0;}
    .vis-item{padding:14px 16px;background:var(--bg2);border:1.5px solid var(--bd);border-radius:14px;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:14px;transition:border-color 0.2s;}
    .vis-item:hover{border-color:var(--acc);}
    .vis-icon{font-size:22px;flex-shrink:0;}
    .vis-info{min-width:0;}
    .vis-device{font-size:13px;font-weight:700;color:var(--ink);margin-bottom:3px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
    .vis-badge{padding:2px 8px;border-radius:100px;font-size:10px;font-weight:700;letter-spacing:0.05em;}
    .vis-badge.mob{background:rgba(59,130,246,0.1);color:#3b82f6;border:1px solid rgba(59,130,246,0.2);}
    .vis-badge.desk{background:rgba(34,197,94,0.1);color:#16a34a;border:1px solid rgba(34,197,94,0.2);}
    .vis-meta{font-size:11px;color:var(--ink3);display:flex;gap:12px;flex-wrap:wrap;}
    .vis-meta span{display:flex;align-items:center;gap:4px;}
    .vis-time{font-size:11px;font-weight:600;color:var(--ink3);text-align:right;white-space:nowrap;}
    .vis-screen{font-size:11px;color:var(--ink3);}

    /* PROJ extras */
    .ac-stack{display:flex;flex-wrap:wrap;gap:3px;margin-top:5px;}
    .ac-chip{padding:2px 7px;background:var(--bg);border:1px solid var(--bd);border-radius:100px;font-size:9px;font-weight:700;color:var(--ink3);}
    .ac-links{display:flex;gap:5px;margin-top:6px;}
    .ac-link{font-size:10px;font-weight:700;color:var(--ink2);text-decoration:none;padding:3px 8px;border:1px solid var(--bd);border-radius:100px;transition:all 0.2s;}
    .ac-link:hover{border-color:var(--acc);color:var(--ink);}

    @keyframes up{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}

    @media(max-width:768px){
      .awrap,.anav-in{padding-left:16px;padding-right:16px;}
      .fgrid{grid-template-columns:1fr;}
      .dstats{grid-template-columns:1fr 1fr;}
      .dstat:nth-child(2){border-right:none;}
      .dstat:nth-child(4){border-right:none;}
      .items-grid{grid-template-columns:1fr 1fr;}
      .vis-item{grid-template-columns:auto 1fr;}
      .vis-time{display:none;}
    }
    @media(max-width:480px){
      .items-grid{grid-template-columns:1fr;}
      .d-title{font-size:26px;}
      .dstats{grid-template-columns:1fr 1fr;}
    }
  `;

  // ── LOGIN ──
  if (!isAuthenticated) return (
    <>
      <style>{css}</style>
      <div className={`aw${d?' dark':''}`}>
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

  // ── DASHBOARD ──
  return (
    <>
      <style>{css}</style>
      <div className={`aw${d?' dark':''}`}>
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
            <div className="dstat">
              <div className="dstat-n">{certificates.length}</div>
              <div className="dstat-l">Sertifikat</div>
            </div>
            <div className="dstat">
              <div className="dstat-n">{projects.length}</div>
              <div className="dstat-l">Proyek</div>
            </div>
            <div className="dstat">
              <div className="dstat-n">{comments.length}</div>
              <div className="dstat-l">Komentar</div>
            </div>
            <div className="dstat">
              <div className="dstat-n">{viewCount}</div>
              <div className="dstat-l">Total Kunjungan</div>
              <div className="dstat-action">
                <button className="btn-reset" onClick={handleResetViews}>Reset → 0</button>
              </div>
            </div>
          </div>

          {/* TABS */}
          <div className="tabs">
            {[
              {id:'certs',label:'Sertifikat',count:certificates.length},
              {id:'projects',label:'Proyek',count:projects.length},
              {id:'comments',label:'Komentar',count:comments.length},
              {id:'visitors',label:'Pengunjung',count:visitors.length},
            ].map(t=>(
              <button key={t.id} className={`tab-btn${activeTab===t.id?' active':''}`} onClick={()=>setActiveTab(t.id)}>
                {t.label}<span className="tab-count">{t.count}</span>
              </button>
            ))}
          </div>

          {/* ── TAB SERTIFIKAT ── */}
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
                      {certUploadMode==='url' ? (
                        <><label className="fla">URL Gambar</label><input type="url" placeholder="https://..." value={certForm.image_url} onChange={e=>setCertForm({...certForm,image_url:e.target.value})} className="fin"/>{certForm.image_url&&<img src={certForm.image_url} className="file-preview" onError={e=>e.target.style.display='none'}/>}</>
                      ):(
                        <><label className="fla">File Gambar (JPG, PNG)</label><div className="drop-zone"><input type="file" ref={certFileRef} accept="image/*,.pdf" onChange={onCertFileChange}/>{!certFilePreview?(<><div className="drop-zone-icon">📄</div><div className="drop-zone-text">Klik atau drag file ke sini</div><div className="drop-zone-sub">JPG, PNG, PDF — maks 10MB</div></>):(<img src={certFilePreview} className="file-preview"/>)}</div>{certFile&&<div style={{fontSize:'11px',color:'var(--ink2)',marginTop:'6px'}}>📎 {certFile.name}</div>}</>
                      )}
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

          {/* ── TAB PROYEK ── */}
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
                    <div><label className="fla">Tech Stack (pisah koma)</label><input type="text" placeholder="Node.js, Express, PostgreSQL" value={projForm.tech_stack} onChange={e=>setProjForm({...projForm,tech_stack:e.target.value})} className="fin"/></div>
                    <div className="fgrid-full"><label className="fla">Deskripsi</label><textarea placeholder="Jelaskan proyek ini..." value={projForm.description} onChange={e=>setProjForm({...projForm,description:e.target.value})} className="fta"/></div>
                    <div><label className="fla">Link GitHub</label><input type="url" placeholder="https://github.com/..." value={projForm.github_url} onChange={e=>setProjForm({...projForm,github_url:e.target.value})} className="fin"/></div>
                    <div><label className="fla">Link Demo</label><input type="url" placeholder="https://..." value={projForm.demo_url} onChange={e=>setProjForm({...projForm,demo_url:e.target.value})} className="fin"/></div>
                    <div className="fgrid-full">
                      {projUploadMode==='url'?(<><label className="fla">URL Thumbnail</label><input type="url" placeholder="https://..." value={projForm.image_url} onChange={e=>setProjForm({...projForm,image_url:e.target.value})} className="fin"/>{projForm.image_url&&<img src={projForm.image_url} className="file-preview" onError={e=>e.target.style.display='none'}/>}</>):(<><label className="fla">File Thumbnail</label><div className="drop-zone"><input type="file" ref={projFileRef} accept="image/*" onChange={onProjFileChange}/>{!projFilePreview?(<><div className="drop-zone-icon">🖼</div><div className="drop-zone-text">Klik atau drag gambar</div><div className="drop-zone-sub">JPG, PNG — maks 10MB</div></>):(<img src={projFilePreview} className="file-preview"/>)}</div>{projFile&&<div style={{fontSize:'11px',color:'var(--ink2)',marginTop:'6px'}}>📎 {projFile.name}</div>}</>)}
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
                {projects.length===0?<div className="empty-st">Belum ada proyek.</div>:projects.map(proj=>{
                  const stack=proj.tech_stack?proj.tech_stack.split(',').map(s=>s.trim()):[];
                  return(
                    <div key={proj.id} className="ac-card">
                      <div className="ac-thumb">{proj.image_url?<img src={proj.image_url} alt={proj.title}/>:<div className="ac-thumb-empty">{proj.title?proj.title[0]:'?'}</div>}</div>
                      <div className="ac-foot">
                        <div className="ac-title">{proj.title}</div>
                        {proj.description&&<div className="ac-sub" style={{display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{proj.description}</div>}
                        {stack.length>0&&<div className="ac-stack">{stack.slice(0,4).map(s=><span key={s} className="ac-chip">{s}</span>)}</div>}
                        <div className="ac-links">
                          {proj.github_url&&<a href={proj.github_url} target="_blank" rel="noopener noreferrer" className="ac-link">GitHub ↗</a>}
                          {proj.demo_url&&<a href={proj.demo_url} target="_blank" rel="noopener noreferrer" className="ac-link">Demo ↗</a>}
                        </div>
                        <div className="ac-actions">
                          <button className="btn-edit" onClick={()=>startEditProj(proj)}>✏ Edit</button>
                          <button className="btn-del" onClick={()=>handleDeleteProj(proj.id)}>🗑 Hapus</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ── TAB KOMENTAR ── */}
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

          {/* ── TAB PENGUNJUNG ── */}
          {activeTab==='visitors' && (
            <div style={{padding:'20px 0'}}>
              <div className="sec-actions">
                <span className="sec-label">{visitors.length} kunjungan tercatat</span>
                {visitors.length>0&&<button className="btn-reset" onClick={handleClearVisitors}>🗑 Hapus Semua</button>}
              </div>
              {visitors.length===0
                ? <div className="empty-st">Belum ada data pengunjung. Pastikan tabel <code>visitors</code> sudah dibuat di Supabase (lihat SQL di bawah).</div>
                : <div className="vis-list">
                  {visitors.map((v,i)=>{
                    const isMobile=/mobile|android|iphone|ipad/i.test(v.user_agent||'');
                    return(
                      <div key={v.id||i} className="vis-item">
                        <div className="vis-icon">{getDeviceIcon(v.user_agent)}</div>
                        <div className="vis-info">
                          <div className="vis-device">
                            {getBrowser(v.user_agent)} on {getOS(v.user_agent)}
                            <span className={`vis-badge ${isMobile?'mob':'desk'}`}>{isMobile?'Mobile':'Desktop'}</span>
                          </div>
                          <div className="vis-meta">
                            {v.screen_size&&<span>🖥 {v.screen_size}</span>}
                            {v.language&&<span>🌐 {v.language}</span>}
                            {v.timezone&&<span>🕐 {v.timezone}</span>}
                            {v.referrer&&v.referrer!=='direct'&&<span>↩ {v.referrer.replace('https://','').replace('http://','').split('/')[0]}</span>}
                          </div>
                        </div>
                        <div className="vis-time">{new Date(v.visited_at).toLocaleString('id-ID',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div>
                      </div>
                    );
                  })}
                </div>
              }
              <div style={{marginTop:'24px',padding:'16px',background:'var(--bg2)',border:'1px solid var(--bd)',borderRadius:'14px',fontSize:'12px',color:'var(--ink2)',lineHeight:'1.7'}}>
                <div style={{fontWeight:'700',color:'var(--ink)',marginBottom:'8px'}}>⚠️ Belum ada data? Jalankan SQL ini di Supabase:</div>
                <pre style={{margin:0,fontFamily:'monospace',fontSize:'11px',whiteSpace:'pre-wrap',color:'var(--acc)'}}>{`CREATE TABLE IF NOT EXISTS visitors (
  id BIGSERIAL PRIMARY KEY,
  user_agent TEXT,
  screen_size TEXT,
  language TEXT,
  timezone TEXT,
  referrer TEXT,
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON visitors FOR ALL USING (true) WITH CHECK (true);`}</pre>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}