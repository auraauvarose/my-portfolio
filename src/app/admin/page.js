"use client";
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import BackgroundCanvas from '@/components/animations/BackgroundCanvas';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('default_theme');
      if (saved) return saved === 'dark';
    }
    return true;
  });
  const [activeTab, setActiveTab] = useState('certs');
  const [isLoading, setIsLoading] = useState(false);
  
  const bgCanvasRef = useRef(null);
  const bgAnimRef = useRef(null);
  
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
  
  // Appearance & Settings — read from localStorage first to prevent flash
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
  const [defaultTheme, setDefaultTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('default_theme') || 'dark';
    }
    return 'dark';
  });
  const [bgAnimation, setBgAnimation] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('bg_animation') || 'none';
    }
    return 'none';
  });
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
  
  // Profile photo
  const [profilePreview, setProfilePreview] = useState('');
  const [profileFile, setProfileFile] = useState(null);
  const [profileUploading, setProfileUploading] = useState(false);
  const profileFileRef = useRef();
  
  // Update broadcast
  const [updateBanner, setUpdateBanner] = useState('');

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
    { id: 'sage',    name: 'Soft Sage',  color: '#ACC8A2', desc: 'Natural · Botanical' },
    { id: 'pumpkin', name: 'Pumpkin',    color: '#FD802E', desc: 'Vibrant · Bold' },
    { id: 'honey',   name: 'Honey Tan',  color: '#E3C586', desc: 'Warm · Premium' },
    { id: 'periwinkle', name: 'Periwinkle', color: '#DBD5F2', desc: 'Dreamy · Soft' },
    { id: 'muted_violet', name: 'Muted Violet', color: '#544470', desc: 'Deep · Mystis' },
    { id: 'coral',   name: 'Coral Reef', color: '#FF7F7F', desc: 'Ocean · Fresh' },
    { id: 'mint',    name: 'Mint Green', color: '#98FF98', desc: 'Cool · Refreshing' },
    { id: 'lavender', name: 'Lavender',  color: '#E6E6FA', desc: 'Calm · Elegant' },
    { id: 'teal',    name: 'Teal Ocean', color: '#008080', desc: 'Deep · Mysterious' },
    { id: 'magenta', name: 'Magenta',    color: '#FF00FF', desc: 'Bold · Vibrant' },
    { id: 'electric_purple', name: 'Electric Purple', color: '#8b5cf6', desc: 'Futuristic · Bright' },
    { id: 'frozen_cyan', name: 'Frozen Cyan', color: '#22d3ee', desc: 'Frosty · Neon' },
    { id: 'neon_pink', name: 'Neon Pink', color: '#f43f5e', desc: 'Vibrant · Cyber' },
    { id: 'banana_yellow', name: 'Banana Yellow', color: '#facc15', desc: 'Bright · Playful' },
    { id: 'sakura_bloom', name: 'Sakura Bloom', color: '#fda4af', desc: 'Soft · Floral' },
  ];

  const BG_THEMES = [
    { id: 'default', name: 'Gelap / Terang',    darkBg:'#111110', darkBg2:'#1c1c1a', lightBg:'#ffffff', lightBg2:'#f4f4f0',  desc:'Classic original' },
    { id: 'warm',    name: 'Coklat / Krem',     darkBg:'#1a1410', darkBg2:'#271e14', lightBg:'#f5f0e8', lightBg2:'#ece5d5', desc:'Warm editorial' },
    { id: 'navy',    name: 'Navy / Krim',       darkBg:'#0d1117', darkBg2:'#161b22', lightBg:'#fdf6e3', lightBg2:'#f0e8cc', desc:'Dev / GitHub vibes' },
    { id: 'forest',  name: 'Hutan / Putih',     darkBg:'#0d1a0f', darkBg2:'#142518', lightBg:'#f0f7f0', lightBg2:'#dceadc', desc:'Natural · Fresh' },
    { id: 'slate',   name: 'Batu Tulis / Perak',darkBg:'#0f1117', darkBg2:'#181c27', lightBg:'#f8f9fb', lightBg2:'#eaedf2', desc:'Cool · Profesional' },
    { id: 'mocha',   name: 'Mocha / Krem',       darkBg:'#1c1510', darkBg2:'#2a1e14', lightBg:'#faf3e8', lightBg2:'#ede0cc', desc:'Coffee · Cozy' },
    { id: 'midnight',name: 'Midnight / Lavender', darkBg:'#0a0a14', darkBg2:'#12121f', lightBg:'#f0eeff', lightBg2:'#e3ddff', desc:'Night · Mystis' },
    { id: 'rose_bg', name: 'Mawar / Blush',       darkBg:'#180d12', darkBg2:'#25101a', lightBg:'#fff0f4', lightBg2:'#ffe0ea', desc:'Romantic · Soft' },
    { id: 'ash',     name: 'Abu / Putih Bersih',  darkBg:'#141414', darkBg2:'#1f1f1f', lightBg:'#f5f5f5', lightBg2:'#ebebeb', desc:'Minimalis · Modern' },
    { id: 'obsidian',name: 'Obsidian / Emas',     darkBg:'#0c0c0c', darkBg2:'#181818', lightBg:'#fffde8', lightBg2:'#fff9cc', desc:'Premium · Luxury' },
    { id: 'aurora',  name: 'Aurora / Neon',       darkBg:'#060d14', darkBg2:'#0d1a24', lightBg:'#e8fff9', lightBg2:'#ccfff0', desc:'Futuristik · Vivid' },
    { id: 'sangria', name: 'Sangria / Peach',     darkBg:'#1a0a0a', darkBg2:'#2a1010', lightBg:'#fff3ee', lightBg2:'#ffe5d8', desc:'Bold · Hangat' },
    { id: 'dusk',    name: 'Senja / Jingga',      darkBg:'#120d06', darkBg2:'#1e1508', lightBg:'#fff8f0', lightBg2:'#ffecda', desc:'Golden hour · Damai' },
    { id: 'sage_olive',   name: 'Sage / Deep Olive',      darkBg:'#1A2517', darkBg2:'#243320', lightBg:'#ACC8A2', lightBg2:'#9ab891', desc:'Natural · Botanical' },
    { id: 'pumpkin_charcoal', name: 'Pumpkin / Charcoal', darkBg:'#233D4C', darkBg2:'#1a2e39', lightBg:'#FD802E', lightBg2:'#ffe0cc', desc:'Bold · Industrial' },
    { id: 'honey_black',  name: 'Honey Tan / Jet Black',  darkBg:'#171717', darkBg2:'#202020', lightBg:'#E3C586', lightBg2:'#d4b06a', desc:'Warm · Premium' },
    { id: 'periwinkle_violet', name: 'Periwinkle / Violet', darkBg:'#544470', darkBg2:'#3e3354', lightBg:'#DBD5F2', lightBg2:'#ccc4eb', desc:'Dreamy · Pastel' },
    { id: 'cyberpunk', name: 'Cyberpunk Neon',   darkBg:'#0b0914', darkBg2:'#151226', lightBg:'#fff0fa', lightBg2:'#ffe3f4', desc:'Vibrant · Retro' },
    { id: 'nordic',    name: 'Nordic Frost',     darkBg:'#0b1016', darkBg2:'#141b25', lightBg:'#f0f5fa', lightBg2:'#e1ecf5', desc:'Arctic · Clean' },
    { id: 'matcha',    name: 'Matcha Forest',    darkBg:'#0e150f', darkBg2:'#18231a', lightBg:'#f4f8f4', lightBg2:'#e5efe5', desc:'Creamy · Botanical' },
    { id: 'dracula',   name: 'Gothic Dracula',   darkBg:'#13141f', darkBg2:'#1a1c2c', lightBg:'#f2f3f9', lightBg2:'#e2e5f3', desc:'Dark · Vampiric' },
    { id: 'sakura',    name: 'Sakura Petal',     darkBg:'#1a0f14', darkBg2:'#28161f', lightBg:'#fff3f6', lightBg2:'#ffe3eb', desc:'Cherry · Soft' },
  ];

  const FONT_MAP = {
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

  const FONTS = [
    { id: 'fraunces',  name: 'Editorial',    heading: 'Fraunces',           body: 'Plus Jakarta Sans', desc: 'Serif elegan · Editorial' },
    { id: 'playfair',  name: 'Klasik',       heading: 'Playfair Display',   body: 'Inter',             desc: 'Serif klasik · Bersih' },
    { id: 'space',     name: 'Teknologi',    heading: 'Space Grotesk',      body: 'Space Grotesk',     desc: 'Geometric · Tech vibes' },
    { id: 'syne',      name: 'Avant-Garde',  heading: 'Syne',               body: 'DM Sans',           desc: 'Display bold · Kontemporer' },
    { id: 'cormorant', name: 'Elegan',       heading: 'Cormorant Garamond', body: 'Lato',              desc: 'High fashion · Halus' },
    { id: 'sugo',      name: 'Display Bold', heading: 'Bebas Neue',         body: 'Inter',             desc: 'Ultra bold · Display (Sugo-style)' },
    { id: 'wildcat',   name: 'Geometric',    heading: 'Teko',               body: 'Nunito',            desc: 'Condensed · Geometric (Wildcat-style)' },
    { id: 'sugarpie',  name: 'Cursive',      heading: 'Pacifico',           body: 'Plus Jakarta Sans', desc: 'Playful · Script (Sugar Pie-style)' },
    { id: 'tan',       name: 'Editorial+',   heading: 'Libre Caslon Display', body: 'Libre Caslon Text', desc: 'Wide · Editorial (Tan Headline-style)' },
    { id: 'monospace', name: 'Code Style',   heading: 'JetBrains Mono',     body: 'Fira Code',         desc: 'Developer · Coding vibes' },
    { id: 'retro',     name: 'Retro 80s',    heading: 'Press Start 2P',     body: 'VT323',             desc: 'Gaming · Pixel art' },
    { id: 'luxury',    name: 'Luxury',       heading: 'Cinzel',             body: 'Crimson Text',      desc: 'Royal · Premium' },
  ];

  const DEFAULT_MUSIC = 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3';

  // Mount settings retrieval
  useEffect(() => {
    const initSettings = async () => {
      const { data } = await supabase.from('settings').select('key,value');
      if (data) {
        data.forEach(row => {
          if (row.key === 'theme_color' && row.value) { setThemeColor(row.value); localStorage.setItem('theme_color', row.value); }
          if (row.key === 'profile_image' && row.value) setProfilePreview(row.value);
          if (row.key === 'bg_theme' && row.value) { setBgTheme(row.value); localStorage.setItem('bg_theme', row.value); }
          if (row.key === 'font_choice' && row.value) { setFontChoice(row.value); localStorage.setItem('font_choice', row.value); }
          if (row.key === 'music_url' && row.value) setMusicUrl(row.value);
          if (row.key === 'default_theme' && row.value) {
            setDefaultTheme(row.value);
            setIsDark(row.value === 'dark');
            localStorage.setItem('default_theme', row.value);
          }
          if (row.key === 'bg_animation' && row.value) { setBgAnimation(row.value); localStorage.setItem('bg_animation', row.value); }
        });
      }
    };
    initSettings();
  }, []);

  // Background style sync
  useEffect(() => {
    const curBg = BG_THEMES.find(t => t.id === bgTheme) || BG_THEMES[0];
    const bg = d ? curBg.darkBg : curBg.lightBg;
    document.documentElement.style.background = bg;
    document.body.style.background = bg;
    document.body.style.margin = '0';
    document.body.style.padding = '0';
  }, [d, bgTheme]);



  const saveSetting = async (key, value) => {
    await supabase.from('settings').upsert({ key, value }, { onConflict: 'key' });
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  };
  const toast = (setter, msg) => { setter(msg); setTimeout(() => setter(''), 2500); };
  const broadcastUpdate = async (msg) => {
    await saveSetting('last_update', JSON.stringify({ msg, ts: Date.now() }));
  };

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
    
    const up = await supabase.from('user_photos').select('*').order('created_at',{ascending:false});
    if (up.data) setUserPhotos(up.data);
    
    if (st.data) {
      st.data.forEach(row => {
        if (row.key === 'theme_color') setThemeColor(row.value);
        if (row.key === 'profile_image') setProfilePreview(row.value);
        if (row.key === 'bg_theme') setBgTheme(row.value);
        if (row.key === 'font_choice') setFontChoice(row.value);
        if (row.key === 'music_url') setMusicUrl(row.value);
        if (row.key === 'default_theme') setDefaultTheme(row.value);
        if (row.key === 'bg_animation') setBgAnimation(row.value);
      });
    }
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

  // ── APPEARANCE & SETTINGS HANDLERS ──
  const handleProfileUpload = async () => {
    if (!profileFile) return;
    setProfileUploading(true);
    try {
      const ext = profileFile.name.split('.').pop();
      const fname = `profile_${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('certificates').upload(fname, profileFile, {upsert:false});
      if (error) throw error;
      const url = supabase.storage.from('certificates').getPublicUrl(fname).data.publicUrl;
      await saveSetting('profile_image', url);
      setProfilePreview(url);
      setProfileFile(null);
      toast(setSettingsSaved, '✓ Foto profil tersimpan!');
      await broadcastUpdate('👤 Foto profil diperbarui');
    } catch(err) { alert('Upload gagal: ' + err.message); }
    setProfileUploading(false);
  };

  const handleThemeChange = async (color) => { setThemeColor(color); await saveSetting('theme_color', color); await broadcastUpdate('🎨 Tema warna diperbarui'); toast(setSettingsSaved, '✓ Warna tersimpan!'); };
  const handleBgThemeChange = async (id) => { setBgTheme(id); await saveSetting('bg_theme', id); await broadcastUpdate('🖼 Background tema diperbarui'); toast(setSettingsSaved, '✓ Background tersimpan!'); };
  const handleFontChange = async (id) => { setFontChoice(id); await saveSetting('font_choice', id); toast(setSettingsSaved, '✓ Font tersimpan!'); };
  
  // Handlers baru untuk Default Theme & Bg Animation
  const saveDefaultTheme = async (val) => {
    setDefaultTheme(val);
    await saveSetting('default_theme', val);
    await broadcastUpdate('Tema default diperbarui');
    toast(setSettingsSaved, '✓ Tema default tersimpan!');
  };
  const saveBgAnimation = async (val) => {
    setBgAnimation(val);
    await saveSetting('bg_animation', val);
    await broadcastUpdate('Animasi background diperbarui');
    toast(setSettingsSaved, '✓ Animasi tersimpan!');
  };

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
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,900;1,9..144,400;1,9..144,700&family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=Inter:wght@400;600;700&family=Space+Grotesk:wght@400;600;700;800&family=Syne:wght@700;800&family=DM+Sans:wght@400;500;700&family=Cormorant+Garamond:ital,wght@0,700;1,400&family=Lato:wght@400;700&family=Bebas+Neue&family=Teko:wght@400;600;700&family=Pacifico&family=Libre+Caslon+Display&family=Libre+Caslon+Text:wght@400;700&family=Nunito:wght@400;600;700;800&display=swap');
    *,*::before,*::after{box-sizing:border-box;}
    html{margin:0;padding:0;width:100%;scrollbar-width:none;}
    html::-webkit-scrollbar{display:none;}
    body{margin:0;padding:0;width:100%;}
    .aw{--acc:#d4eb00;--ink:#f0efe8;--ink2:#909088;--ink3:#555550;--bg:#111110;--bg2:#1c1c1a;--bd:rgba(255,255,255,0.07);--shadow:rgba(0,0,0,0.3);--danger:rgba(239,68,68,0.1);--danger-bd:rgba(239,68,68,0.3);font-family:var(--font-body),'Plus Jakarta Sans',sans-serif;background:var(--bg);color:var(--ink);min-height:100vh;transition: background 0.3s ease, color 0.3s ease;}
    .aw.light{--acc:#d4eb00;--ink:#1a1a1a;--ink2:#555555;--ink3:#999999;--bg:#ffffff;--bg2:#f4f4f0;--bd:rgba(0,0,0,0.09);--shadow:rgba(0,0,0,0.07);}
    .bg-canvas { position: fixed; inset: 0; pointer-events: none; z-index: 1; opacity: 0.6; }
    
    /* Elegant Navbar */
    .anav{position:fixed;top:0;left:0;right:0;z-index:50;background:var(--bg);border-bottom:1px solid var(--bd);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);transition:background .3s, border-color .3s;}
    .anav-in{max-width:1200px;margin:0 auto;padding:0 32px;height:66px;display:flex;align-items:center;justify-content:space-between;gap:12px;}
    .alogo{font-family:var(--font-heading),'Fraunces',serif;font-size:22px;font-weight:900;color:var(--ink);text-decoration:none;letter-spacing:-0.03em;}
    .alogo em{font-style:normal;color:var(--acc);}
    .anav-right{display:flex;align-items:center;gap:10px;}
    .badge{font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--acc);padding:5px 12px;border:1px solid var(--acc);background:var(--acc-bg);border-radius:100px;}
    
    .btn-site{padding:7px 16px;background:transparent;border:1px solid var(--bd);color:var(--ink2);border-radius:100px;font-family:inherit;font-size:12px;font-weight:700;text-decoration:none;display:flex;align-items:center;gap:4px;transition:all .2s;}
    .btn-site:hover{color:var(--ink);border-color:var(--acc);background:rgba(var(--acc-rgb),0.05);}
    .btn-th{padding:7px 16px;border:1px solid var(--bd);background:var(--bg2);color:var(--ink);border-radius:100px;font-family:inherit;font-size:12px;font-weight:700;transition:all .2s;cursor:pointer;}
    .btn-th:hover{border-color:var(--acc);box-shadow:0 0 0 3px rgba(var(--acc-rgb),0.1);}
    
    .awrap{max-width:1200px;margin:0 auto;padding:24px 32px 60px 32px;}
    
    /* Interactive Shimmer */
    .lbar{position:fixed;top:66px;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,var(--acc),transparent);background-size:200% 100%;animation:shimmer 1.2s ease infinite;z-index:100;}
    @keyframes shimmer{0%{background-position:200% 0;}100%{background-position:-200% 0;}}
    
    /* Cinematic Login Screen */
    .login-outer{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;position:relative;overflow:hidden;background:radial-gradient(circle at 50% 50%, var(--bg2) 0%, var(--bg) 100%);}
    
    .login-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.12;
      pointer-events: none;
      z-index: 1;
    }
    .login-orb-1 {
      width: 350px;
      height: 350px;
      background: var(--acc);
      top: 15%;
      left: 15%;
      animation: drift 15s ease-in-out infinite alternate;
    }
    .login-orb-2 {
      width: 300px;
      height: 300px;
      background: #6366f1;
      bottom: 15%;
      right: 15%;
      animation: drift 12s ease-in-out infinite alternate-reverse;
    }
    @keyframes drift {
      from { transform: translate(0, 0) scale(1); }
      to { transform: translate(45px, 35px) scale(1.15); }
    }
    
    .login-card{
      width:100%;
      max-width:400px;
      padding:48px 40px;
      background:var(--bg2);
      border:1px solid var(--bd);
      border-radius:24px;
      position:relative;
      z-index:2;
      backdrop-filter:blur(20px);
      -webkit-backdrop-filter:blur(20px);
      box-shadow:0 30px 60px -15px var(--shadow), inset 0 1px 0 rgba(255,255,255,0.06);
      animation: loginIntro 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .aw.light .login-card {
      box-shadow:0 20px 40px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.6);
    }
    
    @keyframes loginIntro {
      from { opacity: 0; transform: translateY(20px) scale(0.97); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    
    .l-eye{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.14em;color:var(--ink2);margin-bottom:12px;opacity:0.7;}
    .l-title{font-family:var(--font-heading),'Fraunces',serif;font-size:42px;font-weight:900;line-height:.95;letter-spacing:-.03em;color:var(--ink);margin:0 0 32px;}
    .l-title em{font-style:italic;font-weight:400;color:var(--ink2);}
    .fl{display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--ink2);margin-bottom:8px;}
    
    .fi{
      width:100%;
      padding:14px 16px;
      background:rgba(0,0,0,0.18);
      border:1.5px solid var(--bd);
      color:var(--ink);
      border-radius:12px;
      font-family:inherit;
      font-size:16px;
      letter-spacing:4px;
      outline:none;
      transition:all .3s cubic-bezier(0.16, 1, 0.3, 1);
      margin-bottom:16px;
    }
    .aw.light .fi {
      background:rgba(255,255,255,0.7);
    }
    .fi:focus{
      border-color:var(--acc);
      box-shadow: 0 0 0 3px rgba(var(--acc-rgb), 0.12), 0 4px 12px rgba(0, 0, 0, 0.15);
      background: var(--bg);
    }
    
    .l-err{padding:12px 14px;border-radius:12px;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.25);color:#ef4444;font-size:12px;font-weight:600;margin-bottom:16px;animation:shake 0.4s ease;}
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-4px); }
      75% { transform: translateX(4px); }
    }
    
    .btn-login{
      width:100%;
      padding:15px;
      background:var(--acc);
      color:#0d0d0d;
      border:none;
      border-radius:12px;
      font-family:inherit;
      font-size:14px;
      font-weight:800;
      letter-spacing:.04em;
      transition:all .3s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 4px 15px rgba(var(--acc-rgb), 0.15);
      cursor:pointer;
    }
    .btn-login:hover{
      transform:translateY(-2px);
      box-shadow:0 8px 25px rgba(var(--acc-rgb), 0.35);
      filter:brightness(1.05);
    }
    .btn-login:active{
      transform:translateY(0);
    }
    
    /* SaaS Elevated Dashboard Header */
    .dash-hdr{padding-top:100px;padding-bottom:36px;border-bottom:1px solid var(--bd);}
    .d-eye{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.14em;color:var(--ink2);margin-bottom:10px;opacity:0.8;}
    .d-title{font-family:var(--font-heading),'Fraunces',serif;font-size:clamp(32px,5vw,56px);font-weight:900;line-height:.95;letter-spacing:-.03em;color:var(--ink);margin:0;}
    .d-title em{font-style:italic;font-weight:400;color:var(--ink2);}
    
    /* Glowing Dashboard Stats Grid */
    .dstats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-top: 32px;
      border-bottom: none;
      padding-bottom: 8px;
    }
    .dstat {
      padding: 24px;
      text-align: left;
      background: var(--bg2);
      border: 1px solid var(--bd);
      border-radius: 20px;
      position: relative;
      overflow: hidden;
      transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 120px;
      box-shadow: 0 4px 20px -5px var(--shadow);
    }
    .dstat:hover {
      border-color: var(--acc);
      transform: translateY(-4px);
      box-shadow: 0 16px 36px -12px rgba(var(--acc-rgb), 0.16);
    }
    .dstat::after {
      content: '';
      position: absolute;
      width: 140px;
      height: 140px;
      background: radial-gradient(circle, rgba(var(--acc-rgb), 0.04) 0%, transparent 70%);
      right: -40px;
      top: -40px;
      border-radius: 50%;
      pointer-events: none;
    }
    .dstat-n {
      font-family: 'Fraunces', serif;
      font-size: 38px;
      font-weight: 900;
      color: var(--ink);
      line-height: 1;
      margin-bottom: 6px;
    }
    .dstat-l {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .12em;
      color: var(--ink2);
    }
    .dstat-action{margin-top:10px;}
    .btn-reset{padding:5px 12px;background:var(--danger);border:1px solid var(--danger-bd);color:#ef4444;border-radius:100px;font-family:inherit;font-size:10px;font-weight:700;transition:all .2s;cursor:pointer;}
    .btn-reset:hover{background:#ef4444;color:white;border-color:#ef4444;}
    
    /* Pill-Style Tabs Navigation */
    .tabs {
      display: flex;
      gap: 8px;
      border-bottom: 1px solid var(--bd);
      margin-top: 36px;
      overflow-x: auto;
      padding-bottom: 14px;
      scrollbar-width: none;
    }
    .tabs::-webkit-scrollbar {
      display: none;
    }
    .tab-btn {
      padding: 10px 20px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--bd);
      font-family: inherit;
      font-size: 13px;
      font-weight: 700;
      color: var(--ink2);
      border-radius: 100px;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      white-space: nowrap;
      cursor: pointer;
      display: flex;
      align-items: center;
    }
    .tab-btn:hover {
      color: var(--ink);
      border-color: var(--acc);
      background: rgba(var(--acc-rgb), 0.04);
    }
    .tab-btn.active {
      color: #0d0d0d;
      background: var(--acc);
      border-color: var(--acc);
      box-shadow: 0 4px 15px rgba(var(--acc-rgb), 0.18);
    }
    .tab-count {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 18px;
      height: 18px;
      border-radius: 100px;
      background: rgba(0, 0, 0, 0.08);
      font-size: 10px;
      font-weight: 700;
      color: var(--ink2);
      margin-left: 8px;
      padding: 0 5px;
    }
    .tab-btn.active .tab-count {
      background: rgba(0, 0, 0, 0.12);
      color: #0d0d0d;
    }
    
    /* Modern Dashboard Panels */
    .panel{padding:32px 0;border-bottom:1px solid var(--bd);animation: panelFade 0.4s ease;}
    @keyframes panelFade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .panel-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:8px;}
    .panel-title{font-family:var(--font-heading),'Fraunces',serif;font-size:22px;font-weight:900;color:var(--ink);margin:0;}
    .panel-edit-badge{display:flex;align-items:center;gap:7px;padding:5px 12px;background:rgba(var(--acc-rgb),.15);border:1px solid rgba(var(--acc-rgb),.4);border-radius:100px;font-size:10px;font-weight:700;color:var(--ink);}
    .panel-edit-badge span{width:6px;height:6px;border-radius:50%;background:var(--acc);}
    
    .upload-toggle{display:flex;gap:0;background:var(--bg2);border:1px solid var(--bd);border-radius:10px;overflow:hidden;width:fit-content;margin-bottom:18px;padding:2px;}
    .upload-opt{padding:6px 14px;font-family:inherit;font-size:11px;font-weight:700;border:none;background:transparent;color:var(--ink2);border-radius:8px;transition:all .2s;cursor:pointer;}
    .upload-opt.active{background:var(--ink);color:var(--bg);}
    
    .drop-zone{border:2px dashed var(--bd);border-radius:14px;padding:28px;text-align:center;transition:all .3s cubic-bezier(0.16, 1, 0.3, 1);position:relative;overflow:hidden;background:rgba(0,0,0,0.08);cursor:pointer;}
    .drop-zone:hover{border-color:var(--acc);background:rgba(var(--acc-rgb),.04);}
    .drop-zone input[type=file]{position:absolute;inset:0;opacity:0;width:100%;height:100%;cursor:pointer;}
    .drop-zone-icon{font-size:28px;margin-bottom:8px;animation: bounceSlow 2s ease infinite;}
    @keyframes bounceSlow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
    .drop-zone-text{font-size:13px;font-weight:600;color:var(--ink2);}
    .drop-zone-sub{font-size:11px;color:var(--ink3);margin-top:4px;}
    .file-preview{width:100%;max-height:160px;object-fit:cover;border-radius:12px;margin-top:12px;border:1px solid var(--bd);box-shadow: 0 4px 12px var(--shadow);}
    
    .fgrid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
    .fgrid-full{grid-column:1/-1;}
    .fla{display:block;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--ink2);margin-bottom:6px;}
    .fin,.fta{width:100%;padding:13px 15px;background:var(--bg2);border:1.5px solid var(--bd);color:var(--ink);border-radius:11px;font-family:inherit;font-size:13px;outline:none;transition:border-color .25s;}
    .fin::placeholder,.fta::placeholder{color:var(--ink3);}
    .fin:focus,.fta:focus{border-color:var(--acc);background:var(--bg);}
    .fta{height:90px;resize:vertical;}
    
    .factions{display:flex;align-items:center;gap:8px;margin-top:18px;flex-wrap:wrap;}
    .btn-add{padding:12px 24px;background:var(--ink);color:var(--bg);border:none;border-radius:11px;font-family:inherit;font-size:12px;font-weight:700;transition:all .2s;cursor:pointer;}
    .btn-add:hover:not(:disabled){transform:translateY(-2px);box-shadow: 0 4px 12px var(--shadow);}
    .btn-add:disabled{opacity:0.5;cursor:not-allowed;}
    .btn-add.em{background:var(--acc);color:#0d0d0d;box-shadow: 0 4px 15px rgba(var(--acc-rgb), 0.15);}
    .btn-add.em:hover:not(:disabled){box-shadow: 0 6px 20px rgba(var(--acc-rgb), 0.3);}
    
    .btn-cancel{padding:12px 18px;background:transparent;border:1px solid var(--bd);color:var(--ink2);border-radius:11px;font-family:inherit;font-size:12px;font-weight:700;transition:all .2s;cursor:pointer;}
    .btn-cancel:hover{border-color:var(--ink);color:var(--ink);}
    .toast{display:flex;align-items:center;gap:7px;padding:11px 16px;border-radius:10px;background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.25);color:#16a34a;font-size:12px;font-weight:600;}
    
    /* Interactive Dashboard Grid Cards */
    .items-grid{padding:32px 0;display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:18px;}
    .empty-st{padding:60px 24px;text-align:center;border:1px dashed var(--bd);border-radius:20px;color:var(--ink2);font-size:13px;grid-column:1/-1;}
    
    .ac-card{background:var(--bg2);border:1.5px solid var(--bd);border-radius:20px;overflow:hidden;transition:all 0.3s cubic-bezier(0.16, 1, 0.3, 1);box-shadow: 0 4px 15px -5px var(--shadow);}
    .ac-card:hover{border-color:var(--acc);transform: translateY(-4px);box-shadow: 0 12px 30px -10px var(--shadow);}
    .ac-thumb{aspect-ratio:16/10;overflow:hidden;background:var(--bg);border-bottom: 1px solid var(--bd);}
    .ac-thumb img{width:100%;height:100%;object-fit:cover;transition:transform .5s;}
    .ac-card:hover .ac-thumb img{transform:scale(1.06);}
    .ac-thumb-empty{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:42px;color:var(--bd);background:rgba(0,0,0,0.1);}
    .ac-foot{padding:14px 16px;}
    .ac-title{font-size:14px;font-weight:700;color:var(--ink);margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .ac-sub{font-size:11px;color:var(--ink2);line-height:1.4;}
    .ac-actions{display:flex;gap:8px;margin-top:14px;}
    .btn-edit{flex:1;padding:8px;background:var(--acc);color:#0d0d0d;border:none;border-radius:10px;font-family:inherit;font-size:11px;font-weight:700;cursor:pointer;transition:all 0.2s;text-align:center;}
    .btn-edit:hover{filter:brightness(1.05);transform:translateY(-1px);}
    .btn-del{flex:1;padding:8px;background:var(--danger);border:1px solid var(--danger-bd);color:#ef4444;border-radius:10px;font-family:inherit;font-size:11px;font-weight:700;transition:all .2s;cursor:pointer;}
    .btn-del:hover{background:#ef4444;color:white;border-color:#ef4444;}
    
    /* Modern Comments & Activity Items */
    .comments-list{display:flex;flex-direction:column;gap:12px;padding:24px 0;}
    .comment-item{padding:16px 20px;background:var(--bg2);border:1.5px solid var(--bd);border-radius:16px;display:flex;align-items:flex-start;justify-content:space-between;gap:16px;box-shadow: 0 4px 15px -5px var(--shadow);transition: all 0.25s;}
    .comment-item:hover{border-color:var(--acc);transform: translateX(4px);}
    .comment-item-body{flex:1;min-width:0;}
    .comment-name{font-size:14px;font-weight:700;color:var(--ink);margin-bottom:4px;}
    .comment-msg{font-size:13px;color:var(--ink2);line-height:1.6;margin-bottom:6px;word-break:break-word;}
    .comment-dt{font-size:10px;font-weight:600;color:var(--ink3);text-transform:uppercase;letter-spacing:.08em;}
    .comment-del{padding:8px 14px;background:var(--danger);border:1px solid var(--danger-bd);color:#ef4444;border-radius:10px;font-family:inherit;font-size:11px;font-weight:700;flex-shrink:0;transition:all .2s;cursor:pointer;}
    .comment-del:hover{background:#ef4444;color:white;border-color:#ef4444;}
    
    .sec-actions{display:flex;gap:8px;margin-bottom:16px;align-items:center;flex-wrap:wrap;}
    .sec-label{font-size:13px;font-weight:600;color:var(--ink2);}
    
    .vis-list{display:flex;flex-direction:column;gap:10px;padding:20px 0;}
    .vis-item{padding:16px 20px;background:var(--bg2);border:1.5px solid var(--bd);border-radius:16px;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:16px;box-shadow: 0 4px 15px -5px var(--shadow);transition: border-color 0.2s;}
    .vis-item:hover{border-color: var(--acc);}
    .vis-icon{font-size:24px;}
    .vis-info{min-width:0;}
    .vis-device{font-size:13px;font-weight:700;color:var(--ink);margin-bottom:4px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
    .vis-badge{padding:3px 9px;border-radius:100px;font-size:9px;font-weight:700;letter-spacing: 0.05em;text-transform:uppercase;}
    .vis-badge.mob{background:rgba(59,130,246,.1);color:#3b82f6;border:1px solid rgba(59,130,246,.2);}
    .vis-badge.desk{background:rgba(34,197,94,.1);color:#16a34a;border:1px solid rgba(34,197,94,.2);}
    .vis-meta{font-size:11px;color:var(--ink3);display:flex;gap:12px;flex-wrap:wrap;}
    .vis-time{font-size:11px;font-weight:600;color:var(--ink3);text-align:right;white-space:nowrap;}
    
    /* Appearance Adjusters */
    .theme-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-bottom:24px;}
    .bg-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-bottom:24px;}
    .font-list{display:flex;flex-direction:column;gap:10px;}
    .music-section{background:var(--bg2);border:1px solid var(--bd);border-radius:18px;padding:24px;}
    .music-url-display{font-size:11px;color:var(--ink3);margin-top:8px;word-break:break-all;padding:10px 14px;background:var(--bg);border:1px solid var(--bd);border-radius:10px;line-height:1.5;}
    
    @media(max-width:900px){
      .dstats{grid-template-columns:1fr 1fr; gap:12px;}
      .items-grid{grid-template-columns:1fr 1fr; gap:12px;}
    }
    
    @media(max-width:768px){
      .awrap,.anav-in{padding-left:20px;padding-right:20px;}
      .anav-in{height:60px;}
      .lbar{top:60px;}
      .dash-hdr{padding-top:80px;}
      .fgrid{grid-template-columns:1fr;}
      .theme-grid,.bg-grid{grid-template-columns:repeat(3,1fr);}
      .vis-item{grid-template-columns:auto 1fr;}
      .vis-time{display:none;}
    }
    
    @media(max-width:480px) {
      .dstats{grid-template-columns:1fr;}
      .items-grid{grid-template-columns:1fr;}
    }
  `;

  const curBg = BG_THEMES.find(t => t.id === bgTheme) || BG_THEMES[0];
  const fontStyle = FONT_MAP[fontChoice] || FONT_MAP.fraunces;
  const accHex  = themeColor.replace('#','');
  const accRgb  = accHex.length===6
    ? [parseInt(accHex.slice(0,2),16),parseInt(accHex.slice(2,4),16),parseInt(accHex.slice(4,6),16)]
    : [212,235,0];
  const accBg   = `rgba(${accRgb[0]},${accRgb[1]},${accRgb[2]},0.12)`;

  if (!isAuthenticated) return (
    <>
      <style>{css}</style>
      <BackgroundCanvas bgAnimation={bgAnimation} themeColor={themeColor} isDark={isDark} />
      <div className={`aw${d?'':' light'}`} style={{
        '--acc':         `var(--accent-color, ${themeColor})`,
        '--acc-bg':      `color-mix(in srgb, var(--acc, ${themeColor}) 12%, transparent)`,
        '--acc-rgb':     `var(--accent-color-rgb, ${accRgb[0]}, ${accRgb[1]}, ${accRgb[2]})`,
        '--bg':          d ? curBg.darkBg  : curBg.lightBg,
        '--bg2':         d ? curBg.darkBg2 : curBg.lightBg2,
        '--font-heading': fontStyle.heading,
        '--font-body':    fontStyle.body,
        fontFamily:       fontStyle.body,
      }}>
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
          <div className="login-orb login-orb-1"></div>
          <div className="login-orb login-orb-2"></div>
          
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
      <BackgroundCanvas bgAnimation={bgAnimation} themeColor={themeColor} isDark={isDark} />
      <div className={`aw${d?'':' light'}`} style={{
        '--acc':         `var(--accent-color, ${themeColor})`,
        '--acc-bg':      `color-mix(in srgb, var(--acc, ${themeColor}) 12%, transparent)`,
        '--acc-rgb':     `var(--accent-color-rgb, ${accRgb[0]}, ${accRgb[1]}, ${accRgb[2]})`,
        '--bg':          d ? curBg.darkBg  : curBg.lightBg,
        '--bg2':         d ? curBg.darkBg2 : curBg.lightBg2,
        '--font-heading': fontStyle.heading,
        '--font-body':    fontStyle.body,
        fontFamily:       fontStyle.body,
      }}>
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

              {/* ── FOTO PROFIL ── */}
              <div className="panel" style={{marginBottom:'20px'}}>
                <div className="panel-head"><h2 className="panel-title">👤 Foto Profil</h2></div>
                <div style={{display:'flex',alignItems:'flex-start',gap:'20px',flexWrap:'wrap'}}>
                  <div style={{flexShrink:0}}>
                    {profilePreview
                      ? <img src={profilePreview} style={{width:'90px',height:'90px',borderRadius:'12px',objectFit:'cover',border:'2px solid var(--bd)'}} alt="Profil"/>
                      : <div style={{width:'90px',height:'90px',borderRadius:'12px',background:'var(--bg)',border:'2px dashed var(--bd)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'32px'}}>👤</div>
                    }
                  </div>
                  <div style={{flex:1,minWidth:'200px',display:'flex',flexDirection:'column',gap:'10px'}}>
                    <label style={{cursor:'pointer',display:'inline-flex',alignItems:'center',gap:'8px',padding:'10px 16px',background:'var(--bg2)',border:'1px solid var(--bd)',borderRadius:'10px',fontSize:'13px',fontWeight:'700',color:'var(--ink)',width:'fit-content'}}>
                      📁 {profileFile ? profileFile.name : 'Pilih foto profil...'}
                      <input ref={profileFileRef} type="file" accept="image/*" style={{display:'none'}} onChange={e=>{
                        const f = e.target.files[0]; if(!f) return;
                        setProfileFile(f);
                        const r = new FileReader(); r.onload=ev=>setProfilePreview(ev.target.result); r.readAsDataURL(f);
                      }}/>
                    </label>
                    <div style={{display:'flex',gap:'8px'}}>
                      <button className="btn-add" onClick={handleProfileUpload} disabled={!profileFile||profileUploading}>
                        {profileUploading ? 'Mengupload...' : '⬆ Upload & Simpan'}
                      </button>
                      {profilePreview && (
                        <button className="btn-del" style={{padding:'8px 14px'}} onClick={async()=>{
                          await saveSetting('profile_image',''); setProfilePreview(''); setProfileFile(null);
                          if(profileFileRef.current) profileFileRef.current.value='';
                          toast(setSettingsSaved,'✓ Foto profil dihapus');
                        }}>🗑 Hapus</button>
                      )}
                    </div>
                    <p style={{fontSize:'11px',color:'var(--ink2)',margin:0}}>Foto ini tampil di galeri halaman utama sebagai foto pribadimu.</p>
                  </div>
                </div>
              </div>

              {/* ── TEMA DEFAULT ── */}
              <div className="panel">
                <div className="panel-head">
                  <h2 className="panel-title">🌓 Tampilan Default</h2>
                  <span style={{fontSize:'12px',color:'var(--ink2)'}}>Tema saat website pertama dibuka pengunjung</span>
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {[
                    { val: 'dark',  label: '🌙 Dark Mode',  desc: 'Tema gelap (default)' },
                    { val: 'light', label: '☀️ Light Mode', desc: 'Tema terang' },
                  ].map(opt => (
                    <button
                      key={opt.val}
                      onClick={() => saveDefaultTheme(opt.val)}
                      style={{
                        flex: 1, minWidth: '140px', padding: '16px 20px',
                        background: defaultTheme === opt.val ? 'var(--acc)' : 'var(--bg2)',
                        border: `2px solid ${defaultTheme === opt.val ? 'var(--acc)' : 'var(--bd)'}`,
                        borderRadius: '14px',
                        color: defaultTheme === opt.val ? '#0d0d0d' : 'var(--ink)',
                        fontFamily: 'inherit', fontWeight: 700, fontSize: '14px',
                        cursor: 'pointer', transition: 'all 0.2s',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                      }}
                    >
                      <span style={{ fontSize: '22px' }}>{opt.label.split(' ')[0]}</span>
                      <span>{opt.label.split(' ').slice(1).join(' ')}</span>
                      <span style={{ fontSize: '11px', fontWeight: 500, opacity: 0.7 }}>{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── ANIMASI BACKGROUND ── */}
              <div className="panel">
                <div className="panel-head">
                  <h2 className="panel-title">✨ Animasi Background</h2>
                  <span style={{fontSize:'12px',color:'var(--ink2)'}}>Pilih animasi yang tampil di latar belakang website</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
                  {                  [
                    { val: 'none',      label: '⬛ Tidak Ada',  desc: 'Tanpa animasi' },
                    { val: 'particles', label: '✦ Particles',   desc: 'Titik bergerak' },
                    { val: 'bubbles',   label: '🫧 Bubbles',    desc: 'Gelembung naik' },
                    { val: 'stars',     label: '⭐ Stars',       desc: 'Bintang berkedip' },
                    { val: 'matrix',    label: '💻 Matrix',     desc: 'Hujan kode' },
                    { val: 'waves',     label: '🌊 Waves',      desc: 'Gelombang air' },
                    { val: 'aurora',    label: '🌌 Aurora',     desc: 'Cahaya utara' },
                    { val: 'grid',      label: '⊞ Grid',        desc: 'Grid bergerak' },
                    { val: 'rain',      label: '🌧️ Rain',       desc: 'Hujan turun' },
                    { val: 'fireflies', label: '✨ Fireflies',  desc: 'Kunang-kunang' },
                    { val: 'snow',      label: '❄️ Snow',       desc: 'Salju turun' },
                    { val: 'constellation', label: '☄️ Constell',    desc: 'Rasi bintang' },
                    { val: 'nebula',    label: '💨 Nebula',     desc: 'Awan kosmik' },
                    { val: 'vortex',    label: '🌀 Vortex',     desc: 'Pusaran galaksi' },
                    { val: 'meteor',    label: '☄️ Meteor',     desc: 'Hujan meteor' },
                    { val: 'dna',       label: '🧬 DNA',        desc: 'Heliks berputar' },
                    { val: 'tunnel',    label: '🚇 Tunnel',     desc: 'Terowongan 3D' },
                    { val: 'confetti',  label: '🎉 Confetti',   desc: 'Pesta confetti' },
                    { val: 'wave_mesh', label: '🕸️ WaveMesh',   desc: 'Mesh 3D interaktif' },
                    { val: 'chaos',     label: '⚡ Chaos',      desc: 'Walker acak' },
                  ].map(opt => (
                    <button
                      key={opt.val}
                      onClick={() => saveBgAnimation(opt.val)}
                      style={{
                        padding: '14px 12px',
                        background: bgAnimation === opt.val ? 'var(--acc)' : 'var(--bg2)',
                        border: `2px solid ${bgAnimation === opt.val ? 'var(--acc)' : 'var(--bd)'}`,
                        borderRadius: '14px',
                        color: bgAnimation === opt.val ? '#0d0d0d' : 'var(--ink)',
                        fontFamily: 'inherit', fontWeight: 700, fontSize: '13px',
                        cursor: 'pointer', transition: 'all 0.2s',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                      }}
                    >
                      <span style={{ fontSize: '20px' }}>{opt.label.split(' ')[0]}</span>
                      <span>{opt.label.split(' ').slice(1).join(' ')}</span>
                      <span style={{ fontSize: '10px', fontWeight: 500, opacity: 0.6 }}>{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

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
                        <div className="ac-actions">
                          {!photo.approved && (
                            <button className="btn-edit" style={{background:'rgba(34,197,94,.1)',color:'#16a34a',borderColor:'rgba(34,197,94,.3)'}} onClick={()=>handleApprovePhoto(photo.id)}>✓ Setujui</button>
                          )}
                          {photo.approved && (
                            <span style={{fontSize:'10px',fontWeight:'700',color:'#16a34a',padding:'3px 8px',background:'rgba(34,197,94,.1)',borderRadius:'6px'}}>✓ Live</span>
                          )}
                          <button className="btn-del" onClick={()=>handleRejectPhoto(photo.id)}>🗑 Hapus</button>
                        </div>
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