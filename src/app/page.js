"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [isDark, setIsDark] = useState(true);
  const [time, setTime] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedImg, setSelectedImg] = useState(null);
  const [views, setViews] = useState(0);
  const [comments, setComments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [nameInput, setNameInput] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitDone, setSubmitDone] = useState(false);
  const audioRef = useRef(null);

  const d = isDark;

  // Sync body background to prevent white flash / white sides
  useEffect(() => {
    document.documentElement.style.background = d ? '#111110' : '#f7f6f1';
    document.body.style.background = d ? '#111110' : '#f7f6f1';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
  }, [d]);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date().toLocaleTimeString('id-ID')), 1000);
    const loadAndIncrementViews = async () => {
      const { data } = await supabase.from('views').select('count').eq('slug', 'home').single();
      if (data) {
        const newCount = data.count + 1;
        setViews(newCount);
        await supabase.from('views').update({ count: newCount }).eq('slug', 'home');
      }
    };
    const loadComments = async () => {
      const { data } = await supabase.from('comments').select('*').order('created_at', { ascending: false });
      if (data) setComments(data);
    };
    const loadCertificates = async () => {
      const { data } = await supabase.from('certificates').select('*').order('created_at', { ascending: false });
      if (data) setCertificates(data);
    };
    loadCertificates(); loadAndIncrementViews(); loadComments();
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

  const skills = [
    { name: 'Node.js', cat: 'Back-End', level: 85 },
    { name: 'Express.js', cat: 'Framework', level: 80 },
    { name: 'PostgreSQL', cat: 'Database', level: 75 },
    { name: 'Python', cat: 'Language', level: 70 },
    { name: 'Docker', cat: 'DevOps', level: 60 },
    { name: 'Next.js', cat: 'Front-End', level: 65 },
    { name: 'Supabase', cat: 'BaaS', level: 78 },
    { name: 'Git', cat: 'Tools', level: 82 },
  ];

  const timeline = [
    { year: '2022', title: 'Mulai Belajar Programming', desc: 'Memulai perjalanan di dunia IT, belajar Python dan dasar-dasar web development secara otodidak.' },
    { year: '2023', title: 'Masuk Jurusan IT', desc: 'Resmi terdaftar di program studi Teknologi Informasi. Mulai mendalami back-end development dan database.' },
    { year: '2024', title: 'Proyek Pertama', desc: 'Berhasil membangun REST API pertama menggunakan Node.js + Express dan deploy ke production server.' },
    { year: '2025', title: 'Sertifikasi & Kompetisi', desc: 'Mengikuti berbagai pelatihan, mendapat beberapa sertifikat kompetensi, dan mulai berkontribusi ke open source.' },
    { year: '2026', title: 'Sekarang', desc: 'Fokus membangun portfolio yang kuat, mempelajari cloud architecture, dan mempersiapkan diri untuk karir profesional.' },
  ];

  const goals = [
    { icon: '🎯', title: 'Jangka Pendek', items: ['Lulus dengan IPK terbaik', 'Kuasai cloud (AWS/GCP)', 'Bangun 5 proyek portfolio', 'Kontribusi open source'] },
    { icon: '🚀', title: 'Jangka Menengah', items: ['Bekerja di tech company', 'Spesialisasi di sistem distributed', 'Bangun startup atau produk sendiri', 'Mentoring junior developer'] },
    { icon: '🌟', title: 'Jangka Panjang', items: ['Software architect berpengalaman', 'Berkontribusi pada komunitas IT Indonesia', 'Buat platform edukasi coding', 'Impak positif melalui teknologi'] },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,900;1,9..144,400;1,9..144,700&display=swap');

        *, *::before, *::after { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; width: 100%; }

        body {
          cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="cyan" stroke="white" stroke-width="1.5"><path d="M3 3l7 17 2.5-7.5L20 10z"/></svg>'), auto;
        }
        a, button {
          cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="magenta" stroke="white" stroke-width="1.5"><path d="M3 3l7 17 2.5-7.5L20 10z"/></svg>'), pointer;
        }

        .rw {
          --acc: #d4eb00;
          --acc-bg: rgba(212,235,0,0.1);
          --ink: #0d0d0d;
          --ink2: #717171;
          --ink3: #aaaaaa;
          --bg: #f7f6f1;
          --bg2: #eeeee8;
          --bd: rgba(0,0,0,0.08);
          --card: #ffffff;
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: var(--bg);
          color: var(--ink);
          min-height: 100vh;
          width: 100%;
          transition: background 0.4s, color 0.4s;
        }
        .rw.dark {
          --ink: #f0efe8;
          --ink2: #888880;
          --ink3: #555550;
          --bg: #111110;
          --bg2: #1c1c1a;
          --bd: rgba(255,255,255,0.07);
          --card: #1c1c1a;
        }

        /* ── NAV ── */
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 50;
          background: var(--bg);
          border-bottom: 1px solid var(--bd);
          transition: background 0.4s, border-color 0.4s;
        }
        .nav-in {
          max-width: 1140px; margin: 0 auto; padding: 0 48px;
          height: 64px; display: flex; align-items: center; justify-content: space-between;
        }
        .logo {
          font-family: 'Fraunces', serif; font-size: 22px; font-weight: 900;
          color: var(--ink); text-decoration: none; letter-spacing: -0.5px;
        }
        .logo em { font-style: normal; color: var(--acc); }
        .nav-links { display: flex; gap: 36px; list-style: none; margin: 0; padding: 0; }
        .nav-links a {
          font-size: 13px; font-weight: 600; letter-spacing: 0.04em;
          color: var(--ink2); text-decoration: none; transition: color 0.2s;
        }
        .nav-links a:hover { color: var(--ink); }
        .theme-toggle {
          padding: 8px 18px; border: 1px solid var(--bd);
          background: var(--bg2); color: var(--ink);
          border-radius: 100px; font-family: inherit;
          font-size: 12px; font-weight: 700; letter-spacing: 0.04em;
          transition: all 0.2s;
        }
        .theme-toggle:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.12); }

        /* ── WRAP ── */
        .wrap { max-width: 1140px; margin: 0 auto; padding: 0 48px; }

        /* ── HERO ── */
        .hero {
          padding-top: 120px; padding-bottom: 80px;
          display: grid; grid-template-columns: 1fr 300px;
          align-items: center; gap: 64px;
          border-bottom: 1px solid var(--bd);
        }
        .hero-tag {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 12px; font-weight: 700; letter-spacing: 0.1em;
          color: var(--ink2); text-transform: uppercase; margin-bottom: 20px;
        }
        .hero-dot {
          width: 7px; height: 7px; border-radius: 50%; background: var(--acc);
          animation: blink 2s ease infinite;
        }
        @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:0.2;} }
        .hero-h1 {
          font-family: 'Fraunces', serif;
          font-size: clamp(50px, 6.5vw, 88px);
          font-weight: 900; line-height: 0.92; letter-spacing: -0.02em;
          color: var(--ink); margin: 0 0 22px;
        }
        .hero-h1 em { font-style: italic; font-weight: 400; color: var(--ink2); }
        .hero-p {
          font-size: 17px; color: var(--ink2); line-height: 1.65;
          max-width: 460px; margin-bottom: 36px;
        }
        .hero-btns { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .btn-dark {
          padding: 14px 26px; background: var(--ink); color: var(--bg);
          border: none; border-radius: 100px; font-family: inherit;
          font-size: 14px; font-weight: 700; text-decoration: none; display: inline-block;
          transition: all 0.2s;
        }
        .btn-dark:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.2); }
        .btn-acc {
          padding: 13px 20px; background: var(--acc); color: #0d0d0d;
          border: none; border-radius: 100px; font-family: inherit;
          font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 6px;
        }
        .hero-photo-wrap { position: relative; height: 340px; }
        .hero-photo-bg {
          position: absolute; inset: -10px; background: var(--acc);
          border-radius: 24px; transform: rotate(4deg);
          transition: transform 0.4s ease;
        }
        .hero-photo-wrap:hover .hero-photo-bg { transform: rotate(7deg); }
        .hero-photo {
          position: relative; width: 100%; height: 100%;
          border-radius: 20px; overflow: hidden; background: var(--bg2);
        }
        .hero-photo img { width: 100%; height: 100%; object-fit: cover; }

        /* ── STATS ── */
        .stats {
          display: grid; grid-template-columns: repeat(4,1fr);
          border-bottom: 1px solid var(--bd);
        }
        .stat {
          padding: 40px 0; text-align: center;
          border-right: 1px solid var(--bd);
          animation: up 0.5s ease both;
        }
        .stat:last-child { border-right: none; }
        .stat-n {
          font-family: 'Fraunces', serif; font-size: 44px; font-weight: 900;
          color: var(--ink); line-height: 1; margin-bottom: 6px;
        }
        .stat-l {
          font-size: 11px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.1em; color: var(--ink2);
        }

        /* ── SECTION BASE ── */
        .sec { padding: 80px 0; border-bottom: 1px solid var(--bd); }
        .sec-head {
          display: flex; justify-content: space-between; align-items: flex-end;
          margin-bottom: 52px;
        }
        .eyebrow {
          font-size: 11px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.12em; color: var(--ink2); margin-bottom: 8px;
        }
        .sec-title {
          font-family: 'Fraunces', serif;
          font-size: clamp(30px, 4.5vw, 50px);
          font-weight: 900; line-height: 1.05; letter-spacing: -0.02em;
          color: var(--ink); margin: 0;
        }
        .sec-num {
          font-family: 'Fraunces', serif; font-size: 60px; font-weight: 900;
          color: var(--bd); line-height: 1; user-select: none;
        }

        /* ── ABOUT / HISTORY ── */
        .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: start; }
        .about-text { font-size: 16px; color: var(--ink2); line-height: 1.75; }
        .about-text p { margin: 0 0 16px; }
        .about-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 28px; }
        .about-tag {
          padding: 6px 14px; background: var(--bg2); border: 1px solid var(--bd);
          border-radius: 100px; font-size: 12px; font-weight: 600; color: var(--ink2);
        }

        /* Timeline */
        .timeline { position: relative; padding-left: 24px; }
        .timeline::before {
          content: ''; position: absolute;
          left: 0; top: 8px; bottom: 8px;
          width: 1px; background: var(--bd);
        }
        .tl-item { position: relative; padding-left: 28px; padding-bottom: 36px; }
        .tl-item:last-child { padding-bottom: 0; }
        .tl-dot {
          position: absolute; left: -30px; top: 5px;
          width: 10px; height: 10px; border-radius: 50%;
          background: var(--bg); border: 2px solid var(--ink3);
          transition: border-color 0.2s, background 0.2s;
        }
        .tl-item:hover .tl-dot { border-color: var(--acc); background: var(--acc); }
        .tl-year {
          font-family: 'Fraunces', serif; font-size: 13px; font-weight: 900;
          color: var(--acc); margin-bottom: 4px; letter-spacing: 0.05em;
        }
        .tl-title { font-size: 15px; font-weight: 700; color: var(--ink); margin-bottom: 6px; }
        .tl-desc { font-size: 13px; color: var(--ink2); line-height: 1.6; }

        /* ── SKILLS ── */
        .skills-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; }
        .skill-card {
          padding: 20px; background: var(--bg2);
          border: 1px solid var(--bd); border-radius: 16px;
          animation: up 0.5s ease both; transition: transform 0.2s, box-shadow 0.2s;
        }
        .skill-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.1); }
        .skill-cat { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink3); margin-bottom: 8px; }
        .skill-name { font-size: 17px; font-weight: 700; color: var(--ink); margin-bottom: 14px; }
        .skill-bar-bg { height: 4px; background: var(--bd); border-radius: 4px; overflow: hidden; }
        .skill-bar-fill {
          height: 100%; background: var(--acc); border-radius: 4px;
          transition: width 1s ease;
        }
        .skill-pct { font-size: 11px; font-weight: 600; color: var(--ink3); margin-top: 6px; text-align: right; }

        /* ── GOALS ── */
        .goals-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; }
        .goal-card {
          padding: 28px; background: var(--bg2);
          border: 1px solid var(--bd); border-radius: 20px;
          transition: transform 0.2s, box-shadow 0.2s;
          animation: up 0.5s ease both;
        }
        .goal-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.1); }
        .goal-icon { font-size: 28px; margin-bottom: 16px; }
        .goal-title { font-size: 16px; font-weight: 700; color: var(--ink); margin-bottom: 16px; }
        .goal-items { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
        .goal-item {
          display: flex; align-items: flex-start; gap: 10px;
          font-size: 13px; color: var(--ink2); line-height: 1.5;
        }
        .goal-item::before {
          content: '→'; color: var(--acc); font-weight: 700;
          flex-shrink: 0; margin-top: 1px;
        }

        /* ── CERTS ── */
        .cert-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(300px,1fr)); gap: 20px; }
        .cert-card {
          background: var(--bg2); border: 1px solid var(--bd);
          border-radius: 20px; overflow: hidden; cursor: pointer;
          transition: transform 0.3s, box-shadow 0.3s;
          animation: up 0.5s ease both;
        }
        .cert-card:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(0,0,0,0.12); }
        .cert-img { overflow: hidden; aspect-ratio: 16/10; }
        .cert-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
        .cert-card:hover .cert-img img { transform: scale(1.07); }
        .cert-info { padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; }
        .cert-info-t p { font-size: 14px; font-weight: 700; color: var(--ink); margin: 0 0 2px; }
        .cert-info-t span { font-size: 12px; color: var(--ink2); }
        .cert-arr {
          width: 32px; height: 32px; border-radius: 50%;
          background: var(--ink); color: var(--bg);
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; flex-shrink: 0; transition: transform 0.25s;
        }
        .cert-card:hover .cert-arr { transform: rotate(45deg); }
        .cert-empty {
          grid-column: 1/-1; padding: 80px; text-align: center;
          border: 1px dashed var(--bd); border-radius: 20px;
          color: var(--ink2); font-size: 14px;
        }

        /* ── CONTACT ── */
        .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; }
        .form-g { margin-bottom: 14px; }
        .form-l {
          display: block; font-size: 11px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.1em;
          color: var(--ink2); margin-bottom: 8px;
        }
        .form-i, .form-t {
          width: 100%; padding: 15px 18px;
          background: var(--bg2); border: 1px solid var(--bd); color: var(--ink);
          border-radius: 14px; font-family: inherit; font-size: 15px; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .form-i::placeholder, .form-t::placeholder { color: var(--ink3); }
        .form-i:focus, .form-t:focus { border-color: var(--ink); box-shadow: 0 0 0 3px var(--acc-bg); }
        .form-t { height: 160px; resize: none; }
        .form-btn {
          width: 100%; padding: 16px; background: var(--ink); color: var(--bg);
          border: none; border-radius: 14px; font-family: inherit;
          font-size: 14px; font-weight: 700; letter-spacing: 0.04em;
          transition: all 0.2s; margin-top: 4px;
        }
        .form-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.15); }
        .form-btn:disabled { opacity: 0.6; }
        .submit-ok {
          display: flex; align-items: center; gap: 8px;
          padding: 14px 18px; border-radius: 12px;
          background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.2);
          color: #16a34a; font-size: 13px; font-weight: 600; margin-top: 12px;
          animation: up 0.3s ease;
        }
        .comments-hd { display: flex; align-items: baseline; gap: 10px; margin-bottom: 20px; }
        .comments-n { font-family: 'Fraunces', serif; font-size: 36px; font-weight: 900; color: var(--ink); line-height: 1; }
        .comments-lb { font-size: 12px; font-weight: 600; color: var(--ink2); }
        .comments-list { max-height: 520px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; }
        .comment-card { padding: 18px 20px; background: var(--bg2); border: 1px solid var(--bd); border-radius: 16px; animation: up 0.3s ease; }
        .comment-name { font-size: 14px; font-weight: 700; color: var(--ink); margin-bottom: 6px; display: flex; align-items: center; gap: 10px; }
        .comment-name::after { content: ''; flex: 1; height: 1px; background: var(--bd); }
        .comment-msg { font-size: 14px; color: var(--ink2); line-height: 1.6; margin-bottom: 10px; }
        .comment-dt { font-size: 11px; font-weight: 600; color: var(--ink3); text-transform: uppercase; letter-spacing: 0.08em; }
        .comments-empty { padding: 40px; text-align: center; color: var(--ink2); font-size: 14px; }

        /* ── SCROLLBAR ── */
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--ink3); border-radius: 4px; }
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: var(--ink3) transparent; }

        /* ── FOOTER ── */
        .footer { padding: 44px 0; display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--bd); }
        .footer-logo { font-family: 'Fraunces', serif; font-size: 20px; font-weight: 900; color: var(--ink); }
        .footer-logo em { font-style: normal; color: var(--acc); }
        .footer-copy { font-size: 13px; font-weight: 500; color: var(--ink2); }

        /* ── LIGHTBOX ── */
        .lightbox {
          position: fixed; inset: 0; background: rgba(0,0,0,0.92);
          z-index: 1000; display: flex; align-items: center; justify-content: center;
          padding: 32px; animation: fadeIn 0.2s ease;
        }
        .lightbox img { max-width: 100%; max-height: 90vh; border-radius: 16px; box-shadow: 0 40px 80px rgba(0,0,0,0.6); animation: zoom 0.3s ease; }
        .lbox-close {
          position: absolute; top: 24px; right: 24px;
          width: 48px; height: 48px; background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.15);
          color: white; border-radius: 50%; font-size: 18px;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s;
        }
        .lbox-close:hover { background: rgba(255,255,255,0.2); }

        /* ── MUSIC ── */
        .music-btn {
          position: fixed; bottom: 32px; right: 32px; z-index: 100;
          width: 56px; height: 56px; border-radius: 50%;
          background: var(--ink); color: var(--bg); border: none;
          font-size: 18px; display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 24px rgba(0,0,0,0.25); transition: transform 0.2s, box-shadow 0.2s;
        }
        .music-btn:hover { transform: scale(1.1); box-shadow: 0 12px 32px rgba(0,0,0,0.3); }
        .music-btn.playing { animation: spin 8s linear infinite; }

        /* ── ANIMATIONS ── */
        @keyframes spin { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }
        @keyframes up { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
        @keyframes fadeIn { from{opacity:0;} to{opacity:1;} }
        @keyframes zoom { from{transform:scale(0.92);opacity:0;} to{transform:scale(1);opacity:1;} }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .wrap { padding: 0 24px; }
          .nav-in { padding: 0 24px; }
          .hero { grid-template-columns: 1fr; }
          .hero-photo-wrap { height: 240px; order: -1; }
          .stats { grid-template-columns: 1fr 1fr; }
          .stat:nth-child(2) { border-right: none; }
          .about-grid { grid-template-columns: 1fr; gap: 40px; }
          .skills-grid { grid-template-columns: 1fr 1fr; }
          .goals-grid { grid-template-columns: 1fr; }
          .contact-grid { grid-template-columns: 1fr; gap: 40px; }
          .nav-links { display: none; }
          .footer { flex-direction: column; gap: 12px; text-align: center; }
          .sec-num { display: none; }
        }
      `}</style>

      <div className={`rw${d ? ' dark' : ''}`}>

        {/* ── NAV ── */}
        <nav className="nav">
          <div className="nav-in">
            <a href="#" className="logo">Aura<em>.</em></a>
            <ul className="nav-links">
              <li><a href="#">Beranda</a></li>
              <li><a href="#about">Tentang</a></li>
              <li><a href="#skills">Skills</a></li>
              <li><a href="#portfolio">Portfolio</a></li>
              <li><a href="#contact">Kontak</a></li>
            </ul>
            <button className="theme-toggle" onClick={() => setIsDark(!d)}>
              {d ? '☀ Light' : '🌙 Dark'}
            </button>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section className="wrap hero">
          <div>
            <div className="hero-tag">
              <span className="hero-dot" />
              Back-End Developer &amp; IT Student
            </div>
            <h1 className="hero-h1">
              Halo, Saya<br />
              Aura <em>Auvarose</em>
            </h1>
            <p className="hero-p">
              Fokus pada pengembangan sistem server yang skalabel dan efisien. Saya senang mengubah logika kompleks menjadi kode yang bersih dan maintainable.
            </p>
            <div className="hero-btns">
              <a href="#contact" className="btn-dark">Hubungi Saya →</a>
              <div className="btn-acc">🕐 {time || '00:00:00'}</div>
            </div>
          </div>

          <div className="hero-photo-wrap">
            <div className="hero-photo-bg" />
            <div className="hero-photo">
              <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Aura&backgroundColor=c7d2fe" alt="Aura" />
            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        <div className="wrap" id="about" style={{padding: 0}}>
          <div className="stats" style={{margin:'0 48px'}}>
            {[
              { n: '10+', l: 'Proyek Selesai' },
              { n: views || 0, l: 'Pengunjung' },
              { n: '2+', l: 'Tahun Belajar' },
              { n: 'A', l: 'IPK Rata-rata' },
            ].map((s, i) => (
              <div key={i} className="stat" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="stat-n">{s.n}</div>
                <div className="stat-l">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── ABOUT & HISTORY ── */}
        <section className="wrap sec">
          <div className="sec-head">
            <div>
              <p className="eyebrow">Tentang Saya</p>
              <h2 className="sec-title">Cerita &<br />Perjalanan</h2>
            </div>
          </div>

          <div className="about-grid">
            <div>
              <div className="about-text">
                <p>
                  Hai! Saya <strong>Aura Auvarose</strong>, seorang IT student yang memiliki passion besar di bidang back-end development. Saya percaya bahwa kode yang baik bukan hanya yang bekerja, tapi yang juga mudah dibaca, di-maintain, dan di-scale.
                </p>
                <p>
                  Perjalanan saya di dunia programming dimulai dari rasa penasaran yang besar — bagaimana sebuah aplikasi bisa berjalan di balik layar? Dari pertanyaan sederhana itu, saya mulai mendalami server, database, dan arsitektur sistem.
                </p>
                <p>
                  Saat ini saya aktif belajar cloud computing dan distributed systems, sambil terus membangun proyek-proyek yang memberikan solusi nyata.
                </p>
              </div>
              <div className="about-tags">
                {['Node.js','PostgreSQL','Docker','REST API','Git','Next.js','Python','Supabase'].map(t => (
                  <span key={t} className="about-tag">{t}</span>
                ))}
              </div>
            </div>

            <div>
              <div className="eyebrow" style={{marginBottom:'24px'}}>Timeline</div>
              <div className="timeline">
                {timeline.map((tl) => (
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

        {/* ── SKILLS ── */}
        <section className="wrap sec" id="skills">
          <div className="sec-head">
            <div>
              <p className="eyebrow">Kemampuan</p>
              <h2 className="sec-title">Tech<br />Stack</h2>
            </div>
            <span className="sec-num">0{skills.length}</span>
          </div>
          <div className="skills-grid">
            {skills.map((sk, i) => (
              <div key={sk.name} className="skill-card" style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="skill-cat">{sk.cat}</div>
                <div className="skill-name">{sk.name}</div>
                <div className="skill-bar-bg">
                  <div className="skill-bar-fill" style={{ width: `${sk.level}%` }} />
                </div>
                <div className="skill-pct">{sk.level}%</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── GOALS ── */}
        <section className="wrap sec">
          <div className="sec-head">
            <div>
              <p className="eyebrow">Tujuan & Visi</p>
              <h2 className="sec-title">Goals &<br />Aspirasi</h2>
            </div>
          </div>
          <div className="goals-grid">
            {goals.map((g, i) => (
              <div key={g.title} className="goal-card" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="goal-icon">{g.icon}</div>
                <div className="goal-title">{g.title}</div>
                <ul className="goal-items">
                  {g.items.map(item => (
                    <li key={item} className="goal-item">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── CERTIFICATES ── */}
        <section className="wrap sec" id="portfolio">
          <div className="sec-head">
            <div>
              <p className="eyebrow">Pencapaian</p>
              <h2 className="sec-title">Koleksi<br />Sertifikat</h2>
            </div>
            <span className="sec-num">0{certificates.length}</span>
          </div>
          <div className="cert-grid">
            {certificates.length === 0 ? (
              <div className="cert-empty">Belum ada sertifikat yang ditambahkan.</div>
            ) : (
              certificates.map((cert, i) => (
                <div key={cert.id} className="cert-card" onClick={() => setSelectedImg(cert.image_url)} style={{ animationDelay: `${i * 0.07}s` }}>
                  <div className="cert-img"><img src={cert.image_url} alt="Sertifikat" /></div>
                  <div className="cert-info">
                    <div className="cert-info-t">
                      <p>Sertifikat Kompetensi</p>
                      <span>Klik untuk lihat detail</span>
                    </div>
                    <div className="cert-arr">↗</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* ── CONTACT ── */}
        <section className="wrap sec" id="contact">
          <div className="sec-head">
            <div>
              <p className="eyebrow">Buku Tamu</p>
              <h2 className="sec-title">Tinggalkan<br />Pesan</h2>
            </div>
          </div>
          <div className="contact-grid">
            <div>
              <form onSubmit={submitComment}>
                <div className="form-g">
                  <label className="form-l">Nama Lengkap</label>
                  <input type="text" placeholder="Masukkan nama kamu..." value={nameInput} onChange={e => setNameInput(e.target.value)} className="form-i" required />
                </div>
                <div className="form-g">
                  <label className="form-l">Pesan</label>
                  <textarea placeholder="Tulis pesanmu di sini..." value={messageInput} onChange={e => setMessageInput(e.target.value)} className="form-t" required />
                </div>
                <button type="submit" className="form-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Mengirim...' : 'Kirim Pesan →'}
                </button>
              </form>
              {submitDone && <div className="submit-ok">✓ Pesan terkirim! Terima kasih sudah mampir.</div>}
            </div>

            <div>
              <div className="comments-hd">
                <span className="comments-n">{comments.length}</span>
                <span className="comments-lb">Pesan Masuk</span>
              </div>
              <div className="comments-list custom-scrollbar">
                {comments.length === 0 ? (
                  <div className="comments-empty">Belum ada pesan. Jadilah yang pertama! 👋</div>
                ) : (
                  comments.map(c => (
                    <div key={c.id} className="comment-card">
                      <p className="comment-name">{c.name}</p>
                      <p className="comment-msg">{c.message}</p>
                      <p className="comment-dt">{new Date(c.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="wrap footer">
          <div className="footer-logo">Aura<em>.</em>Dev</div>
          <p className="footer-copy">© 2026 Aura Auvarose · Made with Next.js &amp; Supabase</p>
        </footer>

        {/* ── LIGHTBOX ── */}
        {selectedImg && (
          <div className="lightbox" onClick={() => setSelectedImg(null)}>
            <button className="lbox-close" onClick={() => setSelectedImg(null)}>✕</button>
            <img src={selectedImg} alt="Sertifikat" onClick={e => e.stopPropagation()} />
          </div>
        )}

        {/* ── MUSIC ── */}
        <audio ref={audioRef} loop>
          <source src="https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3" type="audio/mpeg" />
        </audio>
        <button onClick={toggleMusic} className={`music-btn${isPlaying ? ' playing' : ''}`} title={isPlaying ? 'Pause' : 'Play'}>
          {isPlaying ? '♪' : '▶'}
        </button>

      </div>
    </>
  );
}