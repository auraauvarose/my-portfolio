"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [isDark, setIsDark] = useState(true);
  const [lang, setLang] = useState('id');
  const [time, setTime] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);
  const [views, setViews] = useState(0);
  const [comments, setComments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [projects, setProjects] = useState([]);
  const [nameInput, setNameInput] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitDone, setSubmitDone] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  const [ripple, setRipple] = useState(null);
  const [profileImage, setProfileImage] = useState('');
  const [aiOpen, setAiOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [typedDesc, setTypedDesc] = useState('');
  const [typingDone, setTypingDone] = useState(false);
  const [typedAbout1, setTypedAbout1] = useState('');
  const [typedAbout2, setTypedAbout2] = useState('');
  const [aboutTypingDone, setAboutTypingDone] = useState(false);
  const [aboutVisible, setAboutVisible] = useState(false);
  const [loopName, setLoopName] = useState('Auvarose');
  const [ghRepos, setGhRepos] = useState([]);
  const [ghStatus, setGhStatus] = useState({ detail: 'my-portfolio', since: '', online: false });
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeAnim, setLikeAnim] = useState(false);
  const [likeId, setLikeId] = useState('');
  const [updateMsg, setUpdateMsg] = useState('');
  const [commentReplies, setCommentReplies] = useState({});
  const [replyInput, setReplyInput] = useState({});
  const [replyOpen, setReplyOpen] = useState({});
  const [communityPhotos, setCommunityPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoForm, setPhotoForm] = useState({ name:'', caption:'' });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoSubmitDone, setPhotoSubmitDone] = useState(false);
  const [photoSubmitting, setPhotoSubmitting] = useState(false);
  const [themeColor, setThemeColor] = useState('#d4eb00');
  const [bgTheme, setBgTheme]       = useState('default');
  const [fontChoice, setFontChoice] = useState('fraunces');
  const [musicUrl, setMusicUrl]     = useState('https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3');
  const audioRef = useRef(null);
  const themeBtnRef = useRef(null);
  const aiEndRef = useRef(null);
  const d = isDark;
  const isID = lang === 'id';

  // ── THEME DATA (sama persis dengan admin) ──
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
  };
  const FONTS = {
    fraunces:  { heading:"'Fraunces',serif",           body:"'Plus Jakarta Sans',sans-serif" },
    playfair:  { heading:"'Playfair Display',serif",   body:"'Inter',sans-serif" },
    space:     { heading:"'Space Grotesk',sans-serif", body:"'Space Grotesk',sans-serif" },
    syne:      { heading:"'Syne',sans-serif",           body:"'DM Sans',sans-serif" },
    cormorant: { heading:"'Cormorant Garamond',serif",  body:"'Lato',sans-serif" },
  };
  const curBg   = BG_THEMES[bgTheme]   || BG_THEMES.default;
  const curFont = FONTS[fontChoice]     || FONTS.fraunces;
  // accent-bg with 18% alpha
  const accHex  = themeColor.replace('#','');
  const accRgb  = accHex.length===6
    ? [parseInt(accHex.slice(0,2),16),parseInt(accHex.slice(2,4),16),parseInt(accHex.slice(4,6),16)]
    : [212,235,0];
  const accBg   = `rgba(${accRgb[0]},${accRgb[1]},${accRgb[2]},0.12)`;

  const toggleTheme = () => {
    if (themeBtnRef.current) {
      const r = themeBtnRef.current.getBoundingClientRect();
      const x = ((r.left + r.width / 2) / window.innerWidth * 100).toFixed(1);
      const y = ((r.top + r.height / 2) / window.innerHeight * 100).toFixed(1);
      // ripple = destination theme bg color
      const color = d ? curBg.lightBg : curBg.darkBg;
      setRipple({ x, y, key: Date.now(), color });
      setTimeout(() => setRipple(null), 700);
    }
    setIsDark(prev => !prev);
  };

  const sendAI = async () => {
    if (!aiInput.trim() || aiLoading) return;
    const userMsg = { role: 'user', content: aiInput.trim() };
    const newMsgs = [...aiMessages, userMsg];
    setAiMessages(newMsgs);
    setAiInput('');
    setAiLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMsgs }),
      });
      const data = await res.json();
      const reply = data.reply || 'Maaf, tidak ada respons.';
      setAiMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setAiMessages(prev => [...prev, { role: 'assistant', content: 'Koneksi gagal. Coba lagi.' }]);
    }
    setAiLoading(false);
  };

    useEffect(() => { aiEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [aiMessages]);

  // ── TYPING ANIMATION for hero description ──
  useEffect(() => {
    if (!pageReady) return;
    const fullText = isID
      ? 'Belajar dari awal sampai akhir, Berhenti menunggu mood yang tepat untuk bergerak. Kamu punya mimpi besar di dunia teknologi, tapi mimpi itu tidak akan terwujud kalau kamu terus memanjakan rasa malas dan pola tidur yang berantakan.'
      : "Learning from start to finish. Stop waiting for the right mood to act. You have big dreams in tech, but those dreams won't come true if you keep giving in to laziness and a messy sleep schedule.";
    setTypedDesc('');
    setTypingDone(false);
    let i = 0;
    const speed = 22;
    const tick = () => {
      if (i <= fullText.length) {
        setTypedDesc(fullText.slice(0, i));
        i++;
        setTimeout(tick, speed);
      } else {
        setTypingDone(true);
      }
    };
    const delay = setTimeout(tick, 600);
    return () => clearTimeout(delay);
  }, [pageReady, isID]);

  // ── LOOPING AUVAROSE name variants ──
  useEffect(() => {
    const variants = ['Auvarose', 'NPC', 'Turu', 'Gg', 'Py', 'Auvarose'];
    let idx = 0;
    let charIdx = variants[0].length;
    let deleting = true;
    let t;
    const tick = () => {
      const current = variants[idx];
      if (deleting) {
        charIdx--;
        setLoopName(current.slice(0, charIdx));
        if (charIdx === 0) { deleting = false; idx = (idx + 1) % variants.length; t = setTimeout(tick, 300); return; }
        t = setTimeout(tick, 55);
      } else {
        charIdx++;
        setLoopName(variants[idx].slice(0, charIdx));
        if (charIdx === variants[idx].length) {
          deleting = true;
          t = setTimeout(tick, idx === variants.length - 1 ? 2500 : 1400);
          return;
        }
        t = setTimeout(tick, 80);
      }
    };
    t = setTimeout(tick, 2800);
    return () => clearTimeout(t);
  }, []);

  // ── TYPING for About section (triggers when scrolled into view) ──
  const aboutRef = useRef(null);
  useEffect(() => {
    if (!aboutVisible) return;
    const p1 = isID
      ? 'Hai! Saya Aura Auvarose, seorang mahasiswa Informatika semester 1 yang sedang meniti jalan di dunia teknologi. Perjalanan saya bukan tentang kemudahan, melainkan tentang ketekunan di tengah keterbatasan.'
      : "Hi! I'm Aura Auvarose, a first-semester Informatics student carving my path in the tech world. My journey isn't about ease — it's about persistence through limitations.";
    const p2 = isID
      ? 'Saat ini, saya sedang aktif mendalami Fedora Linux dan membangun portofolio pribadi sebagai bukti nyata perkembangan saya. Fokus saya saat ini adalah menguasai logika pemrograman yang kuat dan terus konsisten belajar setiap malam demi mencapai level profesional.'
      : "Currently I'm actively exploring Fedora Linux and building this personal portfolio as real proof of my growth. My focus is on mastering strong programming logic and staying consistent — learning every night to reach a professional level.";
    setTypedAbout1(''); setTypedAbout2(''); setAboutTypingDone(false);
    let i = 0; const speed = 18;
    const tick1 = () => {
      if (i <= p1.length) { setTypedAbout1(p1.slice(0,i)); i++; setTimeout(tick1, speed); }
      else { let j = 0; const tick2 = () => {
        if (j <= p2.length) { setTypedAbout2(p2.slice(0,j)); j++; setTimeout(tick2, speed); }
        else setAboutTypingDone(true);
      }; setTimeout(tick2, 300); }
    };
    setTimeout(tick1, 200);
  }, [aboutVisible, isID]);

  useEffect(() => {
    if (!aboutRef.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setAboutVisible(true); obs.disconnect(); } }, { threshold: 0.3 });
    obs.observe(aboutRef.current);
    return () => obs.disconnect();
  }, []);

  // Sync html bg + site-dark class — matches bgTheme selection
  useEffect(() => {
    document.documentElement.classList.toggle('site-dark', d);
    document.documentElement.style.background = d ? curBg.darkBg : curBg.lightBg;
    document.body.style.margin = '0';
    document.body.style.padding = '0';
  }, [d, bgTheme]);

  // Scroll reveal via IntersectionObserver — re-run when projects/certs load
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('revealed');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [projects, certificates, pageReady, lang]);

  // Magnetic hover effect on cards
  useEffect(() => {
    // Disable 3D mag on touch/low-end devices
    if (window.matchMedia('(pointer:coarse)').matches) return;
    // Disable during scroll to prevent lag
    let scrolling = false, scrollTimer;
    const onScroll = () => { scrolling = true; clearTimeout(scrollTimer); scrollTimer = setTimeout(()=>{ scrolling=false; },150); };
    window.addEventListener('scroll', onScroll, { passive: true });

    const handler = (e) => {
      if (scrolling) return;
      const card = e.currentTarget;
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - 0.5) * 8;
      const y = ((e.clientY - r.top) / r.height - 0.5) * 8;
      card.style.transform = `translateY(-4px) rotateX(${-y}deg) rotateY(${x}deg)`;
    };
    const reset = (e) => { e.currentTarget.style.transform = ''; };
    const cards = document.querySelectorAll('.mag');
    cards.forEach(c => { c.addEventListener('mousemove', handler); c.addEventListener('mouseleave', reset); });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cards.forEach(c => { c.removeEventListener('mousemove', handler); c.removeEventListener('mouseleave', reset); });
    };
  });

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date().toLocaleTimeString('id-ID')), 1000);
    const loadViews = async () => {
      const { data } = await supabase.from('views').select('count').eq('slug', 'home').single();
      if (data) { const n = data.count + 1; setViews(n); await supabase.from('views').update({ count: n }).eq('slug', 'home'); }
    };

    const logVisitor = async () => {
      try {
        const ua = navigator.userAgent || '';
        // ── Extract device model from user agent ──
        let deviceModel = '';
        // Android: ambil model dari dalam tanda kurung, e.g. "Linux; Android 12; Poco M5"
        const androidMatch = ua.match(/Android[\s/][\d.]+;?\s*([^;)]+)/i);
        if (androidMatch) {
          deviceModel = androidMatch[1].trim();
          // Bersihkan kata-kata generik
          deviceModel = deviceModel.replace(/Build\/.*/i,'').replace(/wv\)/i,'').trim();
        }
        // iPhone/iPad: ambil model
        const iosMatch = ua.match(/(iPhone|iPad)[^;]*/i);
        if (iosMatch) deviceModel = iosMatch[0].replace(/;.*/,'').trim();
        // Windows PC: ambil versi Windows
        const winMatch = ua.match(/Windows NT ([\d.]+)/i);
        if (winMatch) {
          const winVer = {'10.0':'10','6.3':'8.1','6.2':'8','6.1':'7','6.0':'Vista'}[winMatch[1]] || winMatch[1];
          deviceModel = 'Windows ' + winVer;
        }
        // Mac: ambil versi macOS
        const macMatch = ua.match(/Mac OS X ([\d_]+)/i);
        if (macMatch && !iosMatch) deviceModel = 'macOS ' + macMatch[1].replace(/_/g,'.');
        // Linux desktop
        if (!deviceModel && /Linux/i.test(ua) && !/Android/i.test(ua)) deviceModel = 'Linux PC';

        await supabase.from('visitors').insert([{
          user_agent:  ua,
          device_model: deviceModel || null,
          screen_size: `${window.screen.width}x${window.screen.height}`,
          language:    navigator.language || '',
          timezone:    Intl.DateTimeFormat().resolvedOptions().timeZone || '',
          referrer:    document.referrer || 'direct',
          visited_at:  new Date().toISOString(),
        }]);
      } catch(_) {}
    };
    const loadComments = async () => {
      const { data } = await supabase.from('comments').select('*').order('created_at', { ascending: false });
      if (data) setComments(data);
    };
    const loadCerts = async () => {
      const { data, error } = await supabase.from('certificates').select('*').order('created_at', { ascending: false });
      if (data) setCertificates(data);
    };
    const loadProjects = async () => {
      const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      if (data) setProjects(data);
    };
    const loadProfileImage = async () => {
      const { data } = await supabase.from('settings').select('key,value');
      if (data) data.forEach(row => {
        if (row.key === 'profile_image' && row.value) setProfileImage(row.value);
        if (row.key === 'theme_color'   && row.value) setThemeColor(row.value);
        if (row.key === 'bg_theme'      && row.value) setBgTheme(row.value);
        if (row.key === 'font_choice'   && row.value) setFontChoice(row.value);
        if (row.key === 'music_url'     && row.value) setMusicUrl(row.value);
      });
    };
    const init = async () => {
      await Promise.all([loadCerts(), loadProjects(), loadViews(), loadComments(), loadProfileImage()]);
      logVisitor(); // non-blocking, fire and forget

      // Listen for theme updates from admin (realtime)
      const channel = supabase
        .channel('settings-watch')
        .on('postgres_changes', { event:'UPDATE', schema:'public', table:'settings', filter:'key=eq.last_update' }, (payload) => {
          try {
            const info = JSON.parse(payload.new.value);
            setUpdateMsg(info.msg || '🔄 Tema diperbarui');
            setTimeout(() => window.location.reload(), 3500);
          } catch(_) {}
        })
        .subscribe();

      // Load approved community photos
      supabase.from('user_photos').select('*').eq('approved',true).order('created_at',{ascending:false}).then(({data})=>{
        if (data) setCommunityPhotos(data);
      });

      // Load like count from dedicated likes table
      supabase.from('likes').select('count', { count:'exact', head:true }).then(({count})=>{
        setLikeCount(count||0);
      });
      // Generate stable device ID and check if already liked
      let devId = typeof localStorage !== 'undefined' ? localStorage.getItem('_dev_id') : null;
      if (!devId) {
        devId = Math.random().toString(36).slice(2) + Date.now().toString(36);
        if (typeof localStorage !== 'undefined') localStorage.setItem('_dev_id', devId);
      }
      setLikeId(devId);
      supabase.from('likes').select('id').eq('device_id', devId).single().then(({data})=>{
        if (data) setLiked(true);
      }).catch(()=>{});

      // Load replies
      supabase.from('replies').select('*').order('created_at',{ascending:true}).then(({data})=>{
        if (!data) return;
        const map = {};
        data.forEach(r => { if (!map[r.comment_id]) map[r.comment_id]=[]; map[r.comment_id].push(r); });
        setCommentReplies(map);
      });

      // GitHub public API — no key needed
      fetch('https://api.github.com/users/auraauvarose/repos?sort=pushed&per_page=4')
        .then(r => r.json()).then(d => { if (Array.isArray(d)) setGhRepos(d.slice(0,4)); }).catch(()=>{});
      fetch('https://api.github.com/users/auraauvarose/events/public?per_page=10')
        .then(r => r.json()).then(events => {
          if (!Array.isArray(events)) return;
          // Find most recent push
          const push = events.find(e => e.type === 'PushEvent');
          if (!push) { setGhStatus({ detail: null, since: null, online: false }); return; }
          const repo = (push.repo?.name || '').split('/')[1] || 'repository';
          const msg  = push.payload?.commits?.[0]?.message || 'Commit terbaru';
          const mins = Math.round((Date.now() - new Date(push.created_at)) / 60000);
          const ago  = mins < 60 ? `${mins}m ago` : mins < 1440 ? `${Math.round(mins/60)}h ago` : `${Math.round(mins/1440)}d ago`;
          // Only show "Online" if pushed within last 60 minutes
          // Show online if VSCode was open recently (pushed within 8h)
          const isRecent = mins < 480;
          setGhStatus({ detail: repo, since: ago, msg: msg.split('\n')[0].slice(0,60), online: isRecent });
        }).catch(()=>{});
      setTimeout(() => setPageReady(true), 300);
    };
    init();
    return () => clearInterval(interval);
  }, []);

  const submitComment = async (e) => {
    e.preventDefault();
    if (!nameInput || !messageInput) return;
    setIsSubmitting(true);
    await supabase.from('comments').insert([{ name: nameInput, message: messageInput }]);
    setNameInput(''); setMessageInput('');
    setSubmitDone(true);
    setTimeout(() => setSubmitDone(false), 3000);
    const { data } = await supabase.from('comments').select('*').order('created_at', { ascending: false });
    if (data) setComments(data);
    setIsSubmitting(false);
  };

  const toggleMusic = () => {
    isPlaying ? audioRef.current.pause() : audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const handleLike = async () => {
    if (liked || !likeId) return;
    setLiked(true);
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 800);
    const { error } = await supabase.from('likes').insert([{ device_id: likeId }]);
    if (!error) {
      const { count } = await supabase.from('likes').select('count', { count:'exact', head:true });
      setLikeCount(count||0);
    } else {
      // Already liked from another session
      setLiked(true);
    }
  };

  const submitPhoto = async (e) => {
    e.preventDefault();
    if (!photoFile || !photoForm.name) return;
    setPhotoSubmitting(true);
    try {
      const ext = photoFile.name.split('.').pop();
      const fname = `community_${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('certificates').upload(fname, photoFile, { upsert: false });
      if (error) { alert('Upload gagal: ' + error.message); setPhotoSubmitting(false); return; }
      const url = supabase.storage.from('certificates').getPublicUrl(fname).data.publicUrl;
      await supabase.from('user_photos').insert([{ sender_name: photoForm.name, caption: photoForm.caption, image_url: url, approved: false }]);
      setPhotoSubmitDone(true);
      setPhotoForm({ name:'', caption:'' });
      setPhotoFile(null);
      setTimeout(() => setPhotoSubmitDone(false), 4000);
    } catch(err) { alert('Error: '+err.message); }
    setPhotoSubmitting(false);
  };

  const submitReply = async (commentId, name) => {
    const text = replyInput[commentId]?.trim();
    if (!text || !name) return;
    await supabase.from('replies').insert([{ comment_id: commentId, name: name||'Anonim', message: text }]);
    setReplyInput(prev => ({...prev, [commentId]:''}));
    const { data } = await supabase.from('replies').select('*').order('created_at',{ascending:true});
    if (data) {
      const map = {};
      data.forEach(r => { if (!map[r.comment_id]) map[r.comment_id]=[]; map[r.comment_id].push(r); });
      setCommentReplies(map);
    }
  };

  // Reload audio when musicUrl changes (updated from admin)
  useEffect(() => {
    if (audioRef.current) {
      const wasPlaying = isPlaying;
      audioRef.current.pause();
      audioRef.current.load();
      if (wasPlaying) audioRef.current.play().catch(() => {});
    }
  }, [musicUrl]);

  // ── TRANSLATIONS ──
  const tx = {
    navHome: isID ? 'Beranda' : 'Home',
    navAbout: isID ? 'Tentang' : 'About',
    navSkills: isID ? 'Skills' : 'Skills',
    navProjects: isID ? 'Proyek' : 'Projects',
    navCerts: isID ? 'Sertifikat' : 'Certificates',
    navContact: isID ? 'Kontak' : 'Contact',
    heroBadge: isID ? 'Pelajar & IT Student' : 'Student & IT Learner',
    heroGreet: isID ? 'Alo, Saya' : "Hey, I'm",
    heroDesc: isID
      ? 'Belajar dari awal sampai akhir, Berhenti menunggu mood yang tepat untuk bergerak. Kamu punya mimpi besar di dunia teknologi, tapi mimpi itu tidak akan terwujud kalau kamu terus memanjakan rasa malas dan pola tidur yang berantakan.'
      : "Learning from start to finish. Stop waiting for the right mood to act. You have big dreams in tech, but those dreams won't come true if you keep giving in to laziness and a messy sleep schedule.",
    heroBtn: isID ? 'Hubungi Saya →' : 'Contact Me →',
    statProjects: isID ? 'Proyek Selesai' : 'Projects Done',
    statVisitors: isID ? 'Pengunjung' : 'Visitors',
    statYears: isID ? 'Tahun Belajar' : 'Years Learning',
    statGPA: isID ? 'IPK Rata-rata' : 'Avg. GPA',
    socialLabel: isID ? 'Temukan Saya' : 'Find Me On',
    aboutEyebrow: isID ? 'Tentang Saya' : 'About Me',
    aboutTitle: isID ? 'Cerita &\nPerjalanan' : 'Story &\nJourney',
    aboutP1: isID
      ? 'Hai! Saya Aura Auvarose, seorang mahasiswa Informatika semester 1 yang sedang meniti jalan di dunia teknologi. Perjalanan saya bukan tentang kemudahan, melainkan tentang ketekunan di tengah keterbatasan.'
      : "Hi! I'm Aura Auvarose, a first-semester Informatics student carving my path in the tech world. My journey isn't about ease — it's about persistence through limitations.",
    aboutP2: isID
      ? 'Saat ini, saya sedang aktif mendalami Fedora Linux dan membangun portofolio pribadi sebagai bukti nyata perkembangan saya. Fokus saya saat ini adalah menguasai logika pemrograman yang kuat dan terus konsisten belajar setiap malam demi mencapai level profesional.'
      : "Currently I'm actively exploring Fedora Linux and building this personal portfolio as real proof of my growth. My focus is on mastering strong programming logic and staying consistent — learning every night to reach a professional level.",
    tlLabel: isID ? 'Timeline' : 'Timeline',
    skillsEyebrow: isID ? 'Kemampuan' : 'Skills',
    goalsEyebrow: isID ? 'Tujuan & Visi' : 'Goals & Vision',
    goalsTitle: isID ? 'Goals &\nAspirasi' : 'Goals &\nAspirations',
    projEyebrow: isID ? 'Karya Saya' : 'My Work',
    projTitle: isID ? 'Proyek' : 'Projects',
    projEmpty: isID ? 'Belum ada proyek. Tambahkan lewat panel Admin.' : 'No projects yet. Add them via the Admin panel.',
    certEyebrow: isID ? 'Pencapaian' : 'Achievements',
    certTitle: isID ? 'Sertifikat' : 'Certificates',
    certEmpty: isID ? 'Belum ada sertifikat. Tambahkan lewat panel Admin.' : 'No certificates yet. Add via Admin panel.',
    certDefault: isID ? 'Sertifikat Kompetensi' : 'Competency Certificate',
    certClick: isID ? 'Klik untuk lihat detail' : 'Click to view details',
    modalLabel: isID ? 'Catatan Sertifikat' : 'Certificate Notes',
    modalIssuer: isID ? 'Diterbitkan Oleh' : 'Issued By',
    modalDate: isID ? 'Tanggal Ditambahkan' : 'Date Added',
    modalVerified: isID ? 'Sertifikat Terverifikasi ✓' : 'Verified Certificate ✓',
    contactEyebrow: isID ? 'Buku Tamu' : 'Guestbook',
    contactTitle: isID ? 'Tinggalkan\nPesan' : 'Leave a\nMessage',
    fName: isID ? 'Nama Lengkap' : 'Full Name',
    fNamePh: isID ? 'Masukkan nama kamu...' : 'Enter your name...',
    fMsg: isID ? 'Pesan' : 'Message',
    fMsgPh: isID ? 'Tulis pesanmu di sini...' : 'Write your message here...',
    fSend: isID ? 'Kirim Pesan →' : 'Send Message →',
    fSending: isID ? 'Mengirim...' : 'Sending...',
    fOk: isID ? '✓ Pesan terkirim! Terima kasih sudah mampir.' : '✓ Message sent! Thanks for stopping by.',
    commentsLabel: isID ? 'Pesan Masuk' : 'Messages',
    commentsEmpty: isID ? 'Belum ada pesan. Jadilah yang pertama! 👋' : "No messages yet. Be the first! 👋",
    footerViews: isID ? 'Website ini telah dibuka' : 'This site has been visited',
    footerTimes: isID ? 'kali' : 'times',
    footerMade: isID ? 'Dibuat dengan Next.js & Supabase' : 'Made with Next.js & Supabase',
    galleryEyebrow: isID ? 'GALERI FOTO' : 'PHOTO GALLERY',
    galleryTitle: isID ? 'Momen & Kenangan' : 'Moments & Memories',
    galleryCta: isID ? '📷 Kirim Fotomu →' : '📷 Send Your Photo →',
    galleryEmpty: isID ? 'Belum ada foto.' : 'No photos yet.',
    galleryUpload: isID ? 'Jadilah yang pertama kirim foto →' : 'Be the first to send a photo →',
    replyOpen: isID ? '💬 Balas' : '💬 Reply',
    replyClose: isID ? '✕ Tutup' : '✕ Close',
    replyNamePh: isID ? 'Nama kamu...' : 'Your name...',
    replyMsgPh: isID ? 'Balasan...' : 'Reply...',
    replySend: isID ? 'Kirim' : 'Send',
    likeLabel: isID ? 'Suka website ini?' : 'Like this website?',
    likedLabel: isID ? 'Terima kasih!' : 'Thank you!',
    likeSubLabel: isID ? 'orang menyukai ini' : 'people liked this',
    currentActivity: isID ? 'Aktivitas Saat Ini' : 'Current Activity',
    onlineLabel: isID ? '🟢 Online' : '🟢 Online',
    offlineLabel: isID ? '⚫ Offline' : '⚫ Offline',
    recentRepos: isID ? 'Repositori Terbaru' : 'Recent Repositories',
    viewAll: isID ? 'Lihat semua →' : 'View all →',
    discWorkspace: isID ? 'Workspace: my-portfolio' : 'Workspace: my-portfolio',
  };

  const socials = [
    { icon: 'GH', name: 'GitHub', url: 'https://github.com/auraauvarose', handle: '@auraauvarose' },
    { icon: 'IG', name: 'Instagram', url: 'https://www.instagram.com/aura_auvarose_/', handle: '@aura_auvarose_' },
    { icon: 'LI', name: 'LinkedIn', url: 'https://linkedin.com/in/USERNAME', handle: 'Belum Ada' },
    { icon: '✉', name: 'Email', url: 'mailto:auraauvaroseendica@gmail.com', handle: 'auraauvaroseendica@gmail.com' },
    { icon: 'DC', name: 'Discord', url: 'https://discord.com/users/862306063054667786', handle: '@Rur^a!' },
    { icon: 'TT', name: 'TikTok', url: 'https://www.tiktok.com/@au.rose', handle: '@au.rose' },
  ];

  const skills = [
    { name: 'Node.js', cat: 'Back-End', level: 45 },
    { name: 'Express.js', cat: 'Framework', level: 0 },
    { name: 'JavaScript', cat: 'Language', level: 60 },
    { name: 'Python', cat: 'Language', level: 70 },
    { name: 'Docker', cat: 'DevOps', level: 0 },
    { name: 'Next.js', cat: 'Front-End', level: 50 },
    { name: 'Git', cat: 'Tools', level: 82 },
    { name: 'C++', cat: 'Language', level: 55 },
    { name : 'Linux', cat: 'OS', level: 65 },
    { name: 'SQL', cat: 'Database', level: 30 },
    { name: 'Next.js', cat: 'Framework', level: 50 },
    
  ];

  const timeline = isID ? [
    { year: '2021–2025', title: 'Pengalaman Belajar', desc: 'Desain Komunikasi Visual.' },
    { year: '2022', title: 'Mengenal Pemrograman', desc: 'Memulai belajar pemrograman menggunakan JavaScript dan Python.' },
    { year: '2025', title: 'Kuliah S1 Informatika', desc: 'Mulai menempuh pendidikan S1 Informatika.' },
  ] : [
    { year: '2021–2025', title: 'Learning Experience', desc: 'Visual Communication Design.' },
    { year: '2022', title: 'First Steps in Programming', desc: 'Started learning programming with JavaScript and Python.' },
    { year: '2025', title: 'S1 Informatics', desc: 'Enrolled in a Bachelor of Informatics degree.' },
  ];

  const goals = isID ? [
    { icon: '🎯', title: 'Jangka Pendek', items: ['Lulus dengan IPK terbaik', 'Kuasai cloud (AWS/GCP)', 'Bangun 5 proyek portfolio', 'Kontribusi open source'] },
    { icon: '🚀', title: 'Jangka Menengah', items: ['Bekerja di tech company', 'Spesialisasi distributed system', 'Bangun startup atau produk sendiri', 'Mentoring junior developer'] },
    { icon: '🌟', title: 'Jangka Panjang', items: ['Software architect berpengalaman', 'Berkontribusi pada komunitas IT', 'Buat platform edukasi coding', 'Impak positif melalui teknologi'] },
  ] : [
    { icon: '🎯', title: 'Short Term', items: ['Graduate with top GPA', 'Master cloud (AWS/GCP)', 'Build 5 portfolio projects', 'Contribute to open source'] },
    { icon: '🚀', title: 'Mid Term', items: ['Work at a tech company', 'Specialize in distributed systems', 'Build a startup or product', 'Mentor junior developers'] },
    { icon: '🌟', title: 'Long Term', items: ['Experienced software architect', 'Contribute to IT community', 'Build a coding education platform', 'Create positive impact through tech'] },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,900;1,9..144,400;1,9..144,700&family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=Inter:wght@400;600;700&family=Space+Grotesk:wght@400;600;700;800&family=Syne:wght@700;800&family=DM+Sans:wght@400;500;700&family=Cormorant+Garamond:ital,wght@0,700;1,400&family=Lato:wght@400;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;}
        html{
          margin:0;padding:0;width:100%;overflow-x:hidden;
          background:#111110;
          transition:background 0.5s ease;
          scrollbar-width:thin;scrollbar-color:rgba(100,100,100,0.5) transparent;
        }
        html.site-dark{background:#111110;}
        html:not(.site-dark){background:#ffffff;}
        html::-webkit-scrollbar{width:4px;}
        html::-webkit-scrollbar-track{background:transparent;}
        html::-webkit-scrollbar-thumb{background:rgba(100,100,100,0.4);border-radius:4px;}
        html::-webkit-scrollbar-thumb:hover{background:rgba(150,150,150,0.6);}
        body{margin:0;padding:0;width:100%;overflow-x:hidden;background:transparent;}
        body{cursor:url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="cyan" stroke="white" stroke-width="1.5"><path d="M3 3l7 17 2.5-7.5L20 10z"/></svg>'),auto;}
        a,button{cursor:url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="magenta" stroke="white" stroke-width="1.5"><path d="M3 3l7 17 2.5-7.5L20 10z"/></svg>'),pointer;}

        /* ── WAVE RIPPLE OVERLAY ── */
        .theme-ripple{
          position:fixed;inset:0;z-index:9997;pointer-events:none;
          background:var(--ripple-color,#ffffff);
          clip-path:circle(0% at var(--rx,50%) var(--ry,50%));
          animation:waveRipple 0.65s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        @keyframes waveRipple{
          0%{clip-path:circle(0% at var(--rx) var(--ry));opacity:0.95;}
          60%{clip-path:circle(120% at var(--rx) var(--ry));opacity:0.9;}
          100%{clip-path:circle(150% at var(--rx) var(--ry));opacity:0;}
        }

        /* ── LOADING SCREEN ── */
        .page-loader{
          position:fixed;inset:0;z-index:9999;
          background:#111110;
          display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;
          transition:opacity 0.5s ease, visibility 0.5s ease;
        }
        .page-loader.done{opacity:0;visibility:hidden;pointer-events:none;}
        .loader-logo{font-family:var(--font-body,'Plus Jakarta Sans'),sans-serif;font-size:22px;font-weight:800;color:#f0efe8;letter-spacing:0.18em;text-transform:lowercase;}
        .loader-logo em{font-style:normal;color:var(--loader-acc,#d4eb00);}
        .loader-bar-wrap{width:160px;height:2px;background:rgba(255,255,255,0.1);border-radius:2px;overflow:hidden;}
        .loader-bar{height:100%;width:0%;background:var(--loader-acc,#d4eb00);border-radius:2px;animation:loadProgress 1.2s cubic-bezier(.4,0,.2,1) forwards;}
        @keyframes loadProgress{0%{width:0%;}60%{width:75%;}100%{width:100%;}}
        .loader-text{font-family:var(--font-body);font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:rgba(240,239,232,0.4);}

        /* ── THEME VARS ── */
        .rw{
          --acc:#d4eb00; --acc-bg:rgba(212,235,0,0.12);
          --ink:#1a1a1a; --ink2:#555555; --ink3:#999999;
          --bg:#ffffff; --bg2:#f4f4f0; --bd:rgba(0,0,0,0.09);
          --shadow:rgba(0,0,0,0.07);
          --font-heading:'Fraunces',serif;
          --font-body:'Plus Jakarta Sans',sans-serif;
          font-family:var(--font-body);
          background:var(--bg); color:var(--ink);
          min-height:100vh; width:100%;
          transition:background 0.5s ease,color 0.5s ease;
          position:relative; overflow-x:hidden;
        }
        .rw.dark{
          --ink:#f0efe8; --ink2:#909088; --ink3:#555550;
          --bg:#111110; --bg2:#1c1c1a; --bd:rgba(255,255,255,0.07);
          --shadow:rgba(0,0,0,0.3);
        }
        .rw *{transition-property:background-color,border-color,color,box-shadow;transition-duration:0.5s;transition-timing-function:ease;}
        /* Perf: promote heavy animated elements to own layer */
        .hero-photo-wrap,.proj-card,.cert-card,.skill-card,.gh-repo-card{transform:translateZ(0);}
        /* Reduce paint during scroll */
        .nav{contain:layout style;}
        .footer{contain:layout style;}
        .rw img,.rw canvas,.rw video,.rw .orb,.rw [data-reveal],.rw .theme-ripple{transition:none!important;}

        /* ── LIGHT MODE CARD SHADOWS ── */
        .rw:not(.dark) .skill-card{box-shadow:0 2px 16px rgba(0,0,0,0.07),0 1px 3px rgba(0,0,0,0.05);}
        .rw:not(.dark) .skill-card:hover{box-shadow:0 8px 32px rgba(0,0,0,0.12),0 2px 8px rgba(0,0,0,0.07);}
        .rw:not(.dark) .goal-card{box-shadow:0 2px 16px rgba(0,0,0,0.07),0 1px 3px rgba(0,0,0,0.05);}
        .rw:not(.dark) .goal-card:hover{box-shadow:0 8px 32px rgba(0,0,0,0.12);}
        .rw:not(.dark) .proj-card{box-shadow:0 2px 20px rgba(0,0,0,0.08),0 1px 4px rgba(0,0,0,0.05);}
        .rw:not(.dark) .proj-card:hover{box-shadow:0 12px 40px rgba(0,0,0,0.14);}
        .rw:not(.dark) .cert-card{box-shadow:0 2px 20px rgba(0,0,0,0.08),0 1px 4px rgba(0,0,0,0.05);}
        .rw:not(.dark) .cert-card:hover{box-shadow:0 12px 40px rgba(0,0,0,0.14);}
        .rw:not(.dark) .comment-card{box-shadow:0 1px 8px rgba(0,0,0,0.06);}
        .rw:not(.dark) .nav{box-shadow:0 1px 24px rgba(0,0,0,0.08);}
        .rw:not(.dark) .gh-activity{box-shadow:0 2px 20px rgba(0,0,0,0.07);}
        .rw:not(.dark) .stat{box-shadow:inset -1px 0 0 rgba(0,0,0,0.06);}
        .rw:not(.dark) .footer-views{box-shadow:0 1px 8px rgba(0,0,0,0.06);}
        .rw:not(.dark) .social-btn{box-shadow:0 1px 6px rgba(0,0,0,0.06);}

        /* ── DARK MODE ORBS ── */
        /* ── UPDATE BANNER ── */
        .update-banner{
          position:fixed;top:0;left:0;right:0;z-index:999;
          background:var(--acc);color:#0d0d0d;
          display:flex;align-items:center;justify-content:center;gap:8px;
          padding:10px 20px;font-size:13px;font-weight:700;
          animation:slideDown .4s cubic-bezier(.22,1,.36,1);
        }
        @keyframes slideDown{from{transform:translateY(-100%);}to{transform:translateY(0);}}
        .update-icon{font-size:16px;}
        .update-progress{
          position:absolute;bottom:0;left:0;height:3px;background:rgba(0,0,0,.2);
          animation:progressBar 3.5s linear forwards;
        }
        @keyframes progressBar{from{width:100%;}to{width:0%;}}

        .orb{
          position:fixed; border-radius:50%; pointer-events:none;
          filter:blur(90px); z-index:0; opacity:0;
          transition:opacity 0.6s ease;
          will-change:transform; transform:translateZ(0);
          contain:strict;
        }
        .rw.dark .orb{opacity:1;}
        .orb-1{width:500px;height:500px;background:radial-gradient(circle,rgba(212,235,0,0.12),transparent 70%);top:-100px;left:-100px;animation:orbFloat1 12s ease-in-out infinite;}
        .orb-2{width:400px;height:400px;background:radial-gradient(circle,rgba(0,200,255,0.08),transparent 70%);top:40%;right:-80px;animation:orbFloat2 15s ease-in-out infinite;}
        .orb-3{width:350px;height:350px;background:radial-gradient(circle,rgba(180,100,255,0.07),transparent 70%);bottom:10%;left:20%;animation:orbFloat3 18s ease-in-out infinite;}
        @keyframes orbFloat1{0%,100%{transform:translate(0,0);}50%{transform:translate(40px,30px);}}
        @keyframes orbFloat2{0%,100%{transform:translate(0,0);}50%{transform:translate(-30px,-40px);}}
        @keyframes orbFloat3{0%,100%{transform:translate(0,0);}50%{transform:translate(20px,-20px);}}

        /* ── SCROLL REVEAL ── */
        [data-reveal]{opacity:0;transform:translateY(28px);transition:opacity 0.65s ease,transform 0.65s ease;}
        [data-reveal].revealed{opacity:1;transform:translateY(0);}
        /* Mobile: disable reveal animation — show everything immediately */
        @media(max-width:768px){[data-reveal]{opacity:1!important;transform:none!important;transition:none!important;}}
        [data-reveal][data-delay="1"]{transition-delay:0.1s;}
        [data-reveal][data-delay="2"]{transition-delay:0.2s;}
        [data-reveal][data-delay="3"]{transition-delay:0.3s;}
        [data-reveal][data-delay="4"]{transition-delay:0.4s;}

        /* ── MAGNETIC CARDS ── */
        .mag{transition:transform 0.25s ease,box-shadow 0.25s ease;transform-style:preserve-3d;perspective:800px;will-change:transform;}
        @media(max-width:768px){.mag{transform-style:flat;perspective:none;}} /* disable 3D on mobile = less GPU */

        /* ── NAV ── */
        .nav{position:fixed;top:0;left:0;right:0;z-index:50;background:var(--bg);border-bottom:1px solid var(--bd);transition:background 0.5s,border-color 0.5s;backdrop-filter:blur(12px);}
        .nav-in{max-width:1140px;margin:0 auto;padding:0 40px;height:64px;display:flex;align-items:center;justify-content:space-between;gap:16px;}
        .logo{font-family:var(--font-heading);font-size:22px;font-weight:900;color:var(--ink);text-decoration:none;letter-spacing:-0.5px;flex-shrink:0;}
        .logo em{font-style:normal;color:var(--acc);}
        .nav-links{display:flex;gap:28px;list-style:none;margin:0;padding:0;flex-shrink:0;}
        .nav-links a{font-size:13px;font-weight:600;letter-spacing:0.03em;color:var(--ink2);text-decoration:none;transition:color 0.2s;position:relative;padding-bottom:2px;}
        .nav-links a::after{content:'';position:absolute;bottom:0;left:0;width:0;height:1.5px;background:var(--acc);transition:width 0.25s;}
        .nav-links a:hover{color:var(--ink);}
        .nav-links a:hover::after{width:100%;}
        .nav-right{display:flex;align-items:center;gap:8px;flex-shrink:0;}
        .btn-admin{padding:8px 16px;background:var(--acc);color:#0d0d0d;border:none;border-radius:100px;font-family:inherit;font-size:12px;font-weight:800;letter-spacing:0.04em;text-decoration:none;display:flex;align-items:center;gap:5px;transition:all 0.2s;}
        .btn-admin:hover{transform:translateY(-2px);box-shadow:0 6px 20px var(--acc-bg);}
        .btn-theme{padding:8px 14px;border:1px solid var(--bd);background:var(--bg2);color:var(--ink);border-radius:100px;font-family:inherit;font-size:12px;font-weight:700;transition:all 0.2s;}
        .btn-theme:hover{transform:translateY(-1px);border-color:var(--acc);}

        .wrap{max-width:1140px;margin:0 auto;padding:0 40px;position:relative;z-index:1;}

        /* ── HERO ── */
        .hero{padding-top:116px;padding-bottom:80px;display:grid;grid-template-columns:1fr 300px;align-items:center;gap:60px;border-bottom:1px solid var(--bd);}
        .hero-tag{display:inline-flex;align-items:center;gap:8px;font-size:12px;font-weight:700;letter-spacing:0.1em;color:var(--ink2);text-transform:uppercase;margin-bottom:18px;}
        .hero-dot{width:7px;height:7px;border-radius:50%;background:var(--acc);animation:blink 2s ease infinite;flex-shrink:0;}
        @keyframes blink{0%,100%{opacity:1;}50%{opacity:0.2;}}
        .hero-h1{font-family:var(--font-heading);font-size:clamp(38px,6vw,84px);font-weight:900;line-height:0.93;letter-spacing:-0.02em;color:var(--ink);margin:0 0 22px;}
        .hero-line-1{display:block;animation:heroSlideIn 0.7s cubic-bezier(.22,1,.36,1) both;}
        .hero-line-2{display:block;animation:heroSlideIn 0.7s 0.15s cubic-bezier(.22,1,.36,1) both;}
        .hero-loop-name{animation:heroSlideIn 0.7s 0.25s cubic-bezier(.22,1,.36,1) both;font-style:italic;font-weight:400;color:var(--ink2);}
        @keyframes heroSlideIn{from{opacity:0;transform:translateY(32px);}to{opacity:1;transform:translateY(0);}}
        .hero-cursor{display:inline-block;color:var(--acc);animation:cursorBlink 0.75s step-end infinite;margin-left:1px;font-style:normal;font-weight:900;}
        .type-cursor{color:var(--acc);animation:cursorBlink 0.75s step-end infinite;font-weight:300;}
        .type-cursor.done{display:none;}
        @keyframes cursorBlink{0%,100%{opacity:1;}50%{opacity:0;}}
        .hero-h1 em{font-style:italic;font-weight:400;color:var(--ink2);}
        .hero-loop-name em{font-style:inherit;}
        .hero-p{font-size:16px;color:var(--ink2);line-height:1.7;max-width:460px;margin-bottom:34px;}
        .hero-btns{display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
        .btn-dark{padding:13px 24px;background:var(--ink);color:var(--bg);border:none;border-radius:100px;font-family:inherit;font-size:14px;font-weight:700;text-decoration:none;display:inline-block;transition:all 0.25s;}
        .btn-dark:hover{transform:translateY(-3px);box-shadow:0 10px 28px var(--shadow);}
        .btn-acc{padding:12px 18px;background:var(--acc);color:#0d0d0d;border:none;border-radius:100px;font-family:inherit;font-size:14px;font-weight:600;display:flex;align-items:center;gap:6px;transition:all 0.2s;}
        .btn-acc:hover{transform:translateY(-2px);}
        .hero-photo-wrap{position:relative;height:320px;}
        .hero-photo-bg{position:absolute;inset:-10px;background:var(--acc);border-radius:24px;transform:rotate(4deg);transition:transform 0.5s cubic-bezier(.34,1.56,.64,1);}
        .hero-photo-wrap:hover .hero-photo-bg{transform:rotate(8deg) scale(1.03);}
        .hero-photo{position:relative;width:100%;height:100%;border-radius:20px;overflow:hidden;background:var(--bg2);}
        .hero-photo img{width:100%;height:100%;object-fit:cover;transition:transform 0.5s;}
        .hero-photo-wrap:hover .hero-photo img{transform:scale(1.04);}

        /* ── STATS ── */
        .stats{display:grid;grid-template-columns:repeat(4,1fr);border-bottom:1px solid var(--bd);}
        .stat{padding:36px 0;text-align:center;border-right:1px solid var(--bd);}
        .stat:last-child{border-right:none;}
        .stat-n{font-family:var(--font-heading);font-size:42px;font-weight:900;color:var(--ink);line-height:1;margin-bottom:6px;transition:transform 0.3s;}
        .stat:hover .stat-n{transform:scale(1.08);}
        .stat-l{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--ink2);}

        /* ── SOCIAL MARQUEE ── */
        .social-strip{
          padding:6px 0 6px;border-bottom:1px solid var(--bd);
          position:relative;overflow:visible;
        }
        .social-strip-inner{
          overflow:hidden;
          padding:14px 0;
          position:relative;
        }
        .social-strip-inner::before,.social-strip-inner::after{
          content:'';position:absolute;top:0;bottom:0;width:80px;z-index:2;pointer-events:none;
        }
        .social-strip-inner::before{left:0;background:linear-gradient(to right,var(--bg),transparent);}
        .social-strip-inner::after{right:0;background:linear-gradient(to left,var(--bg),transparent);}
        .social-track{
          display:flex;gap:10px;width:max-content;
          animation:pingPong 22s ease-in-out infinite alternate;
        }
        .social-track:hover{animation-play-state:paused;}
        @keyframes pingPong{
          0%{transform:translateX(0);}
          100%{transform:translateX(calc(-100% + 100vw - 160px));}
        }
        .social-btn{
          display:flex;align-items:center;gap:8px;padding:9px 16px;
          background:var(--bg2);border:1px solid var(--bd);border-radius:100px;
          text-decoration:none;color:var(--ink);font-size:13px;font-weight:600;
          transition:transform .25s,border-color .25s,box-shadow .25s;
          flex-shrink:0;white-space:nowrap;
        }
        .social-btn:hover{transform:translateY(-4px);border-color:var(--acc);box-shadow:0 8px 24px var(--shadow);}
        .social-icon{font-size:10px;font-weight:800;letter-spacing:.05em;color:var(--ink3);}
        .social-handle{font-size:11px;color:var(--ink2);}
        @media(max-width:768px){.social-track{animation-duration:16s;}}

        /* ── SECTION ── */
        .sec{padding-top:76px;padding-bottom:76px;border-bottom:1px solid var(--bd);}
        .sec-head{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:48px;}
        .eyebrow{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:var(--ink2);margin-bottom:8px;}
        .sec-title{font-family:var(--font-heading);font-size:clamp(28px,4vw,48px);font-weight:900;line-height:1.05;letter-spacing:-0.02em;color:var(--ink);margin:0;}
        .sec-num{font-family:var(--font-heading);font-size:56px;font-weight:900;color:var(--bd);line-height:1;user-select:none;}

        /* ── ABOUT ── */
        .about-grid{display:grid;grid-template-columns:1fr 1fr;gap:72px;align-items:start;}
        .about-text{font-size:15px;color:var(--ink2);line-height:1.8;}
        .about-text p{margin:0 0 16px;}
        .about-text strong{color:var(--ink);font-weight:700;}
        .about-tags{display:flex;flex-wrap:wrap;gap:8px;margin-top:24px;}
        .about-tag{padding:5px 13px;background:var(--bg2);border:1px solid var(--bd);border-radius:100px;font-size:12px;font-weight:600;color:var(--ink2);transition:all 0.2s;}
        .about-tag:hover{border-color:var(--acc);color:var(--ink);transform:translateY(-2px);}
        .timeline{position:relative;padding-left:24px;}
        .timeline::before{content:'';position:absolute;left:0;top:8px;bottom:8px;width:1px;background:var(--bd);}
        .tl-item{position:relative;padding-left:28px;padding-bottom:32px;cursor:default;}
        .tl-item:last-child{padding-bottom:0;}
        .tl-dot{position:absolute;left:-30px;top:5px;width:10px;height:10px;border-radius:50%;background:var(--bg);border:2px solid var(--ink3);transition:all 0.3s;}
        .tl-item:hover .tl-dot{border-color:var(--acc);background:var(--acc);transform:scale(1.4);}
        .tl-year{font-family:var(--font-heading);font-size:13px;font-weight:900;color:var(--acc);margin-bottom:4px;letter-spacing:0.05em;}
        .tl-title{font-size:15px;font-weight:700;color:var(--ink);margin-bottom:5px;}
        .tl-desc{font-size:13px;color:var(--ink2);line-height:1.6;}

        /* ── SKILLS ── */
        .skills-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;}
        .skill-card{padding:18px;background:var(--bg2);border:1px solid var(--bd);border-radius:16px;transition:border-color 0.2s,box-shadow 0.2s;}
        .skill-card:hover{border-color:var(--acc);box-shadow:0 0 0 3px var(--acc-bg);}
        .skill-cat{font-size:9px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:var(--ink3);margin-bottom:8px;}
        .skill-name{font-size:16px;font-weight:700;color:var(--ink);margin-bottom:12px;}
        .skill-bar-bg{height:4px;background:var(--bd);border-radius:4px;overflow:hidden;}
        .skill-bar-fill{height:100%;background:var(--acc);border-radius:4px;transition:width 1.2s ease;}
        .skill-pct{font-size:11px;font-weight:600;color:var(--ink3);margin-top:5px;text-align:right;}

        /* ── GOALS ── */
        .goals-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
        .goal-card{padding:26px;background:var(--bg2);border:1px solid var(--bd);border-radius:20px;transition:border-color 0.25s,box-shadow 0.25s;}
        .goal-card:hover{border-color:var(--acc);box-shadow:0 8px 32px var(--shadow);}
        .goal-icon{font-size:26px;margin-bottom:14px;}
        .goal-title{font-size:15px;font-weight:700;color:var(--ink);margin-bottom:14px;}
        .goal-items{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:9px;}
        .goal-item{display:flex;align-items:flex-start;gap:9px;font-size:13px;color:var(--ink2);line-height:1.5;}
        .goal-item::before{content:'→';color:var(--acc);font-weight:700;flex-shrink:0;margin-top:1px;}

        /* ── PROJECTS ── */
        .proj-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:20px;}
        .proj-card{background:var(--bg2);border:1px solid var(--bd);border-radius:20px;overflow:hidden;transition:border-color 0.25s,box-shadow 0.25s;}
        .proj-card:hover{border-color:var(--acc);box-shadow:0 16px 40px var(--shadow);}
        .proj-thumb{aspect-ratio:16/9;overflow:hidden;background:var(--bg);position:relative;}
        .proj-thumb img{width:100%;height:100%;object-fit:cover;transition:transform 0.5s;}
        .proj-card:hover .proj-thumb img{transform:scale(1.06);}
        .proj-thumb-empty{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-family:var(--font-heading);font-size:48px;font-weight:900;color:var(--bd);}
        .proj-body{padding:20px;}
        .proj-title{font-size:16px;font-weight:700;color:var(--ink);margin-bottom:7px;}
        .proj-desc{font-size:13px;color:var(--ink2);line-height:1.6;margin-bottom:14px;}
        .proj-stack{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:16px;}
        .proj-chip{padding:3px 10px;background:var(--bg);border:1px solid var(--bd);border-radius:100px;font-size:10px;font-weight:700;color:var(--ink3);}
        .proj-links{display:flex;gap:8px;}
        .proj-link{display:flex;align-items:center;gap:5px;padding:7px 14px;border-radius:100px;font-size:12px;font-weight:700;text-decoration:none;transition:all 0.2s;}
        .proj-link.gh{background:var(--ink);color:var(--bg);}
        .proj-link.gh:hover{opacity:0.8;}
        .proj-link.demo{background:var(--acc);color:#0d0d0d;}
        .proj-link.demo:hover{opacity:0.85;}

        /* ── CERTS ── */
        .cert-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:18px;}
        .cert-card{background:var(--bg2);border:1px solid var(--bd);border-radius:20px;overflow:hidden;cursor:pointer;transition:border-color 0.25s,box-shadow 0.3s;}
        .cert-card:hover{border-color:var(--acc);box-shadow:0 16px 40px var(--shadow);}
        .cert-img{overflow:hidden;aspect-ratio:16/10;}
        .cert-img img{width:100%;height:100%;object-fit:cover;transition:transform 0.5s;}
        .cert-card:hover .cert-img img{transform:scale(1.07);}
        .cert-info{padding:14px 18px;display:flex;align-items:center;justify-content:space-between;gap:12px;}
        .cert-info-t{min-width:0;}
        .cert-info-t p{font-size:13px;font-weight:700;color:var(--ink);margin:0 0 2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .cert-info-t span{font-size:11px;color:var(--ink2);}
        .cert-arr{width:30px;height:30px;border-radius:50%;background:var(--ink);color:var(--bg);display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;transition:transform 0.25s,background 0.2s;}
        .cert-card:hover .cert-arr{transform:rotate(45deg);background:var(--acc);color:#0d0d0d;}
        .cert-empty,.proj-empty{grid-column:1/-1;padding:60px 24px;text-align:center;border:1px dashed var(--bd);border-radius:20px;color:var(--ink2);font-size:14px;}

        /* ── CERT MODAL ── */
        .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn 0.2s ease;}
        .modal-box{display:flex;width:100%;max-width:960px;max-height:92vh;border-radius:22px;overflow:hidden;animation:zoom 0.3s ease;box-shadow:0 40px 80px rgba(0,0,0,0.6);}
        .modal-img-side{flex:1;background:#000;display:flex;align-items:center;justify-content:center;overflow:hidden;min-height:320px;}
        .modal-img-side img{width:100%;height:100%;object-fit:contain;}
        .modal-info-side{width:270px;flex-shrink:0;background:var(--bg2);padding:32px 24px;display:flex;flex-direction:column;position:relative;border-left:1px solid var(--bd);}
        .modal-notepad-lines{position:absolute;inset:0;background-image:repeating-linear-gradient(transparent,transparent 31px,var(--bd) 31px,var(--bd) 32px);background-position:0 56px;pointer-events:none;opacity:0.4;}
        .modal-close{position:absolute;top:14px;right:14px;width:30px;height:30px;border-radius:50%;background:var(--bg);border:1px solid var(--bd);color:var(--ink2);font-size:13px;display:flex;align-items:center;justify-content:center;transition:all 0.2s;z-index:1;}
        .modal-close:hover{background:var(--ink);color:var(--bg);}
        .modal-note-label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:var(--ink3);margin-bottom:6px;position:relative;z-index:1;}
        .modal-note-title{font-family:var(--font-heading);font-size:19px;font-weight:900;color:var(--ink);line-height:1.2;margin-bottom:22px;position:relative;z-index:1;}
        .modal-note-item{margin-bottom:18px;position:relative;z-index:1;}
        .modal-note-key{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:var(--acc);margin-bottom:4px;}
        .modal-note-val{font-size:13px;font-weight:600;color:var(--ink2);}
        .modal-note-div{height:1px;background:var(--bd);margin:18px 0;position:relative;z-index:1;}
        .modal-acc-bar{margin-top:auto;padding:11px 14px;background:var(--acc);border-radius:10px;font-size:11px;font-weight:700;color:#0d0d0d;text-align:center;position:relative;z-index:1;}

        /* ── CONTACT ── */
        .contact-grid{display:grid;grid-template-columns:1fr 1fr;gap:64px;}
        .form-g{margin-bottom:12px;}
        .form-l{display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--ink2);margin-bottom:7px;}
        .form-i,.form-t{width:100%;padding:14px 16px;background:var(--bg2);border:1.5px solid var(--bd);color:var(--ink);border-radius:12px;font-family:inherit;font-size:14px;outline:none;transition:border-color 0.2s,box-shadow 0.2s;}
        .form-i::placeholder,.form-t::placeholder{color:var(--ink3);}
        .form-i:focus,.form-t:focus{border-color:var(--acc);box-shadow:0 0 0 3px var(--acc-bg);}
        .form-t{height:150px;resize:none;}
        .form-btn{width:100%;padding:15px;background:var(--ink);color:var(--bg);border:none;border-radius:12px;font-family:inherit;font-size:14px;font-weight:700;letter-spacing:0.04em;transition:all 0.2s;margin-top:4px;}
        .form-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 24px var(--shadow);}
        .form-btn:disabled{opacity:0.5;}
        .submit-ok{display:flex;align-items:center;gap:8px;padding:13px 16px;border-radius:11px;background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.25);color:#16a34a;font-size:13px;font-weight:600;margin-top:10px;animation:up 0.3s ease;}
        .comments-hd{display:flex;align-items:baseline;gap:10px;margin-bottom:18px;}
        .comments-n{font-family:var(--font-heading);font-size:34px;font-weight:900;color:var(--ink);line-height:1;}
        .comments-lb{font-size:12px;font-weight:600;color:var(--ink2);}
        .comments-list{max-height:480px;overflow-y:auto;display:flex;flex-direction:column;gap:10px;}
        .comment-card{padding:16px 18px;background:var(--bg2);border:1px solid var(--bd);border-radius:14px;transition:border-color 0.2s;}
        .comment-card:hover{border-color:var(--acc);}
        .comment-name{font-size:13px;font-weight:700;color:var(--ink);margin-bottom:5px;display:flex;align-items:center;gap:10px;}
        .comment-name::after{content:'';flex:1;height:1px;background:var(--bd);}
        .comment-msg{font-size:13px;color:var(--ink2);line-height:1.6;margin-bottom:8px;}
        .comment-dt{font-size:10px;font-weight:600;color:var(--ink3);text-transform:uppercase;letter-spacing:0.08em;}
        .comments-empty{padding:36px;text-align:center;color:var(--ink2);font-size:13px;}

        /* ── SCROLLBAR ── */
        .custom-scrollbar::-webkit-scrollbar{width:4px;}
        .custom-scrollbar::-webkit-scrollbar-track{background:transparent;}
        .custom-scrollbar::-webkit-scrollbar-thumb{background:var(--ink3);border-radius:4px;}
        .custom-scrollbar{scrollbar-width:thin;scrollbar-color:var(--ink3) transparent;}

        /* ── FOOTER ── */
        .footer{padding-top:40px;padding-bottom:40px;border-top:1px solid var(--bd);}
        .footer-inner{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;}
        .footer-left{display:flex;flex-direction:column;gap:6px;}
        .footer-logo{font-family:var(--font-heading);font-size:19px;font-weight:900;color:var(--ink);}
        .footer-logo em{font-style:normal;color:var(--acc);}
        .footer-copy{font-size:12px;font-weight:500;color:var(--ink2);margin:0;}
        .footer-right{display:flex;flex-direction:column;align-items:flex-end;gap:8px;}
        .footer-views{display:inline-flex;align-items:center;gap:9px;padding:8px 16px;background:var(--bg2);border:1px solid var(--bd);border-radius:100px;}
        .footer-views-dot{width:6px;height:6px;border-radius:50%;background:var(--acc);animation:blink 2s ease infinite;flex-shrink:0;}
        .footer-views-num{font-family:var(--font-heading);font-size:14px;font-weight:900;color:var(--ink);}
        .footer-views-text{font-size:12px;font-weight:600;color:var(--ink2);}
        .footer-made{font-size:12px;font-weight:500;color:var(--ink3);}

        /* ── FLOAT (LANG + MUSIC) ── */
        .float-group{position:fixed;bottom:28px;right:28px;z-index:200;display:flex;flex-direction:column;align-items:center;gap:8px;}
        .lang-btn{width:54px;height:34px;border-radius:100px;background:var(--bg2);border:1.5px solid var(--bd);color:var(--ink);font-family:inherit;font-size:12px;font-weight:800;letter-spacing:0.04em;display:flex;align-items:center;justify-content:center;gap:4px;box-shadow:0 4px 16px var(--shadow);transition:all 0.25s;}
        .lang-btn:hover{transform:translateY(-2px);border-color:var(--acc);box-shadow:0 8px 24px var(--shadow);}
        .music-btn{width:54px;height:54px;border-radius:50%;background:var(--ink);color:var(--bg);border:none;font-size:18px;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px var(--shadow);transition:all 0.25s;}
        .music-btn:hover{transform:scale(1.1);box-shadow:0 12px 32px var(--shadow);}
        .music-btn.playing{animation:spin 8s linear infinite;}



        /* ── GITHUB ACTIVITY ── */
        /* ── DISCORD ACTIVITY ── */
        .disc-block{background:var(--bg2);border:1px solid var(--bd);border-radius:16px;padding:14px 18px;margin-bottom:14px;}
        .disc-head-row{display:flex;align-items:center;gap:8px;margin-bottom:10px;}
        .disc-label-text{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--ink2);}
        .disc-since{font-size:10px;color:var(--ink3);margin-left:auto;}
        .disc-card{display:flex;align-items:center;gap:13px;}
        .disc-vscode-icon{width:46px;height:46px;border-radius:10px;overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center;}
        .disc-info{flex:1;min-width:0;}
        .disc-app-name{font-size:13px;font-weight:700;color:var(--ink);}
        .disc-detail-line{font-size:11px;color:var(--ink2);margin-top:2px;}
        .disc-detail-line strong{color:var(--acc);}
        .disc-workspace{font-size:10px;color:var(--ink3);margin-top:1px;}
        .disc-online-badge{font-size:10px;font-weight:700;color:#23d05e;white-space:nowrap;padding:3px 9px;background:rgba(35,208,94,.1);border:1px solid rgba(35,208,94,.2);border-radius:100px;flex-shrink:0;}

        /* ── GITHUB REPOS ── */
        .gh-repos-block{background:var(--bg2);border:1px solid var(--bd);border-radius:16px;padding:14px 18px;margin-bottom:36px;}
        .gh-repos-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
        .gh-repos-title{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--ink2);}
        .gh-repos-link{font-size:11px;font-weight:700;color:var(--acc);text-decoration:none;opacity:.85;transition:opacity .2s;}
        .gh-repos-link:hover{opacity:1;}
        .gh-repos-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
        .gh-repo-card{background:var(--bg);border:1px solid var(--bd);border-radius:10px;padding:11px 13px;text-decoration:none;display:flex;flex-direction:column;gap:5px;transition:border-color .2s,transform .15s;will-change:transform;}
        .gh-repo-card:hover{border-color:var(--acc);transform:translateY(-2px);}
        .gh-repo-name{display:flex;align-items:center;gap:5px;font-size:12px;font-weight:700;color:var(--ink);overflow:hidden;}
        .gh-repo-name span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .gh-repo-desc{font-size:10px;color:var(--ink2);line-height:1.45;}
        .gh-repo-meta{display:flex;align-items:center;gap:8px;font-size:10px;color:var(--ink3);margin-top:auto;flex-wrap:wrap;}
        .gh-repo-lang{display:flex;align-items:center;gap:3px;}
        .gh-lang-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}
        @media(max-width:580px){.gh-repos-grid{grid-template-columns:1fr;}}

        /* Mobile: hide scroll dots on desktop */
        .mobile-scroll-hint{display:none;}

        /* ── SKELETON LOADER ── */
        .gh-repo-skeleton{background:var(--bg);border:1px solid var(--bd);border-radius:10px;padding:11px 13px;display:flex;flex-direction:column;gap:8px;}
        .skel{background:linear-gradient(90deg,var(--bd) 25%,var(--bg2) 50%,var(--bd) 75%);background-size:200% 100%;animation:skelShimmer 1.4s ease infinite;border-radius:4px;}
        .skel-title{height:12px;width:60%;}
        .skel-desc{height:10px;width:90%;}
        .skel-meta{height:9px;width:40%;}
        @keyframes skelShimmer{0%{background-position:200% 0;}100%{background-position:-200% 0;}}

        /* ── LIKE BUTTON ── */
        .like-section{padding:32px 0;border-top:1px solid var(--bd);text-align:center;}
        .like-wrap{display:flex;flex-direction:column;align-items:center;gap:12px;}
        .like-btn{display:flex;align-items:center;gap:10px;padding:14px 28px;background:var(--bg2);border:2px solid var(--bd);border-radius:100px;font-family:inherit;font-size:14px;font-weight:700;color:var(--ink);transition:all .25s;}
        .like-btn:hover:not(:disabled){border-color:var(--acc);transform:translateY(-2px);box-shadow:0 8px 24px var(--shadow);}
        .like-btn.liked{border-color:rgba(239,68,68,.4);background:rgba(239,68,68,.06);color:#dc2626;}
        .like-btn.anim .like-heart{animation:heartPop .6s cubic-bezier(.34,1.56,.64,1);}
        .like-heart{font-size:20px;line-height:1;}
        @keyframes heartPop{0%{transform:scale(1);}40%{transform:scale(1.6);}70%{transform:scale(0.9);}100%{transform:scale(1);}}
        .like-count{display:flex;align-items:center;gap:6px;}
        .like-num{font-size:28px;font-weight:900;font-family:var(--font-heading);color:var(--ink);}
        .like-sub{font-size:12px;color:var(--ink2);font-weight:600;}

        /* ── COMMUNITY GALLERY ── */
        .gallery-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin-bottom:24px;}
        .gallery-item{position:relative;border-radius:12px;overflow:hidden;aspect-ratio:1;background:var(--bg2);cursor:pointer;}
        .gallery-modal{background:var(--bg);border:1px solid var(--bd);border-radius:20px;overflow:hidden;max-width:480px;width:90vw;position:relative;}
        .gallery-modal-img{width:100%;aspect-ratio:4/3;object-fit:cover;display:block;}
        .gallery-modal-info{padding:16px 20px;}
        .gallery-modal-name{font-size:16px;font-weight:800;color:var(--ink);}
        .gallery-modal-caption{font-size:13px;color:var(--ink2);margin-top:4px;line-height:1.5;}
        .gallery-modal-ig{font-size:12px;color:var(--acc);font-weight:700;margin-top:6px;}
        .gallery-item img{width:100%;height:100%;object-fit:cover;transition:transform .4s;}
        .gallery-item:hover img{transform:scale(1.05);}
        .gallery-overlay{position:absolute;bottom:0;left:0;right:0;padding:10px 12px;background:linear-gradient(transparent,rgba(0,0,0,.65));opacity:0;transition:opacity .3s;}
        .gallery-item:hover .gallery-overlay{opacity:1;}
        .gallery-name{font-size:12px;font-weight:700;color:#fff;}
        .gallery-caption{font-size:10px;color:rgba(255,255,255,.75);margin-top:2px;}
        .gallery-empty{grid-column:1/-1;text-align:center;padding:50px 20px;color:var(--ink2);font-size:14px;display:flex;flex-direction:column;align-items:center;gap:10px;}
        .gallery-upload-link{font-size:13px;font-weight:700;color:var(--acc);text-decoration:none;}
        .gallery-cta-btn{display:inline-flex;align-items:center;padding:10px 20px;background:var(--bg2);border:1px solid var(--bd);border-radius:100px;font-size:12px;font-weight:700;color:var(--ink);text-decoration:none;transition:all .2s;white-space:nowrap;align-self:flex-start;}
        .gallery-cta-btn:hover{border-color:var(--acc);transform:translateY(-2px);}
        .gallery-item-featured{grid-column:span 1;border:2px solid var(--acc);}
        .gallery-badge{font-size:9px;font-weight:800;background:var(--acc);color:#000;padding:2px 7px;border-radius:100px;display:inline-block;margin-bottom:3px;}


        /* ── COMMENT REPLIES ── */
        .reply-item{display:flex;align-items:flex-start;gap:7px;margin-top:8px;padding-top:8px;border-top:1px solid var(--bd);}
        .reply-arrow{color:var(--acc);font-size:12px;flex-shrink:0;margin-top:2px;}
        .reply-name{font-size:11px;font-weight:700;color:var(--ink);margin-right:6px;}
        .reply-msg{font-size:12px;color:var(--ink2);}
        .reply-toggle{margin-top:8px;}
        .reply-btn{font-size:11px;font-weight:700;color:var(--acc);background:none;border:none;padding:0;cursor:pointer;opacity:.8;transition:opacity .2s;}
        .reply-btn:hover{opacity:1;}
        .reply-form{display:flex;flex-direction:column;gap:6px;margin-top:8px;}
        .reply-input{padding:8px 10px;background:var(--bg);border:1px solid var(--bd);border-radius:8px;font-family:inherit;font-size:12px;color:var(--ink);outline:none;transition:border-color .2s;}
        .reply-input:focus{border-color:var(--acc);}
        .reply-send{padding:7px 14px;background:var(--acc);color:#0d0d0d;border:none;border-radius:8px;font-family:inherit;font-size:12px;font-weight:700;align-self:flex-end;}

        .gh-activity{background:var(--bg2);border:1px solid var(--bd);border-radius:20px;padding:20px 24px;margin-bottom:14px;overflow:hidden;}
        .gh-activity-head{display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap;}
        .gh-status-dot{width:8px;height:8px;border-radius:50%;background:#2ea043;animation:blink 2s ease infinite;flex-shrink:0;}
        .gh-activity-title{font-size:13px;font-weight:700;color:var(--ink);}
        .gh-activity-sub{font-size:11px;color:var(--ink2);margin-left:auto;}
        .gh-chart-wrap{width:100%;overflow:hidden;border-radius:10px;}
        .gh-chart-wrap img{width:100%;height:auto;display:block;border-radius:8px;}
        .rw:not(.dark) .gh-chart-wrap img{filter:none;}
        .rw.dark .gh-chart-wrap img{filter:invert(1) hue-rotate(180deg) brightness(0.85);}

        /* ── AI CHAT ── */
        .ai-btn{padding:8px 13px;background:var(--acc);color:#0d0d0d;border:none;border-radius:100px;font-family:inherit;font-size:11px;font-weight:800;letter-spacing:0.03em;display:flex;align-items:center;gap:5px;transition:all 0.2s;cursor:pointer;}
        .ai-btn:hover{transform:translateY(-2px);box-shadow:0 6px 20px var(--acc-bg);}
        .ai-panel{position:fixed;bottom:100px;right:28px;z-index:300;width:340px;background:var(--bg2);border:1px solid var(--bd);border-radius:20px;box-shadow:0 24px 64px rgba(0,0,0,0.25);display:flex;flex-direction:column;overflow:hidden;animation:up 0.25s ease;}
        .ai-panel-head{padding:14px 18px;background:var(--bg);border-bottom:1px solid var(--bd);display:flex;align-items:center;gap:10px;}
        .ai-panel-dot{width:8px;height:8px;border-radius:50%;background:var(--acc);animation:blink 2s ease infinite;}
        .ai-panel-title{font-size:13px;font-weight:800;color:var(--ink);flex:1;}
        .ai-panel-close{background:transparent;border:none;color:var(--ink2);font-size:16px;cursor:pointer;padding:2px 6px;border-radius:6px;line-height:1;}
        .ai-msgs{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;max-height:320px;min-height:160px;}
        .ai-msg{max-width:85%;padding:10px 13px;border-radius:14px;font-size:13px;line-height:1.5;}
        .ai-msg.user{background:var(--acc);color:#0d0d0d;align-self:flex-end;border-bottom-right-radius:4px;font-weight:600;}
        .ai-msg.assistant{background:var(--bg);border:1px solid var(--bd);color:var(--ink);align-self:flex-start;border-bottom-left-radius:4px;}
        .ai-empty{text-align:center;color:var(--ink2);font-size:12px;padding:20px;}
        .ai-panel-foot{padding:10px 14px;border-top:1px solid var(--bd);display:flex;gap:8px;background:var(--bg);}
        .ai-input{flex:1;padding:9px 13px;background:var(--bg2);border:1.5px solid var(--bd);color:var(--ink);border-radius:10px;font-family:inherit;font-size:13px;outline:none;}
        .ai-input:focus{border-color:var(--acc);}
        .ai-send{padding:9px 14px;background:var(--acc);color:#0d0d0d;border:none;border-radius:10px;font-family:inherit;font-size:12px;font-weight:800;cursor:pointer;flex-shrink:0;}
        .ai-send:disabled{opacity:0.5;}
        @media(max-width:600px){.ai-panel{right:12px;left:12px;width:auto;bottom:90px;}}

        /* ── ANIMATIONS ── */
        @keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
        @keyframes up{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
        @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
        @keyframes zoom{from{transform:scale(0.93);opacity:0;}to{transform:scale(1);opacity:1;}}

        /* ── RESPONSIVE: TABLET ── */
        @media(max-width:900px){
          .wrap,.nav-in{padding-left:28px;padding-right:28px;}
          .nav-links{display:none;}
          .hero{grid-template-columns:1fr;padding-top:90px;padding-bottom:56px;gap:36px;}
          .hero-photo-wrap{height:240px;order:-1;width:100%;}
          .hero-p{max-width:100%;}
          .stats{grid-template-columns:1fr 1fr;}
          .stat:nth-child(2){border-right:none;}
          .stat:nth-child(3){border-top:1px solid var(--bd);}
          .stat:nth-child(4){border-top:1px solid var(--bd);border-right:none;}
          .about-grid{grid-template-columns:1fr;gap:40px;}
          .skills-grid{grid-template-columns:1fr 1fr;}
          .goals-grid{grid-template-columns:1fr 1fr;}
          .contact-grid{grid-template-columns:1fr;gap:36px;}
          .sec-num{display:none;}
          .modal-box{flex-direction:column;max-height:92vh;overflow-y:auto;}
          .modal-info-side{width:100%;border-left:none;border-top:1px solid var(--bd);min-height:auto;}
          .modal-img-side{min-height:220px;flex:none;}
          .footer-inner{flex-direction:column;align-items:center;text-align:center;}
          .footer-right{align-items:center;}
        }

        /* ── RESPONSIVE: MOBILE ── */
        @media(max-width:600px){
          .wrap,.nav-in{padding-left:20px;padding-right:20px;}
          .nav-right{gap:6px;}
          .btn-theme{padding:6px 10px;font-size:11px;}
          .btn-admin{padding:6px 11px;font-size:11px;}

          .hero{padding-top:80px;padding-bottom:48px;gap:28px;}
          .hero-photo-wrap{height:200px;}
          .hero-h1{font-size:clamp(32px,9vw,44px);line-height:0.95;}
          .hero-p{font-size:14px;line-height:1.65;}
          .btn-dark{padding:11px 18px;font-size:13px;}
          .btn-acc{padding:10px 14px;font-size:13px;}

          .stats{grid-template-columns:1fr 1fr;}
          .stat{padding:24px 0;}
          .stat-n{font-size:32px;}
          .stat-l{font-size:10px;}

          .social-label{display:none;}
          .social-strip{padding-top:18px;padding-bottom:18px;}

          .sec{padding-top:48px;padding-bottom:48px;}
          .sec-head{margin-bottom:32px;}
          .sec-title{font-size:clamp(22px,6vw,32px) !important;}
          .eyebrow{font-size:10px;}

          .about-text{font-size:14px;}
          .about-grid{gap:32px;}

          .skills-grid{grid-template-columns:1fr 1fr;gap:10px;}
          .skill-card{padding:14px;}
          .skill-name{font-size:14px;}

          .goals-grid{grid-template-columns:1fr;gap:12px;}
          .goal-card{padding:20px;}

          /* Mobile carousel for projects, certs, gallery */
          .proj-grid{display:flex;overflow-x:auto;gap:14px;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;padding-bottom:16px;scrollbar-width:none;}
          .proj-grid::-webkit-scrollbar{display:none;}
          .proj-grid .proj-card{min-width:82vw;max-width:82vw;scroll-snap-align:start;flex-shrink:0;}
          .cert-grid{display:flex;overflow-x:auto;gap:14px;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;padding-bottom:16px;scrollbar-width:none;}
          .cert-grid::-webkit-scrollbar{display:none;}
          .cert-grid .cert-card{min-width:78vw;max-width:78vw;scroll-snap-align:start;flex-shrink:0;}
          .gallery-grid{display:flex;overflow-x:auto;gap:10px;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;padding-bottom:12px;scrollbar-width:none;}
          .gallery-grid::-webkit-scrollbar{display:none;}
          .gallery-grid .gallery-item{min-width:72vw;max-width:72vw;scroll-snap-align:start;flex-shrink:0;}
          /* Scroll dots indicators */
          .mobile-scroll-hint{display:flex!important;justify-content:center;gap:5px;margin-top:10px;}
          .mobile-scroll-hint span{width:6px;height:6px;border-radius:50%;background:var(--bd);}
          .mobile-scroll-hint span.active{background:var(--acc);}

          .contact-grid{gap:32px;}
          .comments-list{max-height:320px;}

          .modal-overlay{padding:12px;}
          .modal-box{border-radius:16px;}
          .modal-img-side{min-height:160px;}
          .modal-info-side{padding:20px 16px;}
          .modal-note-title{font-size:16px;}

          .float-group{bottom:18px;right:16px;gap:7px;}
          .lang-btn{width:48px;height:30px;font-size:11px;}
          .music-btn{width:48px;height:48px;font-size:16px;}

          .footer{padding-top:28px;padding-bottom:28px;}
          .footer-logo{font-size:17px;}
          .footer-views{padding:7px 14px;}
          .footer-right{align-items:center;}

          .cert-empty,.proj-empty{padding:40px 16px;}
        }

        /* ── EXTRA SMALL ── */
        @media(max-width:380px){
          .wrap,.nav-in{padding-left:16px;padding-right:16px;}
          .hero-h1{font-size:30px;}
          .hero-tag{font-size:10px;}
          .hero-btns{flex-direction:column;align-items:flex-start;}
          .btn-dark,.btn-acc{width:100%;justify-content:center;}
        }
      `}</style>

      <div className={`rw${d ? ' dark' : ''}`} style={{
        '--acc':         themeColor,
        '--acc-bg':      accBg,
        '--bg':          d ? curBg.darkBg  : curBg.lightBg,
        '--bg2':         d ? curBg.darkBg2 : curBg.lightBg2,
        '--font-heading': curFont.heading,
        '--font-body':    curFont.body,
        fontFamily:       curFont.body,
      }}>
        {/* THEME RIPPLE WAVE */}
        {ripple && (
          <div
            key={ripple.key}
            className="theme-ripple"
            style={{ '--rx': `${ripple.x}%`, '--ry': `${ripple.y}%`, '--ripple-color': ripple.color }}
          />
        )}
        {/* LOADING SCREEN */}
        <div className={`page-loader${pageReady ? ' done' : ''}`} style={{'--loader-acc': themeColor}}>
          <div className="loader-logo">aura<em>au</em>varose</div>
          <div className="loader-bar-wrap"><div className="loader-bar" /></div>
          <div className="loader-text">{isID ? 'Memuat...' : 'Loading...'}</div>
        </div>
        {/* DARK MODE ORBS */}
        {/* UPDATE BANNER */}
        {updateMsg && (
          <div className="update-banner">
            <span className="update-icon">✨</span>
            <span>{updateMsg} — halaman akan dimuat ulang...</span>
            <div className="update-progress"/>
          </div>
        )}

        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        {/* NAV */}
        <nav className="nav">
          <div className="nav-in">
            <a href="#" className="logo"><em>A.</em></a>
            <ul className="nav-links">
              <li><a href="#">{tx.navHome}</a></li>
              <li><a href="#about">{tx.navAbout}</a></li>
              <li><a href="#skills">{tx.navSkills}</a></li>
              <li><a href="#projects">{tx.navProjects}</a></li>
              <li><a href="#portfolio">{tx.navCerts}</a></li>
              <li><a href="#contact">{tx.navContact}</a></li>
            </ul>
            <div className="nav-right">
              <button className="ai-btn" onClick={() => setAiOpen(!aiOpen)}>
                ✦ AI
              </button>
              <button ref={themeBtnRef} className="btn-theme" onClick={toggleTheme}>
                {d ? '☀ Light' : '🌙 Dark'}
              </button>
              <a href="/admin" className="btn-admin">⚙ Admin</a>
            </div>
          </div>
        </nav>

        {/* HERO */}
        <section className="wrap hero">
          <div data-reveal>
            <div className="hero-tag"><span className="hero-dot" />{tx.heroBadge}</div>
            <h1 className="hero-h1">
              <span className="hero-line-1">{tx.heroGreet}</span>
              <span className="hero-line-2">Aura <em className="hero-loop-name">{loopName}<span className="hero-cursor">|</span></em></span>
            </h1>
            <p className="hero-p">
              {typedDesc}<span className={`type-cursor${typingDone?' done':''}`}>|</span>
            </p>
            <div className="hero-btns">
              <a href="#contact" className="btn-dark">{tx.heroBtn}</a>
              <div className="btn-acc">🕐 {time || '00:00:00'}</div>
            </div>
          </div>
          <div className="hero-photo-wrap" data-reveal data-delay="2">
            <div className="hero-photo-bg" />
            <div className="hero-photo">
              <img src={profileImage || "https://api.dicebear.com/7.x/notionists/svg?seed=Aura&backgroundColor=c7d2fe"} alt="Aura" />
            </div>
          </div>
        </section>

        {/* STATS */}
        <div style={{borderBottom:'1px solid var(--bd)',position:'relative',zIndex:1}}>
          <div className="wrap" id="about" style={{padding:0}}>
            <div className="stats">
              {[
                {n:'0+',l:tx.statProjects},{n:views||0,l:tx.statVisitors},
                {n:'2+',l:tx.statYears},{n:'0',l:tx.statGPA}
              ].map((s,i)=>(
                <div key={i} className="stat" data-reveal data-delay={String(i+1)}>
                  <div className="stat-n">{s.n}</div><div className="stat-l">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SOCIAL MARQUEE */}
        <div className="social-strip" data-reveal>
          <div className="social-strip-inner">
            <div className="social-track">
              {socials.map(s=>(
                <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" className="social-btn">
                  <span className="social-icon">{s.icon}</span>
                  <span>{s.name}</span>
                  <span className="social-handle">{s.handle}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ABOUT + TIMELINE */}
        <section className="wrap sec" id="about">
          <div className="sec-head" data-reveal>
            <div><p className="eyebrow">{tx.aboutEyebrow}</p><h2 className="sec-title" dangerouslySetInnerHTML={{__html: tx.aboutTitle.replace('\n','<br/>')}} /></div>
          </div>
          <div className="about-grid">
            <div data-reveal ref={aboutRef}>
              <div className="about-text">
                <p>{typedAbout1 || ''}<span className={`type-cursor${aboutTypingDone||!aboutVisible?' done':''}`} style={{opacity:typedAbout2?0:1}}>|</span></p>
                <p>{typedAbout2 || ''}{typedAbout2&&!aboutTypingDone&&<span className="type-cursor">|</span>}</p>
              </div>
              <div className="about-tags">
                {['Node.js','JavaScript','Python','Next.js','Git','Linux','REST API','Supabase'].map(t2=>(
                  <span key={t2} className="about-tag">{t2}</span>
                ))}
              </div>
            </div>
            <div data-reveal data-delay="2">
              <div className="eyebrow" style={{marginBottom:'22px'}}>{tx.tlLabel}</div>
              <div className="timeline">
                {timeline.map(tl=>(
                  <div key={tl.year} className="tl-item">
                    <div className="tl-dot" />
                    <div className="tl-year">{tl.year}</div>
                    <div className="tl-title">{tl.title}</div>
                    <div className="tl-desc">{tl.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SKILLS */}
        <section className="wrap sec" id="skills">
          <div className="sec-head" data-reveal>
            <div><p className="eyebrow">{tx.skillsEyebrow}</p><h2 className="sec-title">Tech<br/>Stack</h2></div>
            <span className="sec-num">0{skills.length}</span>
          </div>
          <div className="skills-grid">
            {skills.map((sk,i)=>(
              <div key={sk.name} className="skill-card mag" data-reveal data-delay={String((i%4)+1)}>
                <div className="skill-cat">{sk.cat}</div>
                <div className="skill-name">{sk.name}</div>
                <div className="skill-bar-bg"><div className="skill-bar-fill" style={{width:`${sk.level}%`}} /></div>
                <div className="skill-pct">{sk.level}%</div>
              </div>
            ))}
          </div>
        </section>

        {/* GOALS */}
        <section className="wrap sec">
          <div className="sec-head" data-reveal>
            <div><p className="eyebrow">{tx.goalsEyebrow}</p><h2 className="sec-title" dangerouslySetInnerHTML={{__html: tx.goalsTitle.replace('\n','<br/>')}} /></div>
          </div>
          <div className="goals-grid">
            {goals.map((g,i)=>(
              <div key={i} className="goal-card mag" data-reveal data-delay={String(i+1)}>
                <div className="goal-icon">{g.icon}</div>
                <div className="goal-title">{g.title}</div>
                <ul className="goal-items">
                  {g.items.map(item=><li key={item} className="goal-item">{item}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* PROJECTS */}
        <section className="wrap sec" id="projects">
          {/* ── DISCORD ACTIVITY STATUS ── */}
          <div className="disc-block" data-reveal>
            <div className="disc-head-row">
              <span className="disc-label-text">{tx.currentActivity}</span>
              {ghStatus.since && <span className="disc-since">{ghStatus.since}</span>}
            </div>
            <div className="disc-card">
              <div className="disc-vscode-icon">
                <svg viewBox="0 0 100 100" width="32" height="32">
                  <rect width="100" height="100" rx="16" fill="#2b5fce"/>
                  <path d="M70 15L40 47 22 33l-8 6 18 16-18 16 8 6 18-14 30 32 10-5V20z" fill="white" opacity=".9"/>
                </svg>
              </div>
              <div className="disc-info">
                <div className="disc-app-name">Visual Studio Code</div>
                <div className="disc-detail-line">Editing <strong>{ghStatus.detail || 'my-portfolio'}</strong></div>
                <div className="disc-workspace">{tx.discWorkspace}</div>
              </div>
              {ghStatus.online
                ? <span className="disc-online-badge">{tx.onlineLabel}</span>
                : <span className="disc-online-badge" style={{color:'var(--ink3)',background:'var(--bg)',border:'1px solid var(--bd)'}}>{tx.offlineLabel}</span>
              }
            </div>
          </div>

          {/* ── GITHUB CONTRIBUTION CHART ── */}
          <div className="gh-activity" data-reveal>
            <div className="gh-activity-head">
              <span className="gh-status-dot"/>
              <span className="gh-activity-title">Active on GitHub</span>
              <span className="gh-activity-sub">@auraauvarose · 370 contributions this year</span>
            </div>
            <div className="gh-chart-wrap">
              <img src="https://ghchart.rshah.org/2ea043/auraauvarose" alt="GitHub Contribution Chart" loading="lazy"/>
            </div>
          </div>

          {/* ── RECENT REPOS ── */}
          {/* ── RECENT REPOS ── */}
          <div className="gh-repos-block" data-reveal>
            <div className="gh-repos-hd">
              <span className="gh-repos-title">{tx.recentRepos}</span>
              <a href="https://github.com/auraauvarose" target="_blank" rel="noopener noreferrer" className="gh-repos-link">{tx.viewAll}</a>
            </div>
            {ghRepos.length === 0 ? (
              <div className="gh-repos-grid">
                {[1,2,3,4].map(n => (
                  <div key={n} className="gh-repo-skeleton">
                    <div className="skel skel-title"/><div className="skel skel-desc"/><div className="skel skel-meta"/>
                  </div>
                ))}
              </div>
            ) : (
              <div className="gh-repos-grid">
                {ghRepos.map(repo => {
                  const mins = Math.round((Date.now() - new Date(repo.pushed_at)) / 60000);
                  const ago = mins < 60 ? mins+'m ago' : mins < 1440 ? Math.round(mins/60)+'h ago' : Math.round(mins/1440)+'d ago';
                  const LC = {JavaScript:'#f7df1e',TypeScript:'#3178c6',Python:'#3776ab',CSS:'#264de4',HTML:'#e34c26',Shell:'#89e051'};
                  const lc = (repo.language && LC[repo.language]) || 'var(--ink3)';
                  return (
                    <a key={repo.id} href={repo.html_url} target="_blank" rel="noopener noreferrer" className="gh-repo-card">
                      <div className="gh-repo-name">
                        <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor" style={{opacity:.5,flexShrink:0}}>
                          <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 010-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9z"/>
                        </svg>
                        <span>{repo.name}</span>
                      </div>
                      {repo.description && <div className="gh-repo-desc">{repo.description.slice(0,65)}{repo.description.length>65?'...':''}</div>}
                      <div className="gh-repo-meta">
                        {repo.language && <span className="gh-repo-lang"><span className="gh-lang-dot" style={{background:lc}}/>{repo.language}</span>}
                        <span className="gh-repo-time">🕒 {ago}</span>
                        {repo.stargazers_count > 0 && <span>⭐{repo.stargazers_count}</span>}
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
          <div className="sec-head" data-reveal>
            <div><p className="eyebrow">{tx.projEyebrow}</p><h2 className="sec-title">{tx.projTitle}</h2></div>
            <span className="sec-num">0{projects.length}</span>
          </div>
          <div className="proj-grid">
            {projects.length === 0 ? (
              <div className="proj-empty">{tx.projEmpty}</div>
            ) : projects.map((p,i)=>{
              const stack = p.tech_stack ? p.tech_stack.split(',').map(s=>s.trim()) : [];
              return (
                <div key={p.id} className="proj-card mag" data-reveal data-delay={String((i%3)+1)}>
                  <div className="proj-thumb">
                    {p.image_url ? <img src={p.image_url} alt={p.title}/> : <div className="proj-thumb-empty">{p.title?p.title[0]:'?'}</div>}
                  </div>
                  <div className="proj-body">
                    <div className="proj-title">{p.title}</div>
                    <div className="proj-desc">{p.description}</div>
                    {stack.length>0 && <div className="proj-stack">{stack.map(s=><span key={s} className="proj-chip">{s}</span>)}</div>}
                    <div className="proj-links">
                      {p.github_url && <a href={p.github_url} target="_blank" rel="noopener noreferrer" className="proj-link gh">⬡ GitHub</a>}
                      {p.demo_url && <a href={p.demo_url} target="_blank" rel="noopener noreferrer" className="proj-link demo">↗ Demo</a>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Mobile scroll indicator */}
          <div className="mobile-scroll-hint">
            {projects.length > 0 && projects.map((_,i)=><span key={i}/>)}
          </div>
        </section>

        {/* CERTIFICATES */}
        <section className="wrap sec" id="portfolio">
          <div className="sec-head" data-reveal>
            <div><p className="eyebrow">{tx.certEyebrow}</p><h2 className="sec-title">{tx.certTitle}</h2></div>
            <span className="sec-num">0{certificates.length}</span>
          </div>
          <div className="cert-grid">
            {certificates.length === 0 ? (
              <div className="cert-empty">{tx.certEmpty}</div>
            ) : certificates.map((cert,i)=>(
              <div key={cert.id} className="cert-card mag" onClick={()=>setSelectedCert(cert)} data-reveal data-delay={String((i%3)+1)}>
                <div className="cert-img"><img src={cert.image_url} alt="Sertifikat"/></div>
                <div className="cert-info">
                  <div className="cert-info-t">
                    <p>{cert.title || tx.certDefault}</p>
                    <span>{cert.issuer || tx.certClick}</span>
                  </div>
                  <div className="cert-arr">↗</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mobile-scroll-hint">
            {certificates.length > 0 && certificates.map((_,i)=><span key={i}/>)}
          </div>
        </section>

        {/* ── UNIFIED GALLERY: Admin Photos + Community Photos ── */}
        <section className="wrap sec" id="gallery">
          <div className="sec-head" data-reveal>
            <div>
              <p className="eyebrow">{tx.galleryEyebrow}</p>
              <h2 className="sec-title">{isID?"Momen &":"Moments &"}<br/>{isID?"Kenangan":"Memories"}</h2>
            </div>
            <a href="/submit-photo" target="_blank" className="gallery-cta-btn">{tx.galleryCta}</a>
          </div>
          <div className="gallery-grid" data-reveal>
            {/* Admin personal photos first (profileImage as first item if exists) */}
            {profileImage && (
              <div className="gallery-item gallery-item-featured" onClick={()=>setSelectedPhoto({image_url:profileImage, sender_name:'Aura Auvarose', caption:'', badge:'Admin'})}>
                <img src={profileImage} alt="Aura Auvarose"/>
                <div className="gallery-overlay">
                  <div className="gallery-badge">📌 Admin</div>
                  <div className="gallery-name">Aura Auvarose</div>
                </div>
              </div>
            )}
            {/* Community photos (approved) */}
            {communityPhotos.map(p=>(
              <div key={p.id} className="gallery-item" onClick={()=>setSelectedPhoto(p)}>
                <img src={p.image_url} alt={p.sender_name}/>
                <div className="gallery-overlay">
                  <div className="gallery-name">{p.sender_name}</div>
                  {p.caption && <div className="gallery-caption">{p.caption}</div>}
                </div>
              </div>
            ))}
            {!profileImage && communityPhotos.length === 0 && (
              <div className="gallery-empty">
                <span style={{fontSize:'40px'}}>📸</span>
                <p>{tx.galleryEmpty}</p>
                <a href="/submit-photo" target="_blank" className="gallery-upload-link">{tx.galleryUpload}</a>
              </div>
            )}
          </div>
          <div className="mobile-scroll-hint">
            {(communityPhotos.length + (profileImage ? 1 : 0)) > 0 &&
              Array.from({length: communityPhotos.length + (profileImage ? 1 : 0)}).map((_,i)=><span key={i}/>)}
          </div>
        </section>

        {/* CONTACT */}
        <section className="wrap sec" id="contact">
          <div className="sec-head" data-reveal>
            <div><p className="eyebrow">{tx.contactEyebrow}</p><h2 className="sec-title" dangerouslySetInnerHTML={{__html: tx.contactTitle.replace("\n","<br/>")}} /></div>
          </div>
          <div className="contact-grid">
            <div data-reveal>
              <form onSubmit={submitComment}>
                <div className="form-g"><label className="form-l">{tx.fName}</label><input type="text" placeholder={tx.fNamePh} value={nameInput} onChange={e=>setNameInput(e.target.value)} className="form-i" required/></div>
                <div className="form-g"><label className="form-l">{tx.fMsg}</label><textarea placeholder={tx.fMsgPh} value={messageInput} onChange={e=>setMessageInput(e.target.value)} className="form-t" required/></div>
                <button type="submit" className="form-btn" disabled={isSubmitting}>{isSubmitting?tx.fSending:tx.fSend}</button>
              </form>
              {submitDone && <div className="submit-ok">{tx.fOk}</div>}
            </div>
            <div data-reveal data-delay="2">
              <div className="comments-hd">
                <span className="comments-n">{comments.length}</span>
                <span className="comments-lb">{tx.commentsLabel}</span>
              </div>
              <div className="comments-list custom-scrollbar">
                {comments.length===0
                  ? <div className="comments-empty">{tx.commentsEmpty}</div>
                  : comments.map(c=>(
                    <div key={c.id} className="comment-card">
                      <p className="comment-name">{c.name}</p>
                      <p className="comment-msg">{c.message}</p>
                      <p className="comment-dt">{new Date(c.created_at).toLocaleDateString(isID?'id-ID':'en-US',{day:'numeric',month:'long',year:'numeric'})}</p>
                      {/* Replies */}
                      {(commentReplies[c.id]||[]).map((r,ri)=>(
                        <div key={ri} className="reply-item">
                          <span className="reply-arrow">↳</span>
                          <div>
                            <span className="reply-name">{r.name}</span>
                            <span className="reply-msg">{r.message}</span>
                          </div>
                        </div>
                      ))}
                      <div className="reply-toggle">
                        <button className="reply-btn" onClick={()=>setReplyOpen(prev=>({...prev,[c.id]:!prev[c.id]}))}>
                          {replyOpen[c.id] ? tx.replyClose : `${tx.replyOpen}${(commentReplies[c.id]||[]).length>0?' ('+commentReplies[c.id].length+')':''}`}
                        </button>
                      </div>
                      {replyOpen[c.id] && (
                        <div className="reply-form">
                          <input className="reply-input" placeholder={tx.replyNamePh} value={replyInput[`${c.id}_name`]||''} onChange={e=>setReplyInput(prev=>({...prev,[`${c.id}_name`]:e.target.value}))}/>
                          <input className="reply-input" placeholder={tx.replyMsgPh} value={replyInput[c.id]||''} onChange={e=>setReplyInput(prev=>({...prev,[c.id]:e.target.value}))} onKeyDown={e=>e.key==='Enter'&&submitReply(c.id, replyInput[`${c.id}_name`])}/>
                          <button className="reply-send" onClick={()=>submitReply(c.id, replyInput[`${c.id}_name`])}>{tx.replySend}</button>
                        </div>
                      )}
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        </section>

        {/* ── COMMUNITY PHOTOS ── */}
        

        {/* ── LIKE BUTTON ── */}
        <div className="like-section" data-reveal>
          <div className="like-wrap">
            <button className={`like-btn${liked?' liked':''}${likeAnim?' anim':''}`} onClick={handleLike} disabled={liked}>
              <span className="like-heart">{liked ? '❤️' : '🤍'}</span>
              <span className="like-label">{liked ? tx.likedLabel : tx.likeLabel}</span>
            </button>
            <div className="like-count"><span className="like-num">{likeCount}</span><span className="like-sub">{tx.likeSubLabel}</span></div>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="wrap footer" data-reveal>
          <div className="footer-inner">
            <div className="footer-left">
              <div className="footer-logo">aura<em>a</em>uvarose</div>
              <p className="footer-copy">© 2026 auraauvarose</p>
            </div>
            <div className="footer-right">
              <div className="footer-views">
                <span className="footer-views-dot"/>
                <span className="footer-views-num">{views||0}</span>
                <span className="footer-views-text">&nbsp;{tx.footerTimes}</span>
              </div>
              <p className="footer-made">{tx.footerMade}</p>
            </div>
          </div>
        </footer>

        {/* CERT MODAL */}
        {/* ── GALLERY PHOTO MODAL ── */}
        {selectedPhoto && (
          <div className="modal-overlay" onClick={()=>setSelectedPhoto(null)}>
            <div className="gallery-modal" onClick={e=>e.stopPropagation()}>
              <img src={selectedPhoto.image_url} alt={selectedPhoto.sender_name} className="gallery-modal-img"/>
              <div className="gallery-modal-info">
                {selectedPhoto.badge && <span className="gallery-badge" style={{marginBottom:'6px',display:'inline-block'}}>📌 {selectedPhoto.badge}</span>}
                <div className="gallery-modal-name">{selectedPhoto.sender_name}</div>
                {selectedPhoto.caption && <div className="gallery-modal-caption">{selectedPhoto.caption}</div>}
                {selectedPhoto.instagram && <div className="gallery-modal-ig">@{selectedPhoto.instagram}</div>}
              </div>
              <button className="modal-close" onClick={()=>setSelectedPhoto(null)}>✕</button>
            </div>
          </div>
        )}

        {selectedCert && (
          <div className="modal-overlay" onClick={()=>setSelectedCert(null)}>
            <div className="modal-box" onClick={e=>e.stopPropagation()}>
              <div className="modal-img-side">
                <img src={selectedCert.image_url} alt="Sertifikat"/>
              </div>
              <div className="modal-info-side">
                <div className="modal-notepad-lines"/>
                <button className="modal-close" onClick={()=>setSelectedCert(null)}>✕</button>
                <p className="modal-note-label">{tx.modalLabel}</p>
                <h3 className="modal-note-title">{selectedCert.title||tx.certDefault}</h3>
                <div className="modal-note-div"/>
                <div className="modal-note-item">
                  <div className="modal-note-key">{tx.modalIssuer}</div>
                  <div className="modal-note-val">{selectedCert.issuer||'—'}</div>
                </div>
                <div className="modal-note-item">
                  <div className="modal-note-key">{tx.modalDate}</div>
                  <div className="modal-note-val">
                    {selectedCert.created_at ? new Date(selectedCert.created_at).toLocaleDateString(isID?'id-ID':'en-US',{day:'numeric',month:'long',year:'numeric'}) : '—'}
                  </div>
                </div>
                <div className="modal-note-div"/>
                <div className="modal-acc-bar">{tx.modalVerified}</div>
              </div>
            </div>
          </div>
        )}

        {/* AI CHAT PANEL */}
        {aiOpen && (
          <div className="ai-panel">
            <div className="ai-panel-head">
              <span className="ai-panel-dot"/>
              <span className="ai-panel-title">✦ AI Aura</span>
              <button className="ai-panel-close" onClick={() => setAiOpen(false)}>✕</button>
            </div>
            <div className="ai-msgs custom-scrollbar">
              {aiMessages.length === 0 && (
                <div className="ai-empty">Halo! 👋 Tanya apa saja tentang Aura atau pemrograman.</div>
              )}
              {aiMessages.map((m, i) => (
                <div key={i} className={`ai-msg ${m.role}`}>{m.content}</div>
              ))}
              {aiLoading && <div className="ai-msg assistant">✦ Sedang berpikir...</div>}
              <div ref={aiEndRef}/>
            </div>
            <div className="ai-panel-foot">
              <input
                className="ai-input"
                placeholder="Tanya sesuatu..."
                value={aiInput}
                onChange={e => setAiInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendAI()}
              />
              <button className="ai-send" onClick={sendAI} disabled={aiLoading}>{tx.replySend}</button>
            </div>
          </div>
        )}

        {/* FLOAT: LANG + MUSIC */}
        <audio ref={audioRef} loop>
          <source src={musicUrl} type="audio/mpeg"/>
        </audio>
        <div className="float-group">
          <button className="lang-btn" onClick={()=>setLang(lang==='id'?'en':'id')} title={lang==='id'?'Switch to English':'Ganti ke Indonesia'}>
            <span style={{fontSize:'14px'}}>{lang==='id'?'🇮🇩':'🇬🇧'}</span>
            <span>{lang==='id'?'ID':'EN'}</span>
          </button>
          <button onClick={toggleMusic} className={`music-btn${isPlaying?' playing':''}`} title={isPlaying?'Pause':'Play'}>
            {isPlaying?'♪':'▶'}
          </button>
        </div>
      </div>
    </>
  );
}