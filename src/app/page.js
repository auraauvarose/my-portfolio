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
  const audioRef = useRef(null);
  const themeBtnRef = useRef(null);
  const aiEndRef = useRef(null);
  const d = isDark;
  const isID = lang === 'id';

  const toggleTheme = () => {
    if (themeBtnRef.current) {
      const r = themeBtnRef.current.getBoundingClientRect();
      const x = ((r.left + r.width / 2) / window.innerWidth * 100).toFixed(1);
      const y = ((r.top + r.height / 2) / window.innerHeight * 100).toFixed(1);
      // ripple color = destination theme background
      const color = d ? '#ffffff' : '#111110';
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

  // Sync html class — let CSS handle ALL transitions, no direct style manipulation
  useEffect(() => {
    document.documentElement.classList.toggle('site-dark', d);
    document.body.style.margin = '0';
    document.body.style.padding = '0';
  }, [d]);

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
    const handler = (e) => {
      const card = e.currentTarget;
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - 0.5) * 10;
      const y = ((e.clientY - r.top) / r.height - 0.5) * 10;
      card.style.transform = `translateY(-6px) rotateX(${-y}deg) rotateY(${x}deg)`;
    };
    const reset = (e) => { e.currentTarget.style.transform = ''; };
    const cards = document.querySelectorAll('.mag');
    cards.forEach(c => { c.addEventListener('mousemove', handler); c.addEventListener('mouseleave', reset); });
    return () => cards.forEach(c => { c.removeEventListener('mousemove', handler); c.removeEventListener('mouseleave', reset); });
  });

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date().toLocaleTimeString('id-ID')), 1000);
    const loadViews = async () => {
      const { data } = await supabase.from('views').select('count').eq('slug', 'home').single();
      if (data) { const n = data.count + 1; setViews(n); await supabase.from('views').update({ count: n }).eq('slug', 'home'); }
    };
    const trackVisitor = async () => {
      try {
        await supabase.from('visitors').insert([{
          user_agent: navigator.userAgent,
          screen_size: `${window.screen.width}x${window.screen.height}`,
          language: navigator.language || 'unknown',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown',
          referrer: document.referrer || 'direct',
        }]);
      } catch (_) { /* silent fail — tabel mungkin belum ada */ }
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
      const { data } = await supabase.from('settings').select('value').eq('key', 'profile_image').single();
      if (data?.value) setProfileImage(data.value);
    };
    const init = async () => {
      await Promise.all([loadCerts(), loadProjects(), loadViews(), loadComments(), loadProfileImage()]);
      trackVisitor(); // fire and forget — don't block page load
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
  };

  const socials = [
    { icon: 'GH', name: 'GitHub', url: 'https://github.com/auraauvarose', handle: '@auraauvarose' },
    { icon: 'IG', name: 'Instagram', url: 'https://www.instagram.com/aura_auvarose_/', handle: '@aura_auvarose_' },
    { icon: 'LI', name: 'LinkedIn', url: 'https://linkedin.com/in/USERNAME', handle: 'Belum Ada' },
    { icon: '✉', name: 'Email', url: 'mailto:auraauvaroseendica@gmail.com', handle: 'auraauvaroseendica@gmail.com' },
  ];

  const skills = [
    { name: 'Node.js', cat: 'Back-End', level: 45 },
    { name: 'Express.js', cat: 'Framework', level: 0 },
    { name: 'JavaScript', cat: 'Language', level: 60 },
    { name: 'Python', cat: 'Language', level: 70 },
    { name: 'Docker', cat: 'DevOps', level: 0 },
    { name: 'Next.js', cat: 'Front-End', level: 50 },
    { name: 'Git', cat: 'Tools', level: 82 },
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
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,900;1,9..144,400;1,9..144,700&display=swap');
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
        .loader-logo{font-family:'Fraunces',serif;font-size:52px;font-weight:900;color:#f0efe8;letter-spacing:-2px;}
        .loader-logo em{font-style:normal;color:#d4eb00;}
        .loader-bar-wrap{width:160px;height:2px;background:rgba(255,255,255,0.1);border-radius:2px;overflow:hidden;}
        .loader-bar{height:100%;width:0%;background:#d4eb00;border-radius:2px;animation:loadProgress 1.2s cubic-bezier(.4,0,.2,1) forwards;}
        @keyframes loadProgress{0%{width:0%;}60%{width:75%;}100%{width:100%;}}
        .loader-text{font-family:'Plus Jakarta Sans',sans-serif;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:rgba(240,239,232,0.4);}

        /* ── THEME VARS ── */
        .rw{
          --acc:#d4eb00; --acc-bg:rgba(212,235,0,0.12);
          --ink:#1a1a1a; --ink2:#555555; --ink3:#999999;
          --bg:#ffffff; --bg2:#f4f4f0; --bd:rgba(0,0,0,0.09);
          --shadow:rgba(0,0,0,0.07);
          font-family:'Plus Jakarta Sans',sans-serif;
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
        .rw img,.rw canvas,.rw video,.rw .orb,.rw [data-reveal],.rw .theme-ripple{transition:none!important;}

        /* ── DARK MODE ORBS ── */
        .orb{
          position:fixed; border-radius:50%; pointer-events:none;
          filter:blur(90px); z-index:0; opacity:0;
          transition:opacity 0.6s ease;
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
        [data-reveal][data-delay="1"]{transition-delay:0.1s;}
        [data-reveal][data-delay="2"]{transition-delay:0.2s;}
        [data-reveal][data-delay="3"]{transition-delay:0.3s;}
        [data-reveal][data-delay="4"]{transition-delay:0.4s;}

        /* ── MAGNETIC CARDS ── */
        .mag{transition:transform 0.3s ease,box-shadow 0.3s ease;transform-style:preserve-3d;perspective:800px;}

        /* ── NAV ── */
        .nav{position:fixed;top:0;left:0;right:0;z-index:50;background:var(--bg);border-bottom:1px solid var(--bd);transition:background 0.5s,border-color 0.5s;backdrop-filter:blur(12px);}
        .nav-in{max-width:1140px;margin:0 auto;padding:0 40px;height:64px;display:flex;align-items:center;justify-content:space-between;gap:16px;}
        .logo{font-family:'Fraunces',serif;font-size:22px;font-weight:900;color:var(--ink);text-decoration:none;letter-spacing:-0.5px;flex-shrink:0;}
        .logo em{font-style:normal;color:var(--acc);}
        .nav-links{display:flex;gap:28px;list-style:none;margin:0;padding:0;flex-shrink:0;}
        .nav-links a{font-size:13px;font-weight:600;letter-spacing:0.03em;color:var(--ink2);text-decoration:none;transition:color 0.2s;position:relative;padding-bottom:2px;}
        .nav-links a::after{content:'';position:absolute;bottom:0;left:0;width:0;height:1.5px;background:var(--acc);transition:width 0.25s;}
        .nav-links a:hover{color:var(--ink);}
        .nav-links a:hover::after{width:100%;}
        .nav-right{display:flex;align-items:center;gap:8px;flex-shrink:0;}
        .btn-admin{padding:8px 16px;background:var(--acc);color:#0d0d0d;border:none;border-radius:100px;font-family:inherit;font-size:12px;font-weight:800;letter-spacing:0.04em;text-decoration:none;display:flex;align-items:center;gap:5px;transition:all 0.2s;}
        .btn-admin:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(212,235,0,0.45);}
        .btn-theme{padding:8px 14px;border:1px solid var(--bd);background:var(--bg2);color:var(--ink);border-radius:100px;font-family:inherit;font-size:12px;font-weight:700;transition:all 0.2s;}
        .btn-theme:hover{transform:translateY(-1px);border-color:var(--acc);}

        .wrap{max-width:1140px;margin:0 auto;padding:0 40px;position:relative;z-index:1;}

        /* ── HERO ── */
        .hero{padding-top:116px;padding-bottom:80px;display:grid;grid-template-columns:1fr 300px;align-items:center;gap:60px;border-bottom:1px solid var(--bd);}
        .hero-tag{display:inline-flex;align-items:center;gap:8px;font-size:12px;font-weight:700;letter-spacing:0.1em;color:var(--ink2);text-transform:uppercase;margin-bottom:18px;}
        .hero-dot{width:7px;height:7px;border-radius:50%;background:var(--acc);animation:blink 2s ease infinite;flex-shrink:0;}
        @keyframes blink{0%,100%{opacity:1;}50%{opacity:0.2;}}
        .hero-h1{font-family:'Fraunces',serif;font-size:clamp(38px,6vw,84px);font-weight:900;line-height:0.93;letter-spacing:-0.02em;color:var(--ink);margin:0 0 22px;}
        .hero-h1 em{font-style:italic;font-weight:400;color:var(--ink2);}
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
        .stat-n{font-family:'Fraunces',serif;font-size:42px;font-weight:900;color:var(--ink);line-height:1;margin-bottom:6px;transition:transform 0.3s;}
        .stat:hover .stat-n{transform:scale(1.08);}
        .stat-l{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--ink2);}

        /* ── SOCIAL STRIP ── */
        .social-strip{padding-top:24px;padding-bottom:24px;border-bottom:1px solid var(--bd);display:flex;align-items:center;gap:10px;overflow-x:auto;}
        .social-strip::-webkit-scrollbar{height:0;}
        .social-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--ink3);margin-right:4px;flex-shrink:0;}
        .social-btn{display:flex;align-items:center;gap:8px;padding:9px 16px;background:var(--bg2);border:1px solid var(--bd);border-radius:100px;text-decoration:none;color:var(--ink);font-size:13px;font-weight:600;transition:all 0.25s;flex-shrink:0;white-space:nowrap;}
        .social-btn:hover{transform:translateY(-3px);border-color:var(--acc);box-shadow:0 6px 20px var(--shadow);}
        .social-icon{font-size:10px;font-weight:800;letter-spacing:0.05em;color:var(--ink3);}
        .social-handle{font-size:11px;color:var(--ink2);}

        /* ── SECTION ── */
        .sec{padding-top:76px;padding-bottom:76px;border-bottom:1px solid var(--bd);}
        .sec-head{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:48px;}
        .eyebrow{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:var(--ink2);margin-bottom:8px;}
        .sec-title{font-family:'Fraunces',serif;font-size:clamp(28px,4vw,48px);font-weight:900;line-height:1.05;letter-spacing:-0.02em;color:var(--ink);margin:0;}
        .sec-num{font-family:'Fraunces',serif;font-size:56px;font-weight:900;color:var(--bd);line-height:1;user-select:none;}

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
        .tl-year{font-family:'Fraunces',serif;font-size:13px;font-weight:900;color:var(--acc);margin-bottom:4px;letter-spacing:0.05em;}
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
        .proj-thumb-empty{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-family:'Fraunces',serif;font-size:48px;font-weight:900;color:var(--bd);}
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
        .modal-note-title{font-family:'Fraunces',serif;font-size:19px;font-weight:900;color:var(--ink);line-height:1.2;margin-bottom:22px;position:relative;z-index:1;}
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
        .comments-n{font-family:'Fraunces',serif;font-size:34px;font-weight:900;color:var(--ink);line-height:1;}
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
        .footer-logo{font-family:'Fraunces',serif;font-size:19px;font-weight:900;color:var(--ink);}
        .footer-logo em{font-style:normal;color:var(--acc);}
        .footer-copy{font-size:12px;font-weight:500;color:var(--ink2);margin:0;}
        .footer-right{display:flex;flex-direction:column;align-items:flex-end;gap:8px;}
        .footer-views{display:inline-flex;align-items:center;gap:9px;padding:8px 16px;background:var(--bg2);border:1px solid var(--bd);border-radius:100px;}
        .footer-views-dot{width:6px;height:6px;border-radius:50%;background:var(--acc);animation:blink 2s ease infinite;flex-shrink:0;}
        .footer-views-num{font-family:'Fraunces',serif;font-size:14px;font-weight:900;color:var(--ink);}
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
        .gh-activity{background:var(--bg2);border:1px solid var(--bd);border-radius:20px;padding:20px 24px;margin-bottom:36px;overflow:hidden;}
        .gh-activity-head{display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap;}
        .gh-status-dot{width:8px;height:8px;border-radius:50%;background:#2ea043;animation:blink 2s ease infinite;flex-shrink:0;}
        .gh-activity-title{font-size:13px;font-weight:700;color:var(--ink);}
        .gh-activity-sub{font-size:11px;color:var(--ink2);margin-left:auto;}
        .gh-chart-wrap{width:100%;overflow:hidden;border-radius:10px;}
        .gh-chart-wrap img{width:100%;height:auto;display:block;border-radius:8px;}
        .rw:not(.dark) .gh-chart-wrap img{filter:none;}
        .rw.dark .gh-chart-wrap img{filter:invert(1) hue-rotate(180deg) brightness(0.85);}

        /* ── AI CHAT ── */
        .ai-btn{padding:8px 13px;background:linear-gradient(135deg,#d4eb00,#c5da00);color:#0d0d0d;border:none;border-radius:100px;font-family:inherit;font-size:11px;font-weight:800;letter-spacing:0.03em;display:flex;align-items:center;gap:5px;transition:all 0.2s;cursor:pointer;}
        .ai-btn:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(212,235,0,0.5);}
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

          .proj-grid{grid-template-columns:1fr;}
          .cert-grid{grid-template-columns:1fr;}

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

      <div className={`rw${d ? ' dark' : ''}`}>
        {/* THEME RIPPLE WAVE */}
        {ripple && (
          <div
            key={ripple.key}
            className="theme-ripple"
            style={{ '--rx': `${ripple.x}%`, '--ry': `${ripple.y}%`, '--ripple-color': ripple.color }}
          />
        )}
        {/* LOADING SCREEN */}
        <div className={`page-loader${pageReady ? ' done' : ''}`}>
          <div className="loader-logo"><em>A.</em></div>
          <div className="loader-bar-wrap"><div className="loader-bar" /></div>
          <div className="loader-text">{isID ? 'Memuat...' : 'Loading...'}</div>
        </div>
        {/* DARK MODE ORBS */}
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
            <h1 className="hero-h1">{tx.heroGreet}<br />Aura <em>Auvarose</em></h1>
            <p className="hero-p">{tx.heroDesc}</p>
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

        {/* SOCIAL STRIP */}
        <div className="wrap social-strip" data-reveal>
          <span className="social-label">{tx.socialLabel}</span>
          {socials.map(s=>(
            <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" className="social-btn">
              <span className="social-icon">{s.icon}</span>
              <span>{s.name}</span>
              <span className="social-handle">{s.handle}</span>
            </a>
          ))}
        </div>

        {/* ABOUT + TIMELINE */}
        <section className="wrap sec" id="about">
          <div className="sec-head" data-reveal>
            <div><p className="eyebrow">{tx.aboutEyebrow}</p><h2 className="sec-title" dangerouslySetInnerHTML={{__html: tx.aboutTitle.replace('\n','<br/>')}} /></div>
          </div>
          <div className="about-grid">
            <div data-reveal>
              <div className="about-text">
                <p>{tx.aboutP1}</p>
                <p>{tx.aboutP2}</p>
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
          {/* GITHUB ACTIVITY */}
          <div className="gh-activity" data-reveal>
            <div className="gh-activity-head">
              <span className="gh-status-dot"/>
              <span className="gh-activity-title">Active on GitHub</span>
              <span className="gh-activity-sub">@auraauvarose · 370 contributions this year</span>
            </div>
            <div className="gh-chart-wrap">
              <img
                src="https://ghchart.rshah.org/2ea043/auraauvarose"
                alt="GitHub Contribution Chart"
                loading="lazy"
              />
            </div>
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
        </section>

        {/* CONTACT */}
        <section className="wrap sec" id="contact">
          <div className="sec-head" data-reveal>
            <div><p className="eyebrow">{tx.contactEyebrow}</p><h2 className="sec-title">Tinggalkan<br/>Pesan</h2></div>
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
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        </section>

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
              <button className="ai-send" onClick={sendAI} disabled={aiLoading}>Kirim</button>
            </div>
          </div>
        )}

        {/* FLOAT: LANG + MUSIC */}
        <audio ref={audioRef} loop>
          <source src="https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3" type="audio/mpeg"/>
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