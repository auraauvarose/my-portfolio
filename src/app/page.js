"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FadeIn,
  ScaleIn,
  SlideIn,
  StaggerContainer,
  StaggerItem,
  ScrollReveal,
  FloatingElement,
  BounceIn,
} from '@/components/animations/ScrollReveal';
import BackgroundCanvas from '@/components/animations/BackgroundCanvas';

// ── Gemini Logo SVG Component ──
function GeminiLogo({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" style={{flexShrink:0}}>
      <path d="M14 28C14 26.0633 13.6267 24.2433 12.88 22.54C12.1567 20.8367 11.165 19.355 9.905 18.095C8.645 16.835 7.16333 15.8433 5.46 15.12C3.75667 14.3733 1.93667 14 0 14C1.93667 14 3.75667 13.6383 5.46 12.915C7.16333 12.1683 8.645 11.165 9.905 9.905C11.165 8.645 12.1567 7.16333 12.88 5.46C13.6267 3.75667 14 1.93667 14 0C14 1.93667 14.3617 3.75667 15.085 5.46C15.8317 7.16333 16.835 8.645 18.095 9.905C19.355 11.165 20.8367 12.1683 22.54 12.915C24.2433 13.6383 26.0633 14 28 14C26.0633 14 24.2433 14.3733 22.54 15.12C20.8367 15.8433 19.355 16.835 18.095 18.095C16.835 19.355 15.8317 20.8367 15.085 22.54C14.3617 24.2433 14 26.0633 14 28Z" fill="currentColor"/>
    </svg>
  );
}

export default function Home() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('default_theme');
      if (saved) return saved === 'dark';
    }
    return true;
  });
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
  const [mounted, setMounted] = useState(false);
  const [ripple, setRipple] = useState(null);
  const [profileImage, setProfileImage] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('profile_image') || '';
    }
    return '';
  });
  const [ecoMode, setEcoMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const local = localStorage.getItem('eco_mode');
      if (local !== null) return local === 'true';
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      return isMobile;
    }
    return false;
  });
  const [sandboxCode, setSandboxCode] = useState(() => {
    return `<div class="card-wrap">
  <div class="glow-box">Aura Auvarose</div>
</div>

<style>
  body {
    background: #0d0d12;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 150px;
    margin: 0;
    font-family: sans-serif;
  }
  .card-wrap {
    padding: 2px;
    background: linear-gradient(135deg, var(--theme-color, #d4eb00) 0%, #1e1e24 100%);
    border-radius: 12px;
  }
  .glow-box {
    padding: 16px 28px;
    background: #15151a;
    color: #ffffff;
    font-weight: 800;
    text-align: center;
    border-radius: 10px;
    font-size: 14px;
    letter-spacing: 0.05em;
    box-shadow: 0 10px 25px rgba(0,0,0,0.4);
    animation: bouncePulse 2s infinite ease-in-out;
  }
  @keyframes bouncePulse {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }
</style>`;
  });
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
  const [certActiveIdx, setCertActiveIdx] = useState(0);
  const [certPage, setCertPage] = useState(0);
  const [projActiveIdx, setProjActiveIdx] = useState(0);
  const [galleryActiveIdx, setGalleryActiveIdx] = useState(0);
  const [photoForm, setPhotoForm] = useState({ name:'', caption:'' });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoSubmitDone, setPhotoSubmitDone] = useState(false);
  const [photoSubmitting, setPhotoSubmitting] = useState(false);
  const [devHubActiveTab, setDevHubActiveTab] = useState('status');
  const [ghCommits, setGhCommits] = useState([]);
  const [termOpen, setTermOpen] = useState(false);
  const [matrixActive, setMatrixActive] = useState(false);
  const [termLines, setTermLines] = useState([
    { type: 'output', text: "Welcome to Arch Workstation inside Aura's Portfolio!\nType \"help\" for a list of available commands." }
  ]);
  const [termInput, setTermInput] = useState('');
  const termEndRef = useRef(null);
  const [themeColor, setThemeColor] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme_color') || '#d4eb00';
    }
    return '#d4eb00';
  });
  const [bgTheme, setBgTheme]       = useState(() => {
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
  const [musicUrl, setMusicUrl]     = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('music_url') || 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3';
    }
    return 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3';
  });

  // ── NEW STATES ──
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bgAnimation, setBgAnimation] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('bg_animation') || 'constellation';
    }
    return 'constellation';
  });
  const [loveParticles, setLoveParticles] = useState([]);
  const [defaultThemeMode, setDefaultThemeMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('default_theme') || 'dark';
    }
    return 'dark';
  });
  const [isMobile, setIsMobile] = useState(false);
  const [activeSkill, setActiveSkill] = useState(null);
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadText, setLoadText] = useState('Inisialisasi Portofolio...');

  const audioRef = useRef(null);
  const themeBtnRef = useRef(null);
  const aiEndRef = useRef(null);
  const certGridRef = useRef(null);
  const projGridRef = useRef(null);
  const galleryGridRef = useRef(null);
  const bgCanvasRef = useRef(null);
  const bgAnimRef = useRef(null);
  const socialTrackRef = useRef(null);
  const gallerAutoRef = useRef(null);

  const d = isDark;
  const isID = lang === 'id';

  // ── THEME DATA ──
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
    pumpkin_charcoal:   { darkBg:'#233D4C', darkBg2:'#1a2e39', lightBg:'#FFF0E6',  lightBg2:'#ffe0cc' },
    honey_black:        { darkBg:'#171717', darkBg2:'#202020', lightBg:'#E3C586',  lightBg2:'#d4b06a' },
    periwinkle_violet:  { darkBg:'#544470', darkBg2:'#3e3354', lightBg:'#DBD5F2',  lightBg2:'#ccc4eb' },
    cyberpunk:          { darkBg:'#0b0914', darkBg2:'#151226', lightBg:'#fff0fa',  lightBg2:'#ffe3f4' },
    nordic:             { darkBg:'#0b1016', darkBg2:'#141b25', lightBg:'#f0f5fa',  lightBg2:'#e1ecf5' },
    matcha:             { darkBg:'#0e150f', darkBg2:'#18231a', lightBg:'#f4f8f4',  lightBg2:'#e5efe5' },
    dracula:            { darkBg:'#13141f', darkBg2:'#1a1c2c', lightBg:'#f2f3f9',  lightBg2:'#e2e5f3' },
    sakura:             { darkBg:'#1a0f14', darkBg2:'#28161f', lightBg:'#fff3f6',  lightBg2:'#ffe3eb' },
  };
  const FONTS = {
    fraunces:  { heading:"'Fraunces',serif",           body:"'Plus Jakarta Sans',sans-serif" },
    playfair:  { heading:"'Playfair Display',serif",   body:"'Inter',sans-serif" },
    space:     { heading:"'Space Grotesk',sans-serif", body:"'Space Grotesk',sans-serif" },
    syne:      { heading:"'Syne',sans-serif",           body:"'DM Sans',sans-serif" },
    cormorant: { heading:"'Cormorant Garamond',serif",  body:"'Lato',sans-serif" },
    sugo:      { heading:"'Bebas Neue',sans-serif",            body:"'Inter',sans-serif" },
    wildcat:   { heading:"'Teko',sans-serif",                  body:"'Nunito',sans-serif" },
    sugarpie:  { heading:"'Pacifico',cursive",                 body:"'Plus Jakarta Sans',sans-serif" },
    tan:       { heading:"'Libre Caslon Display',serif",       body:"'Libre Caslon Text',serif" },
    
    // font untuk hal lain semisal error
    error:     { heading:"'Roboto Mono',monospace", body:"'Roboto Mono',monospace" },
    





  };
  const curBg   = BG_THEMES[bgTheme]   || BG_THEMES.default; // fallback ke default kalau bgTheme gak ketemu
  const curFont = FONTS[fontChoice]     || FONTS.fraunces;
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
      const color = d ? curBg.lightBg : curBg.darkBg;
      setRipple({ x, y, key: Date.now(), color });
      setTimeout(() => setRipple(null), 700);
    }
    setIsDark(prev => !prev);
  };



  const handleTermCommand = (input) => {
    const cmd = input.trim().toLowerCase();
    if (!cmd) return;
    
    setTermLines(prev => [...prev, { type: 'input', text: `[aura@Arch ~]$ ${input}` }]);
    setTermInput('');
    
    let outputText = '';
    
    switch (cmd) {
      case 'help':
        outputText = 'Available commands:\n  help      - Show this help message\n  neofetch  - Display system info in retro Arch workstation style\n  skills    - List tech stack and programming skills\n  projects  - Show highlighted software engineering projects\n  matrix    - Toggle green full-screen falling digital rain\n  clear     - Clear the terminal console screen\n  theme     - View current theme & customization settings\n  time      - Display current localized system time\n  exit      - Close this interactive terminal console';
        break;
      case 'clear':
        setTermLines([]);
        return;
      case 'exit':
      case 'close':
        setTermOpen(false);
        return;
      case 'neofetch':
        outputText = `       ,---.\n      /     \\\n      | () () |  OS: Arch Linux (x86_64)\n       \\  ^  /   Host: Aura's Dev Box\n        |||||    Kernel: 6.8.9-Arch\n                 Uptime: 2 days, 4 hours\n                 Shell: Bash on JetBrains Mono\n                 DE: GNOME 46\n                 Accent Color: ${themeColor}\n                 Font: ${fontChoice}\n                 CPU: AMD Ryzen 9 7940HS (16) @ 4.0GHz\n                 GPU: NVIDIA RTX 4070 Mobile\n                 Memory: 16.2 GB / 32.0 GB`;
        break;
      case 'skills':
        outputText = '-- Aura\'s Full Stack & Creative Technologies --\n\n🎨 FRONTEND: HTML5, CSS3, JavaScript (ES6+), React.js, Next.js (App Router), Framer Motion, Vanilla CSS\n💻 BACKEND: Node.js, Express, Supabase (PostgreSQL), RESTful APIs, Secure Database Architecture\n⚙️ TOOLS & DEV: Git & GitHub, Linux (Arch Workstation, GNOME, Bash CLI), Docker, Webpack, Figma';
        break;
      case 'projects':
        outputText = '-- Outstanding Developer Showcases --\n\n🌟 1. Aura\'s Premium Developer Portfolio & Dynamic Dashboard\n🌐 2. Retro Arcade Hub (Featuring Canvas-based Tetris, Snake & Memory Matrix)\n📷 3. Secure Drag & Drop Photo Gallery Upload Center';
        break;
      case 'matrix':
        setMatrixActive(prev => !prev);
        outputText = !matrixActive 
          ? 'INITIALIZING DYNAMIC GREEN MATRIX CODES... DRAIN ACTIVATED! [Close terminal or type "matrix" to exit]'
          : 'TERMINATING MATRIX CODES... RETURNING TO NORMAL SPACETIME CONTINUUM.';
        break;
      case 'theme':
        outputText = `🎨 DYNAMIC DESIGN SYSTEM CUSTOMIZATION:\n-------------------------------------\nAccent Color : ${themeColor}\nFont Family  : ${fontChoice}\nBG Palette   : ${bgTheme}`;
        break;
      case 'time':
        outputText = `🕒 Localized Server Time:\n-------------------------\n${new Date().toString()}`;
        break;
      default:
        outputText = `bash: command not found: ${input}. Type "help" for a list of available commands.`;
    }
    
    setTermLines(prev => [...prev, { type: 'output', text: outputText }]);
  };

  useEffect(() => {
    if (termOpen) {
      termEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [termLines, termOpen]);

  useEffect(() => {
    if (!matrixActive) return;
    const canvas = document.getElementById('matrix-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationFrameId;
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズヅブプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const alphabet = katakana.split('');
    
    const fontSize = 16;
    const columns = Math.ceil(canvas.width / fontSize);
    
    const rainDrops = Array(columns).fill(1);
    
    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = themeColor || '#27c93f';
      ctx.font = fontSize + 'px monospace';
      
      for (let i = 0; i < rainDrops.length; i++) {
        const text = alphabet[Math.floor(Math.random() * alphabet.length)];
        ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);
        
        if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          rainDrops[i] = 0;
        }
        rainDrops[i]++;
      }
    };
    
    const interval = setInterval(draw, 30);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [matrixActive, themeColor]);

  useEffect(() => {
    if (!pageReady) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [pageReady]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  const aboutRef = useRef(null);
  useEffect(() => {
    if (!aboutVisible) return;
    const p1 = isID
      ? 'Hai! Saya Aura Auvarose, seorang mahasiswa Informatika semester 1 yang sedang meniti jalan di dunia teknologi. Perjalanan saya bukan tentang kemudahan, melainkan tentang ketekunan di tengah keterbatasan.'
      : "Hi! I'm Aura Auvarose, a first-semester Informatics student carving my path in the tech world. My journey isn't about ease — it's about persistence through limitations.";
    const p2 = isID
      ? 'Saat ini, saya sedang aktif mendalami Arch Linux dan membangun portofolio pribadi sebagai bukti nyata perkembangan saya. Fokus saya saat ini adalah menguasai logika pemrograman yang kuat dan terus konsisten belajar setiap malam demi mencapai level profesional.'
      : "Currently I'm actively exploring Arch Linux and building this personal portfolio as real proof of my growth. My focus is on mastering strong programming logic and staying consistent — learning every night to reach a professional level.";
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

  useEffect(() => {
    document.documentElement.classList.toggle('site-dark', d);
    document.documentElement.style.background = d ? curBg.darkBg : curBg.lightBg;
    document.body.style.margin = '0';
    document.body.style.padding = '0';
  }, [d, bgTheme]);

  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [projects, certificates, pageReady, lang]);

  useEffect(() => {
    if (window.matchMedia('(pointer:coarse)').matches) return;
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
    const el = galleryGridRef.current;
    if (!el) return;
    const total = communityPhotos.length + (profileImage ? 1 : 0);
    if (total <= 1) return;

    let currentIdx = 0;
    let direction = 1;
    let paused = false;

    const getCardW = () => el.scrollWidth / total;

    const autoScroll = () => {
      if (!galleryGridRef.current || paused) return;
      const next = currentIdx + direction;
      if (next >= total) { direction = -1; currentIdx = total - 2; }
      else if (next < 0) { direction = 1; currentIdx = 1; }
      else { currentIdx = next; }
      el.scrollTo({ left: getCardW() * currentIdx, behavior: 'smooth' });
      setGalleryActiveIdx(currentIdx);
    };

    gallerAutoRef.current = setInterval(autoScroll, 2800);

    const onScroll = () => {
      const w = getCardW();
      if (w > 0) setGalleryActiveIdx(Math.round(el.scrollLeft / w));
    };
    el.addEventListener('scroll', onScroll, { passive: true });

    let touchStartX = 0;
    let touchStartScroll = 0;
    const onTouchStart = (e) => {
      paused = true;
      touchStartX = e.touches[0].clientX;
      touchStartScroll = el.scrollLeft;
      clearInterval(gallerAutoRef.current);
    };
    const onTouchMove = (e) => {
      const dx = touchStartX - e.touches[0].clientX;
      el.scrollLeft = touchStartScroll + dx;
    };
    const onTouchEnd = () => {
      const w = getCardW();
      currentIdx = Math.round(el.scrollLeft / w);
      el.scrollTo({ left: w * currentIdx, behavior: 'smooth' });
      setGalleryActiveIdx(currentIdx);
      paused = false;
      gallerAutoRef.current = setInterval(autoScroll, 2800);
    };
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });

    let isDown = false, startX = 0, startScroll = 0;
    const onMouseDown = (e) => {
      isDown = true; paused = true;
      startX = e.pageX; startScroll = el.scrollLeft;
      el.style.cursor = 'grabbing';
      clearInterval(gallerAutoRef.current);
    };
    const onMouseMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      el.scrollLeft = startScroll - (e.pageX - startX);
    };
    const onMouseUp = () => {
      if (!isDown) return;
      isDown = false; el.style.cursor = '';
      const w = getCardW();
      currentIdx = Math.round(el.scrollLeft / w);
      el.scrollTo({ left: w * currentIdx, behavior: 'smooth' });
      setGalleryActiveIdx(currentIdx);
      paused = false;
      gallerAutoRef.current = setInterval(autoScroll, 2800);
    };
    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      clearInterval(gallerAutoRef.current);
      el.removeEventListener('scroll', onScroll);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [communityPhotos, profileImage]);

  useEffect(() => {
    const el = socialTrackRef.current;
    if (!el) return;
    let isDown = false, startX = 0, scrollLeft = 0;
    const parent = el.parentElement;
    const onDown = (e) => { isDown = true; startX = e.pageX - parent.offsetLeft; scrollLeft = parent.scrollLeft; parent.style.cursor = 'grabbing'; el.style.animationPlayState = 'paused'; };
    const onLeave = () => { isDown = false; parent.style.cursor = ''; el.style.animationPlayState = ''; };
    const onUp = () => { isDown = false; parent.style.cursor = ''; el.style.animationPlayState = ''; };
    const onMove = (e) => { if (!isDown) return; e.preventDefault(); const x = e.pageX - parent.offsetLeft; parent.scrollLeft = scrollLeft - (x - startX) * 1.5; };
    parent.addEventListener('mousedown', onDown);
    parent.addEventListener('mouseleave', onLeave);
    parent.addEventListener('mouseup', onUp);
    parent.addEventListener('mousemove', onMove, { passive: false });
    return () => {
      parent.removeEventListener('mousedown', onDown);
      parent.removeEventListener('mouseleave', onLeave);
      parent.removeEventListener('mouseup', onUp);
      parent.removeEventListener('mousemove', onMove);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date().toLocaleTimeString('id-ID')), 1000);
    const loadViews = async () => {
      const { data } = await supabase.from('views').select('count').eq('slug', 'home').single();
      if (data) { const n = data.count + 1; setViews(n); await supabase.from('views').update({ count: n }).eq('slug', 'home'); }
    };

    const logVisitor = async () => {
      try {
        const ua = navigator.userAgent || '';
        let deviceModel = '';
        const androidMatch = ua.match(/Android[\s/][\d.]+;?\s*([^;)]+)/i);
        if (androidMatch) { deviceModel = androidMatch[1].trim().replace(/Build\/.*/i,'').replace(/wv\)/i,'').trim(); }
        const iosMatch = ua.match(/(iPhone|iPad)[^;]*/i);
        if (iosMatch) deviceModel = iosMatch[0].replace(/;.*/,'').trim();
        const winMatch = ua.match(/Windows NT ([\d.]+)/i);
        if (winMatch) { const winVer = {'10.0':'10','6.3':'8.1','6.2':'8','6.1':'7','6.0':'Vista'}[winMatch[1]] || winMatch[1]; deviceModel = 'Windows ' + winVer; }
        const macMatch = ua.match(/Mac OS X ([\d_]+)/i);
        if (macMatch && !iosMatch) deviceModel = 'macOS ' + macMatch[1].replace(/_/g,'.');
        if (!deviceModel && /Linux/i.test(ua) && !/Android/i.test(ua)) deviceModel = 'Linux PC';
        await supabase.from('visitors').insert([{ user_agent: ua, device_model: deviceModel || null, screen_size: `${window.screen.width}x${window.screen.height}`, language: navigator.language || '', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '', referrer: document.referrer || 'direct', visited_at: new Date().toISOString() }]);
      } catch(_) {}
    };
    const loadComments = async () => {
      const { data } = await supabase.from('comments').select('*').order('created_at', { ascending: false });
      if (data) setComments(data);
    };
    const loadCerts = async () => {
      const { data } = await supabase.from('certificates').select('*').order('created_at', { ascending: false });
      if (data) setCertificates(data);
    };
    const loadProjects = async () => {
      const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      if (data) setProjects(data);
    };
    const loadSettings = async () => {
      const { data } = await supabase.from('settings').select('key,value');
      if (data) data.forEach(row => {
        if (row.key === 'profile_image'   && row.value) { setProfileImage(row.value); localStorage.setItem('profile_image', row.value); }
        if (row.key === 'theme_color'     && row.value) { setThemeColor(row.value); localStorage.setItem('theme_color', row.value); }
        if (row.key === 'bg_theme'        && row.value) { setBgTheme(row.value); localStorage.setItem('bg_theme', row.value); }
        if (row.key === 'font_choice'     && row.value) { setFontChoice(row.value); localStorage.setItem('font_choice', row.value); }
        if (row.key === 'music_url'       && row.value) { setMusicUrl(row.value); localStorage.setItem('music_url', row.value); }
        if (row.key === 'default_theme'   && row.value) { setDefaultThemeMode(row.value); setIsDark(row.value === 'dark'); localStorage.setItem('default_theme', row.value); }
        if (row.key === 'bg_animation'    && row.value) { setBgAnimation(row.value); localStorage.setItem('bg_animation', row.value); }
      });
    };
    let loadTimer;
    const init = async () => {
      await Promise.all([loadCerts(), loadProjects(), loadViews(), loadComments(), loadSettings()]);
      logVisitor();

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

      supabase.from('user_photos').select('*').eq('approved',true).order('created_at',{ascending:false}).then(({data})=>{
        if (data) setCommunityPhotos(data);
      });

      supabase.from('likes').select('count', { count:'exact', head:true }).then(({count})=>{ setLikeCount(count||0); });
      let devId = typeof localStorage !== 'undefined' ? localStorage.getItem('_dev_id') : null;
      if (!devId) { devId = Math.random().toString(36).slice(2) + Date.now().toString(36); if (typeof localStorage !== 'undefined') localStorage.setItem('_dev_id', devId); }
      setLikeId(devId);
      supabase.from('likes').select('id').eq('device_id', devId).single().then(({data})=>{ if (data) setLiked(true); }).catch(()=>{});

      supabase.from('replies').select('*').order('created_at',{ascending:true}).then(({data})=>{
        if (!data) return;
        const map = {};
        data.forEach(r => { if (!map[r.comment_id]) map[r.comment_id]=[]; map[r.comment_id].push(r); });
        setCommentReplies(map);
      });

      fetch('https://api.github.com/users/auraauvarose/repos?sort=pushed&per_page=4')
        .then(r => r.json()).then(d => { if (Array.isArray(d)) setGhRepos(d.slice(0,4)); }).catch(()=>{});
      fetch('https://api.github.com/users/auraauvarose/events/public?per_page=15')
        .then(r => r.json()).then(events => {
          if (!Array.isArray(events)) return;
          
          // 1. Process recent commits timeline
          const pushEvents = events.filter(e => e.type === 'PushEvent');
          const commitsList = [];
          pushEvents.forEach(evt => {
            if (evt.payload && evt.payload.commits) {
              evt.payload.commits.forEach(c => {
                commitsList.push({
                  sha: c.sha.slice(0, 7),
                  message: c.message,
                  repo: evt.repo.name.split('/')[1] || 'repository',
                  time: evt.created_at,
                });
              });
            }
          });
          setGhCommits(commitsList.slice(0, 4));

          // 2. Set current status
          const push = pushEvents[0];
          if (!push) { setGhStatus({ detail: null, since: null, online: false }); return; }
          const repo = (push.repo?.name || '').split('/')[1] || 'repository';
          const msg  = push.payload?.commits?.[0]?.message || 'Commit terbaru';
          const mins = Math.round((Date.now() - new Date(push.created_at)) / 60000);
          const ago  = mins < 60 ? `${mins}m ago` : mins < 1440 ? `${Math.round(mins/60)}h ago` : `${Math.round(mins/1440)}d ago`;
          setGhStatus({ detail: repo, since: ago, msg: msg.split('\n')[0].slice(0,60), online: mins < 480 });
        }).catch(()=>{});

      // A premium progress simulation
      const start = Date.now();
      const duration = 2200; // 2.2 seconds
      const steps = [
        { limit: 20, text: isID ? 'Menghubungkan database...' : 'Connecting database...' },
        { limit: 45, text: isID ? 'Memuat proyek & sertifikat...' : 'Loading projects & certs...' },
        { limit: 70, text: isID ? 'Mengoptimalkan aset grafis...' : 'Optimizing visual assets...' },
        { limit: 90, text: isID ? 'Menyinkronkan status GitHub...' : 'Syncing GitHub status...' },
        { limit: 100, text: isID ? 'Selesai! Membuka gerbang...' : 'Almost ready! Unlocking...' }
      ];

      loadTimer = setInterval(() => {
        const elapsed = Date.now() - start;
        const pct = Math.min(Math.round((elapsed / duration) * 100), 100);
        setLoadProgress(pct);

        const step = steps.find(s => pct <= s.limit) || steps[steps.length - 1];
        setLoadText(step.text);

        if (pct >= 100) {
          clearInterval(loadTimer);
          setTimeout(() => setPageReady(true), 150);
        }
      }, 30);
    };
    init();
    return () => {
      clearInterval(interval);
      if (loadTimer) clearInterval(loadTimer);
    };
   }, []);

   // Set mounted to true immediately for createPortal
   useEffect(() => {
     setMounted(true);
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
    if (!likeId) return;

    if (liked) {
      // Optimistic unlike update
      setLiked(false);
      setLikeCount(prev => Math.max(0, prev - 1));

      const { error } = await supabase.from('likes').delete().eq('device_id', likeId);
      if (error) {
        // Rollback on Supabase error
        setLiked(true);
        const { count } = await supabase.from('likes').select('count', { count:'exact', head:true });
        setLikeCount(count || 0);
      }
    } else {
      // Optimistic like update
      setLiked(true);
      setLikeAnim(true);
      setTimeout(() => setLikeAnim(false), 800);

      // Fireworks emoji explosion math
      const newParticles = Array.from({ length: 45 }, (_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 150 + 60;
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity - 60;
        return {
          id: Date.now() + i,
          size: Math.random() * 24 + 14,
          dur: Math.random() * 1.5 + 1.0,
          delay: Math.random() * 0.25,
          emoji: ['❤️','💕','💖','💗','💓','✨','🎉','🥳','⭐','💘','💝'][Math.floor(Math.random() * 11)],
          tx: `${tx}px`,
          ty: `${ty}px`,
          rot: `${Math.random() * 360 - 180}deg`,
          scale: Math.random() * 0.8 + 0.8,
        };
      });
      setLoveParticles(newParticles);
      setTimeout(() => setLoveParticles([]), 4000);

      setLikeCount(prev => prev + 1);

      const { error } = await supabase.from('likes').insert([{ device_id: likeId }]);
      if (error) {
        // Rollback on Supabase error
        setLiked(false);
        const { count } = await supabase.from('likes').select('count', { count:'exact', head:true });
        setLikeCount(count || 0);
      }
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

  useEffect(() => {
    if (audioRef.current) {
      const wasPlaying = isPlaying;
      audioRef.current.pause();
      audioRef.current.load();
      if (wasPlaying) audioRef.current.play().catch(() => {});
    }
  }, [musicUrl]);

  useEffect(() => {
    const makeHandler = (ref, setter, total) => () => {
      if (!ref.current || total === 0) return;
      const el = ref.current;
      const cardWidth = el.scrollWidth / total;
      const idx = Math.round(el.scrollLeft / cardWidth);
      setter(Math.min(idx, total - 1));
    };
    const cEl = certGridRef.current;
    const pEl = projGridRef.current;
    const gEl = galleryGridRef.current;
    const cH = makeHandler(certGridRef, setCertActiveIdx, certificates.length);
    const pH = makeHandler(projGridRef, setProjActiveIdx, projects.length);
    const gTotal = communityPhotos.length + (profileImage ? 1 : 0);
    const gH = makeHandler(galleryGridRef, setGalleryActiveIdx, gTotal);
    if (cEl) cEl.addEventListener("scroll", cH, { passive: true });
    if (pEl) pEl.addEventListener("scroll", pH, { passive: true });
    if (gEl) gEl.addEventListener("scroll", gH, { passive: true });
    return () => {
      if (cEl) cEl.removeEventListener("scroll", cH);
      if (pEl) pEl.removeEventListener("scroll", pH);
      if (gEl) gEl.removeEventListener("scroll", gH);
    };
  }, [certificates, projects, communityPhotos, profileImage]);

  const tx = {
    navHome: isID ? 'Beranda' : 'Home',
    navAbout: isID ? 'Tentang' : 'About',
    navSkills: isID ? 'Skills' : 'Skills',
    navProjects: isID ? 'Proyek' : 'Projects',
    navCerts: isID ? 'Sertifikat' : 'Certificates',
    navContact: isID ? 'Kontak' : 'Contact',
    navGame: isID ? 'Game' : 'Game',
    heroBadge: isID ? 'Pelajar & IT Student' : 'Student & IT Learner',
    heroGreet: isID ? 'Alo, Saya' : "Hey, I'm",
    heroBtn: isID ? 'Hubungi Saya →' : 'Contact Me →',
    downloadCV: isID ? 'Unduh CV 📄' : 'Download CV 📄',
    statProjects: isID ? 'Proyek Selesai' : 'Projects Done',
    statVisitors: isID ? 'Pengunjung' : 'Visitors',
    statYears: isID ? 'Tahun Belajar' : 'Years Learning',
    statGPA: isID ? 'IPK Rata-rata' : 'Avg. GPA',
    socialLabel: isID ? 'Temukan Saya' : 'Find Me On',
    aboutEyebrow: isID ? 'Tentang Saya' : 'About Me',
    aboutTitle: isID ? 'Cerita &\nPerjalanan' : 'Story &\nJourney',
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
    likedLabel: isID ? 'Terima kasih! ❤️' : 'Thank you! ❤️',
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
    {
      name: 'Node.js',
      cat: 'Back-End',
      color: '#339933',
      colorRgb: '51, 153, 51',
      desc: {
        id: 'Runtime JavaScript di sisi server yang cepat, dibangun di atas V8 Chrome.',
        en: 'Fast, server-side JavaScript runtime built on Chrome\'s V8 engine.'
      },
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L3 7.2v9.6L12 22l9-5.2V7.2L12 2zm-1 15.5l-4-2.3v-4.6l4 2.3v4.6zm1-6.4L8 8.8l4-2.3 4 2.3-4 2.3zm5 4.1l-4 2.3v-4.6l4-2.3v4.6z" />
        </svg>
      )
    },
    {
      name: 'Express.js',
      cat: 'Framework',
      color: '#828282',
      colorRgb: '130, 130, 130',
      desc: {
        id: 'Framework web minimalis dan fleksibel untuk Node.js untuk membangun API.',
        en: 'Minimalist and flexible web framework for Node.js to build APIs.'
      },
      icon: (
        <div className="express-logo-text" style={{ fontSize: '14px', fontWeight: '900', fontFamily: 'var(--font-heading), monospace', letterSpacing: '-0.5px' }}>EX</div>
      )
    },
    {
      name: 'JavaScript',
      cat: 'Language',
      color: '#f7df1e',
      colorRgb: '247, 223, 30',
      desc: {
        id: 'Bahasa pemrograman web untuk interaktivitas dinamis client & server.',
        en: 'Core web programming language for dynamic client & server interactivity.'
      },
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <rect width="24" height="24" rx="4" fill="#f7df1e" />
          <text x="13" y="19" fill="#000" fontSize="11" fontWeight="900" fontFamily="sans-serif">JS</text>
        </svg>
      )
    },
    {
      name: 'Python',
      cat: 'Language',
      color: '#3776ab',
      colorRgb: '55, 118, 171',
      desc: {
        id: 'Bahasa populer yang bersih, tangguh untuk automasi dan AI/data science.',
        en: 'Clean and powerful language highly popular for automation and AI/data science.'
      },
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2c-2.7 0-2.5 1.2-2.5 1.2h2.5v1.2H8.3c0 0-2.5-.2-2.5 2.5s0 2.5 2.5 2.5h1.2v-1.2c0 0 .1-1.2 1.2-1.2h2.5c2.7 0 2.5-1.2 2.5-1.2H13.2V4.8h3.7c0 0 2.5.2 2.5-2.5S16.9 0 14.4 0H12zm-3.7.9a.6.6 0 1 1 0 1.2.6.6 0 0 1 0-1.2zm6.2 17.3c2.7 0 2.5-1.2 2.5-1.2H14.5v-1.2h3.7c0 0 2.5.2 2.5-2.5s0-2.5-2.5-2.5H17v1.2c0 0-.1 1.2-1.2 1.2h-2.5c-2.7 0-2.5 1.2-2.5 1.2h2.5v1.2H9.6c0 0-2.5-.2-2.5 2.5s2.5 2.5 5 2.5h2.4zm1.2-.9a.6.6 0 1 1 0-1.2.6.6 0 0 1 0 1.2z" />
        </svg>
      )
    },
    {
      name: 'Docker',
      cat: 'DevOps',
      color: '#2496ed',
      colorRgb: '36, 150, 237',
      desc: {
        id: 'Platform kontainerisasi untuk deploy aplikasi secara konsisten.',
        en: 'Containerization platform to package and deploy apps consistently.'
      },
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M13.983 11.078h2.119c.102 0 .186-.084.186-.186V9.172c0-.102-.084-.186-.186-.186h-2.119c-.102 0-.186.084-.186.186v1.72c0 .101.084.186.186.186zm-2.913 0h2.119c.102 0 .186-.084.186-.186V9.172c0-.102-.084-.186-.186-.186h-2.119c-.102 0-.186.084-.186.186v1.72c0 .101.084.186.186.186zm-2.913 0h2.119c.102 0 .186-.084.186-.186V9.172c0-.102-.084-.186-.186-.186H8.157c-.102 0-.186.084-.186.186v1.72c0 .101.084.186.186.186zm-2.913 0h2.119c.102 0 .186-.084.186-.186V9.172c0-.102-.084-.186-.186-.186H5.244c-.102 0-.186.084-.186.186v1.72c0 .101.084.186.186.186zm-2.913 0h2.119c.102 0 .186-.084.186-.186V9.172c0-.102-.084-.186-.186-.186H2.33c-.102 0-.186.084-.186.186v1.72c0 .101.084.186.186.186zm2.913-2.502h2.119c.102 0 .186-.084.186-.186V6.67c0-.102-.084-.186-.186-.186H5.244c-.102 0-.186.084-.186.186v1.72c0 .101.084.186.186.186zm2.913 0h2.119c.102 0 .186-.084.186-.186V6.67c0-.102-.084-.186-.186-.186H8.157c-.102 0-.186.084-.186.186v1.72c0 .101.084.186.186.186zm2.913 0h2.119c.102 0 .186-.084.186-.186V6.67c0-.102-.084-.186-.186-.186h-2.119c-.102 0-.186.084-.186.186v1.72c0 .101.084.186.186.186zm2.913-2.502h2.119c.102 0 .186-.084.186-.186V4.168c0-.102-.084-.186-.186-.186h-2.119c-.102 0-.186.084-.186.186v1.72c0 .101.084.186.186.186zM23.957 12.39c-.16-.08-.4-.144-.688-.176-.56-.064-1.2-.08-1.872-.08-.304 0-.624.016-.944.032v-1.12c0-.1-.08-.176-.176-.176h-2.112c-.1 0-.176.08-.176.176v2.176c-.032 0-.064-.016-.096-.016-.272-.032-.608-.048-.96-.048h-.048c-.08-.416-.288-.848-.656-1.2-.56-.544-1.376-.8-2.432-.8-1.024 0-1.84.272-2.432.8-.368.352-.576.784-.656 1.2h-.048c-.352 0-.688.016-.96.048-.032 0-.064.016-.096.016V8.914c0-.1-.08-.176-.176-.176H8.2c-.1 0-.176.08-.176.176v3.296C6.68 12.422 5.096 13.062 4.12 14.15c-.944 1.056-1.232 2.336-1.232 3.488 0 3.552 2.8 5.616 7.424 5.616 5.376 0 7.84-2.896 8.944-5.328.752.128 1.48.24 2.16.24.4 0 .768-.032 1.088-.08.768-.112 1.344-.448 1.552-1.008.208-.576.016-1.392-.096-4.688z" />
        </svg>
      )
    },
    {
      name: 'Next.js',
      cat: 'Framework',
      color: '#ffffff',
      colorRgb: '255, 255, 255',
      desc: {
        id: 'Framework React premium dengan render server, SSR, dan optimasi performa.',
        en: 'Premium React framework featuring server-side rendering, SSR, and speed.'
      },
      icon: (
        <svg viewBox="0 0 128 128" fill="currentColor">
          <path d="M64 0C28.7 0 0 28.7 0 64s28.7 64 64 64 64-28.7 64-64S99.3 0 64 0zm37.5 95.8l-42.9-55.5V90H47.4V38h11.2l42.6 55V38h11.2v57.8h-.9z" />
        </svg>
      )
    },
    {
      name: 'Git',
      cat: 'Tools',
      color: '#f05032',
      colorRgb: '240, 80, 50',
      desc: {
        id: 'Sistem pengontrol versi standar industri untuk kolaborasi kode.',
        en: 'Industry-standard version control system for code collaboration.'
      },
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.3 10.9L13.1.7C12.7.3 12 .3 11.6.7L8.9 3.4l3.2 3.2c.8-.3 1.8-.1 2.4.6.6.6.8 1.5.6 2.3l3.2 3.2c.8-.2 1.7 0 2.3.6.8.8.8 2.1 0 2.9-.8.8-2.1.8-2.9 0-.6-.6-.8-1.5-.6-2.3l-3.2-3.2v4.7c.3.2.5.5.6.9.4.8.2 1.8-.4 2.4-.6.6-1.5.8-2.3.6L9.6 21.6c-.2.8-1 1.3-1.8 1.1-.8-.2-1.3-1-1.1-1.8.2-.8 1-1.3 1.8-1.1l2.8-2.8v-4.7c-.3-.2-.5-.5-.6-.9-.4-.8-.2-1.8.4-2.4.6-.6 1.5-.8 2.3-.6l3.2-3.2-2.7-2.7L.7 11.6c-.4.4-.4 1.1 0 1.5l10.2 10.2c.4.4 1.1.4 1.5 0l10.9-10.9c.4-.4.4-1.1 0-1.5z" />
        </svg>
      )
    },
    {
      name: 'C++',
      cat: 'Language',
      color: '#00599c',
      colorRgb: '0, 89, 156',
      desc: {
        id: 'Bahasa berkinerja tinggi, banyak digunakan pada sistem & game engine.',
        en: 'High-performance language, widely used in systems & game engines.'
      },
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M2 12c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10S2 17.52 2 12zm8.5-4h-4v8h4v-1.5h-2.5v-1h2.5v-1.5h-2.5v-1h2.5V8zm7.5 2.5h-1.5v-1.5h-1v1.5h-1.5v1h1.5v1.5h1v-1.5h1.5v-1zm5 0h-1.5v-1.5h-1v1.5h-1.5v1h1.5v1.5h1v-1.5h1.5v-1z" />
        </svg>
      )
    },
    {
      name: 'Linux',
      cat: 'OS',
      color: '#fcc624',
      colorRgb: '252, 198, 36',
      desc: {
        id: 'Sistem operasi open-source tangguh, tulang punggung server cloud.',
        en: 'Robust open-source operating system, the backbone of cloud servers.'
      },
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="4 17 10 11 4 5" />
          <line x1="12" y1="19" x2="20" y2="19" />
        </svg>
      )
    },
    {
      name: 'SQL',
      cat: 'Database',
      color: '#00758f',
      colorRgb: '0, 117, 143',
      desc: {
        id: 'Bahasa standar untuk mengelola, kueri database relasional secara efisien.',
        en: 'Standard language for managing and querying relational databases.'
      },
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M3 5v6c0 1.66 4 3 9 3s9-1.34 9-3V5" />
          <path d="M3 11v6c0 1.66 4 3 9 3s9-1.34 9-3v-6" />
        </svg>
      )
    }
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
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,900;1,9..144,400;1,9..144,700&family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=Inter:wght@400;600;700&family=Space+Grotesk:wght@400;600;700;800&family=Syne:wght@700;800&family=DM+Sans:wght@400;500;700&family=Cormorant+Garamond:ital,wght@0,700;1,400&family=Lato:wght@400;700&family=Bebas+Neue&family=Teko:wght@400;600;700&family=Pacifico&family=Libre+Caslon+Display&family=Libre+Caslon+Text:wght@400;700&family=Nunito:wght@400;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;}
        html{margin:0;padding:0;width:100%;max-width:100%;overflow-x:hidden!important;background:#111110;transition:background 0.5s ease;scrollbar-width:thin;scrollbar-color:rgba(100,100,100,0.5) transparent;}
        html.site-dark{background:#111110;}
        html:not(.site-dark){background:#ffffff;}
        html{scrollbar-gutter:stable;}
        html::-webkit-scrollbar{width:4px;}
        html::-webkit-scrollbar-track{background:transparent;}
        html::-webkit-scrollbar-thumb{background:rgba(100,100,100,0.4);border-radius:4px;}
        html::-webkit-scrollbar-thumb:hover{background:rgba(150,150,150,0.6);}
        body{margin:0;padding:0;width:100%;max-width:100%;overflow-x:hidden!important;background:transparent;}
        /* Modern Custom Cursor - Elegant Dot Style */
        body{cursor:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Ccircle cx='8' cy='8' r='6' fill='%23d4eb00' stroke='%230d0d0d' stroke-width='1.5'/%3E%3Ccircle cx='8' cy='8' r='2' fill='%230d0d0d'/%3E%3C/svg%3E") 8 8,auto;}
        a,button,[role="button"],input,textarea,select,label[for]{cursor:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Ccircle cx='10' cy='10' r='8' fill='none' stroke='%23d4eb00' stroke-width='2'/%3E%3Ccircle cx='10' cy='10' r='3' fill='%23d4eb00'/%3E%3C/svg%3E") 10 10,pointer;}

        /* ── BG CANVAS ── */
        .bg-canvas{position:fixed;inset:0;z-index:1;pointer-events:none;opacity:0.7;}

        /* ── WAVE RIPPLE ── */
        .theme-ripple{position:fixed;inset:0;z-index:9997;pointer-events:none;background:var(--ripple-color,#ffffff);clip-path:circle(0% at var(--rx,50%) var(--ry,50%));animation:waveRipple 0.65s cubic-bezier(0.22,1,0.36,1) forwards;}
        @keyframes waveRipple{0%{clip-path:circle(0% at var(--rx) var(--ry));opacity:0.95;}60%{clip-path:circle(120% at var(--rx) var(--ry));opacity:0.9;}100%{clip-path:circle(150% at var(--rx) var(--ry));opacity:0;}}

        /* ── LOADING ── */
        .page-loader{position:fixed;inset:0;z-index:9999;background:#111110;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;transition:opacity 0.5s ease, visibility 0.5s ease;}
        .page-loader.done{opacity:0;visibility:hidden;pointer-events:none;}
        .loader-logo{font-family:var(--font-body,'Plus Jakarta Sans'),sans-serif;font-size:22px;font-weight:800;color:#f0efe8;letter-spacing:0.18em;text-transform:lowercase;}
        .loader-logo em{font-style:normal;color:var(--loader-acc,#d4eb00);}
        .loader-bar-wrap{width:160px;height:2px;background:rgba(255,255,255,0.1);border-radius:2px;overflow:hidden;}
        .loader-bar{height:100%;width:0%;background:var(--loader-acc,#d4eb00);border-radius:2px;animation:loadProgress 1.2s cubic-bezier(.4,0,.2,1) forwards;}
        @keyframes loadProgress{0%{width:0%;}60%{width:75%;}100%{width:100%;}}
        .loader-text{font-family:var(--font-body);font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:rgba(240,239,232,0.4);}
        .loader-spinner{width:40px;height:40px;border:3px solid rgba(212,235,0,0.2);border-top-color:var(--loader-acc,#d4eb00);border-radius:50%;animation:spin 1s linear infinite;}
        @keyframes spin{to{transform:rotate(360deg);}}

        /* ── THEME VARS ── */
        .rw{--acc:#d4eb00;--acc-bg:rgba(212,235,0,0.12);--ink:#1a1a1a;--ink2:#555555;--ink3:#999999;--bg:#ffffff;--bg2:#f4f4f0;--bd:rgba(0,0,0,0.09);--shadow:rgba(0,0,0,0.07);--font-heading:'Fraunces',serif;--font-body:'Plus Jakarta Sans',sans-serif;font-family:var(--font-body);background:var(--bg);color:var(--ink);min-height:100vh;width:100%;max-width:100%;transition:background 0.5s ease,color 0.5s ease;position:relative;overflow-x:hidden!important;}
        .rw.dark{--ink:#f0efe8;--ink2:#909088;--ink3:#555550;--bg:#111110;--bg2:#1c1c1a;--bd:rgba(255,255,255,0.07);--shadow:rgba(0,0,0,0.3);}
        .rw *{transition-property:background-color,border-color,color,box-shadow;transition-duration:0.5s;transition-timing-function:ease;}
        .hero-photo-wrap,.proj-card,.cert-card,.skill-card,.gh-repo-card{transform:translateZ(0);}
        .nav{contain:layout style;}
        .footer{contain:layout style;}
        .rw img,.rw canvas,.rw video,.rw .orb,.rw [data-reveal],.rw .theme-ripple{transition:none!important;}

        /* ── LIGHT MODE SHADOWS ── */
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

        /* ── UPDATE BANNER ── */
        .update-banner{position:fixed;top:0;left:0;right:0;z-index:999;background:var(--acc);color:#0d0d0d;display:flex;align-items:center;justify-content:center;gap:8px;padding:10px 20px;font-size:13px;font-weight:700;animation:slideDown .4s cubic-bezier(.22,1,.36,1);}
        @keyframes slideDown{from{transform:translateY(-100%);}to{transform:translateY(0);}}
        .update-icon{font-size:16px;}
        .update-progress{position:absolute;bottom:0;left:0;height:3px;background:rgba(0,0,0,.2);animation:progressBar 3.5s linear forwards;}
        @keyframes progressBar{from{width:100%;}to{width:0%;}}

        /* ── ORBS ── */
        .orb{position:fixed;border-radius:50%;pointer-events:none;filter:blur(90px);z-index:0;opacity:0;transition:opacity 0.6s ease;will-change:transform;transform:translateZ(0);contain:strict;}
        .rw.dark .orb{opacity:1;}
        .orb-1{width:500px;height:500px;background:radial-gradient(circle,rgba(212,235,0,0.12),transparent 70%);top:-100px;left:-100px;animation:orbFloat1 12s ease-in-out infinite;}
        .orb-2{width:400px;height:400px;background:radial-gradient(circle,rgba(0,200,255,0.08),transparent 70%);top:40%;right:-80px;animation:orbFloat2 15s ease-in-out infinite;}
        .orb-3{width:350px;height:350px;background:radial-gradient(circle,rgba(180,100,255,0.07),transparent 70%);bottom:10%;left:20%;animation:orbFloat3 18s ease-in-out infinite;}
        @keyframes orbFloat1{0%,100%{transform:translate(0,0);}50%{transform:translate(40px,30px);}}
        @keyframes orbFloat2{0%,100%{transform:translate(0,0);}50%{transform:translate(-30px,-40px);}}
        @keyframes orbFloat3{0%,100%{transform:translate(0,0);}50%{transform:translate(20px,-20px);}}

        /* ── SCROLL REVEAL ── */
        [data-reveal]{opacity:0.95;transform:translate3d(0,16px,0);transition:opacity 0.5s cubic-bezier(.22,1,.36,1),transform 0.5s cubic-bezier(.22,1,.36,1);will-change:opacity,transform;contain:layout style;}
        [data-reveal].revealed{opacity:1;transform:translate3d(0,0,0);}
        [data-reveal][data-delay="1"]{transition-delay:0.08s;}
        [data-reveal][data-delay="2"]{transition-delay:0.16s;}
        [data-reveal][data-delay="3"]{transition-delay:0.24s;}
        [data-reveal][data-delay="4"]{transition-delay:0.32s;}
        /* Reveal variants for cards — subtle slide up + fade */
        .skill-card[data-reveal]{transform:translate3d(0,16px,0);}
        .skill-card[data-reveal].revealed{transform:translate3d(0,0,0);}
        .goal-card[data-reveal]{transform:translate3d(0,16px,0);}
        .goal-card[data-reveal].revealed{transform:translate3d(0,0,0);}
        .cert-card[data-reveal]{transform:translate3d(0,12px,0);}
        .cert-card[data-reveal].revealed{transform:translate3d(0,0,0);}
        .proj-card[data-reveal]{transform:translate3d(0,12px,0);}
        .proj-card[data-reveal].revealed{transform:translate3d(0,0,0);}
        /* Sec-head gets a subtle slide */
        .sec-head[data-reveal]{transform:translate3d(0,10px,0);}
        .sec-head[data-reveal].revealed{transform:translate3d(0,0,0);}
        @media(max-width:768px){
          [data-reveal]{opacity:0.95;transform:translate3d(0,12px,0);transition:opacity 0.35s ease-out,transform 0.35s ease-out;}
          [data-reveal][data-delay="1"],[data-reveal][data-delay="2"],[data-reveal][data-delay="3"],[data-reveal][data-delay="4"]{transition-delay:0s;}
          .sec-head[data-reveal]{transform:translate3d(0,10px,0);}
        }

        /* ── MAGNETIC CARDS ── */
        .mag{transition:transform 0.25s ease,box-shadow 0.25s ease;transform-style:preserve-3d;perspective:800px;will-change:transform;}
        @media(max-width:768px){.mag{transform-style:flat;perspective:none;}}

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
        .nav-links a.nav-game{color:var(--acc);font-weight:800;}
        .nav-right{display:flex;align-items:center;gap:8px;flex-shrink:0;}
        .btn-admin{padding:8px 16px;background:var(--acc);color:#0d0d0d;border:none;border-radius:100px;font-family:inherit;font-size:12px;font-weight:800;letter-spacing:0.04em;text-decoration:none;display:flex;align-items:center;gap:5px;transition:all 0.2s;}
        .btn-admin:hover{transform:translateY(-2px);box-shadow:0 6px 20px var(--acc-bg);}
        .btn-theme{padding:8px 14px;border:1px solid var(--bd);background:var(--bg2);color:var(--ink);border-radius:100px;font-family:inherit;font-size:12px;font-weight:700;transition:all 0.2s;}
        .btn-theme:hover{transform:translateY(-1px);border-color:var(--acc);}

        /* ── AI BUTTON (Gemini style) ── */
        .ai-btn{padding:8px 13px;border:none;border-radius:100px;font-family:inherit;font-size:11px;font-weight:800;letter-spacing:0.03em;display:flex;align-items:center;gap:6px;transition:all 0.2s;cursor:pointer;background:linear-gradient(135deg,#4285f4,#9b72cf,#d76f7a,#e8a95b);color:#fff;}
        .ai-btn:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(155,114,207,0.4);}

        /* ── HAMBURGER MENU (mobile) ── */
        .hamburger{display:none;flex-direction:column;gap:5px;background:none;border:none;padding:6px;cursor:pointer;}
        .hamburger span{display:block;width:22px;height:2px;background:var(--ink);border-radius:2px;transition:all 0.3s;}
        .hamburger.open span:nth-child(1){transform:translateY(7px) rotate(45deg);}
        .hamburger.open span:nth-child(2){opacity:0;}
        .hamburger.open span:nth-child(3){transform:translateY(-7px) rotate(-45deg);}
        @media(max-width:900px){
          .nav-links{display:none;}
          .hamburger{display:flex;}
        }

        /* ── MOBILE DRAWER ── */
        .mobile-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:98;backdrop-filter:blur(4px);opacity:0;pointer-events:none;transition:opacity 0.3s;}
        .mobile-overlay.open{opacity:1;pointer-events:all;}
        .mobile-drawer{position:fixed;top:0;right:0;bottom:0;width:280px;background:var(--bg);border-left:1px solid var(--bd);z-index:99;transform:translateX(100%);transition:transform 0.35s cubic-bezier(0.22,1,0.36,1);display:flex;flex-direction:column;padding:0;overflow-y:auto;}
        .mobile-drawer.open{transform:translateX(0);}
        .mobile-drawer-head{display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1px solid var(--bd);}
        .mobile-drawer-logo{font-family:var(--font-heading);font-size:20px;font-weight:900;color:var(--ink);}
        .mobile-drawer-logo em{font-style:normal;color:var(--acc);}
        .mobile-drawer-close{width:32px;height:32px;background:var(--bg2);border:1px solid var(--bd);border-radius:50%;color:var(--ink);font-size:15px;display:flex;align-items:center;justify-content:center;}
        .mobile-nav-list{list-style:none;margin:0;padding:16px 0;border-bottom:1px solid var(--bd);}
        .mobile-nav-list li a{display:block;padding:12px 24px;font-size:14px;font-weight:600;color:var(--ink2);text-decoration:none;transition:all 0.2s;}
        .mobile-nav-list li a:hover,.mobile-nav-list li a.active{color:var(--ink);background:var(--bg2);}
        .mobile-nav-list li a.nav-game{color:var(--acc);font-weight:800;}
        .mobile-drawer-actions{padding:16px 24px;display:flex;flex-direction:column;gap:10px;}
        .mobile-action-row{display:flex;gap:8px;}
        .mobile-action-btn{flex:1;padding:10px 12px;border-radius:12px;font-family:inherit;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:6px;text-decoration:none;transition:all 0.2s;border:1px solid var(--bd);background:var(--bg2);color:var(--ink);}
        .mobile-action-btn:hover{border-color:var(--acc);}
        .mobile-action-btn.accent{background:var(--acc);color:#0d0d0d;border-color:var(--acc);}
        .mobile-action-btn.ai-style{background:linear-gradient(135deg,#4285f4,#9b72cf,#d76f7a,#e8a95b);color:#fff;border:none;}

        .wrap{max-width:1140px;margin:0 auto;padding:0 40px;position:relative;z-index:1;}

        /* ── HERO ── */
        .hero{padding-top:116px;padding-bottom:80px;display:grid;grid-template-columns:1fr 300px;align-items:center;gap:60px;border-bottom:1px solid var(--bd);}
        .hero-tag{display:inline-flex;align-items:center;gap:8px;font-size:12px;font-weight:700;letter-spacing:0.12em;color:var(--ink);background:var(--acc-bg);border:1px solid rgba(212,235,0,0.15);padding:6px 16px;border-radius:100px;text-transform:uppercase;margin-bottom:24px;backdrop-filter:blur(8px);box-shadow:0 4px 20px rgba(0,0,0,0.04);}
        .hero-dot{width:7px;height:7px;border-radius:50%;background:var(--acc);animation:blink 2s ease infinite;flex-shrink:0;}
        @keyframes blink{0%,100%{opacity:1;}50%{opacity:0.2;}}
        .hero-h1{font-family:var(--font-heading);font-size:clamp(38px,6vw,84px);font-weight:900;line-height:0.93;letter-spacing:-0.02em;color:var(--ink);margin:0 0 22px;}
        .hero-line-1{display:block;animation:heroSlideIn 0.7s cubic-bezier(.22,1,.36,1) both;}
        .hero-line-2{display:block;animation:heroSlideIn 0.7s 0.15s cubic-bezier(.22,1,.36,1) both;}
        .hero-loop-name{animation:heroSlideIn 0.7s 0.25s cubic-bezier(.22,1,.36,1) both;font-style:italic;font-weight:400;color:var(--ink2);}
        .gradient-text{background:linear-gradient(135deg, var(--acc, #d4eb00) 0%, #38bdf8 50%, #818cf8 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;text-shadow:none;display:inline-block;}
        @keyframes heroSlideIn{from{opacity:0;transform:translateY(32px);}to{opacity:1;transform:translateY(0);}}
        .hero-cursor{display:inline-block;color:var(--acc);animation:cursorBlink 0.75s step-end infinite;margin-left:1px;font-style:normal;font-weight:900;}
        .type-cursor{color:var(--acc);animation:cursorBlink 0.75s step-end infinite;font-weight:300;}
        .type-cursor.done{display:none;}
        @keyframes cursorBlink{0%,100%{opacity:1;}50%{opacity:0;}}
        .hero-h1 em{font-style:italic;font-weight:400;color:var(--ink2);}
        .hero-p{font-size:16px;color:var(--ink2);line-height:1.7;max-width:460px;margin-bottom:34px;}
        .hero-btns{display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
        .btn-dark{padding:13px 24px;background:var(--ink);color:var(--bg);border:none;border-radius:100px;font-family:inherit;font-size:14px;font-weight:700;text-decoration:none;display:inline-block;transition:all 0.25s;}
        .btn-dark:hover{transform:translateY(-3px);box-shadow:0 10px 28px var(--shadow);}
        .btn-acc{padding:12px 18px;background:var(--acc);color:#0d0d0d;border:none;border-radius:100px;font-family:inherit;font-size:14px;font-weight:600;display:flex;align-items:center;gap:6px;transition:all 0.2s;}
        .btn-acc:hover{transform:translateY(-2px);}

        /* Floating Badges */
        .float-badge{position:absolute;padding:8px 14px;border-radius:12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);backdrop-filter:blur(12px);box-shadow:0 8px 32px rgba(0,0,0,0.2);display:flex;align-items:center;gap:8px;font-size:12px;font-weight:700;color:var(--ink);z-index:10;user-select:none;pointer-events:none;white-space:nowrap;}
        .rw.dark .float-badge{background:rgba(20,20,20,0.65);border:1px solid rgba(255,255,255,0.05);}
        .badge-1{top:-15px;left:-35px;animation:floatSlow 4s ease-in-out infinite alternate;}
        .badge-2{bottom:35px;right:-35px;animation:floatSlow2 4.5s ease-in-out infinite alternate;}
        .badge-3{top:50%;left:-45px;animation:floatSlow3 5s ease-in-out infinite alternate;}
        @keyframes floatSlow{0%{transform:translateY(0) rotate(-2deg);}100%{transform:translateY(-10px) rotate(2deg);}}
        @keyframes floatSlow2{0%{transform:translateY(0) rotate(3deg);}100%{transform:translateY(8px) rotate(-3deg);}}
        @keyframes floatSlow3{0%{transform:translateY(0) rotate(-1deg);}100%{transform:translateY(-8px) rotate(1deg);}}

        .hero-photo-wrap{position:relative;height:320px;width:100%;max-width:300px;margin:0 auto;}
        .hero-photo-bg{position:absolute;inset:-10px;background:linear-gradient(135deg, var(--acc, #d4eb00), #818cf8);border-radius:24px;transform:rotate(4deg);transition:transform 0.5s cubic-bezier(.34,1.56,.64,1);filter:blur(2px);opacity:0.85;}
        .hero-photo-wrap:hover .hero-photo-bg{transform:rotate(8deg) scale(1.03);filter:blur(0px);opacity:1;}
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

        /* ── SOCIAL MARQUEE (draggable) ── */
        .social-strip{padding:6px 0 6px;border-bottom:1px solid var(--bd);position:relative;overflow:hidden;}
        .social-strip-inner{overflow:hidden;padding:14px 0;position:relative;cursor:grab;}
        .social-strip-inner:active{cursor:grabbing;}
        .social-strip-inner::before,.social-strip-inner::after{content:'';position:absolute;top:0;bottom:0;width:80px;z-index:2;pointer-events:none;}
        .social-strip-inner::before{left:0;background:linear-gradient(to right,var(--bg),transparent);}
        .social-strip-inner::after{right:0;background:linear-gradient(to left,var(--bg),transparent);}
        .social-track{display:flex;gap:10px;width:max-content;padding:0 80px;animation:pingPong 22s ease-in-out infinite alternate;}
        .social-track:hover{animation-play-state:paused;}
        @keyframes pingPong{0%{transform:translateX(0);}100%{transform:translateX(calc(-50% + 50vw));}}
        .social-btn{display:flex;align-items:center;gap:8px;padding:9px 16px;background:var(--bg2);border:1px solid var(--bd);border-radius:100px;text-decoration:none;color:var(--ink);font-size:13px;font-weight:600;transition:transform .25s,border-color .25s,box-shadow .25s;flex-shrink:0;white-space:nowrap;}
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
        .skill-card{
          position:relative;
          overflow:hidden;
          min-height:136px;
          padding:18px;
          background:var(--bg2);
          border:1px solid var(--bd);
          border-radius:18px;
          transition: border-color 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          cursor:pointer;
          display:flex;
          flex-direction:column;
          justify-content:space-between;
        }
        .skill-card:hover, .skill-card.active{
          border-color: var(--skill-color);
          box-shadow: 0 12px 30px -10px rgba(var(--skill-color-rgb), 0.25), 0 0 0 3px rgba(var(--skill-color-rgb), 0.08);
          transform: translateY(-4px);
        }
        .skill-main{
          display:flex;
          flex-direction:column;
          height:100%;
          justify-content:space-between;
          transition: transform 0.35s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.3s;
        }
        .skill-card:hover .skill-main, .skill-card.active .skill-main{
          transform: translateY(-10px);
          opacity: 0;
          pointer-events: none;
        }
        .skill-header{
          display:flex;
          align-items:center;
          justify-content:space-between;
          margin-bottom:12px;
        }
        .skill-icon-wrap{
          width:40px;
          height:40px;
          border-radius:12px;
          background: rgba(var(--skill-color-rgb), 0.06);
          color: var(--skill-color);
          display:flex;
          align-items:center;
          justify-content:center;
          transition: transform 0.3s ease, background 0.3s ease;
        }
        .rw:not(.dark) .skill-card[style*="#ffffff"] .skill-icon-wrap,
        .rw:not(.dark) .skill-card[style*="#FFFFFF"] .skill-icon-wrap {
          background: rgba(0, 0, 0, 0.06);
          color: #000000;
        }
        .rw.dark .skill-card[style*="#ffffff"] .skill-icon-wrap,
        .rw.dark .skill-card[style*="#FFFFFF"] .skill-icon-wrap {
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
        }
        .skill-card:hover .skill-icon-wrap{
          transform: scale(1.1) rotate(4deg);
        }
        .skill-icon-wrap svg{
          width:22px;
          height:22px;
        }
        .skill-cat{
          font-size:9px;
          font-weight:700;
          letter-spacing:0.12em;
          text-transform:uppercase;
          color:var(--ink3);
        }
        .skill-name{
          font-size:16px;
          font-weight:800;
          color:var(--ink);
          margin:0;
          letter-spacing:-0.01em;
        }
        .skill-desc-overlay{
          position:absolute;
          inset:0;
          padding:18px;
          background: var(--bg2);
          display:flex;
          flex-direction:column;
          justify-content:space-between;
          opacity:0;
          transform: translateY(100%);
          transition: transform 0.35s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.3s;
          pointer-events:none;
        }
        .skill-card:hover .skill-desc-overlay, .skill-card.active .skill-desc-overlay{
          opacity:1;
          transform: translateY(0);
          pointer-events:auto;
        }
        .skill-desc-cat{
          font-size:9px;
          font-weight:700;
          letter-spacing:0.12em;
          text-transform:uppercase;
          color: var(--skill-color);
        }
        .skill-desc-text{
          font-size:12px;
          line-height:1.5;
          color:var(--ink2);
          margin:8px 0 auto 0;
          font-weight:500;
        }
        .skill-desc-footer{
          display:flex;
          align-items:center;
          justify-content:space-between;
          font-size:10px;
          font-weight:700;
          color:var(--ink3);
          border-top: 1px solid var(--bd);
          padding-top:8px;
          margin-top:6px;
        }

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

        /* ── CERTS (UPDATED FOR 3x2 GRID) ── */
        .cert-more-label{display:flex;align-items:center;justify-content:space-between;margin:0 0 16px;padding:0 2px;}
        .cert-more-label span{font-size:13px;font-weight:600;color:var(--ink2);}
        .cert-nav-btns{display:flex;gap:8px;}
        .cert-nav-btn{width:34px;height:34px;border-radius:50%;border:1px solid var(--bd);background:var(--bg2);color:var(--ink);font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;line-height:1;}
        .cert-nav-btn:hover:not(:disabled){border-color:var(--acc);color:var(--acc);}
        .cert-nav-btn:disabled{opacity:0.3;cursor:not-allowed;}
        /* ── CERT GRID ── */
        .cert-grid-wrap{width:100%;}
        .cert-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;width:100%;}
        .cert-card{background:var(--bg2);border:1px solid var(--bd);border-radius:16px;overflow:hidden;cursor:pointer;transition:border-color 0.25s,box-shadow 0.3s;display:block;}
        .cert-card:hover{border-color:var(--acc);box-shadow:0 12px 32px var(--shadow);}
        .cert-img{overflow:hidden;width:100%;aspect-ratio:16/10;flex-shrink:0;background:var(--bg);position:relative;}
        .cert-img img{width:100%;height:100%;object-fit:cover;object-position:top center;display:block;transition:transform 0.5s;}
        .cert-img::before{content:'🎓';position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:48px;opacity:0.3;z-index:0;}
        .cert-img img{position:relative;z-index:1;}
        .cert-card:hover .cert-img img{transform:scale(1.05);}
        .cert-info{padding:12px 14px;display:flex;align-items:center;justify-content:space-between;gap:10px;background:var(--bg2);}
        .cert-info-t{min-width:0;flex:1;}
        .cert-info-t p{font-size:13px;font-weight:700;color:var(--ink);margin:0 0 2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .cert-info-t span{font-size:11px;color:var(--ink2);}
        .cert-arr{width:26px;height:26px;border-radius:50%;background:var(--ink);color:var(--bg);display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0;transition:transform 0.25s,background 0.2s;}
        .cert-card:hover .cert-arr{transform:rotate(45deg);background:var(--acc);color:#0d0d0d;}
        .cert-empty,.proj-empty{grid-column:1/-1;padding:60px 24px;text-align:center;border:1px dashed var(--bd);border-radius:20px;color:var(--ink2);font-size:14px;}
        .cert-page-dots{display:flex;justify-content:center;gap:8px;margin-top:18px;}
        .cert-page-dot{width:8px;height:8px;border-radius:100px;background:var(--bd);border:1px solid var(--bd);cursor:pointer;transition:all .3s;}
        .cert-page-dot.active{width:24px;background:var(--acc);border-color:var(--acc);}

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
        
        /* Menggunakan overflow-y: auto dan menghapus scrollbar-gutter agar tidak menggeser layout */
        .comments-list{max-height:480px;overflow-y:auto;display:flex;flex-direction:column;gap:10px;padding-right:4px;}
        .comment-card{padding:16px 18px;background:var(--bg2);border:1px solid var(--bd);border-radius:14px;transition:border-color 0.2s;}
        .comment-card:hover{border-color:var(--acc);}
        .comment-name{font-size:13px;font-weight:700;color:var(--ink);margin-bottom:5px;display:flex;align-items:center;gap:10px;}
        .comment-name::after{content:'';flex:1;height:1px;background:var(--bd);}
        
        /* Menambahkan word-break untuk menahan teks terlalu panjang */
        .comment-msg{font-size:13px;color:var(--ink2);line-height:1.6;margin-bottom:8px;word-break:break-word;}
        
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

        /* ── FLOAT (LANG + AI + MUSIC) ── */
        .float-group{position:fixed;bottom:28px;right:28px;z-index:9999;display:flex;flex-direction:column;align-items:center;gap:8px;}
        .lang-btn{width:54px;height:34px;border-radius:100px;background:var(--bg2);border:1.5px solid var(--bd);color:var(--ink);font-family:inherit;font-size:12px;font-weight:800;letter-spacing:0.04em;display:flex;align-items:center;justify-content:center;gap:4px;box-shadow:0 4px 16px var(--shadow);transition:all 0.25s;}
        .lang-btn:hover{transform:translateY(-2px);border-color:var(--acc);box-shadow:0 8px 24px var(--shadow);}
        .float-ai-btn{width:54px;height:54px;border-radius:50%;border:none;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(155,114,207,0.35);transition:all 0.25s;background:linear-gradient(135deg,#4285f4,#9b72cf,#d76f7a,#e8a95b);color:#fff;font-size:14px;}
        .float-ai-btn:hover{transform:scale(1.1);box-shadow:0 12px 32px rgba(155,114,207,0.5);}
        .music-btn{width:54px;height:54px;border-radius:50%;background:var(--ink);color:var(--bg);border:none;font-size:18px;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px var(--shadow);transition:all 0.25s;}
        .music-btn:hover{transform:scale(1.1);box-shadow:0 12px 32px var(--shadow);}
        .music-btn.playing{animation:spin 8s linear infinite;}

        /* Custom dynamic tab Visualizer & Arch Terminal GNOME styling */
        .float-term-btn{width:54px;height:54px;border-radius:50%;border:none;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(255,255,255,0.06);transition:all 0.25s;background:#1c1c1f;color:#27c93f;font-family:monospace;font-size:18px;font-weight:bold;cursor:pointer;}
        .float-term-btn:hover{transform:scale(1.1);border:1px solid #27c93f;box-shadow:0 12px 32px rgba(39,201,63,0.2);}

        .Arch-term-modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 90vw;
          max-width: 650px;
          height: 420px;
          background: rgba(22, 10, 24, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 12px;
          box-shadow: 0 30px 70px rgba(0,0,0,0.8), 0 0 40px var(--acc)15;
          z-index: 99999;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          color: #f0efe8;
        }
        .Arch-term-header {
          background: #1c1921;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          user-select: none;
        }
        .Arch-term-title {
          font-size: 11px;
          color: #a0a0a8;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .Arch-ctrl {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          display: inline-block;
          cursor: pointer;
        }
        .Arch-ctrl.close { background: #ff5f56; }
        .Arch-ctrl.min { background: #ffbd2e; }
        .Arch-ctrl.max { background: #27c93f; }
        
        .Arch-term-body {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 13px;
          line-height: 1.5;
        }
        .Arch-term-line {
          white-space: pre-wrap;
          word-break: break-all;
        }
        .Arch-term-line.input {
          color: var(--acc);
        }
        .Arch-term-line.output {
          color: #dfdfe6;
        }
        .Arch-term-prompt-line {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .Arch-prompt-symbol {
          color: var(--acc);
          font-weight: 700;
        }
        .Arch-term-input {
          flex: 1;
          background: transparent;
          border: none;
          color: #fff;
          font-family: inherit;
          font-size: 13px;
          outline: none;
        }
        @media(max-width: 600px) {
          .Arch-term-modal {
            width: 95vw !important;
            height: 70vh !important;
            max-height: 380px !important;
          }
          .Arch-term-body {
            font-size: 11.5px !important;
            padding: 10px !important;
            gap: 6px !important;
          }
          .Arch-term-header {
            padding: 0 10px !important;
            height: 32px !important;
          }
          .Arch-prompt-symbol, .Arch-term-input {
            font-size: 11.5px !important;
          }
        }

        .dev-github-timeline {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 140px;
          overflow-y: auto;
          scrollbar-width: none;
        }
        .dev-github-timeline::-webkit-scrollbar { display: none; }
        .dev-github-commits-hd {
          font-size: 9px;
          font-weight: 800;
          color: var(--acc);
          letter-spacing: 0.1em;
          margin-bottom: 4px;
        }
        .dev-github-commits-empty {
          font-size: 11px;
          color: var(--ink3);
          font-style: italic;
        }
        .dev-github-commit-item {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          font-size: 12px;
          border-left: 2px solid var(--bd);
          padding-left: 10px;
          margin-left: 4px;
          position: relative;
        }
        .commit-dot {
          position: absolute;
          left: -5px;
          top: 3px;
          font-size: 8px;
          color: var(--acc);
          text-shadow: 0 0 8px var(--acc);
        }
        .commit-details {
          display: flex;
          flex-direction: column;
          gap: 2px;
          width: 100%;
        }
        .commit-header {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          font-weight: 700;
        }
        .commit-repo { color: var(--acc); }
        .commit-sha { color: var(--ink3); font-family: monospace; }
        .commit-time { color: var(--ink3); font-size: 9px; }
        .commit-msg {
          color: var(--ink);
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
          max-width: 250px;
        }

        .dev-neofetch-card {
          font-family: monospace;
          font-size: 11px;
          color: var(--ink);
          line-height: 1.4;
        }
        .neofetch-line {
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }

        /* ── GITHUB ACTIVITY ── */
        /* ── HIGH-TECH DEV CONSOLE HUD ── */
        .dev-hub-console {
          background: rgba(30, 30, 30, 0.45);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          overflow: hidden;
          backdrop-filter: blur(20px);
          box-shadow: 0 20px 50px rgba(0,0,0,0.3);
          margin-bottom: 24px;
          font-family: var(--font-body), sans-serif;
          transition: all 0.3s;
        }
        .rw:not(.dark) .dev-hub-console {
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(0, 0, 0, 0.08);
          box-shadow: 0 20px 40px rgba(0,0,0,0.05);
        }
        .dev-hub-header {
          background: rgba(0, 0, 0, 0.25);
          padding: 12px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          flex-wrap: wrap;
          gap: 12px;
        }
        .rw:not(.dark) .dev-hub-header {
          background: rgba(0, 0, 0, 0.04);
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }
        .dev-hub-dots {
          display: flex;
          gap: 6px;
        }
        .dev-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          display: inline-block;
        }
        .dev-dot.red { background: #ff5f56; }
        .dev-dot.yellow { background: #ffbd2e; }
        .dev-dot.green { background: #27c93f; }
        .dev-hub-tabs {
          display: flex;
          gap: 4px;
          margin-left: 12px;
        }
        .dev-tab {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 8px 8px 0 0;
          font-size: 11px;
          font-weight: 700;
          color: var(--ink3);
          background: transparent;
          cursor: pointer;
          user-select: none;
        }
        .dev-tab.active {
          background: rgba(255,255,255,0.04);
          color: var(--ink);
          border-bottom: 2px solid var(--acc);
        }
        .rw:not(.dark) .dev-tab.active {
          background: rgba(0,0,0,0.03);
          border-bottom: 2px solid var(--acc);
        }
        .dev-hub-status {
          margin-left: auto;
        }
        .status-badge {
          font-size: 10px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 100px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }
        .status-badge.online {
          color: #23d05e;
          background: rgba(35, 208, 94, 0.1);
          border: 1px solid rgba(35, 208, 94, 0.2);
        }
        .status-badge.offline {
          color: var(--ink3);
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--bd);
        }
        .dev-hub-body {
          padding: 24px;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 24px;
          align-items: center;
        }
        .dev-hub-body.sandbox-active {
          grid-template-columns: 1fr;
        }
        .sandbox-wrapper {
          display: flex;
          gap: 20px;
          width: 100%;
          flex-wrap: wrap;
        }
        .sandbox-col {
          flex: 1;
          min-width: 280px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        @media(max-width: 900px) {
          .dev-hub-body {
            grid-template-columns: 1fr !important;
            gap: 20px;
          }
          .dev-hub-divider {
            display: none;
          }
        }
        .dev-vscode-card {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .dev-vscode-icon {
          width: 52px;
          height: 52px;
          border-radius: 12px;
          overflow: hidden;
          background: rgba(255,255,255,0.03);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          flex-shrink: 0;
          animation: floatSlow 3s ease-in-out infinite alternate;
        }
        .dev-vscode-info {
          flex: 1;
          min-width: 0;
        }
        .dev-vscode-label {
          font-size: 9px;
          font-weight: 800;
          color: var(--acc);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .dev-vscode-app {
          font-size: 14px;
          font-weight: 800;
          color: var(--ink);
          margin-top: 2px;
        }
        .dev-vscode-file {
          font-size: 12px;
          color: var(--ink2);
          margin-top: 4px;
        }
        .dev-vscode-file strong {
          color: var(--acc);
        }
        .dev-vscode-time {
          font-size: 10px;
          color: var(--ink3);
          margin-top: 4px;
        }
        .dev-hub-divider {
          width: 1px;
          height: 80px;
          background: var(--bd);
        }
        .dev-github-card {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .dev-github-label {
          font-size: 9px;
          font-weight: 800;
          color: var(--ink3);
          letter-spacing: 0.1em;
        }
        .dev-github-title {
          font-size: 13px;
          font-weight: 700;
          color: var(--ink);
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .gh-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #2ea043;
          animation: blink 2s ease infinite;
        }
        .dev-github-chart {
          width: 100%;
          border-radius: 10px;
          overflow: hidden;
          background: rgba(0, 0, 0, 0.1);
          padding: 8px;
          border: 1px solid var(--bd);
        }
        .dev-github-chart img {
          width: 100%;
          height: auto;
          display: block;
        }
        .rw.dark .dev-github-chart img {
          filter: invert(1) hue-rotate(180deg) brightness(0.85);
        }

        /* ── REPOS CARD OVERHAUL ── */
        .gh-repos-block {
          background: rgba(30, 30, 30, 0.25);
          border: 1px solid var(--bd);
          border-radius: 20px;
          padding: 20px;
          backdrop-filter: blur(12px);
          margin-bottom: 36px;
        }
        .rw:not(.dark) .gh-repos-block {
          background: rgba(255,255,255,0.4);
        }
        .gh-repos-hd {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .gh-repos-title {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--ink2);
        }
        .gh-repos-link {
          font-size: 12px;
          font-weight: 700;
          color: var(--acc);
          text-decoration: none;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .gh-repos-link:hover {
          transform: translateX(3px);
          opacity: 0.85;
        }
        .gh-repos-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        @media(max-width:580px){.gh-repos-grid{grid-template-columns:1fr;}}
        .gh-repo-card {
          background: rgba(20, 20, 20, 0.4);
          border: 1px solid var(--bd);
          border-radius: 12px;
          padding: 16px;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          gap: 8px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .rw:not(.dark) .gh-repo-card {
          background: rgba(255, 255, 255, 0.7);
        }
        .gh-repo-card:hover {
          border-color: var(--acc);
          background: rgba(20, 20, 20, 0.6);
          transform: translateY(-4px);
          box-shadow: 0 10px 24px rgba(0,0,0,0.15);
        }
        .rw:not(.dark) .gh-repo-card:hover {
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 0 10px 24px rgba(0,0,0,0.04);
        }
        .gh-repo-name {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 800;
          color: var(--ink);
        }
        .gh-repo-desc {
          font-size: 11px;
          color: var(--ink2);
          line-height: 1.5;
        }
        .gh-repo-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 10px;
          color: var(--ink3);
          margin-top: auto;
        }
        .gh-repo-lang{display:flex;align-items:center;gap:3px;}
        .gh-lang-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}
        .gh-repo-skeleton{background:var(--bg);border:1px solid var(--bd);border-radius:10px;padding:11px 13px;display:flex;flex-direction:column;gap:8px;}
        .skel{background:linear-gradient(90deg,var(--bd) 25%,var(--bg2) 50%,var(--bd) 75%);background-size:200% 100%;animation:skelShimmer 1.4s ease infinite;border-radius:4px;}
        .skel-title{height:12px;width:60%;}
        .skel-desc{height:10px;width:90%;}
        .skel-meta{height:9px;width:40%;}
        @keyframes skelShimmer{0%{background-position:200% 0;}100%{background-position:-200% 0;}}

        /* ── FOOTER LIKE HUB ── */
        .footer-like-section {
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
        }
        @media(max-width:768px) {
          .footer-inner {
            flex-direction: column;
            align-items: center;
            gap: 28px;
            text-align: center;
          }
          .footer-right {
            align-items: center;
          }
        }
        .like-wrap{display:flex;flex-direction:row;align-items:center;gap:12px;position:relative;z-index:2;}
        .like-btn{display:flex;align-items:center;gap:6px;padding:9px 18px;background:rgba(255,255,255,0.03);border:1.5px solid rgba(255,255,255,0.08);border-radius:100px;font-family:inherit;font-size:13px;font-weight:700;color:var(--ink);transition:all .25s cubic-bezier(0.4, 0, 0.2, 1);backdrop-filter:blur(8px);cursor:pointer;}
        .rw:not(.dark) .like-btn{background:rgba(0,0,0,0.03);border:1.5px solid rgba(0,0,0,0.08);}
        .like-btn:hover{border-color:var(--acc);transform:translateY(-2px);box-shadow:0 6px 18px rgba(0,0,0,0.1);}
        .like-btn.liked{border-color:rgba(239,68,68,.35);background:rgba(239,68,68,.08);color:#ef4444;box-shadow:0 0 15px rgba(239,68,68,0.12);}
        .like-btn.anim .like-heart{animation:heartPop .6s cubic-bezier(.34,1.56,.64,1);}
        .like-heart{font-size:15px;line-height:1;}
        @keyframes heartPop{0%{transform:scale(1);}40%{transform:scale(1.5);}70%{transform:scale(0.95);}100%{transform:scale(1);}}
        .like-count{display:flex;align-items:center;gap:4px;background:rgba(255,255,255,0.02);border:1px solid var(--bd);padding:8px 14px;border-radius:100px;font-size:11px;}
        .rw:not(.dark) .like-count{background:rgba(0,0,0,0.01);}
        .like-num{font-size:15px;font-weight:800;font-family:var(--font-heading);color:var(--ink);}
        .like-sub{font-size:11px;color:var(--ink2);font-weight:600;}

        /* ── Radial Fireworks Love Particles ── */
        .love-particle{
          position:absolute;font-size:var(--sz,20px);pointer-events:none;z-index:10;
          animation:loveFloat var(--dur,2s) var(--delay,0s) cubic-bezier(0.25, 1, 0.5, 1) forwards;
          opacity:0;user-select:none;
        }
        @keyframes loveFloat{
          0%{opacity:0;transform:translate(-50%, -50%) scale(0.3) rotate(0deg);}
          15%{opacity:1;transform:translate(-50%, -50%) scale(1.1) rotate(0deg);}
          100%{opacity:0;transform:translate(calc(-50% + var(--tx, 0px)), calc(-50% + var(--ty, -120px))) scale(var(--scale, 1)) rotate(var(--rot, 45deg));}
        }

        /* ── COMMUNITY GALLERY ── */
        .gallery-slider-wrap{position:relative;overflow:hidden;border-radius:16px;}
        .gallery-grid{display:flex;overflow-x:auto;gap:12px;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none;cursor:grab;user-select:none;}
        .gallery-grid::-webkit-scrollbar{display:none;}
        .gallery-grid .gallery-item{min-width:calc((100% - 48px) / 5);max-width:calc((100% - 48px) / 5);scroll-snap-align:start;flex-shrink:0;}
        .gallery-item{position:relative;border-radius:12px;overflow:hidden;aspect-ratio:1;background:var(--bg2);cursor:pointer;transition:transform .25s;}
        .gallery-item:hover{transform:scale(1.02);}
        .gallery-modal{background:var(--bg);border:1px solid var(--bd);border-radius:20px;overflow:hidden;max-width:480px;width:90vw;position:relative;}
        .gallery-modal-img{width:100%;aspect-ratio:4/3;object-fit:cover;display:block;}
        .gallery-modal-info{padding:16px 20px;}
        .gallery-modal-name{font-size:16px;font-weight:800;color:var(--ink);}
        .gallery-modal-caption{font-size:13px;color:var(--ink2);margin-top:4px;line-height:1.5;}
        .gallery-modal-ig{font-size:12px;color:var(--acc);font-weight:700;margin-top:6px;}
        .gallery-item img{width:100%;height:100%;object-fit:cover;transition:transform .4s;}
        .gallery-item:hover img{transform:scale(1.06);}
        .gallery-overlay{position:absolute;bottom:0;left:0;right:0;padding:10px 12px;background:linear-gradient(transparent,rgba(0,0,0,.65));opacity:0;transition:opacity .3s;}
        .gallery-item:hover .gallery-overlay{opacity:1;}
        .gallery-name{font-size:12px;font-weight:700;color:#fff;}
        .gallery-caption{font-size:10px;color:rgba(255,255,255,.75);margin-top:2px;}
        .gallery-empty{min-width:100%;text-align:center;padding:50px 20px;color:var(--ink2);font-size:14px;display:flex;flex-direction:column;align-items:center;gap:10px;}
        .gallery-upload-link{font-size:13px;font-weight:700;color:var(--acc);text-decoration:none;}
        .gallery-cta-btn{display:inline-flex;align-items:center;padding:10px 20px;background:var(--bg2);border:1px solid var(--bd);border-radius:100px;font-size:12px;font-weight:700;color:var(--ink);text-decoration:none;transition:all .2s;white-space:nowrap;align-self:flex-start;}
        .gallery-cta-btn:hover{border-color:var(--acc);transform:translateY(-2px);}
        .gallery-item-featured{border:2px solid var(--acc);}
        .gallery-badge{font-size:9px;font-weight:800;background:var(--acc);color:#000;padding:2px 7px;border-radius:100px;display:inline-block;margin-bottom:3px;}
        .gallery-dots{display:flex;justify-content:center;gap:6px;margin-top:14px;flex-wrap:wrap;}
        .gallery-dot{width:6px;height:6px;border-radius:100px;background:var(--bd);cursor:pointer;transition:all .3s;border:1px solid var(--bd);}
        .gallery-dot.active{width:18px;background:var(--acc);border-color:var(--acc);}

        /* ── COMMENT REPLIES ── */
        /* ── COMMENTS AVATAR OVERHAUL ── */
        .comment-user-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }
        .comment-avatar, .reply-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 800;
          color: #ffffff;
          box-shadow: 0 4px 10px rgba(0,0,0,0.15);
          user-select: none;
          flex-shrink: 0;
        }
        .reply-avatar {
          width: 28px;
          height: 28px;
          font-size: 11px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
        .comment-meta-info {
          flex: 1;
        }
        .comment-name {
          font-size: 13px;
          font-weight: 800;
          color: var(--ink);
          margin: 0 0 2px 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .comment-name::after {
          display: none;
        }
        .comment-dt {
          font-size: 9px;
          font-weight: 700;
          color: var(--ink3);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin: 0;
        }
        .reply-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-top: 12px;
          padding-left: 12px;
          border-left: 2px solid var(--bd);
        }
        .reply-arrow {
          display: none;
        }
        .reply-content-box {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .reply-name {
          font-size: 11px;
          font-weight: 800;
          color: var(--ink);
        }
        .reply-msg {
          font-size: 11px;
          color: var(--ink2);
          line-height: 1.4;
        }
        .reply-toggle{margin-top:8px;}
        .reply-btn{font-size:11px;font-weight:700;color:var(--acc);background:none;border:none;padding:0;cursor:pointer;opacity:.8;transition:opacity .2s;}
        .reply-btn:hover{opacity:1;}
        .reply-form{display:flex;flex-direction:column;gap:6px;margin-top:8px;}
        .reply-input{padding:8px 10px;background:var(--bg);border:1px solid var(--bd);border-radius:8px;font-family:inherit;font-size:12px;color:var(--ink);outline:none;transition:border-color .2s;}
        .reply-input:focus{border-color:var(--acc);}
        .reply-send{padding:7px 14px;background:var(--acc);color:#0d0d0d;border:none;border-radius:8px;font-family:inherit;font-size:12px;font-weight:700;align-self:flex-end;}

        /* ── AI CHAT PANEL ── */
        .ai-panel{position:fixed;bottom:100px;right:100px;z-index:300;width:420px;background:var(--bg2);border:1px solid var(--bd);border-radius:20px;box-shadow:0 24px 64px rgba(0,0,0,0.25);display:flex;flex-direction:column;overflow:hidden;animation:up 0.25s ease;}
        .ai-panel-head{padding:14px 18px;background:var(--bg);border-bottom:1px solid var(--bd);display:flex;align-items:center;gap:10px;}
        .ai-panel-dot{width:8px;height:8px;border-radius:50%;background:var(--acc);animation:blink 2s ease infinite;}
        .ai-panel-title{font-size:13px;font-weight:800;color:var(--ink);flex:1;}
        .ai-panel-close{background:transparent;border:none;color:var(--ink2);font-size:16px;cursor:pointer;padding:2px 6px;border-radius:6px;line-height:1;}
        .ai-msgs{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px;max-height:420px;min-height:200px;}
        .ai-msg{max-width:85%;padding:10px 13px;border-radius:14px;font-size:13px;line-height:1.5;}
        .ai-msg.user{background:var(--acc);color:#0d0d0d;align-self:flex-end;border-bottom-right-radius:4px;font-weight:600;}
        .ai-msg.assistant{background:var(--bg);border:1px solid var(--bd);color:var(--ink);align-self:flex-start;border-bottom-left-radius:4px;}
        .ai-empty{text-align:center;color:var(--ink2);font-size:12px;padding:20px;}
        .ai-panel-foot{padding:10px 14px;border-top:1px solid var(--bd);display:flex;gap:8px;background:var(--bg);}
        .ai-input{flex:1;padding:9px 13px;background:var(--bg2);border:1.5px solid var(--bd);color:var(--ink);border-radius:10px;font-family:inherit;font-size:13px;outline:none;}
        .ai-input:focus{border-color:var(--acc);}
        .ai-send{padding:9px 14px;background:var(--acc);color:#0d0d0d;border:none;border-radius:10px;font-family:inherit;font-size:12px;font-weight:800;cursor:pointer;flex-shrink:0;}
        .ai-send:disabled{opacity:0.5;}
        @media(max-width:600px){.ai-panel{right:12px;left:12px;width:auto;bottom:145px;}}

        /* ── ANIMATIONS ── */
        @keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
        @keyframes up{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
        @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
        @keyframes zoom{from{transform:scale(0.93);opacity:0;}to{transform:scale(1);opacity:1;}}
        @keyframes slideRight{from{opacity:0;transform:translateX(-24px);}to{opacity:1;transform:translateX(0);}}
        @keyframes popIn{from{opacity:0;transform:scale(0.85);}to{opacity:1;transform:scale(1);}}
        @keyframes floatY{0%,100%{transform:translateY(0);}50%{transform:translateY(-8px);}}
        /* Subtle glow pulse on accent elements */
        @keyframes glowPulse{0%,100%{box-shadow:0 0 0 0 var(--acc-bg);}50%{box-shadow:0 0 0 8px transparent;}}
        /* Sheen sweep on cards */
        @keyframes sheenMove{0%{left:-100%;}100%{left:200%;}}
        .cert-card:hover::after,.proj-card:hover::after,.goal-card:hover::after,.skill-card:hover::after{
          content:'';position:absolute;top:0;left:-100%;width:60%;height:100%;
          background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.06) 50%,transparent 60%);
          animation:sheenMove 0.6s ease forwards;pointer-events:none;
        }
        .cert-card,.proj-card,.goal-card,.skill-card{position:relative;overflow:hidden;}
        
        /* ── RESPONSIVE: TABLET ── */
        @media(max-width:900px){
          .wrap,.nav-in{padding-left:28px;padding-right:28px;}
          .nav-links{display:none;}
          .hero{grid-template-columns:1fr;padding-top:90px;padding-bottom:56px;gap:36px;}
          .hero>*:last-child{order:-1;}
          .hero-photo-wrap{height:240px;width:100%;}
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
          .cert-grid{grid-template-columns:repeat(2,1fr) !important;}
          .footer-inner{flex-direction:column;align-items:center;text-align:center;}
          .footer-right{align-items:center;}
        }

        /* ── RESPONSIVE: MOBILE ── */
        @media(max-width:600px){
          .wrap,.nav-in{padding-left:20px;padding-right:20px;}
          .nav-right{gap:6px;}
          .btn-theme,.btn-admin{display:none;}
          .ai-btn-desktop{display:none;}

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
          .skill-card{padding:14px; min-height:124px;}
          .skill-name{font-size:14px;}
          .skill-desc-overlay{padding:14px;}
          .skill-desc-text{font-size:11px; line-height:1.45; margin:6px 0 auto 0;}
          .skill-icon-wrap{width:36px; height:36px; border-radius:10px;}
          .skill-icon-wrap svg{width:20px; height:20px;}

          .goals-grid{grid-template-columns:1fr;gap:12px;}
          .goal-card{padding:20px;}

          .proj-grid{display:flex;overflow-x:auto;gap:14px;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;padding-bottom:16px;scrollbar-width:none;}
          .proj-grid::-webkit-scrollbar{display:none;}
          .proj-grid .proj-card{min-width:82vw;max-width:82vw;scroll-snap-align:start;flex-shrink:0;}

          /* CSS Mobile untuk Certificate Grid */
          .cert-grid-wrap{width:100%;}
          .cert-grid{grid-template-columns:1fr !important;gap:16px !important;display:grid !important;}
          .cert-card{width:100%;border-radius:16px;overflow:hidden;background:var(--bg2);border:1px solid var(--bd);}
          .cert-card:nth-child(n+3) { display: none !important; }
          .cert-img{aspect-ratio:16/10!important;width:100%!important;background:var(--bg);position:relative;}
          .cert-img img{width:100%!important;height:100%!important;object-fit:cover!important;object-position:top center!important;display:block!important;}
          .cert-info{padding:12px 14px!important;}
          .cert-info-t p{font-size:14px!important;max-width:240px!important;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
          .cert-info-t span{font-size:12px!important;}

          /* CSS Mobile untuk Code Sandbox */
          .sandbox-wrapper {
            gap: 16px !important;
          }
          .sandbox-col {
            min-width: 100% !important;
          }
          .sandbox-col textarea, .sandbox-col iframe {
            height: 200px !important;
          }
          .dev-hub-body {
            padding: 14px !important;
          }
          
          .gallery-grid .gallery-item{min-width:78vw;max-width:78vw;scroll-snap-align:start;flex-shrink:0;}
          .mobile-scroll-hint{display:flex!important;justify-content:center;gap:6px;margin-top:14px;align-items:center;}
          .mobile-scroll-hint span{width:6px;height:6px;border-radius:50%;background:var(--bd);transition:background 0.3s ease,width 0.3s ease;display:inline-block;}
          .mobile-scroll-hint span.active{background:var(--acc);width:20px;border-radius:4px;}

          .contact-grid{gap:32px;}
          .comments-list{max-height:320px;overflow-y:scroll;scrollbar-gutter:stable;}

          .modal-overlay{padding:12px;}
          .modal-box{border-radius:16px;}
          .modal-img-side{min-height:160px;}
          .modal-info-side{padding:20px 16px;}
          .modal-note-title{font-size:16px;}

          .float-group{bottom:18px;right:16px;gap:7px;}
          .lang-btn{display:none;}
          .lang-btn{width:48px;height:30px;font-size:11px;}
          .float-ai-btn{width:48px;height:48px;font-size:13px;}
          .music-btn{width:48px;height:48px;font-size:16px;}

          .footer{padding-top:28px;padding-bottom:28px;}
          .footer-logo{font-size:17px;}
          .footer-views{padding:7px 14px;}
          .footer-right{align-items:center;}

          .cert-empty,.proj-empty{padding:40px 16px;}

          .footer-like-section{margin:0;}
          .like-num{font-size:26px;}
        }

        /* ── EXTRA SMALL ── */
        @media(max-width:380px){
          .wrap,.nav-in{padding-left:16px;padding-right:16px;}
          .hero-h1{font-size:30px;}
          .hero-tag{font-size:10px;}
          .hero-btns{flex-direction:column;align-items:flex-start;}
          .btn-dark,.btn-acc{width:100%;justify-content:center;}
        }

        /* ── SECTION CTA BUTTONS ── */
        .sec-cta-wrap {
          display: flex;
          justify-content: center;
          margin-top: 48px;
        }
        .sec-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 14px 36px;
          background: var(--bg2);
          border: 1px solid var(--bd);
          color: var(--ink);
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          border-radius: 100px;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
        }
        .sec-cta-btn:hover {
          border-color: var(--acc);
          background: rgba(212, 235, 0, 0.05);
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -10px rgba(212, 235, 0, 0.25);
        }
        .sec-cta-arrow {
          transition: transform 0.25s ease;
          display: inline-block;
          font-weight: 900;
        }
        .sec-cta-btn:hover .sec-cta-arrow {
          transform: translateX(4px);
        }
      `}</style>

      {/* ── BG ANIMATION CANVAS ── */}
      {!ecoMode && <BackgroundCanvas bgAnimation={bgAnimation} themeColor={themeColor} isDark={isDark} />}

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
          <div key={ripple.key} className="theme-ripple"
            style={{ '--rx': `${ripple.x}%`, '--ry': `${ripple.y}%`, '--ripple-color': ripple.color }}
          />
        )}

        {/* LOADING SCREEN */}
        {/* LOADING SCREEN */}
        {!pageReady && (
          <div
            style={{
              position:'fixed',inset:0,zIndex:99999,
              background:'radial-gradient(circle at center, #09090c 0%, #020204 100%)',
              display:'flex',flexDirection:'column',
              alignItems:'center',justifyContent:'center',
              gap:'24px',
            }}
          >
            {/* Holographic Glowing grid overlay */}
            <div style={{
              position:'absolute',inset:0,
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
              backgroundSize: '30px 30px',
              backgroundPosition: 'center center',
              maskImage: 'radial-gradient(circle, black 30%, transparent 80%)',
              WebkitMaskImage: 'radial-gradient(circle, black 30%, transparent 80%)',
              opacity: 0.8,
              zIndex: 0,
              pointerEvents: 'none'
            }}/>

            {/* Soft Accent Ambient Glow */}
            <div style={{
              position: 'absolute',
              width: '450px',
              height: '450px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(129,140,248,0.08) 0%, transparent 70%)',
              filter: 'blur(60px)',
              pointerEvents: 'none',
              zIndex: 0,
              animation: 'glowPulse 4s ease-in-out infinite alternate'
            }} />

            {/* Cybernetic Rotating Rings */}
            <div style={{ position: 'relative', width: '130px', height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
              {/* Outer Spin Ring */}
              <svg style={{ position: 'absolute', width: '100%', height: '100%', transform: 'rotate(-90deg)', animation: 'spinCw 4s linear infinite' }} viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" stroke="rgba(255,255,255,0.03)" strokeWidth="1.5" fill="transparent"/>
                <circle cx="50" cy="50" r="45" stroke="#818cf8" strokeWidth="2.5" fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 45}`} strokeDashoffset={`${2 * Math.PI * 45 * (1 - loadProgress / 100)}`}
                  strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.1s ease-out', filter: 'drop-shadow(0 0 8px #818cf8)' }}/>
              </svg>

              {/* Inner Speed Ring */}
              <svg style={{ position: 'absolute', width: '80%', height: '80%', transform: 'rotate(45deg)', animation: 'spinCcw 2.5s ease-in-out infinite alternate' }} viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.02)" strokeWidth="1" fill="transparent"/>
                <circle cx="50" cy="50" r="40" stroke="#818cf8" strokeWidth="2" fill="transparent"
                  strokeDasharray="60 180" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 4px #818cf8)' }}/>
              </svg>

              {/* Central Pulsing Glowing Orb */}
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #ffffff 0%, #38bdf8 65%, #818cf8 100%)',
                boxShadow: '0 0 25px rgba(56,189,248,0.85), 0 0 12px rgba(129,140,248,0.4), inset 0 2px 4px rgba(255,255,255,0.7)',
                zIndex: 2,
                animation: 'textBreath 2s ease-in-out infinite',
                userSelect: 'none'
              }} />
            </div>

            {/* Premium Brand Typographic Label */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              zIndex: 1
            }}>
              <div style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '16px',
                fontWeight: '800',
                color: '#ffffff',
                letterSpacing: '0.35em',
                textTransform: 'uppercase',
                textIndent: '0.35em',
              }}>
                aura<span style={{ color: '#38bdf8' }}>au</span>varose
              </div>
              <div style={{
                fontFamily: "'Space Grotesk', monospace",
                fontSize: '9px',
                fontWeight: '700',
                color: 'rgba(255,255,255,0.3)',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                textIndent: '0.25em'
              }}>
                creative developer portfolio
              </div>
            </div>

            {/* High-Tech Monospace Load-Log Console */}
            <div style={{
              width: '280px',
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.04)',
              borderRadius: '12px',
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              zIndex: 1,
              boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.5)',
              fontFamily: "'Space Grotesk', monospace"
            }}>
              {/* Row 1 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'rgba(255,255,255,0.2)' }}>
                <span>SYS_INIT // BOOT_SEQUENCE</span>
                <span style={{ color: '#38bdf8' }}>[ ONLINE ]</span>
              </div>
              {/* Row 2 */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.85)', fontWeight: '600', marginTop: '2px' }}>
                <span style={{ color: '#38bdf8' }}>&gt;</span>
                <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: '220px' }}>{loadText}</span>
              </div>
              {/* Progress Slider Bar */}
              <div style={{ width: '100%', height: '2px', background: 'rgba(255,255,255,0.06)', borderRadius: '100px', marginTop: '6px', overflow: 'hidden', position: 'relative' }}>
                <div style={{
                  height: '100%',
                  width: `${loadProgress}%`,
                  background: 'linear-gradient(90deg, #38bdf8, #818cf8)',
                  boxShadow: '0 0 10px rgba(129,140,248,0.4), 0 0 2px rgba(129,140,248,0.2)',
                  borderRadius: '100px',
                  transition: 'width 0.1s ease-out'
                }}/>
              </div>
              {/* Percentage Indicator */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                <span>SECURE DATABASE SYNC</span>
                <span style={{ fontWeight: '700', color: '#38bdf8' }}>{loadProgress}%</span>
              </div>
            </div>

            <style>{`
              @keyframes glowPulse {
                0% { transform: scale(0.9); opacity: 0.8; }
                100% { transform: scale(1.15); opacity: 1.1; }
              }
              @keyframes spinCw {
                100% { transform: rotate(270deg); }
              }
              @keyframes spinCcw {
                0% { transform: rotate(45deg); }
                100% { transform: rotate(-315deg); }
              }
              @keyframes textBreath {
                0%, 100% { transform: scale(1); opacity: 0.95; filter: drop-shadow(0 0 12px ${themeColor}55); }
                50% { transform: scale(1.05); opacity: 0.8; filter: drop-shadow(0 0 24px ${themeColor}aa); }
              }
            `}</style>
          </div>
        )}

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

        {/* ── MOBILE OVERLAY ── */}
        <div className={`mobile-overlay${mobileMenuOpen ? ' open' : ''}`} onClick={() => setMobileMenuOpen(false)} />

        {/* ── MOBILE DRAWER ── */}
        <div className={`mobile-drawer${mobileMenuOpen ? ' open' : ''}`}>
          <div className="mobile-drawer-head">
            <div className="mobile-drawer-logo">aura<em>a</em>uvarose</div>
            <button className="mobile-drawer-close" onClick={() => setMobileMenuOpen(false)}>✕</button>
          </div>
          <ul className="mobile-nav-list">
            <li><a href="#" onClick={() => setMobileMenuOpen(false)}>{tx.navHome}</a></li>
            <li><a href="#about" onClick={() => setMobileMenuOpen(false)}>{tx.navAbout}</a></li>
            <li><a href="#skills" onClick={() => setMobileMenuOpen(false)}>{tx.navSkills}</a></li>
            <li><a href="#projects" onClick={() => setMobileMenuOpen(false)}>{tx.navProjects}</a></li>
            <li><a href="#portfolio" onClick={() => setMobileMenuOpen(false)}>{tx.navCerts}</a></li>
            <li><a href="#gallery" onClick={() => setMobileMenuOpen(false)}>📸 Gallery</a></li>
            <li><a href="#contact" onClick={() => setMobileMenuOpen(false)}>{tx.navContact}</a></li>
            <li><a href="/game" className="nav-game">{tx.navGame}</a></li>
          </ul>
          <div className="mobile-drawer-actions">
            <div className="mobile-action-row">
              <button
                ref={themeBtnRef}
                className="mobile-action-btn"
                onClick={() => { toggleTheme(); setMobileMenuOpen(false); }}
              >
                {d ? '☀ Light' : '🌙 Dark'}
              </button>
            </div>
            <div className="mobile-action-row">
              <a href="/admin" className="mobile-action-btn accent">⚙ Admin</a>
              <button
                className="mobile-action-btn"
                onClick={() => { setLang(lang === 'id' ? 'en' : 'id'); setMobileMenuOpen(false); }}
              >
                {lang === 'id' ? '🇮🇩 ID' : '🇬🇧 EN'}
              </button>
            </div>
          </div>
        </div>

        {/* NAV */}
        <nav className="nav">
          <div className="nav-in">
            <a href="#" className="logo">aura<em>a</em>uvarose</a>
            <ul className="nav-links">
              <li><a href="#">{tx.navHome}</a></li>
              <li><a href="#about">{tx.navAbout}</a></li>
              <li><a href="#skills">{tx.navSkills}</a></li>
              <li><a href="#projects">{tx.navProjects}</a></li>
              <li><a href="#portfolio">{tx.navCerts}</a></li>
              <li><a href="#contact">{tx.navContact}</a></li>
              <li><a href="/game" className="nav-game">{tx.navGame}</a></li>
            </ul>
            <div className="nav-right">
              <button ref={themeBtnRef} className="btn-theme" onClick={toggleTheme}>
                {d ? '☀ Light' : '🌙 Dark'}
              </button>
              <a href="/admin" className="btn-admin">⚙ Admin</a>
              {/* Hamburger for mobile */}
              <button
                className={`hamburger${mobileMenuOpen ? ' open' : ''}`}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Menu"
              >
                <span/><span/><span/>
              </button>
            </div>
          </div>
        </nav>

        {/* HERO */}
        <section className="wrap hero">
          <FadeIn direction="up" delay={0.2}>
            <div>
              <div className="hero-tag"><span className="hero-dot" />{tx.heroBadge}</div>
              <h1 className="hero-h1">
                <span className="hero-line-1">{tx.heroGreet}</span>
                <span className="hero-line-2">Aura <em className="hero-loop-name gradient-text">{loopName}<span className="hero-cursor">|</span></em></span>
              </h1>
              <p className="hero-p">
                {typedDesc}<span className={`type-cursor${typingDone?' done':''}`}>|</span>
              </p>
              <div className="hero-btns">
                <motion.a
                  href="#contact"
                  className="btn-dark"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {tx.heroBtn}
                </motion.a>
                <motion.a
                  href={`/cv?lang=${lang}&color=${encodeURIComponent(themeColor)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-dark"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ background: 'transparent', border: `2px solid ${themeColor}`, color: themeColor, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {tx.downloadCV}
                </motion.a>
                <motion.div
                  className="btn-acc"
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🕐 {time || '00:00:00'}
                </motion.div>
              </div>
            </div>
          </FadeIn>
          <FadeIn direction="left" delay={0.4}>
            <FloatingElement amplitude={8} duration={4}>
              <div className="hero-photo-wrap">
                <div className="hero-photo-bg" />
                <div className="hero-photo">
                  <motion.img
                    src={profileImage || "https://api.dicebear.com/7.x/notionists/svg?seed=Aura&backgroundColor=c7d2fe"}
                    alt="Aura"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                {/* Floating Badges */}
                <div className="float-badge badge-1">
                  <span>🚀</span>
                  <span>{isID ? 'Arch Linux' : 'Arch Linux'}</span>
                </div>
                <div className="float-badge badge-2">
                  <span>💻</span>
                  <span>{isID ? 'Pengembang Kreatif' : 'Creative Dev'}</span>
                </div>
                <div className="float-badge badge-3">
                  <span>⚡</span>
                  <span>Next.js 16</span>
                </div>
              </div>
            </FloatingElement>
          </FadeIn>
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

        {/* SOCIAL MARQUEE (draggable) */}
        <div className="social-strip" data-reveal>
          <div className="social-strip-inner">
            <div className="social-track" ref={socialTrackRef}>
              {[...socials, ...socials].map((s, i) => (
                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="social-btn">
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
              <div
                key={`${sk.name}-${i}`}
                className={`skill-card mag ${activeSkill === i ? 'active' : ''}`}
                data-reveal
                data-delay={String((i%4)+1)}
                onMouseEnter={() => setActiveSkill(i)}
                onMouseLeave={() => setActiveSkill(null)}
                onClick={() => setActiveSkill(activeSkill === i ? null : i)}
                style={{
                  '--skill-color': sk.color,
                  '--skill-color-rgb': sk.colorRgb
                }}
              >
                {/* Standard layout */}
                <div className="skill-main">
                  <div className="skill-header">
                    <div className="skill-icon-wrap">
                      {sk.icon}
                    </div>
                    <div className="skill-cat">{sk.cat}</div>
                  </div>
                  <div className="skill-name">{sk.name}</div>
                </div>

                {/* Description slide-up overlay on hover / click */}
                <div className="skill-desc-overlay">
                  <div className="skill-desc-cat">{sk.cat}</div>
                  <div className="skill-desc-text">
                    {isID ? sk.desc.id : sk.desc.en}
                  </div>
                  <div className="skill-desc-footer">
                    <span>{sk.name}</span>
                    <span>{isID ? 'Tekan/Hover' : 'Tap/Hover'}</span>
                  </div>
                </div>
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
          {/* HIGH-TECH DEVELOPER HUB / IDE CONSOLE */}
          <div className="dev-hub-console" data-reveal>
            <div className="dev-hub-header">
              <div className="dev-hub-dots">
                <span className="dev-dot red"></span>
                <span className="dev-dot yellow"></span>
                <span className="dev-dot green"></span>
              </div>
              <div className="dev-hub-tabs">
                <div className={`dev-tab ${devHubActiveTab === 'status' ? 'active' : ''}`} onClick={() => setDevHubActiveTab('status')}>
                  <span className="dev-tab-icon">⚡</span>
                  <span>status.js</span>
                </div>
                <div className={`dev-tab ${devHubActiveTab === 'github' ? 'active' : ''}`} onClick={() => setDevHubActiveTab('github')}>
                  <span className="dev-tab-icon">📊</span>
                  <span>github.json</span>
                </div>
                <div className={`dev-tab ${devHubActiveTab === 'sandbox' ? 'active' : ''}`} onClick={() => setDevHubActiveTab('sandbox')}>
                  <span className="dev-tab-icon">🎨</span>
                  <span>sandbox.html</span>
                </div>
              </div>
              <div className="dev-hub-status">
                {ghStatus.online ? (
                  <span className="status-badge online">● {tx.onlineLabel}</span>
                ) : (
                  <span className="status-badge offline">● {tx.offlineLabel}</span>
                )}
              </div>
            </div>

            <div className={`dev-hub-body ${devHubActiveTab === 'sandbox' ? 'sandbox-active' : ''}`}>
              {devHubActiveTab === 'sandbox' ? (
                <div className="sandbox-wrapper">
                  {/* Left Side: Code Editor */}
                  <div className="sandbox-col">
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold', fontFamily: 'monospace' }}>📝 CODE EDITOR</div>
                    <textarea
                      value={sandboxCode}
                      onChange={e => setSandboxCode(e.target.value)}
                      style={{
                        width: '100%',
                        height: '240px',
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '10px',
                        padding: '12px',
                        color: themeColor,
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        fontSize: '12px',
                        lineHeight: '1.5',
                        outline: 'none',
                        resize: 'none'
                      }}
                    />
                  </div>

                  {/* Right Side: Live Preview */}
                  <div className="sandbox-col">
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold', fontFamily: 'monospace' }}>👁️ LIVE PREVIEW</div>
                    <iframe
                      srcDoc={sandboxCode.replaceAll('var(--theme-color, #d4eb00)', themeColor).replaceAll('#d4eb00', themeColor)}
                      title="Sandbox Live Preview"
                      style={{
                        width: '100%',
                        height: '240px',
                        background: '#0d0d12',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '10px',
                        overflow: 'hidden'
                      }}
                      sandbox="allow-scripts"
                    />
                  </div>
                </div>
              ) : devHubActiveTab === 'status' ? (
                <>
                  <div className="dev-vscode-card">
                    <div className="dev-vscode-icon">
                      <svg viewBox="0 0 100 100" width="36" height="36">
                        <rect width="100" height="100" rx="18" fill="#2b5fce"/>
                        <path d="M70 15L40 47 22 33l-8 6 18 16-18 16 8 6 18-14 30 32 10-5V20z" fill="white" opacity=".9"/>
                      </svg>
                    </div>
                    <div className="dev-vscode-info">
                      <div className="dev-vscode-label">{tx.currentActivity}</div>
                      <div className="dev-vscode-app">Visual Studio Code</div>
                      <div className="dev-vscode-file">
                        Editing <strong>{ghStatus.detail || 'my-portfolio'}</strong>
                      </div>
                      {ghStatus.since && <div className="dev-vscode-time">🕒 {ghStatus.since}</div>}
                    </div>
                  </div>

                  <div className="dev-hub-divider"></div>

                  <div className="dev-neofetch-card">
                    <div className="neofetch-line" style={{ fontWeight: 'bold', color: themeColor }}>aura@Arch-workstation</div>
                    <div className="neofetch-line" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>-----------------------</div>
                    <div className="neofetch-line">💻 OS: <span style={{ color: 'rgba(255,255,255,0.85)' }}>Arch Linux</span></div>
                    <div className="neofetch-line">🐚 Shell: <span style={{ color: 'rgba(255,255,255,0.85)' }}>Bash (JetBrains Mono)</span></div>
                    <div className="neofetch-line">📝 Editor: <span style={{ color: 'rgba(255,255,255,0.85)' }}>VS Code 1.89</span></div>
                    <div className="neofetch-line">🎨 Aksen: <span style={{ color: themeColor, fontWeight: '700' }}>{themeColor}</span></div>
                  </div>
                </>
              ) : (
                <>
                  <div className="dev-github-card" style={{ width: '100%' }}>
                    <div className="dev-github-info" style={{ marginBottom: '8px' }}>
                      <div className="dev-github-label" style={{ fontSize: '9px', fontWeight: '800', color: themeColor }}>OPEN SOURCE CONTRIBUTIONS</div>
                    </div>
                    <div className="dev-github-chart">
                      <img src="https://ghchart.rshah.org/2ea043/auraauvarose" alt="GitHub Contribution Chart" loading="lazy" style={{ width: '100%', height: 'auto', filter: 'brightness(0.95)' }}/>
                    </div>
                  </div>

                  <div className="dev-hub-divider"></div>

                  <div className="dev-github-timeline">
                    <div className="dev-github-commits-hd">💻 RECENT COMMITS FEED</div>
                    {ghCommits.length === 0 ? (
                      <div className="dev-github-commits-empty">No public commits logged today...</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {ghCommits.map((c, i) => (
                          <div key={i} className="dev-github-commit-item">
                            <span className="commit-dot">●</span>
                            <div className="commit-details">
                              <div className="commit-header">
                                <span className="commit-repo">[{c.repo}]</span>
                                <span className="commit-sha">{c.sha}</span>
                              </div>
                              <div className="commit-msg">{c.message}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* RECENT REPOS */}
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
                    <a key={repo.id} href={repo.html_url} target="_blank" rel="noopener noreferrer" className="gh-repo-card" style={{ borderTop: `3px solid ${lc}` }}>
                      <div className="gh-repo-name">
                        <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor" style={{opacity:.5,flexShrink:0}}>
                          <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"/>
                        </svg>
                        <span>{repo.name}</span>
                      </div>
                      {repo.description && <div className="gh-repo-desc">{repo.description.slice(0,60)}</div>}
                      <div className="gh-repo-meta">
                        {repo.language && <span className="gh-repo-lang"><span className="gh-lang-dot" style={{background:lc}}/>{repo.language}</span>}
                        <span>🕒 {ago}</span>
                        {repo.stargazers_count > 0 && <span>⭐ {repo.stargazers_count}</span>}
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
          <div className="proj-grid" ref={projGridRef}>
            {projects.length === 0 ? (
              <div className="proj-empty">{tx.projEmpty}</div>
            ) : projects.slice(0, 3).map((p,i)=>{
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

          {projects.length > 0 && (
            <div className="sec-cta-wrap" data-reveal>
              <a href="/projects" className="sec-cta-btn">
                <span>{isID ? 'Lihat Semua Proyek' : 'View All Projects'}</span>
                <span className="sec-cta-arrow">→</span>
              </a>
            </div>
          )}

          <div className="mobile-scroll-hint">
            {projects.length > 0 && projects.slice(0, 3).map((_,i)=><span key={i} className={i===projActiveIdx?'active':''}/>)}
          </div>
        </section>

        {/* CERTIFICATES */}
        <section className="wrap sec" id="portfolio">
          <div className="sec-head" data-reveal>
            <div><p className="eyebrow">{tx.certEyebrow}</p><h2 className="sec-title">{tx.certTitle}</h2></div>
            <span className="sec-num">0{certificates.length}</span>
          </div>
          {certificates.length === 0 ? (
            <div className="cert-empty" data-reveal>{tx.certEmpty}</div>
          ) : (
            <>
              <div className="cert-grid" data-reveal>
                {certificates.slice(0, 4).map(cert => (
                  <div key={cert.id} className="cert-card mag" onClick={()=>setSelectedCert(cert)}>
                    <div className="cert-img">
                      <img
                        src={cert.image_url}
                        alt={cert.title || 'Sertifikat'}
                        loading="lazy"
                        onError={e => { e.currentTarget.style.opacity='0.3'; }}
                      />
                    </div>
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

              {certificates.length > 0 && (
                <div className="sec-cta-wrap" data-reveal>
                  <a href="/certificates" className="sec-cta-btn">
                    <span>{isID ? 'Lihat Semua Sertifikat' : 'View All Certificates'}</span>
                    <span className="sec-cta-arrow">→</span>
                  </a>
                </div>
              )}
            </>
          )}
        </section>

        {/* GALLERY (Momen & Kenangan) */}
        <section className="wrap sec" id="gallery">
          <div className="sec-head" data-reveal>
            <div>
              <p className="eyebrow">{tx.galleryEyebrow}</p>
              <h2 className="sec-title">{isID?"Momen &":"Moments &"}<br/>{isID?"Kenangan":"Memories"}</h2>
            </div>
            <a href="/submit-photo" target="_blank" className="gallery-cta-btn">{tx.galleryCta}</a>
          </div>
          <div className="gallery-slider-wrap" data-reveal>
            <div className="gallery-grid" ref={galleryGridRef}>
              {profileImage && (
                <div className="gallery-item gallery-item-featured" onClick={()=>setSelectedPhoto({image_url:profileImage, sender_name:'Aura Auvarose', caption:'Potret Kreator Utama', badge:'Admin'})}>
                  <img src={profileImage} alt="Aura Auvarose"/>
                  <div className="gallery-overlay" style={{ opacity: 1 }}>
                    <div className="gallery-badge">📌 Admin</div>
                    <div className="gallery-name">Aura Auvarose</div>
                  </div>
                </div>
              )}
              {communityPhotos.slice(0, 4).map(p=>(
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
          </div>
          
          {(communityPhotos.length > 0 || profileImage) && (
            <div className="sec-cta-wrap" data-reveal>
              <a href="/gallery" className="sec-cta-btn">
                <span>{isID ? 'Lihat Semua Kenangan' : 'View All Memories'}</span>
                <span className="sec-cta-arrow">→</span>
              </a>
            </div>
          )}

          <div className="gallery-dots">
            {(communityPhotos.slice(0, 4).length + (profileImage ? 1 : 0)) > 0 &&
              Array.from({length: communityPhotos.slice(0, 4).length + (profileImage ? 1 : 0)}).map((_,i)=>(
                <span
                  key={i}
                  className={`gallery-dot${i===galleryActiveIdx?' active':''}`}
                  onClick={()=>{
                    if (!galleryGridRef.current) return;
                    const total = communityPhotos.slice(0, 4).length + (profileImage ? 1 : 0);
                    const w = galleryGridRef.current.scrollWidth / total;
                    galleryGridRef.current.scrollTo({ left: w * i, behavior: 'smooth' });
                    setGalleryActiveIdx(i);
                  }}
                />
              ))}
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
                  : comments.map(c=>{
                      const firstLetter = c.name ? c.name.charAt(0).toUpperCase() : 'A';
                      const charCode = firstLetter.charCodeAt(0);
                      const hue = (charCode * 15) % 360;
                      const avatarBg = `linear-gradient(135deg, hsl(${hue}, 75%, 60%) 0%, hsl(${(hue + 45) % 360}, 80%, 50%) 100%)`;
                      return (
                        <div key={c.id} className="comment-card">
                          <div className="comment-user-row">
                            <div className="comment-avatar" style={{ background: avatarBg }}>{firstLetter}</div>
                            <div className="comment-meta-info">
                              <p className="comment-name">{c.name}</p>
                              <p className="comment-dt">{new Date(c.created_at).toLocaleDateString(isID?'id-ID':'en-US',{day:'numeric',month:'long',year:'numeric'})}</p>
                            </div>
                          </div>
                          <p className="comment-msg">{c.message}</p>
                          {(commentReplies[c.id]||[]).map((r,ri)=>{
                            const replyFirstLetter = r.name ? r.name.charAt(0).toUpperCase() : 'A';
                            const replyCharCode = replyFirstLetter.charCodeAt(0);
                            const replyHue = (replyCharCode * 15) % 360;
                            const replyAvatarBg = `linear-gradient(135deg, hsl(${replyHue}, 75%, 60%) 0%, hsl(${(replyHue + 45) % 360}, 80%, 50%) 100%)`;
                            return (
                              <div key={ri} className="reply-item">
                                <div className="reply-avatar" style={{ background: replyAvatarBg }}>{replyFirstLetter}</div>
                                <div className="reply-content-box">
                                  <span className="reply-name">{r.name}</span>
                                  <span className="reply-msg">{r.message}</span>
                                </div>
                              </div>
                            );
                          })}
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
                      );
                    })
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

            {/* Centered Premium Like Section inside Footer */}
            <div className="footer-like-section">
              <div className="like-wrap" style={{ position: 'relative' }}>
                {loveParticles.map(p => (
                  <span
                    key={p.id}
                    className="love-particle"
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      '--sz': `${p.size}px`,
                      '--dur': `${p.dur}s`,
                      '--delay': `${p.delay}s`,
                      '--tx': p.tx,
                      '--ty': p.ty,
                      '--rot': p.rot,
                      '--scale': p.scale,
                    }}
                  >
                    {p.emoji}
                  </span>
                ))}
                <button className={`like-btn${liked?' liked':''}${likeAnim?' anim':''}`} onClick={handleLike}>
                  <span className="like-heart">{liked ? '❤️' : '🤍'}</span>
                  <span className="like-label">{liked ? tx.likedLabel : tx.likeLabel}</span>
                </button>
                <div className="like-count">
                  <span className="like-num">{likeCount}</span>
                  <span className="like-sub">{tx.likeSubLabel}</span>
                </div>
              </div>
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

        {/* GALLERY PHOTO MODAL */}
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

        {termOpen && (
          <div className="Arch-term-modal">
            <div className="Arch-term-header">
              <div className="Arch-term-title">
                <span style={{ fontSize: '12px' }}>🐚</span> aura@Arch: ~
              </div>
              <div className="Arch-term-controls" style={{ display: 'flex', gap: '6px' }}>
                <span className="Arch-ctrl close" onClick={() => setTermOpen(false)}></span>
                <span className="Arch-ctrl min"></span>
                <span className="Arch-ctrl max"></span>
              </div>
            </div>
            <div className="Arch-term-body custom-scrollbar" style={{ overflowY: 'auto' }}>
              {termLines.map((line, i) => (
                <div key={i} className={`Arch-term-line ${line.type}`} style={{ whiteSpace: 'pre-wrap' }}>
                  {line.text}
                </div>
              ))}
              <div ref={termEndRef} />
              <div className="Arch-term-prompt-line">
                <span className="Arch-prompt-symbol">[aura@Arch ~]$</span>
                <input
                  className="Arch-term-input"
                  value={termInput}
                  onChange={e => setTermInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleTermCommand(termInput)}
                  autoFocus
                  style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', flex: 1 }}
                />
              </div>
            </div>
          </div>
        )}

        {matrixActive && (
          <div className="matrix-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.92)', zIndex: 99990, pointerEvents: 'auto' }} onClick={() => setMatrixActive(false)}>
            <canvas id="matrix-canvas" style={{ display: 'block', width: '100%', height: '100%' }} />
            <button style={{ position: 'fixed', top: '20px', right: '20px', background: '#e02424', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 18px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', zIndex: 99995 }} onClick={(e) => { e.stopPropagation(); setMatrixActive(false); }}>
              ✕ Exit Matrix
            </button>
          </div>
        )}

        {/* FLOAT: LANG + ECO MODE + MUSIC */}
        <audio ref={audioRef} loop>
          <source src={musicUrl} type="audio/mpeg"/>
        </audio>
        <div className="float-group">
          <button className="float-term-btn" onClick={() => setTermOpen(!termOpen)} title="Arch Linux Terminal ($ _)">
            $_
          </button>
          <button className="lang-btn" onClick={()=>setLang(lang==='id'?'en':'id')} title={lang==='id'?'Switch to English':'Ganti ke Indonesia'}>
            <span style={{fontSize:'14px'}}>{lang==='id'?'🇮🇩':'🇬🇧'}</span>
            <span>{lang==='id'?'ID':'EN'}</span>
          </button>
          <button className="eco-btn" onClick={() => {
            const next = !ecoMode;
            setEcoMode(next);
            if (typeof window !== 'undefined') {
              localStorage.setItem('eco_mode', next ? 'true' : 'false');
            }
          }} title={ecoMode ? 'Matikan Mode Hemat Daya (Aktifkan Animasi)' : 'Aktifkan Mode Hemat Daya (Matikan Animasi)'} style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: ecoMode ? '#10b981' : '#1c1c1f',
            color: ecoMode ? '#fff' : '#8f8f94',
            boxShadow: ecoMode ? '0 8px 24px rgba(16,185,129,0.3)' : '0 8px 24px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            transition: 'all 0.25s',
            fontSize: '16px'
          }}>
            🌿
          </button>
          <button onClick={toggleMusic} className={`music-btn${isPlaying?' playing':''}`} title={isPlaying?'Pause':'Play'}>
            {isPlaying?'♪':'▶'}
          </button>
        </div>
      </div>
    </>
  );
}