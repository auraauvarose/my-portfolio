"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import BackgroundCanvas from '@/components/animations/BackgroundCanvas';

export default function GalleryPage() {
  const [communityPhotos, setCommunityPhotos] = useState([]);
  const [profileImage, setProfileImage] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('profile_image') || '';
    }
    return '';
  });
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Custom Appearance
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('default_theme');
      if (saved) return saved === 'dark';
    }
    return true;
  });
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
  const [bgAnimation, setBgAnimation] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('bg_animation') || 'none';
    }
    return 'none';
  });
  const [pageReady, setPageReady] = useState(false);

  const bgCanvasRef = useRef(null);
  const bgAnimRef = useRef(null);

  const handleBack = (e) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      if (document.referrer && document.referrer.includes(window.location.host)) {
        window.history.back();
      } else {
        window.location.href = '/';
      }
    }
  };

  useEffect(() => {
    const loadData = async () => {
      // Load settings
      const { data: settingsData } = await supabase.from('settings').select('key,value');
      if (settingsData) {
        settingsData.forEach(row => {
          if (row.key === 'profile_image' && row.value) { setProfileImage(row.value); localStorage.setItem('profile_image', row.value); }
          if (row.key === 'theme_color' && row.value) { setThemeColor(row.value); localStorage.setItem('theme_color', row.value); }
          if (row.key === 'bg_theme' && row.value) { setBgTheme(row.value); localStorage.setItem('bg_theme', row.value); }
          if (row.key === 'font_choice' && row.value) { setFontChoice(row.value); localStorage.setItem('font_choice', row.value); }
          if (row.key === 'default_theme' && row.value) { setIsDark(row.value === 'dark'); localStorage.setItem('default_theme', row.value); }
          if (row.key === 'bg_animation' && row.value) { setBgAnimation(row.value); localStorage.setItem('bg_animation', row.value); }
        });
      }

      // Load Photos (only approved ones)
      const { data: photoData } = await supabase
        .from('user_photos')
        .select('*')
        .eq('approved', true)
        .order('created_at', { ascending: false });
      if (photoData) {
        setCommunityPhotos(photoData);
      }
      setPageReady(true);
    };
    loadData();
  }, []);



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
    pumpkin_charcoal:   { darkBg:'#233D4C', darkBg2:'#1a2e39', lightBg:'#FD802E',  lightBg2:'#ffe0cc' },
    honey_black:        { darkBg:'#171717', darkBg2:'#202020', lightBg:'#E3C586',  lightBg2:'#d4b06a' },
    periwinkle_violet:  { darkBg:'#544470', darkBg2:'#3e3354', lightBg:'#DBD5F2',  lightBg2:'#ccc4eb' },
    cyberpunk:          { darkBg:'#0b0914', darkBg2:'#151226', lightBg:'#fff0fa',  lightBg2:'#ffe3f4' },
    nordic:             { darkBg:'#0b1016', darkBg2:'#141b25', lightBg:'#f0f5fa',  lightBg2:'#e1ecf5' },
    matcha:             { darkBg:'#0e150f', darkBg2:'#18231a', lightBg:'#f4f8f4',  lightBg2:'#e5efe5' },
    dracula:            { darkBg:'#13141f', darkBg2:'#1a1c2c', lightBg:'#f2f3f9',  lightBg2:'#e2e5f3' },
    sakura:             { darkBg:'#1a0f14', darkBg2:'#28161f', lightBg:'#fff3f6',  lightBg2:'#ffe3eb' },
  };

  const FONTS = {
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

  const activeBg = BG_THEMES[bgTheme] || BG_THEMES.default;
  const currentBg = isDark ? activeBg.darkBg : activeBg.lightBg;
  const currentBg2 = isDark ? activeBg.darkBg2 : activeBg.lightBg2;

  const curFont = FONTS[fontChoice] || FONTS.fraunces;
  const fontBody = curFont.body;
  const fontHeading = curFont.heading;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,900;1,9..144,400;1,9..144,700&family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=Inter:wght@400;600;700&family=Space+Grotesk:wght@400;600;700;800&family=Syne:wght@700;800&family=DM+Sans:wght@400;500;700&family=Cormorant+Garamond:ital,wght@0,700;1,400&family=Lato:wght@400;700&family=Bebas+Neue&family=Teko:wght@400;600;700&family=Pacifico&family=Libre+Caslon+Display&family=Libre+Caslon+Text:wght@400;700&family=Nunito:wght@400;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body {
          margin: 0; padding: 0;
          background: ${currentBg};
          color: ${isDark ? '#f0efe8' : '#1a1a1a'};
          font-family: ${fontBody};
          min-height: 100vh;
          transition: background 0.3s, color 0.3s;
        }
        .bg-canvas { position: fixed; inset: 0; pointer-events: none; z-index: 1; opacity: 0.6; }
        .wrapper { max-width: 1200px; margin: 0 auto; padding: 48px 24px; position: relative; z-index: 2; }
        .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 56px; }
        .back-btn {
          padding: 8px 18px;
          border: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'};
          background: ${currentBg2};
          color: ${isDark ? '#909088' : '#555555'};
          border-radius: 100px;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .back-btn:hover { border-color: ${themeColor}; color: ${isDark ? '#f0efe8' : '#1a1a1a'}; transform: translateX(-4px); }

        .submit-btn {
          padding: 10px 22px;
          background: ${themeColor};
          color: #0d0d0d;
          border: none;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 800;
          text-decoration: none;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 12px ${themeColor}33;
        }
        .submit-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px ${themeColor}55; }

        .title-sec { text-align: center; margin-bottom: 56px; }
        .title { font-family: ${fontHeading}; font-size: clamp(36px, 6vw, 64px); font-weight: 900; line-height: 1.05; letter-spacing: -0.03em; margin: 0 0 12px; }
        .title em { font-style: italic; font-weight: 400; color: ${isDark ? '#909088' : '#555555'}; }

        /* Masonry-like Grid */
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-top: 32px;
        }
        
        .gallery-item {
          position: relative;
          background: ${currentBg2};
          border: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'};
          border-radius: 20px;
          overflow: hidden;
          cursor: pointer;
          aspect-ratio: 1;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .gallery-item-featured {
          grid-column: span 2;
          grid-row: span 2;
          aspect-ratio: auto;
          height: 100%;
        }
        
        .gallery-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s;
        }
        .gallery-item:hover img { transform: scale(1.05); }

        .gallery-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(10, 10, 12, 0.85) 0%, rgba(10, 10, 12, 0) 60%);
          display: flex; flex-direction: column; justify-content: flex-end;
          padding: 24px; opacity: 0;
          transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .gallery-item:hover .gallery-overlay { opacity: 1; }

        .gallery-badge { align-self: flex-start; padding: 4px 10px; background: ${themeColor}; color: #0d0d0d; border-radius: 100px; font-size: 10px; font-weight: 800; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; }
        .gallery-name { font-size: 16px; font-weight: 800; color: #ffffff; }
        .gallery-caption { font-size: 12px; color: rgba(255, 255, 255, 0.7); margin-top: 4px; line-height: 1.4; }

        .empty { text-align: center; padding: 80px 0; color: ${isDark ? '#909088' : '#555555'}; font-size: 14px; grid-column: 1/-1; }

        /* Lightbox Viewer */
        .lightbox-overlay {
          position: fixed; inset: 0; background: rgba(10, 10, 12, 0.92);
          backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
          display: flex; align-items: center; justify-content: center; z-index: 10000;
          animation: lFadeIn 0.3s ease forwards; padding: 24px;
        }
        .lightbox-box {
          position: relative; max-width: 800px; width: 100%; background: ${currentBg2};
          border: 1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
          border-radius: 24px; overflow: hidden;
          box-shadow: 0 30px 70px rgba(0,0,0,0.6);
          animation: lZoomIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes lFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes lZoomIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }

        .lightbox-img-wrap { width: 100%; max-height: 70vh; background: #000; overflow: hidden; display: flex; align-items: center; justify-content: center; }
        .lightbox-img-wrap img { width: 100%; height: auto; max-height: 70vh; object-fit: contain; }
        .lightbox-info { padding: 24px 32px; display: flex; justify-content: space-between; align-items: center; }
        .lightbox-title { font-size: 18px; font-weight: 800; color: ${isDark ? '#f0efe8' : '#1a1a1a'}; margin: 0 0 6px; }
        .lightbox-sub { font-size: 13px; color: ${isDark ? '#909088' : '#555555'}; line-height: 1.5; }
        .lightbox-close {
          padding: 8px 18px; background: ${themeColor}; color: #0d0d0d;
          border: none; border-radius: 100px; font-family: inherit; font-size: 12px;
          font-weight: 800; cursor: pointer; transition: all 0.2s;
        }
        .lightbox-close:hover { filter: brightness(1.05); transform: translateY(-2px); }

        @media(max-width: 900px) {
          .gallery-grid { grid-template-columns: repeat(2, 1fr); }
          .gallery-item-featured { grid-column: span 2; grid-row: span 2; }
        }
        @media(max-width: 600px) {
          .gallery-grid { grid-template-columns: 1fr; }
          .gallery-item-featured { grid-column: auto; grid-row: auto; aspect-ratio: 1; }
          .header { margin-bottom: 36px; }
          .wrapper { padding: 32px 16px; }
        }
      `}</style>

      <BackgroundCanvas bgAnimation={bgAnimation} themeColor={themeColor} isDark={isDark} />

      <div className="wrapper">
        <header className="header">
          <a href="/" onClick={handleBack} className="back-btn">← Kembali</a>
          <a href="/submit-photo" className="submit-btn">+ Kirim Momen</a>
        </header>

        <section className="title-sec">
          <h1 className="title">Momen &<br/><em>Kenangan</em></h1>
          <p style={{ fontSize: '14px', color: isDark ? '#909088' : '#555555', margin: 0 }}>
            Kumpulan kenangan bersama komunitas dan teman-teman
          </p>
        </section>

        <div className="gallery-grid">
          {profileImage && (
            <div className="gallery-item gallery-item-featured" onClick={() => setSelectedPhoto({image_url: profileImage, sender_name: 'Aura Auvarose', caption: 'Potret Kreator Utama', badge: 'Admin'})}>
              <img src={profileImage} alt="Aura Auvarose" />
              <div className="gallery-overlay" style={{ opacity: 1 }}>
                <div className="gallery-badge">📌 Admin</div>
                <div className="gallery-name">Aura Auvarose</div>
                <div className="gallery-caption">Potret Kreator Utama</div>
              </div>
            </div>
          )}

          {communityPhotos.length === 0 && !profileImage ? (
            <div className="empty">Belum ada foto momen yang dikirimkan.</div>
          ) : communityPhotos.map(p => (
            <div key={p.id} className="gallery-item" onClick={() => setSelectedPhoto(p)}>
              <img src={p.image_url} alt={p.sender_name} />
              <div className="gallery-overlay">
                <div className="gallery-name">{p.sender_name}</div>
                {p.caption && <div className="gallery-caption">{p.caption}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Photo Viewer */}
      {selectedPhoto && (
        <div className="lightbox-overlay" onClick={() => setSelectedPhoto(null)}>
          <div className="lightbox-box" onClick={e => e.stopPropagation()}>
            <div className="lightbox-img-wrap">
              <img src={selectedPhoto.image_url} alt={selectedPhoto.sender_name} />
            </div>
            <div className="lightbox-info">
              <div>
                <h3 className="lightbox-title">
                  {selectedPhoto.badge ? `📌 ${selectedPhoto.sender_name}` : `Koleksi ${selectedPhoto.sender_name}`}
                </h3>
                {selectedPhoto.caption && <p className="lightbox-sub">{selectedPhoto.caption}</p>}
              </div>
              <button className="lightbox-close" onClick={() => setSelectedPhoto(null)}>Tutup</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
