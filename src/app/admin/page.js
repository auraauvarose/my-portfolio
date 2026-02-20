"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const ADMIN_PASSWORD = 'aura2007'; // ← GANTI dengan password admin yang kamu inginkan

export default function AdminPage() {
  const [isDark, setIsDark] = useState(true);
  const d = isDark;
  const [authed, setAuthed] = useState(false);
  const [passInput, setPassInput] = useState('');
  const [passError, setPassError] = useState(false);
  const [tab, setTab] = useState('sertifikat');
  const [certs, setCerts] = useState([]);
  const [certMode, setCertMode] = useState('url');
  const [certTitle, setCertTitle] = useState('');
  const [certIssuer, setCertIssuer] = useState('');
  const [certUrl, setCertUrl] = useState('');
  const [certFile, setCertFile] = useState(null);
  const [certUploading, setCertUploading] = useState(false);
  const [editingCert, setEditingCert] = useState(null);
  const [projects, setProjects] = useState([]);
  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projStack, setProjStack] = useState('');
  const [projGithub, setProjGithub] = useState('');
  const [projDemo, setProjDemo] = useState('');
  const [projImg, setProjImg] = useState('');
  const [projMode, setProjMode] = useState('url');
  const [projFile, setProjFile] = useState(null);
  const [projUploading, setProjUploading] = useState(false);
  const [editingProj, setEditingProj] = useState(null);
  const [comments, setComments] = useState([]);
  const [views, setViews] = useState(0);
  const [profileImg, setProfileImg] = useState('');
  const [profileFile, setProfileFile] = useState(null);
  const [profileMode, setProfileMode] = useState('url');
  const [profileUploading, setProfileUploading] = useState(false);

  useEffect(() => {
    document.documentElement.style.background = d ? '#111110' : '#f4f4f0';
    document.body.style.background = d ? '#111110' : '#f4f4f0';
    document.body.style.margin = '0';
  }, [d]);

  useEffect(() => { if (authed) loadAll(); }, [authed]);

  const loadAll = async () => {
    const [c, p, cm, v, prof] = await Promise.all([
      supabase.from('certificates').select('*').order('created_at', { ascending: false }),
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('comments').select('*').order('created_at', { ascending: false }),
      supabase.from('views').select('count').eq('slug', 'home').single(),
      supabase.from('settings').select('value').eq('key', 'profile_image').single(),
    ]);
    if (c.data) setCerts(c.data);
    if (p.data) setProjects(p.data);
    if (cm.data) setComments(cm.data);
    if (v.data) setViews(v.data.count);
    if (prof.data?.value) setProfileImg(prof.data.value);
  };

  const login = () => {
    if (passInput === ADMIN_PASSWORD) { setAuthed(true); setPassError(false); }
    else { setPassError(true); setPassInput(''); }
  };

  const uploadFile = async (file, bucket) => {
    const ext = file.name.split('.').pop();
    const filename = `${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(filename, file, { upsert: true });
    if (error) { alert('Upload gagal: ' + error.message); return null; }
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filename);
    return urlData.publicUrl;
  };

  const addCert = async () => {
    if (!certTitle || !certIssuer) return alert('Judul dan penerbit wajib diisi.');
    setCertUploading(true);
    let imageUrl = certUrl;
    if (certMode === 'file' && certFile) { imageUrl = await uploadFile(certFile, 'certificates'); if (!imageUrl) { setCertUploading(false); return; } }
    if (editingCert) { await supabase.from('certificates').update({ title: certTitle, issuer: certIssuer, image_url: imageUrl }).eq('id', editingCert.id); setEditingCert(null); }
    else { await supabase.from('certificates').insert([{ title: certTitle, issuer: certIssuer, image_url: imageUrl }]); }
    setCertTitle(''); setCertIssuer(''); setCertUrl(''); setCertFile(null); setCertUploading(false);
    const { data } = await supabase.from('certificates').select('*').order('created_at', { ascending: false });
    if (data) setCerts(data);
  };

  const editCert = (c) => { setEditingCert(c); setCertTitle(c.title||''); setCertIssuer(c.issuer||''); setCertUrl(c.image_url||''); setCertMode('url'); };
  const deleteCert = async (id) => { if (!confirm('Hapus sertifikat ini?')) return; await supabase.from('certificates').delete().eq('id', id); setCerts(prev => prev.filter(c => c.id !== id)); };

  const addProject = async () => {
    if (!projTitle) return alert('Judul proyek wajib diisi.');
    setProjUploading(true);
    let imageUrl = projImg;
    if (projMode === 'file' && projFile) { imageUrl = await uploadFile(projFile, 'projects'); if (!imageUrl) { setProjUploading(false); return; } }
    const payload = { title: projTitle, description: projDesc, tech_stack: projStack, github_url: projGithub, demo_url: projDemo, image_url: imageUrl };
    if (editingProj) { await supabase.from('projects').update(payload).eq('id', editingProj.id); setEditingProj(null); }
    else { await supabase.from('projects').insert([payload]); }
    setProjTitle(''); setProjDesc(''); setProjStack(''); setProjGithub(''); setProjDemo(''); setProjImg(''); setProjFile(null); setProjUploading(false);
    const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    if (data) setProjects(data);
  };

  const editProject = (p) => { setEditingProj(p); setProjTitle(p.title||''); setProjDesc(p.description||''); setProjStack(p.tech_stack||''); setProjGithub(p.github_url||''); setProjDemo(p.demo_url||''); setProjImg(p.image_url||''); setProjMode('url'); };
  const deleteProject = async (id) => { if (!confirm('Hapus proyek ini?')) return; await supabase.from('projects').delete().eq('id', id); setProjects(prev => prev.filter(p => p.id !== id)); };
  const deleteComment = async (id) => { if (!confirm('Hapus komentar ini?')) return; await supabase.from('comments').delete().eq('id', id); setComments(prev => prev.filter(c => c.id !== id)); };
  const saveProfile = async () => {
    setProfileUploading(true);
    let imageUrl = profileImg;
    if (profileMode === 'file' && profileFile) { imageUrl = await uploadFile(profileFile, 'certificates'); if (!imageUrl) { setProfileUploading(false); return; } }
    await supabase.from('settings').upsert({ key: 'profile_image', value: imageUrl }, { onConflict: 'key' });
    if (imageUrl) setProfileImg(imageUrl);
    setProfileUploading(false);
    alert('Foto profil berhasil disimpan!');
  };

  const resetViews = async () => { if (!confirm('Reset views ke 0?')) return; await supabase.from('views').update({ count: 0 }).eq('slug', 'home'); setViews(0); };

  const bg   = d ? '#111110' : '#f4f4f0';
  const bg2  = d ? '#1c1c1a' : '#ffffff';
  const ink  = d ? '#f0efe8' : '#1a1a1a';
  const ink2 = d ? '#909088' : '#666';
  const bd   = d ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.09)';
  const acc  = '#d4eb00';
  const fonts = `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Fraunces:opsz,wght@9..144,900&display=swap');`;

  if (!authed) return (
    <>
      <style>{`${fonts}*{box-sizing:border-box;}body{margin:0;background:${bg};}input:focus{border-color:${acc}!important;outline:none;box-shadow:0 0 0 3px rgba(212,235,0,0.1)!important;}`}</style>
      <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", minHeight:'100vh', background:bg, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
        <div style={{ background:bg2, border:`1px solid ${bd}`, borderRadius:24, padding:'48px 40px', width:'100%', maxWidth:400, textAlign:'center' }}>
          <div style={{ fontFamily:"'Fraunces',serif", fontSize:44, fontWeight:900, color:ink, marginBottom:4 }}><span style={{ color:acc }}>A.</span></div>
          <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.14em', color:ink2, marginBottom:36 }}>Admin Dashboard</div>
          <div style={{ textAlign:'left', marginBottom:14 }}>
            <label style={{ display:'block', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:ink2, marginBottom:7 }}>Password</label>
            <input type="password" placeholder="Masukkan password admin..." value={passInput}
              onChange={e => { setPassInput(e.target.value); setPassError(false); }}
              onKeyDown={e => e.key === 'Enter' && login()}
              style={{ width:'100%', padding:'13px 16px', background:bg, border:`1.5px solid ${passError?'#ef4444':bd}`, color:ink, borderRadius:12, fontFamily:'inherit', fontSize:14, outline:'none', boxSizing:'border-box' }}
              autoFocus />
            {passError && <div style={{ fontSize:12, color:'#ef4444', marginTop:8, fontWeight:600 }}>Keluar Password salah. Coba lagi.</div>}
          </div>
          <button onClick={login} style={{ width:'100%', padding:14, background:acc, color:'#0d0d0d', border:'none', borderRadius:12, fontFamily:'inherit', fontSize:14, fontWeight:800, cursor:'pointer' }}>Masuk →</button>
        </div>
      </div>
    </>
  );

  const inp       = { width:'100%', padding:'11px 14px', background:bg, border:`1.5px solid ${bd}`, color:ink, borderRadius:12, fontFamily:'inherit', fontSize:13, outline:'none', boxSizing:'border-box' };
  const lbl       = { display:'block', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:ink2, marginBottom:6 };
  const fg        = { marginBottom:13 };
  const btnAcc    = { padding:'10px 22px', background:acc, color:'#0d0d0d', border:'none', borderRadius:10, fontFamily:'inherit', fontSize:13, fontWeight:800, cursor:'pointer' };
  const btnEdit   = { padding:'6px 12px', background:acc, color:'#0d0d0d', border:'none', borderRadius:8, fontFamily:'inherit', fontSize:11, fontWeight:700, cursor:'pointer' };
  const btnDel    = { padding:'6px 12px', background:'rgba(239,68,68,0.1)', color:'#ef4444', border:'1px solid rgba(239,68,68,0.2)', borderRadius:8, fontFamily:'inherit', fontSize:11, fontWeight:700, cursor:'pointer' };
  const btnCancel = { padding:'10px 18px', background:'transparent', color:ink2, border:`1px solid ${bd}`, borderRadius:10, fontFamily:'inherit', fontSize:13, fontWeight:700, cursor:'pointer' };
  const tabBtn    = (on) => ({ padding:'9px 20px', borderRadius:100, border:`1.5px solid ${on?acc:bd}`, background:on?acc:'transparent', color:on?'#0d0d0d':ink2, fontFamily:'inherit', fontSize:12, fontWeight:700, cursor:'pointer' });
  const modeBtn   = (on) => ({ padding:'7px 16px', borderRadius:100, border:`1.5px solid ${on?acc:bd}`, background:on?'rgba(212,235,0,0.12)':'transparent', color:on?acc:ink2, fontFamily:'inherit', fontSize:11, fontWeight:700, cursor:'pointer' });
  const itemCard  = { background:bg, border:`1px solid ${bd}`, borderRadius:14, overflow:'hidden' };
  const grid3     = { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:14 };
  const formPanel = { background:bg2, border:`1px solid ${bd}`, borderRadius:20, padding:22, position:'sticky', top:80 };
  const splitGrid = { display:'grid', gridTemplateColumns:'340px 1fr', gap:24, alignItems:'start' };

  return (
    <>
      <style>{`${fonts}*,*::before,*::after{box-sizing:border-box;}body{margin:0;}input::placeholder,textarea::placeholder{color:${d?'#555550':'#bbb'};}input:focus,textarea:focus{border-color:${acc}!important;box-shadow:0 0 0 3px rgba(212,235,0,0.1)!important;outline:none;}@media(max-width:800px){.split{grid-template-columns:1fr!important;}.form-sticky{position:relative!important;top:auto!important;}}.admin-main{max-width:1100px;margin:0 auto;padding:28px 40px 60px;}@media(max-width:600px){.admin-main{padding:20px 18px 48px!important;}}`}</style>
      <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", minHeight:'100vh', background:bg, color:ink }}>

        {/* NAV */}
        <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 40px', height:64, background:bg2, borderBottom:`1px solid ${bd}`, position:'sticky', top:0, zIndex:50 }}>
          <span style={{ fontFamily:"'Fraunces',serif", fontSize:20, fontWeight:900 }}><span style={{ color:acc }}>A.</span></span>
          <div style={{ display:'flex', gap:8 }}>
            <a href="/" style={{ padding:'7px 15px', border:`1px solid ${bd}`, color:ink, borderRadius:100, fontFamily:'inherit', fontSize:12, fontWeight:700, textDecoration:'none', background:'transparent' }}>← Site</a>
            <button onClick={() => setIsDark(!d)} style={{ padding:'7px 13px', border:`1px solid ${bd}`, background:bg, color:ink, borderRadius:100, fontFamily:'inherit', fontSize:12, fontWeight:700, cursor:'pointer' }}>{d?'☀ Light':'🌙 Dark'}</button>
            <button onClick={() => setAuthed(false)} style={{ padding:'7px 13px', border:'1px solid rgba(239,68,68,0.3)', background:'rgba(239,68,68,0.08)', color:'#ef4444', borderRadius:100, fontFamily:'inherit', fontSize:12, fontWeight:700, cursor:'pointer' }}>Keluar</button>
          </div>
        </nav>

        <div className="admin-main">
          {/* HEADER + TABS */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:14, marginBottom:28 }}>
            <div>
              <div style={{ fontFamily:"'Fraunces',serif", fontSize:24, fontWeight:900, color:ink }}>Dashboard</div>
              <div style={{ fontSize:12, color:ink2, marginTop:2 }}>{certs.length} sertifikat · {projects.length} proyek · {comments.length} komentar · {views} views</div>
            </div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {[['sertifikat','🎓 Sertifikat'],['proyek','🚀 Proyek'],['komentar','💬 Komentar'],['profil','📸 Profil'],['stats','📊 Stats']].map(([k,l]) => (
                <button key={k} style={tabBtn(tab===k)} onClick={() => setTab(k)}>{l}</button>
              ))}
            </div>
          </div>

          {/* ══ SERTIFIKAT ══ */}
          {tab==='sertifikat' && (
            <div className="split" style={splitGrid}>
              <div className="form-sticky" style={formPanel}>
                <div style={{ fontFamily:"'Fraunces',serif", fontSize:16, fontWeight:900, color:ink, marginBottom:16 }}>{editingCert?'Mengedit Sertifikat':'+ Upload Sertifikat'}</div>
                <div style={{ display:'flex', gap:8, marginBottom:16 }}>
                  <button style={modeBtn(certMode==='url')} onClick={()=>setCertMode('url')}>🔗 URL</button>
                  <button style={modeBtn(certMode==='file')} onClick={()=>setCertMode('file')}>📁 Upload File</button>
                </div>
                <div style={fg}><label style={lbl}>Judul Sertifikat *</label><input style={inp} placeholder="Cth: Web Development Certificate" value={certTitle||''} onChange={e=>setCertTitle(e.target.value)}/></div>
                <div style={fg}><label style={lbl}>Diterbitkan Oleh *</label><input style={inp} placeholder="Cth: Dicoding Indonesia" value={certIssuer||''} onChange={e=>setCertIssuer(e.target.value)}/></div>
                {certMode==='url'
                  ? <div style={fg}><label style={lbl}>URL Gambar</label><input style={inp} placeholder="https://..." value={certUrl||''} onChange={e=>setCertUrl(e.target.value)}/></div>
                  : <div style={fg}><label style={lbl}>Upload Gambar</label><input type="file" accept="image/*" style={{...inp,padding:'8px'}} onChange={e=>setCertFile(e.target.files[0])}/></div>
                }
                <div style={{ display:'flex', gap:8 }}>
                  <button style={btnAcc} onClick={addCert} disabled={certUploading}>{certUploading?'Mengupload...':(editingCert?'Simpan':'Tambahkan →')}</button>
                  {editingCert && <button style={btnCancel} onClick={()=>{setEditingCert(null);setCertTitle('');setCertIssuer('');setCertUrl('');}}>Batal</button>}
                </div>
              </div>
              <div>
                <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:ink2, marginBottom:14 }}>Semua Sertifikat ({certs.length})</div>
                {certs.length===0
                  ? <div style={{ padding:'48px 24px', textAlign:'center', border:`1px dashed ${bd}`, borderRadius:16, color:ink2, fontSize:13 }}>Belum ada sertifikat.</div>
                  : <div style={grid3}>{certs.map(c=>(
                      <div key={c.id} style={itemCard}>
                        {c.image_url && <img src={c.image_url} alt={c.title} style={{width:'100%',aspectRatio:'16/9',objectFit:'cover',display:'block'}}/>}
                        <div style={{padding:'11px 13px'}}>
                          <div style={{fontSize:12,fontWeight:700,color:ink,marginBottom:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.title||'—'}</div>
                          <div style={{fontSize:11,color:ink2,marginBottom:9}}>{c.issuer||'—'}</div>
                          <div style={{display:'flex',gap:7}}><button style={btnEdit} onClick={()=>editCert(c)}>Edit</button><button style={btnDel} onClick={()=>deleteCert(c.id)}>Hapus</button></div>
                        </div>
                      </div>))}</div>
                }
              </div>
            </div>
          )}

          {/* ══ PROYEK ══ */}
          {tab==='proyek' && (
            <div className="split" style={splitGrid}>
              <div className="form-sticky" style={formPanel}>
                <div style={{ fontFamily:"'Fraunces',serif", fontSize:16, fontWeight:900, color:ink, marginBottom:16 }}>{editingProj?'Mengedit Proyek':'+ Tambah Proyek'}</div>
                <div style={{ display:'flex', gap:8, marginBottom:16 }}>
                  <button style={modeBtn(projMode==='url')} onClick={()=>setProjMode('url')}>🔗 URL</button>
                  <button style={modeBtn(projMode==='file')} onClick={()=>setProjMode('file')}>📁 Upload File</button>
                </div>
                <div style={fg}><label style={lbl}>Judul Proyek *</label><input style={inp} placeholder="Cth: Portfolio Website" value={projTitle||''} onChange={e=>setProjTitle(e.target.value)}/></div>
                <div style={fg}><label style={lbl}>Tech Stack</label><input style={inp} placeholder="Next.js, Supabase, ..." value={projStack||''} onChange={e=>setProjStack(e.target.value)}/></div>
                <div style={fg}><label style={lbl}>Deskripsi</label><textarea style={{...inp,height:76,resize:'vertical'}} placeholder="Deskripsi singkat..." value={projDesc||''} onChange={e=>setProjDesc(e.target.value)}/></div>
                <div style={fg}><label style={lbl}>GitHub URL</label><input style={inp} placeholder="https://github.com/..." value={projGithub||''} onChange={e=>setProjGithub(e.target.value)}/></div>
                <div style={fg}><label style={lbl}>Demo URL</label><input style={inp} placeholder="https://..." value={projDemo||''} onChange={e=>setProjDemo(e.target.value)}/></div>
                {projMode==='url'
                  ? <div style={fg}><label style={lbl}>URL Thumbnail</label><input style={inp} placeholder="https://..." value={projImg||''} onChange={e=>setProjImg(e.target.value)}/></div>
                  : <div style={fg}><label style={lbl}>Upload Thumbnail</label><input type="file" accept="image/*" style={{...inp,padding:'8px'}} onChange={e=>setProjFile(e.target.files[0])}/></div>
                }
                <div style={{ display:'flex', gap:8 }}>
                  <button style={btnAcc} onClick={addProject} disabled={projUploading}>{projUploading?'Mengupload...':(editingProj?'Simpan':'Tambahkan →')}</button>
                  {editingProj && <button style={btnCancel} onClick={()=>{setEditingProj(null);setProjTitle('');setProjDesc('');setProjStack('');setProjGithub('');setProjDemo('');setProjImg('');}}>Batal</button>}
                </div>
              </div>
              <div>
                <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:ink2, marginBottom:14 }}>Semua Proyek ({projects.length})</div>
                {projects.length===0
                  ? <div style={{ padding:'48px 24px', textAlign:'center', border:`1px dashed ${bd}`, borderRadius:16, color:ink2, fontSize:13 }}>Belum ada proyek.</div>
                  : <div style={grid3}>{projects.map(p=>(
                      <div key={p.id} style={itemCard}>
                        {p.image_url
                          ? <img src={p.image_url} alt={p.title} style={{width:'100%',aspectRatio:'16/9',objectFit:'cover',display:'block'}}/>
                          : <div style={{width:'100%',aspectRatio:'16/9',background:d?'#1c1c1a':'#e8e8e4',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Fraunces',serif",fontSize:32,fontWeight:900,color:bd}}>{p.title?.[0]||'?'}</div>
                        }
                        <div style={{padding:'11px 13px'}}>
                          <div style={{fontSize:12,fontWeight:700,color:ink,marginBottom:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.title||'—'}</div>
                          <div style={{fontSize:11,color:ink2,marginBottom:9}}>{p.tech_stack||'—'}</div>
                          <div style={{display:'flex',gap:7}}><button style={btnEdit} onClick={()=>editProject(p)}>Edit</button><button style={btnDel} onClick={()=>deleteProject(p.id)}>Hapus</button></div>
                        </div>
                      </div>))}</div>
                }
              </div>
            </div>
          )}

          {/* ══ KOMENTAR ══ */}
          {tab==='komentar' && (
            <div style={{ maxWidth:680 }}>
              <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:ink2, marginBottom:16 }}>Komentar Masuk ({comments.length})</div>
              {comments.length===0
                ? <div style={{ padding:'48px 24px', textAlign:'center', border:`1px dashed ${bd}`, borderRadius:16, color:ink2, fontSize:13 }}>Belum ada komentar.</div>
                : comments.map(c=>(
                    <div key={c.id} style={{ background:bg2, border:`1px solid ${bd}`, borderRadius:14, padding:'13px 16px', marginBottom:10, display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:13, fontWeight:700, color:ink, marginBottom:3 }}>{c.name}</div>
                        <div style={{ fontSize:13, color:ink2, lineHeight:1.6, marginBottom:5 }}>{c.message}</div>
                        <div style={{ fontSize:10, fontWeight:600, color:d?'#555550':'#bbb', textTransform:'uppercase', letterSpacing:'0.08em' }}>{new Date(c.created_at).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})}</div>
                      </div>
                      <button style={btnDel} onClick={()=>deleteComment(c.id)}>Hapus</button>
                    </div>
                  ))
              }
            </div>
          )}

          {/* ══ PROFIL ══ */}
          {tab==='profil' && (
            <div style={{ maxWidth:480 }}>
              <div style={{ background:bg2, border:`1px solid ${bd}`, borderRadius:20, padding:28 }}>
                <div style={{ fontFamily:"'Fraunces',serif", fontSize:16, fontWeight:900, color:ink, marginBottom:8 }}>📸 Foto Profil</div>
                <div style={{ fontSize:12, color:ink2, marginBottom:20 }}>Foto ini akan muncul di halaman utama portfolio.</div>
                {profileImg && (
                  <div style={{ marginBottom:18, textAlign:'center' }}>
                    <img src={profileImg} alt="Profil" style={{ width:120, height:120, objectFit:'cover', borderRadius:'50%', border:`3px solid ${acc}` }}/>
                  </div>
                )}
                <div style={{ display:'flex', gap:8, marginBottom:16 }}>
                  <button style={modeBtn(profileMode==='url')} onClick={()=>setProfileMode('url')}>🔗 URL</button>
                  <button style={modeBtn(profileMode==='file')} onClick={()=>setProfileMode('file')}>📁 Upload File</button>
                </div>
                {profileMode==='url'
                  ? <div style={fg}><label style={lbl}>URL Foto</label><input style={inp} placeholder="https://..." value={profileImg||''} onChange={e=>setProfileImg(e.target.value)}/></div>
                  : <div style={fg}><label style={lbl}>Upload Foto</label><input type="file" accept="image/*" style={{...inp,padding:'8px'}} onChange={e=>setProfileFile(e.target.files[0])}/></div>
                }
                <button style={btnAcc} onClick={saveProfile} disabled={profileUploading}>{profileUploading?'Menyimpan...':'Simpan Foto →'}</button>
              </div>
            </div>
          )}

          {/* ══ STATS ══ */}
          {tab==='stats' && (
            <div style={{ maxWidth:460 }}>
              <div style={{ background:bg2, border:`1px solid ${bd}`, borderRadius:20, padding:28 }}>
                <div style={{ fontFamily:"'Fraunces',serif", fontSize:16, fontWeight:900, color:ink, marginBottom:20 }}>Statistik Website</div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:bg, borderRadius:14, padding:'18px 20px', marginBottom:20 }}>
                  <div>
                    <div style={{ fontFamily:"'Fraunces',serif", fontSize:38, fontWeight:900, color:acc, lineHeight:1 }}>{views.toLocaleString()}</div>
                    <div style={{ fontSize:12, color:ink2, marginTop:5 }}>Total kunjungan website</div>
                  </div>
                  <button onClick={resetViews} style={{ padding:'10px 18px', background:'rgba(239,68,68,0.1)', color:'#ef4444', border:'1px solid rgba(239,68,68,0.2)', borderRadius:10, fontFamily:'inherit', fontSize:13, fontWeight:700, cursor:'pointer' }}>Reset ke 0</button>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:16 }}>
                  {[['Sertifikat',certs.length,'🎓'],['Proyek',projects.length,'🚀'],['Komentar',comments.length,'💬']].map(([label,n,icon])=>(
                    <div key={label} style={{ background:bg, borderRadius:12, padding:'14px', textAlign:'center' }}>
                      <div style={{ fontSize:20, marginBottom:4 }}>{icon}</div>
                      <div style={{ fontFamily:"'Fraunces',serif", fontSize:22, fontWeight:900, color:ink }}>{n}</div>
                      <div style={{ fontSize:11, color:ink2, marginTop:3 }}>{label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize:11, color:d?'#555550':'#aaa' }}>Reset views tidak bisa dibatalkan.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}