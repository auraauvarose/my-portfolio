"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeIn, ScaleIn, BounceIn } from '@/components/animations/ScrollReveal';
import { FancyLoader, PulseLoader } from '@/components/loading/FancyLoader';
import { PageTransition } from '@/components/animations/PageTransition';
import { supabase } from '@/lib/supabase';
import BackgroundCanvas from '@/components/animations/BackgroundCanvas';

// ─── TETRIS CONSTANTS ───────────────────────────────────────────
const BOARD_W = 10;
const BOARD_H = 20;
const CELL = 30;

const PIECES = [
  { shape: [[1,1,1,1]],                           color: '#00cfff' }, // I
  { shape: [[1,1],[1,1]],                          color: '#ffd700' }, // O
  { shape: [[0,1,0],[1,1,1]],                      color: '#b44aff' }, // T
  { shape: [[0,1,1],[1,1,0]],                      color: '#4bff91' }, // S
  { shape: [[1,1,0],[0,1,1]],                      color: '#ff4b4b' }, // Z
  { shape: [[1,0,0],[1,1,1]],                      color: '#ff9000' }, // J
  { shape: [[0,0,1],[1,1,1]],                      color: '#4b8cff' }, // L
];

const emptyBoard = () => Array.from({ length: BOARD_H }, () => Array(BOARD_W).fill(0));

function rotatePiece(matrix) {
  const rows = matrix.length, cols = matrix[0].length;
  return Array.from({ length: cols }, (_, c) =>
    Array.from({ length: rows }, (_, r) => matrix[rows - 1 - r][c])
  );
}

function randomPiece() {
  const p = PIECES[Math.floor(Math.random() * PIECES.length)];
  return { shape: p.shape, color: p.color, x: Math.floor(BOARD_W / 2) - Math.floor(p.shape[0].length / 2), y: 0 };
}

function isValid(board, piece, dx = 0, dy = 0, shape = null) {
  const s = shape || piece.shape;
  for (let r = 0; r < s.length; r++) {
    for (let c = 0; c < s[r].length; c++) {
      if (!s[r][c]) continue;
      const nx = piece.x + c + dx;
      const ny = piece.y + r + dy;
      if (nx < 0 || nx >= BOARD_W || ny >= BOARD_H) return false;
      if (ny >= 0 && board[ny][nx]) return false;
    }
  }
  return true;
}

function placePiece(board, piece) {
  const newBoard = board.map(r => [...r]);
  piece.shape.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (cell && piece.y + r >= 0) {
        newBoard[piece.y + r][piece.x + c] = piece.color;
      }
    });
  });
  return newBoard;
}

function clearLines(board) {
  const newBoard = board.filter(row => row.some(cell => !cell));
  const cleared = BOARD_H - newBoard.length;
  while (newBoard.length < BOARD_H) newBoard.unshift(Array(BOARD_W).fill(0));
  return { board: newBoard, cleared };
}

// ─── TETRIS COMPONENT ──────────────────────────────────────────
function TetrisGame() {
  const canvasRef = useRef(null);
  const nextCanvasRef = useRef(null);
  const stateRef = useRef({
    board: emptyBoard(),
    current: null,
    next: randomPiece(),
    score: 0,
    lines: 0,
    level: 1,
    gameOver: false,
    running: false,
    lastDrop: 0,
  });
  const rafRef = useRef(null);
  const [display, setDisplay] = useState({ score: 0, lines: 0, level: 1, gameOver: false, running: false });
  const [highScore, setHighScore] = useState(() => {
    if (typeof window !== 'undefined') {
      return parseInt(localStorage.getItem('tetris_hs') || '0');
    }
    return 0;
  });

  const [playerName, setPlayerName] = useState('');
  const [submittingScore, setSubmittingScore] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const handleSubmitScore = async (e) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    setSubmittingScore(true);
    
    const newRecord = {
      player_name: playerName,
      score: display.score,
      game_id: 'tetris',
      created_at: new Date().toISOString()
    };
    
    // 1. Save locally
    try {
      const localScores = JSON.parse(localStorage.getItem('game_scores_local') || '[]');
      localScores.push(newRecord);
      localStorage.setItem('game_scores_local', JSON.stringify(localScores));
    } catch (err) {
      console.error("Gagal menyimpan skor lokal:", err);
    }
    
    // 2. Try Supabase
    try {
      const { error } = await supabase.from('game_scores').insert([
        { player_name: playerName, score: display.score, game_id: 'tetris' }
      ]);
      if (error) throw error;
    } catch (err) {
      console.warn("Gagal unggah skor ke database, aman secara lokal:", err);
    }
    
    setSubmittingScore(false);
    setScoreSubmitted(true);
  };

  // Draw cell helper - must be defined before drawBoard
  const drawCell = useCallback((ctx, x, y, color, size = CELL) => {
    ctx.fillStyle = color;
    ctx.fillRect(x + 1, y + 1, size - 2, size - 2);
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(x + 1, y + 1, size - 2, 3);
    ctx.fillRect(x + 1, y + 1, 3, size - 2);
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(x + 1, y + size - 4, size - 2, 3);
    ctx.fillRect(x + size - 4, y + 1, 3, size - 2);
  }, []);

  const drawBoard = useCallback(() => {
    const canvas = canvasRef.current;
    const nextCanvas = nextCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const st = stateRef.current;

    // Background
    ctx.fillStyle = '#0d0d0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 0.5;
    for (let r = 0; r < BOARD_H; r++) {
      for (let c = 0; c < BOARD_W; c++) {
        ctx.strokeRect(c * CELL, r * CELL, CELL, CELL);
      }
    }

    // Board cells
    for (let r = 0; r < BOARD_H; r++) {
      for (let c = 0; c < BOARD_W; c++) {
        if (st.board[r][c]) {
          drawCell(ctx, c * CELL, r * CELL, st.board[r][c]);
        }
      }
    }

    // Ghost piece
    if (st.current && !st.gameOver) {
      let ghost = { ...st.current };
      while (isValid(st.board, ghost, 0, 1)) ghost = { ...ghost, y: ghost.y + 1 };
      ghost.shape.forEach((row, r) => {
        row.forEach((cell, c) => {
          if (cell) {
            ctx.fillStyle = 'rgba(255,255,255,0.07)';
            ctx.fillRect((ghost.x + c) * CELL + 1, (ghost.y + r) * CELL + 1, CELL - 2, CELL - 2);
          }
        });
      });
    }

    // Current piece
    if (st.current && !st.gameOver) {
      st.current.shape.forEach((row, r) => {
        row.forEach((cell, c) => {
          if (cell) {
            drawCell(ctx, (st.current.x + c) * CELL, (st.current.y + r) * CELL, st.current.color);
          }
        });
      });
    }

    // Game over overlay
    if (st.gameOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 20px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 14);
      ctx.font = '13px monospace';
      ctx.fillStyle = '#aaa';
      ctx.fillText(`Score: ${st.score}`, canvas.width / 2, canvas.height / 2 + 10);
      ctx.fillText('Press START to play again', canvas.width / 2, canvas.height / 2 + 30);
    }

    // Next piece canvas
    if (nextCanvas) {
      const nctx = nextCanvas.getContext('2d');
      nctx.fillStyle = '#0d0d0f';
      nctx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
      if (st.next) {
        const ns = st.next.shape;
        const offX = Math.floor((4 - ns[0].length) / 2);
        const offY = Math.floor((4 - ns.length) / 2);
        ns.forEach((row, r) => {
          row.forEach((cell, c) => {
            if (cell) {
              drawCell(nctx, (offX + c) * 24, (offY + r) * 24, st.next.color, 24);
            }
          });
        });
      }
    }
  }, [drawCell]);

  // Use ref for gameLoop to avoid circular dependency
  const gameLoopRef = useRef(null);

  const gameLoop = useCallback((ts) => {
    const st = stateRef.current;
    if (!st.running || st.gameOver) return;

    const speed = Math.max(80, 500 - (st.level - 1) * 50);
    if (ts - st.lastDrop > speed) {
      st.lastDrop = ts;
      if (isValid(st.board, st.current, 0, 1)) {
        st.current = { ...st.current, y: st.current.y + 1 };
      } else {
        // Place piece
        const newBoard = placePiece(st.board, st.current);
        const { board: cleared, cleared: numCleared } = clearLines(newBoard);
        st.board = cleared;
        const pts = [0, 100, 300, 500, 800][numCleared] || 0;
        st.score += pts * st.level;
        st.lines += numCleared;
        st.level = Math.floor(st.lines / 10) + 1;

        // Next piece
        st.current = st.next;
        st.next = randomPiece();

        if (!isValid(st.board, st.current)) {
          st.gameOver = true;
          st.running = false;
          if (st.score > highScore) {
            setHighScore(st.score);
            localStorage.setItem('tetris_hs', String(st.score));
          }
          setDisplay(d => ({ ...d, gameOver: true, running: false, score: st.score }));
          drawBoard();
          if (st.score > 0) {
            setShowSubmitModal(true);
            setScoreSubmitted(false);
          }
          return;
        }
        setDisplay({ score: st.score, lines: st.lines, level: st.level, gameOver: false, running: true });
      }
    }
    drawBoard();
    rafRef.current = requestAnimationFrame(gameLoopRef.current);
  }, [drawBoard, highScore]);

  // Store gameLoop in ref to allow self-reference
  useEffect(() => {
    gameLoopRef.current = gameLoop;
  }, [gameLoop]);

  const startGame = useCallback(() => {
    setShowSubmitModal(false);
    setScoreSubmitted(false);
    const st = stateRef.current;
    st.board = emptyBoard();
    st.current = randomPiece();
    st.next = randomPiece();
    st.score = 0;
    st.lines = 0;
    st.level = 1;
    st.gameOver = false;
    st.running = true;
    st.lastDrop = performance.now();
    setDisplay({ score: 0, lines: 0, level: 1, gameOver: false, running: true });
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(gameLoop);
  }, [gameLoop]);

  const moveLeft  = useCallback(() => { const st = stateRef.current; if (!st.running || st.gameOver) return; if (isValid(st.board, st.current, -1)) { st.current = { ...st.current, x: st.current.x - 1 }; drawBoard(); } }, [drawBoard]);
  const moveRight = useCallback(() => { const st = stateRef.current; if (!st.running || st.gameOver) return; if (isValid(st.board, st.current, 1)) { st.current = { ...st.current, x: st.current.x + 1 }; drawBoard(); } }, [drawBoard]);
  const moveDown  = useCallback(() => { const st = stateRef.current; if (!st.running || st.gameOver) return; if (isValid(st.board, st.current, 0, 1)) { st.current = { ...st.current, y: st.current.y + 1 }; } drawBoard(); }, [drawBoard]);
  const rotate    = useCallback(() => {
    const st = stateRef.current;
    if (!st.running || st.gameOver) return;
    const rotated = rotatePiece(st.current.shape);
    if (isValid(st.board, st.current, 0, 0, rotated)) {
      st.current = { ...st.current, shape: rotated };
    } else if (isValid(st.board, st.current, 1, 0, rotated)) {
      st.current = { ...st.current, shape: rotated, x: st.current.x + 1 };
    } else if (isValid(st.board, st.current, -1, 0, rotated)) {
      st.current = { ...st.current, shape: rotated, x: st.current.x - 1 };
    }
    drawBoard();
  }, [drawBoard]);
  const hardDrop  = useCallback(() => {
    const st = stateRef.current;
    if (!st.running || st.gameOver) return;
    while (isValid(st.board, st.current, 0, 1)) { st.current = { ...st.current, y: st.current.y + 1 }; }
    drawBoard();
  }, [drawBoard]);

  // Keyboard
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); moveLeft(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); moveRight(); }
      if (e.key === 'ArrowDown')  { e.preventDefault(); moveDown(); }
      if (e.key === 'ArrowUp')    { e.preventDefault(); rotate(); }
      if (e.key === ' ')          { e.preventDefault(); hardDrop(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [moveLeft, moveRight, moveDown, rotate, hardDrop]);

  // Touch swipe
  const touchRef = useRef({ x: 0, y: 0, time: 0 });
  const onTouchStart = (e) => { touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, time: Date.now() }; };
  const onTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touchRef.current.x;
    const dy = e.changedTouches[0].clientY - touchRef.current.y;
    const dt = Date.now() - touchRef.current.time;
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10 && dt < 200) { rotate(); return; }
    if (Math.abs(dx) > Math.abs(dy)) { dx < 0 ? moveLeft() : moveRight(); }
    else { dy > 0 ? hardDrop() : rotate(); }
  };

  useEffect(() => { drawBoard(); }, [drawBoard]);
  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  return (
    <div className="game-wrap">
      <div className="game-left" style={{ position: 'relative' }}>
        <canvas
          ref={canvasRef}
          width={BOARD_W * CELL}
          height={BOARD_H * CELL}
          className="game-canvas"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        />
        {showSubmitModal && (
          <div className="leaderboard-submit-overlay" style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(13, 13, 15, 0.95)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            borderRadius: '8px',
            border: '2px solid #d4eb00',
            boxShadow: '0 0 30px rgba(212,235,0,0.2)',
            zIndex: 10,
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px', color: '#ffd700' }}>🏆 SKOR BARU!</h3>
            <p style={{ fontSize: '12px', margin: '0 0 16px', color: '#a0a0a8', lineHeight: '1.4' }}>Kamu meraih skor <strong>{display.score}</strong>. Masukkan nama kamu untuk Papan Peringkat:</p>
            {!scoreSubmitted ? (
              <form onSubmit={handleSubmitScore} style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '220px', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Nama Pemain"
                  value={playerName}
                  onChange={e => setPlayerName(e.target.value)}
                  maxLength={15}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#fff',
                    textAlign: 'center',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={submittingScore}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    background: '#d4eb00',
                    color: '#000',
                    fontWeight: '800',
                    fontSize: '13px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {submittingScore ? 'Mengirim...' : 'Kirim Skor'}
                </button>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <p style={{ fontSize: '13px', color: '#00ff88', fontWeight: '700', margin: 0 }}>✓ Skor berhasil dikirim!</p>
                <button
                  onClick={() => setShowSubmitModal(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.08)',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: '600',
                    border: '1px solid rgba(255,255,255,0.15)',
                    cursor: 'pointer'
                  }}
                >
                  Tutup
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="game-right">
        <div className="game-panel">
          <div className="game-stat-block">
            <div className="game-stat-label">SCORE</div>
            <div className="game-stat-value">{display.score}</div>
          </div>
          <div className="game-stat-block">
            <div className="game-stat-label">BEST</div>
            <div className="game-stat-value">{highScore}</div>
          </div>
          <div className="game-stat-block">
            <div className="game-stat-label">LINES</div>
            <div className="game-stat-value">{display.lines}</div>
          </div>
          <div className="game-stat-block">
            <div className="game-stat-label">LEVEL</div>
            <div className="game-stat-value">{display.level}</div>
          </div>
          <div className="game-next-label">NEXT</div>
          <canvas ref={nextCanvasRef} width={4 * 24} height={4 * 24} className="game-next-canvas" />
          <button className="game-start-btn" onClick={startGame}>
            {display.running ? '⟳ RESTART' : display.gameOver ? '▶ PLAY AGAIN' : '▶ START'}
          </button>
        </div>
      </div>
      {/* Mobile controls */}
      <div className="mobile-controls">
        <div className="ctrl-row">
          <button className="ctrl-btn" onClick={rotate}>↻ Rotate</button>
        </div>
        <div className="ctrl-row">
          <button className="ctrl-btn" onClick={moveLeft}>◀</button>
          <button className="ctrl-btn" onClick={moveDown}>▼</button>
          <button className="ctrl-btn" onClick={moveRight}>▶</button>
        </div>
        <div className="ctrl-row">
          <button className="ctrl-btn ctrl-btn-wide" onClick={hardDrop}>⬇ DROP</button>
        </div>
      </div>
    </div>
  );
}

// ─── GAME MENU COMPONENT ────────────────────────────────────────
function GameMenu({ onSelectGame }) {
  const games = [
    {
      id: 'tetris',
      name: 'Tetris',
      icon: '🧩',
      desc: 'Susun blok dan raih skor tinggi!',
      color: '#d4eb00',
      gradient: 'linear-gradient(135deg, #d4eb00 0%, #a8c700 100%)'
    },
    {
      id: 'snake',
      name: 'Snake',
      icon: '🐍',
      desc: 'Makan makanan dan jangan tabrak dinding!',
      color: '#00ff88',
      gradient: 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)'
    },
    {
      id: 'memory',
      name: 'Memory',
      icon: '🧠',
      desc: 'Temukan pasangan kartu yang cocok!',
      color: '#ff6b6b',
      gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%)'
    }
  ];

  return (
    <div className="game-menu">
      <h2 className="game-menu-title">Pilih Game</h2>
      <div className="game-menu-grid">
        {games.map((game, index) => {
          const cardContent = (
            <motion.div
              className="game-card"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => game.id === 'tetris' && onSelectGame('tetris')}
              style={{ '--game-color': game.color, cursor: 'pointer', height: '100%' }}
            >
              <div className="game-card-icon" style={{ background: game.gradient }}>
                {game.icon}
              </div>
              <div className="game-card-content">
                <h3 className="game-card-name">{game.name}</h3>
                <p className="game-card-desc">{game.desc}</p>
              </div>
              <div className="game-card-arrow">→</div>
            </motion.div>
          );

          if (game.id === 'tetris') {
            return <div key={game.id}>{cardContent}</div>;
          }
          return (
            <Link key={game.id} href={`/game/${game.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
              {cardContent}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ─── MAIN PAGE ──────────────────────────────────────────────────
export default function GamePage() {
  const [selectedGame, setSelectedGame] = useState('menu');
  const [ecoMode, setEcoMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const local = localStorage.getItem('eco_mode');
      if (local !== null) return local === 'true';
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      return isMobile;
    }
    return false;
  });
  const [leaderboardTab, setLeaderboardTab] = useState('tetris');
  const [leaderboardScores, setLeaderboardScores] = useState([]);
  const [loadingScores, setLoadingScores] = useState(false);

  const fetchScores = useCallback(async (gameId) => {
    setLoadingScores(true);
    let onlineScores = [];
    
    // 1. Try online
    try {
      const { data, error } = await supabase
        .from('game_scores')
        .select('*')
        .eq('game_id', gameId)
        .order('score', { ascending: false })
        .limit(10);
      if (!error && data) {
        onlineScores = data;
      }
    } catch (err) {
      console.warn("Koneksi Supabase error / table belum dimigrasi, fallback ke lokal:", err);
    }
    
    // 2. Try offline cache
    let localScores = [];
    try {
      const stored = localStorage.getItem('game_scores_local');
      if (stored) {
        localScores = JSON.parse(stored).filter(s => s.game_id === gameId);
      }
    } catch (err) {
      console.error(err);
    }
    
    // 3. Merge & sort descending
    const combined = [...onlineScores, ...localScores];
    const unique = [];
    const seen = new Set();
    for (const item of combined) {
      const key = `${item.player_name}-${item.score}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(item);
      }
    }
    unique.sort((a, b) => b.score - a.score);
    setLeaderboardScores(unique.slice(0, 5));
    setLoadingScores(false);
  }, []);

  useEffect(() => {
    if (selectedGame === 'menu') {
      fetchScores(leaderboardTab);
    }
  }, [leaderboardTab, selectedGame, fetchScores]);

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

  useEffect(() => {
    const loadSettings = async () => {
      try {
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
      } catch (e) {
        console.error("Gagal memuat pengaturan tema:", e);
      }
      setPageReady(true);
    };
    loadSettings();
  }, []);

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

  const renderGame = () => {
    switch (selectedGame) {
      case 'tetris':
        return <TetrisGame />;
      case 'snake':
      case 'memory':
        return null; // These are on separate pages
      default:
        return <GameMenu onSelectGame={setSelectedGame} />;
    }
  };

  const gameTitles = {
    menu: { title: 'Game Arcade', sub: 'Pilih game favoritmu dan mulai bermain!' },
    tetris: { title: '🧩 Tetris', sub: 'Susun blok dan raih skor tinggi!' },
    snake: { title: '🐍 Snake', sub: 'Makan makanan dan jangan tabrak dinding!' },
    memory: { title: '🧠 Memory', sub: 'Temukan pasangan kartu yang cocok!' }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,900;1,9..144,400;1,9..144,700&family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=Inter:wght@400;600;700&family=Space+Grotesk:wght@400;600;700;800&family=Syne:wght@700;800&family=DM+Sans:wght@400;500;700&family=Cormorant+Garamond:ital,wght@0,700;1,400&family=Lato:wght@400;700&family=Bebas+Neue&family=Teko:wght@400;600;700&family=Pacifico&family=Libre+Caslon+Display&family=Libre+Caslon+Text:wght@400;700&family=Nunito:wght@400;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;}
        :root {
          --acc: var(--accent-color, ${themeColor});
          --acc-15: color-mix(in srgb, var(--acc) 8%, transparent);
          --acc-20: color-mix(in srgb, var(--acc) 20%, transparent);
          --acc-30: color-mix(in srgb, var(--acc) 13%, transparent);
          --acc-50: color-mix(in srgb, var(--acc) 30%, transparent);
          --acc-55: color-mix(in srgb, var(--acc) 33%, transparent);
        }
        body{margin:0;padding:0;background:${currentBg};color:${isDark ? '#f0efe8' : '#1a1a1a'};font-family:${fontBody};min-height:100vh;transition: background 0.3s, color 0.3s;}
 
        .game-page{min-height:100vh;display:flex;flex-direction:column;position:relative;z-index:2;}
 
        /* ── NAV ── */
        .game-nav{
          display:flex;align-items:center;justify-content:space-between;
          padding:0 40px;height:60px;
          background:${currentBg};
          border-bottom:1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'};
          backdrop-filter:blur(12px);
          position:sticky;top:0;z-index:50;
          transition: background 0.3s, border-color 0.3s;
        }
        .game-nav-logo{font-family:${fontHeading};font-size:20px;font-weight:900;text-decoration:none;color:${isDark ? '#f0efe8' : '#1a1a1a'};transition: color 0.3s;}
        .game-nav-logo em{font-style:normal;color:var(--acc);}
        .game-nav-back{
          display:flex;align-items:center;gap:6px;
          padding:8px 16px;background:${currentBg2};
          border:1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'};border-radius:100px;
          color:${isDark ? '#909088' : '#555555'};font-size:12px;font-weight:700;text-decoration:none;
          transition:all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .game-nav-back:hover{
          color:${isDark ? '#f0efe8' : '#1a1a1a'};
          border-color: var(--acc);
          transform: translateX(-4px);
        }
 
        /* ── MAIN ── */
        .game-main{
          flex:1;display:flex;flex-direction:column;align-items:center;
          padding:40px 20px 60px;
        }
        .game-header{text-align:center;margin-bottom:32px;}
        .game-title{font-family:${fontHeading};font-size:clamp(28px,5vw,48px);font-weight:900;margin:0 0 8px;letter-spacing:-0.03em;color:${isDark ? '#f0efe8' : '#1a1a1a'};transition: color 0.3s;}
        .game-title em{font-style:normal;color:var(--acc);}
        .game-sub{font-size:13px;color:${isDark ? 'rgba(240,239,232,0.4)' : '#555555'};margin:0;transition: color 0.3s;}
 
        /* ── GAME MENU ── */
        .game-menu{width:100%;max-width:800px;}
        .game-menu-title{
          font-size:24px;font-weight:800;text-align:center;margin:0 0 32px;
          color:${isDark ? '#f0efe8' : '#1a1a1a'};
        }
        .game-menu-grid{
          display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));
          gap:20px;padding:0 20px;
        }
        .game-card{
          background:${currentBg2};
          border:1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'};
          border-radius:20px;padding:24px;
          cursor:pointer;transition:all 0.3s ease;
          display:flex;flex-direction:column;align-items:center;text-align:center;
          gap:16px;position:relative;overflow:hidden;
        }
        .game-card::before{
          content:'';position:absolute;inset:0;
          background:linear-gradient(135deg,var(--game-color) 0%,transparent 60%);
          opacity:0;transition:opacity 0.3s ease;
        }
        .game-card:hover::before{opacity:0.1;}
        .game-card:hover{
          border-color:var(--game-color);
          box-shadow:0 0 30px rgba(0,0,0,0.3),0 0 60px var(--game-color)20;
        }
        .game-card-icon{
          width:72px;height:72px;border-radius:20px;
          display:flex;align-items:center;justify-content:center;
          font-size:36px;position:relative;z-index:1;
          box-shadow:0 8px 24px rgba(0,0,0,0.3);
        }
        .game-card-content{position:relative;z-index:1;}
        .game-card-name{font-size:20px;font-weight:800;margin:0 0 8px;color:${isDark ? '#f0efe8' : '#1a1a1a'};}
        .game-card-desc{font-size:13px;color:${isDark ? 'rgba(240,239,232,0.5)' : '#555555'};margin:0;line-height:1.5;}
        .game-card-arrow{
          position:absolute;right:20px;top:50%;transform:translateY(-50%);
          font-size:20px;color:${isDark ? 'rgba(240,239,232,0.3)' : 'rgba(0,0,0,0.3)'};transition:all 0.3s ease;
        }
        .game-card:hover .game-card-arrow{
          color:var(--game-color);transform:translateY(-50%) translateX(4px);
        }
 
        /* ── GAME ── */
        .game-wrap{
          display:flex;gap:24px;align-items:flex-start;
          flex-wrap:wrap;justify-content:center;
        }
        .game-canvas{
          display:block;border:2px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
          border-radius:8px;background:#0d0d0f;
        }
        .game-right{display:flex;flex-direction:column;gap:0;}
        .game-panel{
          background:${currentBg2};
          border:1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'};
          border-radius:16px;padding:20px;
          display:flex;flex-direction:column;gap:16px;
          min-width:140px;
        }
        .game-stat-block{display:flex;flex-direction:column;gap:2px;}
        .game-stat-label{font-size:9px;font-weight:800;letter-spacing:0.15em;text-transform:uppercase;color:${isDark ? 'rgba(240,239,232,0.35)' : '#888888'};}
        .game-stat-value{font-size:24px;font-weight:900;color:${isDark ? '#f0efe8' : '#1a1a1a'};font-family:monospace;}
        .game-next-label{font-size:9px;font-weight:800;letter-spacing:0.15em;text-transform:uppercase;color:${isDark ? 'rgba(240,239,232,0.35)' : '#888888'};}
        .game-next-canvas{border:1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'};border-radius:8px;background:#0d0d0f;display:block;}
        .game-start-btn{
          padding:12px 20px;background:var(--acc);color:#0d0d0d;
          border:none;border-radius:12px;font-family:inherit;font-size:13px;font-weight:800;
          cursor:pointer;transition:all 0.2s;letter-spacing:0.04em;
        }
        .game-start-btn:hover{transform:translateY(-2px);box-shadow:0 8px 24px var(--acc-55);}
 
        /* ── MOBILE CONTROLS ── */
        .mobile-controls{
          display:none;flex-direction:column;align-items:center;gap:10px;
          margin-top:20px;width:100%;
        }
        .ctrl-row{display:flex;gap:8px;justify-content:center;}
        .ctrl-btn{
          width:64px;height:48px;
          background:${currentBg2};
          border:1px solid ${isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.14)'};
          border-radius:12px;color:${isDark ? '#f0efe8' : '#1a1a1a'};font-size:18px;font-weight:700;
          display:flex;align-items:center;justify-content:center;
          cursor:pointer;transition:all 0.15s;user-select:none;
          font-family:inherit;
        }
        .ctrl-btn:active{background:var(--acc-20);border-color:var(--acc);transform:scale(0.95);}
        .ctrl-btn-wide{width:180px;font-size:14px;}
 
        /* ── TIPS ── */
        .game-tips{
          margin-top:28px;padding:16px 20px;
          background:${currentBg2};border:1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'};
          border-radius:12px;font-size:12px;color:${isDark ? 'rgba(240,239,232,0.45)' : '#555555'};
          line-height:1.8;text-align:center;max-width:400px;
        }
        .game-tips strong{color:${isDark ? 'rgba(240,239,232,0.7)' : '#1a1a1a'};}
 
        /* ── LEADERBOARD ── */
        .arcade-leaderboard{
          width:100%;max-width:600px;margin:48px auto 0;
          background:${currentBg2};
          border:1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'};
          border-radius:24px;padding:28px;
          box-shadow:0 12px 40px rgba(0,0,0,0.25);
        }
        .leaderboard-title{
          font-family:${fontHeading};font-size:22px;font-weight:900;text-align:center;
          margin:0 0 20px;letter-spacing:-0.02em;color:${isDark ? '#f0efe8' : '#1a1a1a'};
          display:flex;align-items:center;justify-content:center;gap:8px;
        }
        .leaderboard-tabs{
          display:flex;justify-content:center;gap:8px;margin-bottom:20px;
          border-bottom:1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'};
          padding-bottom:12px;
        }
        .leaderboard-tab{
          padding:8px 16px;border-radius:100px;font-size:12px;font-weight:700;
          cursor:pointer;border:1px solid transparent;background:transparent;
          color:${isDark ? 'rgba(240,239,232,0.5)' : '#555555'};transition:all 0.25s;
        }
        .leaderboard-tab.active{
          background:var(--acc-15);border-color:var(--acc-50);color:var(--acc);
          text-shadow:0 0 8px var(--acc-30);
        }
        .leaderboard-list{
          display:flex;flex-direction:column;gap:8px;
        }
        .leaderboard-row{
          display:flex;align-items:center;justify-content:space-between;
          padding:12px 18px;background:${isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'};
          border-radius:12px;border:1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'};
          transition:all 0.2s;
        }
        .leaderboard-row:hover{
          transform:translateX(4px);background:${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'};
        }
        .leaderboard-rank{font-weight:900;font-size:14px;}
        .leaderboard-player{font-weight:600;font-size:13px;}
        .leaderboard-score{font-family:monospace;font-weight:800;color:var(--acc);font-size:15px;}
        .leaderboard-empty{
          text-align:center;padding:24px;font-size:12px;color:rgba(255,255,255,0.4);
          font-style:italic;
        }

        @media(max-width:600px){
          .game-nav{padding:0 20px;}
          .game-main{padding:24px 16px 80px;}
          .game-canvas{width:100% !important;height:auto !important;max-width:320px;}
          .game-panel{flex-direction:row;flex-wrap:wrap;min-width:unset;width:100%;max-width:360px;}
          .game-stat-block{flex:1;min-width:60px;}
          .mobile-controls{display:flex;}
          .game-menu-grid{grid-template-columns:1fr;padding:0 16px;}
          .game-card-arrow{display:none;}
          .arcade-leaderboard {
            padding: 18px !important;
            margin-top: 36px !important;
            border-radius: 16px !important;
          }
          .leaderboard-title {
            font-size: 17px !important;
            margin-bottom: 14px !important;
          }
          .leaderboard-tab {
            padding: 6px 12px !important;
            font-size: 11px !important;
          }
          .leaderboard-row {
            padding: 10px 12px !important;
          }
          .leaderboard-player {
            font-size: 12px !important;
          }
          .leaderboard-score {
            font-size: 13.5px !important;
          }
        }
      `}</style>

      {pageReady && !ecoMode && (
        <BackgroundCanvas bgAnimation={bgAnimation} themeColor={themeColor} isDark={isDark} />
      )}

      <div className="game-page">
        <nav className="game-nav">
          <Link href="/" className="game-nav-logo">aura<em>a</em>uvarose</Link>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {selectedGame !== 'menu' && (
              <button 
                className="game-nav-back" 
                onClick={() => setSelectedGame('menu')}
                style={{ background: 'transparent', cursor: 'pointer', border: 'none' }}
              >
                ← Menu
              </button>
            )}
            <Link href="/" onClick={handleBack} className="game-nav-back">← Kembali</Link>
          </div>
        </nav>

        <main className="game-main">
          <div className="game-header">
            <h1 className="game-title">
              {selectedGame === 'menu' ? '🎮 ' : ''}
              <em>{gameTitles[selectedGame].title.replace(/^\S+\s/, '')}</em>
            </h1>
            <p className="game-sub">{gameTitles[selectedGame].sub}</p>
          </div>



          {selectedGame === 'tetris' ? (
            <>
              <TetrisGame />
              <div className="game-tips">
                <strong>Desktop:</strong> ← → bergerak &nbsp;·&nbsp; ↑ rotate &nbsp;·&nbsp; ↓ turun &nbsp;·&nbsp; Space drop<br/>
                <strong>Mobile:</strong> Swipe kiri/kanan bergerak &nbsp;·&nbsp; Swipe atas rotate &nbsp;·&nbsp; Swipe bawah drop &nbsp;·&nbsp; Tap rotate
              </div>
            </>
          ) : (
            <>
              {renderGame()}
              {selectedGame === 'menu' && (
                <div className="arcade-leaderboard">
                  <h2 className="leaderboard-title">🏆 PAPAN PERINGKAT ARCADE</h2>
                  <div className="leaderboard-tabs">
                    <button className={`leaderboard-tab ${leaderboardTab === 'tetris' ? 'active' : ''}`} onClick={() => setLeaderboardTab('tetris')}>🧩 Tetris</button>
                    <button className={`leaderboard-tab ${leaderboardTab === 'snake' ? 'active' : ''}`} onClick={() => setLeaderboardTab('snake')}>🐍 Snake</button>
                    <button className={`leaderboard-tab ${leaderboardTab === 'memory' ? 'active' : ''}`} onClick={() => setLeaderboardTab('memory')}>🧠 Memory</button>
                  </div>
                  
                  {loadingScores ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: themeColor }}>Memuat skor...</div>
                  ) : leaderboardScores.length === 0 ? (
                    <div className="leaderboard-empty">Belum ada skor tercatat. Jadilah yang pertama!</div>
                  ) : (
                    <div className="leaderboard-list">
                      {leaderboardScores.map((score, index) => {
                        const medals = ['🥇', '🥈', '🥉'];
                        const rankLabel = medals[index] || `#${index + 1}`;
                        return (
                          <div key={index} className="leaderboard-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span className="leaderboard-rank" style={{ width: '30px' }}>{rankLabel}</span>
                              <span className="leaderboard-player">{score.player_name}</span>
                            </div>
                            <span className="leaderboard-score">{score.score}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
}