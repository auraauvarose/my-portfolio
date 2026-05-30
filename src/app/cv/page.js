'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function CVContent() {
  const searchParams = useSearchParams();
  const lang = searchParams.get('lang') || 'id';
  const color = searchParams.get('color') || '#d4eb00';
  const isID = lang === 'id';

  const [domReady, setDomReady] = useState(false);

  useEffect(() => {
    setDomReady(true);
  }, []);

  const printCV = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <>
      <style>{`
        *, *::before, *::after {
          box-sizing: border-box;
        }
        body {
          background: #09090b;
          color: #e4e4e7;
          font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
          margin: 0;
          padding: 0;
        }
        .cv-container {
          max-width: 800px;
          margin: 40px auto;
          background: #121214;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 40px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
          position: relative;
        }
        
        /* ── CONTROL BAR ── */
        .cv-header-bar {
          background: #18181b;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 16px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 800px;
          margin: 20px auto 0;
        }
        .bar-title {
          font-size: 14px;
          font-weight: 700;
          color: #a1a1aa;
        }
        .bar-btn {
          background: ${color};
          color: #09090b;
          border: none;
          border-radius: 8px;
          padding: 10px 20px;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .bar-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255,255,255,0.05);
        }

        /* ── CV STRUCTURE ── */
        .cv-head {
          border-bottom: 2px solid ${color};
          padding-bottom: 24px;
          margin-bottom: 32px;
        }
        .cv-name {
          font-size: 32px;
          font-weight: 900;
          letter-spacing: -0.03em;
          margin: 0 0 6px 0;
          color: #ffffff;
        }
        .cv-title {
          font-size: 16px;
          color: ${color};
          font-weight: 700;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .cv-body {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 40px;
        }

        /* ── COLUMN LEFT ── */
        .cv-col-left {
          display: flex;
          flex-direction: column;
          gap: 28px;
          border-right: 1px solid rgba(255, 255, 255, 0.06);
          padding-right: 20px;
        }
        .sec-title {
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #ffffff;
          margin: 0 0 12px 0;
          padding-bottom: 6px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .info-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .info-item {
          font-size: 12px;
          color: #a1a1aa;
          word-break: break-all;
        }
        .info-label {
          font-weight: 700;
          color: #e4e4e7;
          margin-bottom: 2px;
        }
        .skill-tag {
          display: inline-block;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          padding: 4px 8px;
          font-size: 11px;
          color: #d4d4d8;
          margin: 0 6px 6px 0;
        }

        /* ── COLUMN RIGHT ── */
        .cv-col-right {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        .job-item {
          margin-bottom: 20px;
        }
        .job-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 6px;
        }
        .job-title {
          font-size: 15px;
          font-weight: 800;
          color: #ffffff;
          margin: 0;
        }
        .job-company {
          font-size: 13px;
          color: ${color};
          font-weight: 700;
        }
        .job-duration {
          font-size: 11px;
          color: #71717a;
          font-weight: 600;
        }
        .job-desc {
          font-size: 12.5px;
          color: #a1a1aa;
          line-height: 1.6;
          margin: 6px 0 0 0;
        }

        /* ── PRINT RULES ── */
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: #ffffff !important;
            color: #18181b !important;
          }
          .cv-container {
            max-width: 100%;
            margin: 0;
            padding: 0;
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
          }
          .cv-name {
            color: #000000 !important;
          }
          .sec-title {
            color: #000000 !important;
            border-bottom: 1px solid #e4e4e7 !important;
          }
          .job-title {
            color: #000000 !important;
          }
          .job-duration {
            color: #71717a !important;
          }
          .job-desc, .info-item {
            color: #27272a !important;
          }
          .info-label {
            color: #18181b !important;
          }
          .skill-tag {
            background: #f4f4f5 !important;
            border: 1px solid #e4e4e7 !important;
            color: #27272a !important;
          }
          .cv-col-left {
            border-right: 1px solid #e4e4e7 !important;
          }
        }

        @media(max-width: 650px) {
          .cv-body {
            grid-template-columns: 1fr;
            gap: 28px;
          }
          .cv-col-left {
            border-right: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
            padding-right: 0;
            padding-bottom: 28px;
          }
          .cv-container {
            padding: 24px;
            margin: 20px 10px;
          }
          .cv-header-bar {
            margin: 10px;
          }
        }
      `}</style>

      {domReady && (
        <div className="no-print cv-header-bar">
          <span className="bar-title">
            {isID ? '📋 Ekspor sebagai PDF Formal (Simpan sebagai PDF)' : '📋 Export as Formal PDF (Save as PDF)'}
          </span>
          <button className="bar-btn" onClick={printCV}>
            🖨️ {isID ? 'Cetak / Simpan PDF' : 'Print / Save PDF'}
          </button>
        </div>
      )}

      <div className="cv-container">
        <div className="cv-head">
          <h1 className="cv-name">Aura Auvarose</h1>
          <h2 className="cv-title">
            {isID ? 'Pengembang Full Stack & Pelajar IT' : 'Full Stack Developer & IT Student'}
          </h2>
        </div>

        <div className="cv-body">
          {/* COLUMN LEFT */}
          <div className="cv-col-left">
            <div>
              <h3 className="sec-title">{isID ? 'Kontak' : 'Contact'}</h3>
              <ul className="info-list">
                <li className="info-item">
                  <div className="info-label">Email</div>
                  auraauvaroseendica@gmail.com
                </li>
                <li className="info-item">
                  <div className="info-label">GitHub</div>
                  github.com/auraauvarose
                </li>
                <li className="info-item">
                  <div className="info-label">Instagram</div>
                  @aura_auvarose_
                </li>
                <li className="info-item">
                  <div className="info-label">{isID ? 'Lokasi' : 'Location'}</div>
                  Indonesia
                </li>
              </ul>
            </div>

            <div>
              <h3 className="sec-title">Skills</h3>
              <div>
                <span className="skill-tag">HTML5</span>
                <span className="skill-tag">CSS3</span>
                <span className="skill-tag">JavaScript</span>
                <span className="skill-tag">React.js</span>
                <span className="skill-tag">Next.js</span>
                <span className="skill-tag">Node.js</span>
                <span className="skill-tag">Express</span>
                <span className="skill-tag">Supabase</span>
                <span className="skill-tag">PostgreSQL</span>
                <span className="skill-tag">Git & GitHub</span>
                <span className="skill-tag">Linux Fedora</span>
                <span className="skill-tag">Bash CLI</span>
              </div>
            </div>

            <div>
              <h3 className="sec-title">{isID ? 'Bahasa' : 'Languages'}</h3>
              <ul className="info-list">
                <li className="info-item">
                  <strong>Bahasa Indonesia</strong> - Native
                </li>
                <li className="info-item">
                  <strong>English</strong> - Professional
                </li>
              </ul>
            </div>
          </div>

          {/* COLUMN RIGHT */}
          <div className="cv-col-right">
            <div>
              <h3 className="sec-title">{isID ? 'Pendidikan' : 'Education'}</h3>
              <div className="job-item">
                <div className="job-header">
                  <h4 className="job-title">{isID ? 'Siswa Rekayasa Perangkat Lunak' : 'Software Engineering Student'}</h4>
                  <span className="job-duration">2023 - Present</span>
                </div>
                <div className="job-company">IT Academy</div>
                <p className="job-desc">
                  {isID 
                    ? 'Fokus mendalam pada dasar-dasar pemrograman, struktur data, pengembangan web, manajemen basis data relasional, dan administrasi sistem Linux.' 
                    : 'Deeply focusing on core programming concepts, data structures, full-stack web development, database management systems, and Linux systems administration.'}
                </p>
              </div>
            </div>

            <div>
              <h3 className="sec-title">{isID ? 'Proyek Unggulan' : 'Featured Projects'}</h3>
              
              <div className="job-item">
                <div className="job-header">
                  <h4 className="job-title">{isID ? 'Dasbor Portofolio Kreatif & Interaktif' : 'Creative & Interactive Portfolio Dashboard'}</h4>
                  <span className="job-duration">Next.js & Supabase</span>
                </div>
                <p className="job-desc">
                  {isID
                    ? 'Portofolio lengkap dengan dasbor status developer secara live, timeline komit GitHub dinamis, kustomisasi skema warna tersinkronisasi, dan integrasi terminal Fedora Linux.'
                    : 'A state-of-the-art developer portfolio with custom accent synchronization, terminal shells, live committing timeline feeds, and clean responsive layout architecture.'}
                </p>
              </div>

              <div className="job-item">
                <div className="job-header">
                  <h4 className="job-title">{isID ? 'Hub Game Arcade Retro' : 'Retro Game Arcade Hub'}</h4>
                  <span className="job-duration">React & LocalStorage</span>
                </div>
                <p className="job-desc">
                  {isID
                    ? 'Menghadirkan game kanvas 2D Tetris, Snake, dan Memory. Terintegrasi dengan papan peringkat ranking ter-sinkronisasi serta fallback cache penyimpanan lokal browser.'
                    : 'Interactive 2D web arcade cabinet hosting Tetris, Snake, and Memory cards. Equipped with fully secure global leaderboard scoring and robust offline cache fallbacks.'}
                </p>
              </div>
            </div>

            <div>
              <h3 className="sec-title">{isID ? 'Sertifikat & Pencapaian' : 'Certifications'}</h3>
              <ul className="info-list" style={{ gap: '10px' }}>
                <li className="info-item" style={{ color: '#ffffff' }}>
                  🏅 <strong>Frontend Web Developer Specialist</strong> - IT Certification Board
                </li>
                <li className="info-item" style={{ color: '#ffffff' }}>
                  🏅 <strong>Database Engineering & Systems Administrator</strong> - Linux Professional Institute
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function ResumePage() {
  return (
    <Suspense fallback={<div style={{ color: '#fff', textAlign: 'center', marginTop: '100px' }}>Loading Resume...</div>}>
      <CVContent />
    </Suspense>
  );
}
