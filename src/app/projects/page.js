"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import BackgroundCanvas from '@/components/animations/BackgroundCanvas';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [tags, setTags] = useState([]);
  
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
      // Load Projects
      const { data: projData } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      if (projData) {
        setProjects(projData);
        setFilteredProjects(projData);
        
        // Extract unique tags
        const allTags = new Set();
        projData.forEach(p => {
          if (p.tech_stack) {
            p.tech_stack.split(',').forEach(t => allTags.add(t.trim()));
          }
        });
        setTags(['All', ...Array.from(allTags)]);
      }

      // Load Settings
      const { data: settingsData } = await supabase.from('settings').select('key,value');
      if (settingsData) {
        settingsData.forEach(row => {
          if (row.key === 'theme_color' && row.value) { setThemeColor(row.value); localStorage.setItem('theme_color', row.value); }
          if (row.key === 'bg_theme' && row.value) { setBgTheme(row.value); localStorage.setItem('bg_theme', row.value); }
          if (row.key === 'font_choice' && row.value) { setFontChoice(row.value); localStorage.setItem('font_choice', row.value); }
          if (row.key === 'default_theme' && row.value) { setIsDark(row.value === 'dark'); localStorage.setItem('default_theme', row.value); }
          if (row.key === 'bg_animation' && row.value) { setBgAnimation(row.value); localStorage.setItem('bg_animation', row.value); }
        });
      }
      setPageReady(true);
    };
    loadData();
  }, []);



  // Filtering Logic
  useEffect(() => {
    let result = projects;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p => 
        (p.title && p.title.toLowerCase().includes(q)) || 
        (p.description && p.description.toLowerCase().includes(q))
      );
    }
    if (selectedTag !== 'All') {
      result = result.filter(p => 
        p.tech_stack && p.tech_stack.split(',').map(s=>s.trim()).includes(selectedTag)
      );
    }
    setFilteredProjects(result);
  }, [search, selectedTag, projects]);

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
        :root {
          --acc: var(--accent-color, ${themeColor});
          --acc-1a: color-mix(in srgb, var(--acc) 10%, transparent);
          --acc-22: color-mix(in srgb, var(--acc) 13%, transparent);
          --acc-33: color-mix(in srgb, var(--acc) 20%, transparent);
        }
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
        .back-btn:hover { border-color: var(--acc); color: ${isDark ? '#f0efe8' : '#1a1a1a'}; transform: translateX(-4px); }
        
        .title-sec { text-align: center; margin-bottom: 48px; }
        .title { font-family: ${fontHeading}; font-size: clamp(36px, 6vw, 64px); font-weight: 900; line-height: 1.05; letter-spacing: -0.03em; margin: 0 0 12px; }
        .title em { font-style: italic; font-weight: 400; color: ${isDark ? '#909088' : '#555555'}; }
        
        /* Filter Controls */
        .controls { display: flex; flex-direction: column; gap: 20px; margin-bottom: 40px; }
        .search-wrap { position: relative; width: 100%; max-width: 500px; margin: 0 auto; }
        .search-input {
          width: 100%;
          padding: 14px 20px;
          background: ${currentBg2};
          border: 1.5px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'};
          color: ${isDark ? '#f0efe8' : '#1a1a1a'};
          border-radius: 16px;
          font-family: inherit;
          font-size: 14px;
          outline: none;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .search-input:focus { border-color: var(--acc); box-shadow: 0 0 0 4px var(--acc-1a); background: ${currentBg}; }
        
        .tags-wrap { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }
        .tag-btn {
          padding: 8px 16px;
          background: ${currentBg2};
          border: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'};
          color: ${isDark ? '#909088' : '#555555'};
          border-radius: 100px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .tag-btn:hover { border-color: var(--acc); color: ${isDark ? '#f0efe8' : '#1a1a1a'}; }
        .tag-btn.active { background: var(--acc); color: #0d0d0d; border-color: var(--acc); box-shadow: 0 4px 12px var(--acc-22); }
 
        /* Grid */
        .proj-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .proj-card {
          background: ${currentBg2};
          border: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'};
          border-radius: 24px;
          overflow: hidden;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
        }
        .proj-card:hover {
          border-color: var(--acc);
          transform: translateY(-6px);
          box-shadow: 0 20px 40px -15px ${isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.08)'};
        }
        .proj-thumb { aspect-ratio: 16/10; overflow: hidden; background: ${currentBg}; border-bottom: 1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}; }
        .proj-thumb img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
        .proj-card:hover .proj-thumb img { transform: scale(1.04); }
        .proj-thumb-empty { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-family: ${fontHeading}; font-size: 56px; font-weight: 900; color: ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}; }
        
        .proj-body { padding: 24px; display: flex; flex-direction: column; flex: 1; }
        .proj-title { font-size: 18px; font-weight: 800; margin: 0 0 10px; color: ${isDark ? '#f0efe8' : '#1a1a1a'}; }
        .proj-desc { font-size: 13px; line-height: 1.6; color: ${isDark ? '#909088' : '#555555'}; margin: 0 0 20px; flex: 1; }
        
        .proj-stack { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 20px; }
        .proj-chip { padding: 4px 10px; background: ${currentBg}; border: 1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}; border-radius: 100px; font-size: 11px; font-weight: 600; color: ${isDark ? '#909088' : '#555555'}; }
        
        .proj-links { display: flex; gap: 8px; border-top: 1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}; padding-top: 16px; }
        .proj-link {
          flex: 1; padding: 10px;
          border-radius: 12px;
          font-size: 12px; font-weight: 700;
          text-align: center; text-decoration: none;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .proj-link.gh { background: ${currentBg}; border: 1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}; color: ${isDark ? '#909088' : '#555555'}; }
        .proj-link.gh:hover { border-color: var(--acc); color: ${isDark ? '#f0efe8' : '#1a1a1a'}; }
        .proj-link.demo { background: var(--acc); color: #0d0d0d; }
        .proj-link.demo:hover { filter: brightness(1.05); box-shadow: 0 4px 12px var(--acc-33); }
        
        .empty { text-align: center; padding: 80px 0; color: ${isDark ? '#909088' : '#555555'}; font-size: 14px; grid-column: 1/-1; }

        @media(max-width: 900px) {
          .proj-grid { grid-template-columns: 1fr 1fr; }
        }
        @media(max-width: 600px) {
          .proj-grid { grid-template-columns: 1fr; }
          .header { margin-bottom: 36px; }
          .wrapper { padding: 32px 16px; }
        }
      `}</style>

      <BackgroundCanvas bgAnimation={bgAnimation} themeColor={themeColor} isDark={isDark} />

      <div className="wrapper">
        <header className="header">
          <a href="/" onClick={handleBack} className="back-btn">← Kembali</a>
          <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: themeColor }}>Koleksi Proyek</span>
        </header>

        <section className="title-sec">
          <h1 className="title">Semua<br/><em>Proyek</em></h1>
          <p style={{ fontSize: '14px', color: isDark ? '#909088' : '#555555', margin: 0 }}>
            Menampilkan {filteredProjects.length} hasil karya pemrograman
          </p>
        </section>

        <div className="controls">
          <div className="search-wrap">
            <input 
              type="text" 
              placeholder="Cari nama proyek atau deskripsi..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="search-input"
            />
          </div>

          {tags.length > 2 && (
            <div className="tags-wrap">
              {tags.map(t => (
                <button 
                  key={t} 
                  onClick={() => setSelectedTag(t)} 
                  className={`tag-btn${selectedTag === t ? ' active' : ''}`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="proj-grid">
          {filteredProjects.length === 0 ? (
            <div className="empty">Tidak ada proyek yang cocok dengan filter pencarian Anda.</div>
          ) : filteredProjects.map(p => {
            const stack = p.tech_stack ? p.tech_stack.split(',').map(s=>s.trim()) : [];
            return (
              <div key={p.id} className="proj-card">
                <div className="proj-thumb">
                  {p.image_url ? <img src={p.image_url} alt={p.title}/> : <div className="proj-thumb-empty">{p.title?p.title[0]:'?'}</div>}
                </div>
                <div className="proj-body">
                  <h3 className="proj-title">{p.title}</h3>
                  <p className="proj-desc">{p.description}</p>
                  {stack.length > 0 && (
                    <div className="proj-stack">
                      {stack.map(s => <span key={s} className="proj-chip">{s}</span>)}
                    </div>
                  )}
                  <div className="proj-links">
                    {p.github_url && <a href={p.github_url} target="_blank" rel="noopener noreferrer" className="proj-link gh">GitHub</a>}
                    {p.demo_url && <a href={p.demo_url} target="_blank" rel="noopener noreferrer" className="proj-link demo">Live Demo</a>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
