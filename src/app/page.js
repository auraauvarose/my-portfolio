"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [isDark, setIsDark] = useState(true);
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
  const audioRef = useRef(null);
  const d = isDark;

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
    const loadProjects = async () => {
      const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      if (data) setProjects(data);
    };
    loadCertificates(); loadProjects(); loadAndIncrementViews(); loadComments();
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

  // ── GANTI USERNAME DI SINI ──
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

  const timeline = [
    { year: '2021 - 2025', title: 'Pengalaman Belajar', desc: 'Desain Komunikasi Visual.' },
    { year: '2022', title: 'Mengenal Pemrograman', desc: 'Memulai belajar pemrograman menggunakan JavaScript dan Python.' },
    { year: '2025', title: 'Pengalaman Belajar', desc: 'S1 Informatika.' },
  ];

  const goals = [
    { icon: '🎯', title: 'Jangka Pendek', items: ['Lulus dengan IPK terbaik', 'Kuasai cloud (AWS/GCP)', 'Bangun 5 proyek portfolio', 'Kontribusi open source'] },
    { icon: '🚀', title: 'Jangka Menengah', items: ['Bekerja di tech company', 'Spesialisasi distributed system', 'Bangun startup atau produk sendiri', 'Mentoring junior developer'] },
    { icon: '🌟', title: 'Jangka Panjang', items: ['Software architect berpengalaman', 'Berkontribusi pada komunitas IT', 'Buat platform edukasi coding', 'Impak positif melalui teknologi'] },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,900;1,9..144,400;1,9..144,700&display=swap');
        *,*::before,*::after{box-sizing:border-box;}
        html,body{margin:0;padding:0;width:100%;}
        body{cursor:url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="cyan" stroke="white" stroke-width="1.5"><path d="M3 3l7 17 2.5-7.5L20 10z"/></svg>'),auto;}
        a,button{cursor:url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="magenta" stroke="white" stroke-width="1.5"><path d="M3 3l7 17 2.5-7.5L20 10z"/></svg>'),pointer;}

        .rw{
          --acc:#d4eb00;--acc-bg:rgba(212,235,0,0.1);
          --ink:#0d0d0d;--ink2:#717171;--ink3:#aaaaaa;
          --bg:#f7f6f1;--bg2:#eeeee8;--bd:rgba(0,0,0,0.08);
          font-family:'Plus Jakarta Sans',sans-serif;
          background:var(--bg);color:var(--ink);
          min-height:100vh;width:100%;transition:background 0.4s,color 0.4s;
        }
        .rw.dark{
          --ink:#f0efe8;--ink2:#888880;--ink3:#555550;
          --bg:#111110;--bg2:#1c1c1a;--bd:rgba(255,255,255,0.07);
        }

        /* NAV */
        .nav{position:fixed;top:0;left:0;right:0;z-index:50;background:var(--bg);border-bottom:1px solid var(--bd);transition:background 0.4s,border-color 0.4s;}
        .nav-in{max-width:1140px;margin:0 auto;padding:0 48px;height:64px;display:flex;align-items:center;justify-content:space-between;}
        .logo{font-family:'Fraunces',serif;font-size:22px;font-weight:900;color:var(--ink);text-decoration:none;letter-spacing:-0.5px;}
        .logo em{font-style:normal;color:var(--acc);}
        .nav-links{display:flex;gap:32px;list-style:none;margin:0;padding:0;}
        .nav-links a{font-size:13px;font-weight:600;letter-spacing:0.04em;color:var(--ink2);text-decoration:none;transition:color 0.2s;}
        .nav-links a:hover{color:var(--ink);}
        .nav-right{display:flex;align-items:center;gap:10px;}
        .btn-admin{
          padding:8px 18px;background:var(--acc);color:#0d0d0d;
          border:none;border-radius:100px;font-family:inherit;
          font-size:12px;font-weight:800;letter-spacing:0.05em;
          text-decoration:none;display:flex;align-items:center;gap:6px;
          transition:all 0.2s;
        }
        .btn-admin:hover{transform:translateY(-1px);box-shadow:0 4px 16px rgba(212,235,0,0.4);}
        .btn-theme{padding:8px 18px;border:1px solid var(--bd);background:var(--bg2);color:var(--ink);border-radius:100px;font-family:inherit;font-size:12px;font-weight:700;transition:all 0.2s;}
        .btn-theme:hover{transform:translateY(-1px);}

        /* WRAP */
        .wrap{max-width:1140px;margin:0 auto;padding:0 48px;}

        /* HERO */
        .hero{padding-top:120px;padding-bottom:80px;display:grid;grid-template-columns:1fr 300px;align-items:center;gap:64px;border-bottom:1px solid var(--bd);}
        .hero-tag{display:inline-flex;align-items:center;gap:8px;font-size:12px;font-weight:700;letter-spacing:0.1em;color:var(--ink2);text-transform:uppercase;margin-bottom:20px;}
        .hero-dot{width:7px;height:7px;border-radius:50%;background:var(--acc);animation:blink 2s ease infinite;}
        @keyframes blink{0%,100%{opacity:1;}50%{opacity:0.2;}}
        .hero-h1{font-family:'Fraunces',serif;font-size:clamp(50px,6.5vw,88px);font-weight:900;line-height:0.92;letter-spacing:-0.02em;color:var(--ink);margin:0 0 22px;}
        .hero-h1 em{font-style:italic;font-weight:400;color:var(--ink2);}
        .hero-p{font-size:17px;color:var(--ink2);line-height:1.65;max-width:460px;margin-bottom:36px;}
        .hero-btns{display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
        .btn-dark{padding:14px 26px;background:var(--ink);color:var(--bg);border:none;border-radius:100px;font-family:inherit;font-size:14px;font-weight:700;text-decoration:none;display:inline-block;transition:all 0.2s;}
        .btn-dark:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.2);}
        .btn-acc{padding:13px 20px;background:var(--acc);color:#0d0d0d;border:none;border-radius:100px;font-family:inherit;font-size:14px;font-weight:600;display:flex;align-items:center;gap:6px;}
        .hero-photo-wrap{position:relative;height:340px;}
        .hero-photo-bg{position:absolute;inset:-10px;background:var(--acc);border-radius:24px;transform:rotate(4deg);transition:transform 0.4s ease;}
        .hero-photo-wrap:hover .hero-photo-bg{transform:rotate(7deg);}
        .hero-photo{position:relative;width:100%;height:100%;border-radius:20px;overflow:hidden;background:var(--bg2);}
        .hero-photo img{width:100%;height:100%;object-fit:cover;}

        /* STATS */
        .stats{display:grid;grid-template-columns:repeat(4,1fr);border-bottom:1px solid var(--bd);}
        .stat{padding:40px 0;text-align:center;border-right:1px solid var(--bd);animation:up 0.5s ease both;}
        .stat:last-child{border-right:none;}
        .stat-n{font-family:'Fraunces',serif;font-size:44px;font-weight:900;color:var(--ink);line-height:1;margin-bottom:6px;}
        .stat-l{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--ink2);}

        /* SOCIAL STRIP */
        .social-strip{padding:28px 0;border-bottom:1px solid var(--bd);display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
        .social-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--ink3);margin-right:4px;}
        .social-btn{
          display:flex;align-items:center;gap:8px;
          padding:10px 18px;background:var(--bg2);border:1px solid var(--bd);
          border-radius:100px;text-decoration:none;
          color:var(--ink);font-size:13px;font-weight:600;
          transition:all 0.2s;
        }
        .social-btn:hover{transform:translateY(-2px);border-color:var(--acc);box-shadow:0 4px 16px rgba(0,0,0,0.1);}
        .social-icon{font-size:11px;font-weight:800;letter-spacing:0.05em;color:var(--ink3);}
        .social-handle{font-size:12px;color:var(--ink2);}

        /* SECTION */
        .sec{padding:80px 0;border-bottom:1px solid var(--bd);}
        .sec-head{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:52px;}
        .eyebrow{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:var(--ink2);margin-bottom:8px;}
        .sec-title{font-family:'Fraunces',serif;font-size:clamp(30px,4.5vw,50px);font-weight:900;line-height:1.05;letter-spacing:-0.02em;color:var(--ink);margin:0;}
        .sec-num{font-family:'Fraunces',serif;font-size:60px;font-weight:900;color:var(--bd);line-height:1;user-select:none;}

        /* ABOUT */
        .about-grid{display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:start;}
        .about-text{font-size:16px;color:var(--ink2);line-height:1.75;}
        .about-text p{margin:0 0 16px;}
        .about-tags{display:flex;flex-wrap:wrap;gap:8px;margin-top:28px;}
        .about-tag{padding:6px 14px;background:var(--bg2);border:1px solid var(--bd);border-radius:100px;font-size:12px;font-weight:600;color:var(--ink2);}
        .timeline{position:relative;padding-left:24px;}
        .timeline::before{content:'';position:absolute;left:0;top:8px;bottom:8px;width:1px;background:var(--bd);}
        .tl-item{position:relative;padding-left:28px;padding-bottom:36px;}
        .tl-item:last-child{padding-bottom:0;}
        .tl-dot{position:absolute;left:-30px;top:5px;width:10px;height:10px;border-radius:50%;background:var(--bg);border:2px solid var(--ink3);transition:all 0.2s;}
        .tl-item:hover .tl-dot{border-color:var(--acc);background:var(--acc);}
        .tl-year{font-family:'Fraunces',serif;font-size:13px;font-weight:900;color:var(--acc);margin-bottom:4px;letter-spacing:0.05em;}
        .tl-title{font-size:15px;font-weight:700;color:var(--ink);margin-bottom:6px;}
        .tl-desc{font-size:13px;color:var(--ink2);line-height:1.6;}

        /* SKILLS */
        .skills-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;}
        .skill-card{padding:20px;background:var(--bg2);border:1px solid var(--bd);border-radius:16px;animation:up 0.5s ease both;transition:transform 0.2s,box-shadow 0.2s;}
        .skill-card:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(0,0,0,0.1);}
        .skill-cat{font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--ink3);margin-bottom:8px;}
        .skill-name{font-size:17px;font-weight:700;color:var(--ink);margin-bottom:14px;}
        .skill-bar-bg{height:4px;background:var(--bd);border-radius:4px;overflow:hidden;}
        .skill-bar-fill{height:100%;background:var(--acc);border-radius:4px;}
        .skill-pct{font-size:11px;font-weight:600;color:var(--ink3);margin-top:6px;text-align:right;}

        /* GOALS */
        .goals-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
        .goal-card{padding:28px;background:var(--bg2);border:1px solid var(--bd);border-radius:20px;transition:transform 0.2s,box-shadow 0.2s;animation:up 0.5s ease both;}
        .goal-card:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(0,0,0,0.1);}
        .goal-icon{font-size:28px;margin-bottom:16px;}
        .goal-title{font-size:16px;font-weight:700;color:var(--ink);margin-bottom:16px;}
        .goal-items{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px;}
        .goal-item{display:flex;align-items:flex-start;gap:10px;font-size:13px;color:var(--ink2);line-height:1.5;}
        .goal-item::before{content:'→';color:var(--acc);font-weight:700;flex-shrink:0;margin-top:1px;}

        /* PROJECTS */
        .proj-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:24px;}
        .proj-card{background:var(--bg2);border:1px solid var(--bd);border-radius:20px;overflow:hidden;animation:up 0.5s ease both;transition:transform 0.3s,box-shadow 0.3s;}
        .proj-card:hover{transform:translateY(-6px);box-shadow:0 24px 48px rgba(0,0,0,0.12);}
        .proj-thumb{aspect-ratio:16/9;overflow:hidden;background:var(--bg);position:relative;}
        .proj-thumb img{width:100%;height:100%;object-fit:cover;transition:transform 0.5s;}
        .proj-card:hover .proj-thumb img{transform:scale(1.06);}
        .proj-thumb-empty{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-family:'Fraunces',serif;font-size:48px;font-weight:900;color:var(--bd);}
        .proj-body{padding:22px;}
        .proj-title{font-size:17px;font-weight:700;color:var(--ink);margin-bottom:8px;}
        .proj-desc{font-size:13px;color:var(--ink2);line-height:1.6;margin-bottom:16px;}
        .proj-stack{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:18px;}
        .proj-chip{padding:4px 12px;background:var(--bg);border:1px solid var(--bd);border-radius:100px;font-size:11px;font-weight:700;color:var(--ink3);}
        .proj-links{display:flex;gap:10px;}
        .proj-link{
          display:flex;align-items:center;gap:6px;
          padding:8px 16px;border-radius:100px;font-size:12px;font-weight:700;
          text-decoration:none;transition:all 0.2s;
        }
        .proj-link.gh{background:var(--ink);color:var(--bg);}
        .proj-link.gh:hover{opacity:0.8;}
        .proj-link.demo{background:var(--acc);color:#0d0d0d;}
        .proj-link.demo:hover{opacity:0.85;}

        /* CERTS */
        .cert-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:20px;}
        .cert-card{background:var(--bg2);border:1px solid var(--bd);border-radius:20px;overflow:hidden;cursor:pointer;transition:transform 0.3s,box-shadow 0.3s;animation:up 0.5s ease both;}
        .cert-card:hover{transform:translateY(-6px);box-shadow:0 20px 40px rgba(0,0,0,0.12);}
        .cert-img{overflow:hidden;aspect-ratio:16/10;}
        .cert-img img{width:100%;height:100%;object-fit:cover;transition:transform 0.5s;}
        .cert-card:hover .cert-img img{transform:scale(1.07);}
        .cert-info{padding:16px 20px;display:flex;align-items:center;justify-content:space-between;}
        .cert-info-t p{font-size:14px;font-weight:700;color:var(--ink);margin:0 0 2px;}
        .cert-info-t span{font-size:12px;color:var(--ink2);}
        .cert-arr{width:32px;height:32px;border-radius:50%;background:var(--ink);color:var(--bg);display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;transition:transform 0.25s;}
        .cert-card:hover .cert-arr{transform:rotate(45deg);}
        .cert-empty,.proj-empty{grid-column:1/-1;padding:80px;text-align:center;border:1px dashed var(--bd);border-radius:20px;color:var(--ink2);font-size:14px;}

        /* CERT MODAL */
        .modal-overlay{
          position:fixed;inset:0;background:rgba(0,0,0,0.88);
          z-index:1000;display:flex;align-items:center;justify-content:center;
          padding:32px;animation:fadeIn 0.2s ease;
        }
        .modal-box{
          display:flex;width:100%;max-width:1000px;max-height:90vh;
          border-radius:24px;overflow:hidden;
          animation:zoom 0.3s ease;
          box-shadow:0 40px 80px rgba(0,0,0,0.6);
        }
        .modal-img-side{
          flex:1;min-height:400px;
          background:#000;
          display:flex;align-items:center;justify-content:center;
          overflow:hidden;
        }
        .modal-img-side img{width:100%;height:100%;object-fit:contain;}
        .modal-info-side{
          width:280px;flex-shrink:0;
          background:var(--bg2);
          padding:36px 28px;
          display:flex;flex-direction:column;
          position:relative;
          border-left:1px solid var(--bd);
        }
        .modal-notepad-lines{
          position:absolute;inset:0;
          background-image:repeating-linear-gradient(
            transparent,transparent 31px,var(--bd) 31px,var(--bd) 32px
          );
          background-position:0 56px;
          pointer-events:none;
          opacity:0.5;
        }
        .modal-close{
          position:absolute;top:16px;right:16px;
          width:32px;height:32px;border-radius:50%;
          background:var(--bg);border:1px solid var(--bd);
          color:var(--ink2);font-size:14px;
          display:flex;align-items:center;justify-content:center;
          transition:all 0.2s;z-index:1;
        }
        .modal-close:hover{background:var(--ink);color:var(--bg);}
        .modal-note-label{
          font-size:10px;font-weight:700;text-transform:uppercase;
          letter-spacing:0.15em;color:var(--ink3);margin-bottom:6px;
          position:relative;z-index:1;
        }
        .modal-note-title{
          font-family:'Fraunces',serif;font-size:20px;font-weight:900;
          color:var(--ink);line-height:1.2;margin-bottom:24px;
          position:relative;z-index:1;
        }
        .modal-note-item{margin-bottom:20px;position:relative;z-index:1;}
        .modal-note-key{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:var(--acc);margin-bottom:4px;}
        .modal-note-val{font-size:14px;font-weight:600;color:var(--ink2);}
        .modal-note-divider{height:1px;background:var(--bd);margin:20px 0;position:relative;z-index:1;}
        .modal-acc-bar{
          margin-top:auto;padding:12px 16px;
          background:var(--acc);border-radius:12px;
          font-size:12px;font-weight:700;color:#0d0d0d;
          text-align:center;position:relative;z-index:1;
        }

        /* CONTACT */
        .contact-grid{display:grid;grid-template-columns:1fr 1fr;gap:80px;}
        .form-g{margin-bottom:14px;}
        .form-l{display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--ink2);margin-bottom:8px;}
        .form-i,.form-t{width:100%;padding:15px 18px;background:var(--bg2);border:1px solid var(--bd);color:var(--ink);border-radius:14px;font-family:inherit;font-size:15px;outline:none;transition:border-color 0.2s,box-shadow 0.2s;}
        .form-i::placeholder,.form-t::placeholder{color:var(--ink3);}
        .form-i:focus,.form-t:focus{border-color:var(--ink);box-shadow:0 0 0 3px var(--acc-bg);}
        .form-t{height:160px;resize:none;}
        .form-btn{width:100%;padding:16px;background:var(--ink);color:var(--bg);border:none;border-radius:14px;font-family:inherit;font-size:14px;font-weight:700;letter-spacing:0.04em;transition:all 0.2s;margin-top:4px;}
        .form-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.15);}
        .form-btn:disabled{opacity:0.6;}
        .submit-ok{display:flex;align-items:center;gap:8px;padding:14px 18px;border-radius:12px;background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.2);color:#16a34a;font-size:13px;font-weight:600;margin-top:12px;animation:up 0.3s ease;}
        .comments-hd{display:flex;align-items:baseline;gap:10px;margin-bottom:20px;}
        .comments-n{font-family:'Fraunces',serif;font-size:36px;font-weight:900;color:var(--ink);line-height:1;}
        .comments-lb{font-size:12px;font-weight:600;color:var(--ink2);}
        .comments-list{max-height:520px;overflow-y:auto;display:flex;flex-direction:column;gap:10px;}
        .comment-card{padding:18px 20px;background:var(--bg2);border:1px solid var(--bd);border-radius:16px;animation:up 0.3s ease;}
        .comment-name{font-size:14px;font-weight:700;color:var(--ink);margin-bottom:6px;display:flex;align-items:center;gap:10px;}
        .comment-name::after{content:'';flex:1;height:1px;background:var(--bd);}
        .comment-msg{font-size:14px;color:var(--ink2);line-height:1.6;margin-bottom:10px;}
        .comment-dt{font-size:11px;font-weight:600;color:var(--ink3);text-transform:uppercase;letter-spacing:0.08em;}
        .comments-empty{padding:40px;text-align:center;color:var(--ink2);font-size:14px;}

        /* SCROLLBAR */
        .custom-scrollbar::-webkit-scrollbar{width:4px;}
        .custom-scrollbar::-webkit-scrollbar-track{background:transparent;}
        .custom-scrollbar::-webkit-scrollbar-thumb{background:var(--ink3);border-radius:4px;}
        .custom-scrollbar{scrollbar-width:thin;scrollbar-color:var(--ink3) transparent;}

        /* FOOTER */
        .footer{padding:44px 0;border-top:1px solid var(--bd);}
        .footer-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;}
        .footer-logo{font-family:'Fraunces',serif;font-size:20px;font-weight:900;color:var(--ink);}
        .footer-logo em{font-style:normal;color:var(--acc);}
        .footer-bottom{display:flex;align-items:center;justify-content:space-between;padding-top:20px;border-top:1px solid var(--bd);}
        .footer-copy{font-size:13px;font-weight:500;color:var(--ink2);}
        .footer-views{
          display:flex;align-items:center;gap:10px;
          padding:10px 20px;
          background:var(--bg2);border:1px solid var(--bd);border-radius:100px;
        }
        .footer-views-dot{width:7px;height:7px;border-radius:50%;background:var(--acc);animation:blink 2s ease infinite;flex-shrink:0;}
        .footer-views-text{font-size:13px;font-weight:600;color:var(--ink2);}
        .footer-views-num{font-family:'Fraunces',serif;font-size:15px;font-weight:900;color:var(--ink);}
        .footer-views-suffix{font-size:13px;font-weight:600;color:var(--ink2);}

        /* MUSIC */
        .music-btn{position:fixed;bottom:32px;right:32px;z-index:100;width:56px;height:56px;border-radius:50%;background:var(--ink);color:var(--bg);border:none;font-size:18px;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(0,0,0,0.25);transition:transform 0.2s;}
        .music-btn:hover{transform:scale(1.1);}
        .music-btn.playing{animation:spin 8s linear infinite;}

        /* ANIMATIONS */
        @keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
        @keyframes up{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
        @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
        @keyframes zoom{from{transform:scale(0.93);opacity:0;}to{transform:scale(1);opacity:1;}}

        /* RESPONSIVE TABLET */
        @media(max-width:900px){
          .wrap{padding:0 24px;}
          .nav-in{padding:0 24px;}
          .nav-links{display:none;}
          .hero{grid-template-columns:1fr;padding-top:96px;gap:40px;}
          .hero-photo-wrap{height:260px;order:-1;width:100%;}
          .hero-p{max-width:100%;}
          .stats{grid-template-columns:1fr 1fr;}
          .stat:nth-child(2){border-right:none;}
          .stat:nth-child(3){border-top:1px solid var(--bd);}
          .stat:nth-child(4){border-top:1px solid var(--bd);border-right:none;}
          .about-grid{grid-template-columns:1fr;gap:48px;}
          .skills-grid{grid-template-columns:1fr 1fr;}
          .goals-grid{grid-template-columns:1fr 1fr;}
          .contact-grid{grid-template-columns:1fr;gap:40px;}
          .sec-num{display:none;}
          .modal-box{flex-direction:column;max-height:95vh;overflow-y:auto;}
          .modal-info-side{width:100%;border-left:none;border-top:1px solid var(--bd);min-height:auto;}
          .modal-img-side{min-height:240px;flex:none;}
          .social-strip{overflow-x:auto;flex-wrap:nowrap;padding-bottom:8px;}
          .social-strip::-webkit-scrollbar{height:0;}
          .footer{flex-direction:column;gap:16px;text-align:center;}
          .footer-views{justify-content:center;}
        }

        /* RESPONSIVE MOBILE */
        @media(max-width:600px){
          .wrap{padding:0 16px;}
          .nav-in{padding:0 16px;}
          .nav-right{gap:6px;}
          .btn-theme{padding:6px 12px;font-size:11px;}
          .btn-admin{padding:6px 12px;font-size:11px;}

          .hero{padding-top:88px;padding-bottom:52px;gap:32px;}
          .hero-photo-wrap{height:220px;}
          .hero-h1{font-size:42px;}
          .hero-p{font-size:15px;}
          .hero-btns{gap:10px;}
          .btn-dark{padding:12px 20px;font-size:13px;}
          .btn-acc{padding:11px 16px;font-size:13px;}

          .stats{grid-template-columns:1fr 1fr;}
          .stat{padding:28px 0;}
          .stat-n{font-size:32px;}

          .social-strip{padding:20px 0;overflow-x:auto;flex-wrap:nowrap;}
          .social-label{display:none;}

          .sec{padding:56px 0;}
          .sec-head{margin-bottom:36px;}
          .sec-title{font-size:28px;}

          .about-text{font-size:15px;}
          .about-grid{gap:36px;}

          .skills-grid{grid-template-columns:1fr 1fr;gap:12px;}
          .skill-card{padding:16px;}
          .skill-name{font-size:15px;}

          .goals-grid{grid-template-columns:1fr;gap:16px;}
          .goal-card{padding:22px;}

          .proj-grid{grid-template-columns:1fr;}
          .cert-grid{grid-template-columns:1fr;}

          .contact-grid{gap:36px;}
          .comments-list{max-height:360px;}

          .modal-overlay{padding:16px;}
          .modal-box{border-radius:16px;}
          .modal-img-side{min-height:180px;}
          .modal-info-side{padding:24px 20px;}
          .modal-note-title{font-size:17px;}

          .music-btn{bottom:20px;right:20px;width:48px;height:48px;font-size:16px;}

          .footer{padding:36px 0;gap:12px;}
          .footer-logo{font-size:18px;}
          .footer-bottom{flex-direction:column;gap:10px;text-align:center;}

          .cert-empty,.proj-empty{padding:48px 24px;}
        }
      `}</style>

      <div className={`rw${d ? ' dark' : ''}`}>

        {/* NAV */}
        <nav className="nav">
          <div className="nav-in">
            <a href="#" className="logo"><em>A.</em></a>
            <ul className="nav-links">
              <li><a href="#">Beranda</a></li>
              <li><a href="#about">Tentang</a></li>
              <li><a href="#skills">Skills</a></li>
              <li><a href="#projects">Proyek</a></li>
              <li><a href="#portfolio">Sertifikat</a></li>
              <li><a href="#contact">Kontak</a></li>
            </ul>
            <div className="nav-right">
              <button className="btn-theme" onClick={() => setIsDark(!d)}>
                {d ? '☀ Light' : '🌙 Dark'}
              </button>
              <a href="/admin" className="btn-admin">⚙ Admin</a>
            </div>
          </div>
        </nav>

        {/* HERO */}
        <section className="wrap hero">
          <div>
            <div className="hero-tag"><span className="hero-dot" />Pelajar &amp; IT Student</div>
            <h1 className="hero-h1">Alo, Saya<br />Aura <em>Auvarose</em></h1>
            <p className="hero-p">Belajar dari awal sampai akhir, Berhenti menunggu mood yang tepat untuk bergerak. Kamu punya mimpi besar di dunia teknologi, tapi mimpi itu tidak akan terwujud kalau kamu terus memanjakan rasa malas dan pola tidur yang berantakan.</p>
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

        {/* STATS */}
        <div style={{borderBottom:'1px solid var(--bd)'}}>
          <div className="wrap" id="about" style={{padding:0}}>
            <div className="stats">
              {[{n:'0+',l:'Proyek Selesai'},{n:views||0,l:'Pengunjung'},{n:'2+',l:'Tahun Belajar'},{n:'0',l:'IPK Rata-rata'}].map((s,i)=>(
                <div key={i} className="stat" style={{animationDelay:`${i*0.08}s`}}>
                  <div className="stat-n">{s.n}</div><div className="stat-l">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SOCIAL STRIP */}
        <div className="wrap social-strip">
          <span className="social-label">Temukan Saya</span>
          {socials.map(s => (
            <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" className="social-btn">
              <span className="social-icon">{s.icon}</span>
              <span>{s.name}</span>
              <span className="social-handle">{s.handle}</span>
            </a>
          ))}
        </div>

        {/* ABOUT + HISTORY */}
        <section className="wrap sec">
          <div className="sec-head">
            <div><p className="eyebrow">Tentang Saya</p><h2 className="sec-title">Cerita &<br />Perjalanan</h2></div>
          </div>
          <div className="about-grid">
            <div>
              <div className="about-text">
                <p>Hai! Saya <strong>Aura Auvarose</strong>, Hai! Saya Aura Auvarose, seorang mahasiswa Informatika semester 1 yang sedang meniti jalan di dunia teknologi. Perjalanan saya bukan tentang kemudahan, melainkan tentang ketekunan di tengah keterbatasan..</p>
                <p>Saat ini, saya sedang aktif mendalami Fedora Linux dan membangun portofolio pribadi sebagai bukti nyata perkembangan saya. Saya tidak takut pada kehadiran AI; bagi saya, AI adalah rekan untuk mempercepat proses belajar, bukan pengganti kreativitas. Fokus saya saat ini adalah menguasai logika pemrograman yang kuat dan terus konsisten belajar setiap malam (meskipun itu artinya saya sering begadang!) demi mencapai level profesional.</p>
              </div>
              <div className="about-tags">
                {['Node.js','PostgreSQL','Docker','REST API','Git','Next.js','Python','Supabase'].map(t=>(
                  <span key={t} className="about-tag">{t}</span>
                ))}
              </div>
            </div>
            <div>
              <div className="eyebrow" style={{marginBottom:'24px'}}>Timeline</div>
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
          <div className="sec-head">
            <div><p className="eyebrow">Kemampuan</p><h2 className="sec-title">Tech<br />Stack</h2></div>
            <span className="sec-num">0{skills.length}</span>
          </div>
          <div className="skills-grid">
            {skills.map((sk,i)=>(
              <div key={sk.name} className="skill-card" style={{animationDelay:`${i*0.06}s`}}>
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
          <div className="sec-head">
            <div><p className="eyebrow">Tujuan & Visi</p><h2 className="sec-title">Goals &<br />Aspirasi</h2></div>
          </div>
          <div className="goals-grid">
            {goals.map((g,i)=>(
              <div key={g.title} className="goal-card" style={{animationDelay:`${i*0.1}s`}}>
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
          <div className="sec-head">
            <div><p className="eyebrow">Karya Saya</p><h2 className="sec-title">Proyek</h2></div>
            <span className="sec-num">0{projects.length}</span>
          </div>
          <div className="proj-grid">
            {projects.length === 0 ? (
              <div className="proj-empty">Belum ada proyek. Tambahkan lewat panel Admin.</div>
            ) : (
              projects.map((p,i)=>{
                const stack = p.tech_stack ? p.tech_stack.split(',').map(s=>s.trim()) : [];
                return (
                  <div key={p.id} className="proj-card" style={{animationDelay:`${i*0.07}s`}}>
                    <div className="proj-thumb">
                      {p.image_url
                        ? <img src={p.image_url} alt={p.title} />
                        : <div className="proj-thumb-empty">{p.title ? p.title[0] : '?'}</div>
                      }
                    </div>
                    <div className="proj-body">
                      <div className="proj-title">{p.title}</div>
                      <div className="proj-desc">{p.description}</div>
                      {stack.length > 0 && (
                        <div className="proj-stack">
                          {stack.map(s=><span key={s} className="proj-chip">{s}</span>)}
                        </div>
                      )}
                      <div className="proj-links">
                        {p.github_url && <a href={p.github_url} target="_blank" rel="noopener noreferrer" className="proj-link gh">⬡ GitHub</a>}
                        {p.demo_url && <a href={p.demo_url} target="_blank" rel="noopener noreferrer" className="proj-link demo">↗ Demo</a>}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* CERTIFICATES */}
        <section className="wrap sec" id="portfolio">
          <div className="sec-head">
            <div><p className="eyebrow">Pencapaian</p><h2 className="sec-title"><br />Sertifikat</h2></div>
            <span className="sec-num">0{certificates.length}</span>
          </div>
          <div className="cert-grid">
            {certificates.length === 0 ? (
              <div className="cert-empty">Belum ada sertifikat. Tambahkan lewat panel Admin.</div>
            ) : (
              certificates.map((cert,i)=>(
                <div key={cert.id} className="cert-card" onClick={()=>setSelectedCert(cert)} style={{animationDelay:`${i*0.07}s`}}>
                  <div className="cert-img"><img src={cert.image_url} alt="Sertifikat" /></div>
                  <div className="cert-info">
                    <div className="cert-info-t">
                      <p>{cert.title || 'Sertifikat Kompetensi'}</p>
                      <span>{cert.issuer || 'Klik untuk lihat detail'}</span>
                    </div>
                    <div className="cert-arr">↗</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* CONTACT */}
        <section className="wrap sec" id="contact">
          <div className="sec-head">
            <div><p className="eyebrow">Buku Tamu</p><h2 className="sec-title">Tinggalkan<br />Pesan</h2></div>
          </div>
          <div className="contact-grid">
            <div>
              <form onSubmit={submitComment}>
                <div className="form-g"><label className="form-l">Nama Lengkap</label><input type="text" placeholder="Masukkan nama kamu..." value={nameInput} onChange={e=>setNameInput(e.target.value)} className="form-i" required /></div>
                <div className="form-g"><label className="form-l">Pesan</label><textarea placeholder="Tulis pesanmu di sini..." value={messageInput} onChange={e=>setMessageInput(e.target.value)} className="form-t" required /></div>
                <button type="submit" className="form-btn" disabled={isSubmitting}>{isSubmitting?'Mengirim...':'Kirim Pesan →'}</button>
              </form>
              {submitDone && <div className="submit-ok">✓ Pesan terkirim! Terima kasih sudah mampir.</div>}
            </div>
            <div>
              <div className="comments-hd">
                <span className="comments-n">{comments.length}</span>
                <span className="comments-lb">Pesan Masuk</span>
              </div>
              <div className="comments-list custom-scrollbar">
                {comments.length === 0
                  ? <div className="comments-empty">Belum ada pesan. Jadilah yang pertama! 👋</div>
                  : comments.map(c=>(
                    <div key={c.id} className="comment-card">
                      <p className="comment-name">{c.name}</p>
                      <p className="comment-msg">{c.message}</p>
                      <p className="comment-dt">{new Date(c.created_at).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})}</p>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        </section>

        <footer className="wrap footer">
          <div className="footer-top">
            <div className="footer-logo">aura<em></em>auvarose</div>
            <div className="footer-views">
              <span className="footer-views-dot" />
              <span className="footer-views-text">Website ini telah dibuka</span>
              <span className="footer-views-num">{views || 0}</span>
              <span className="footer-views-suffix">kali</span>
            </div>
          </div>
          <div className="footer-bottom">
            <p className="footer-copy">© 2026 auraauvarose</p>
            <p className="footer-copy">Made with Next.js &amp; Supabase</p>
          </div>
        </footer>

        {/* CERT MODAL WITH NOTEPAD */}
        {selectedCert && (
          <div className="modal-overlay" onClick={()=>setSelectedCert(null)}>
            <div className="modal-box" onClick={e=>e.stopPropagation()}>
              <div className="modal-img-side">
                <img src={selectedCert.image_url} alt="Sertifikat" />
              </div>
              <div className="modal-info-side">
                <div className="modal-notepad-lines" />
                <button className="modal-close" onClick={()=>setSelectedCert(null)}>✕</button>
                <p className="modal-note-label">Catatan Sertifikat</p>
                <h3 className="modal-note-title">{selectedCert.title || 'Sertifikat Kompetensi'}</h3>
                <div className="modal-note-divider" />
                <div className="modal-note-item">
                  <div className="modal-note-key">Diterbitkan Oleh</div>
                  <div className="modal-note-val">{selectedCert.issuer || '—'}</div>
                </div>
                <div className="modal-note-item">
                  <div className="modal-note-key">Tanggal Ditambahkan</div>
                  <div className="modal-note-val">
                    {selectedCert.created_at
                      ? new Date(selectedCert.created_at).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})
                      : '—'
                    }
                  </div>
                </div>
                <div className="modal-note-divider" />
                <div className="modal-acc-bar">Sertifikat Terverifikasi ✓</div>
              </div>
            </div>
          </div>
        )}

        {/* MUSIC */}
        <audio ref={audioRef} loop>
          <source src="https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3" type="audio/mpeg" />
        </audio>
        <button onClick={toggleMusic} className={`music-btn${isPlaying?' playing':''}`} title={isPlaying?'Pause':'Play'}>
          {isPlaying?'♪':'▶'}
        </button>
      </div>
    </>
  );
}