"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeIn, ScaleIn, BounceIn } from '@/components/animations/ScrollReveal';
import { FancyLoader, PulseLoader } from '@/components/loading/FancyLoader';
import { PageTransition } from '@/components/animations/PageTransition';

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
      <div className="game-left">
        <canvas
          ref={canvasRef}
          width={BOARD_W * CELL}
          height={BOARD_H * CELL}
          className="game-canvas"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        />
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
        {games.map((game, index) => (
          <motion.div
            key={game.id}
            className="game-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            whileHover={{ scale: 1.03, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectGame(game.id)}
            style={{ '--game-color': game.color }}
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
        ))}
      </div>
    </div>
  );
}

// ─── MAIN PAGE ──────────────────────────────────────────────────
export default function GamePage() {
  const [selectedGame, setSelectedGame] = useState('menu');

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
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;}
        html,body{margin:0;padding:0;background:#0a0a0f;color:#f0efe8;font-family:'Plus Jakarta Sans',sans-serif;min-height:100vh;}

        .game-page{min-height:100vh;display:flex;flex-direction:column;}

        /* ── NAV ── */
        .game-nav{
          display:flex;align-items:center;justify-content:space-between;
          padding:0 40px;height:60px;
          background:rgba(10,10,15,0.9);
          border-bottom:1px solid rgba(255,255,255,0.07);
          backdrop-filter:blur(12px);
          position:sticky;top:0;z-index:50;
        }
        .game-nav-logo{font-size:20px;font-weight:900;text-decoration:none;color:#f0efe8;}
        .game-nav-logo em{font-style:normal;color:#d4eb00;}
        .game-nav-back{
          display:flex;align-items:center;gap:6px;
          padding:8px 16px;background:rgba(255,255,255,0.07);
          border:1px solid rgba(255,255,255,0.12);border-radius:100px;
          color:#f0efe8;font-size:12px;font-weight:700;text-decoration:none;
          transition:all 0.2s;
        }
        .game-nav-back:hover{background:rgba(255,255,255,0.12);border-color:rgba(255,255,255,0.2);}

        /* ── MAIN ── */
        .game-main{
          flex:1;display:flex;flex-direction:column;align-items:center;
          padding:40px 20px 60px;
        }
        .game-header{text-align:center;margin-bottom:32px;}
        .game-title{font-size:clamp(28px,5vw,48px);font-weight:900;margin:0 0 8px;letter-spacing:-0.03em;}
        .game-title em{font-style:normal;color:#d4eb00;}
        .game-sub{font-size:13px;color:rgba(240,239,232,0.4);margin:0;}

        /* ── GAME MENU ── */
        .game-menu{width:100%;max-width:800px;}
        .game-menu-title{
          font-size:24px;font-weight:800;text-align:center;margin:0 0 32px;
          color:#f0efe8;
        }
        .game-menu-grid{
          display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));
          gap:20px;padding:0 20px;
        }
        .game-card{
          background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.08);
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
        .game-card-name{font-size:20px;font-weight:800;margin:0 0 8px;color:#f0efe8;}
        .game-card-desc{font-size:13px;color:rgba(240,239,232,0.5);margin:0;line-height:1.5;}
        .game-card-arrow{
          position:absolute;right:20px;top:50%;transform:translateY(-50%);
          font-size:20px;color:rgba(240,239,232,0.3);transition:all 0.3s ease;
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
          display:block;border:2px solid rgba(255,255,255,0.1);
          border-radius:8px;background:#0d0d0f;
        }
        .game-right{display:flex;flex-direction:column;gap:0;}
        .game-panel{
          background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.08);
          border-radius:16px;padding:20px;
          display:flex;flex-direction:column;gap:16px;
          min-width:140px;
        }
        .game-stat-block{display:flex;flex-direction:column;gap:2px;}
        .game-stat-label{font-size:9px;font-weight:800;letter-spacing:0.15em;text-transform:uppercase;color:rgba(240,239,232,0.35);}
        .game-stat-value{font-size:24px;font-weight:900;color:#f0efe8;font-family:monospace;}
        .game-next-label{font-size:9px;font-weight:800;letter-spacing:0.15em;text-transform:uppercase;color:rgba(240,239,232,0.35);}
        .game-next-canvas{border:1px solid rgba(255,255,255,0.08);border-radius:8px;background:#0d0d0f;display:block;}
        .game-start-btn{
          padding:12px 20px;background:#d4eb00;color:#0d0d0d;
          border:none;border-radius:12px;font-family:inherit;font-size:13px;font-weight:800;
          cursor:pointer;transition:all 0.2s;letter-spacing:0.04em;
        }
        .game-start-btn:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(212,235,0,0.35);}

        /* ── MOBILE CONTROLS ── */
        .mobile-controls{
          display:none;flex-direction:column;align-items:center;gap:10px;
          margin-top:20px;width:100%;
        }
        .ctrl-row{display:flex;gap:8px;justify-content:center;}
        .ctrl-btn{
          width:64px;height:48px;
          background:rgba(255,255,255,0.08);
          border:1px solid rgba(255,255,255,0.14);
          border-radius:12px;color:#f0efe8;font-size:18px;font-weight:700;
          display:flex;align-items:center;justify-content:center;
          cursor:pointer;transition:all 0.15s;user-select:none;
          font-family:inherit;
        }
        .ctrl-btn:active{background:rgba(212,235,0,0.2);border-color:#d4eb00;transform:scale(0.95);}
        .ctrl-btn-wide{width:180px;font-size:14px;}

        /* ── TIPS ── */
        .game-tips{
          margin-top:28px;padding:16px 20px;
          background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);
          border-radius:12px;font-size:12px;color:rgba(240,239,232,0.45);
          line-height:1.8;text-align:center;max-width:400px;
        }
        .game-tips strong{color:rgba(240,239,232,0.7);}

        @media(max-width:600px){
          .game-nav{padding:0 20px;}
          .game-main{padding:24px 16px 80px;}
          .game-canvas{width:100% !important;height:auto !important;max-width:320px;}
          .game-panel{flex-direction:row;flex-wrap:wrap;min-width:unset;width:100%;max-width:360px;}
          .game-stat-block{flex:1;min-width:60px;}
          .mobile-controls{display:flex;}
          .game-menu-grid{grid-template-columns:1fr;padding:0 16px;}
          .game-card-arrow{display:none;}
        }
      `}</style>

      <div className="game-page">
        <nav className="game-nav">
          <Link href="/" className="game-nav-logo">aura<em>a</em>uvarose</Link>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {selectedGame !== 'menu' && (
              <button 
                className="game-nav-back" 
                onClick={() => setSelectedGame('menu')}
                style={{ background: 'transparent', cursor: 'pointer' }}
              >
                ← Menu
              </button>
            )}
            <Link href="/" className="game-nav-back">← Kembali</Link>
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

          {selectedGame === 'menu' && (
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '32px' }}>
              <Link href="/game/snake">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: '14px 28px',
                    background: 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)',
                    border: 'none',
                    borderRadius: '14px',
                    color: '#0a0a0f',
                    fontSize: '15px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    boxShadow: '0 8px 24px rgba(0,255,136,0.3)'
                  }}
                >
                  🐍 Mainkan Snake
                </motion.button>
              </Link>
              <Link href="/game/memory">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: '14px 28px',
                    background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%)',
                    border: 'none',
                    borderRadius: '14px',
                    color: '#fff',
                    fontSize: '15px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    boxShadow: '0 8px 24px rgba(255,107,107,0.3)'
                  }}
                >
                  🧠 Mainkan Memory
                </motion.button>
              </Link>
            </div>
          )}

          {selectedGame === 'tetris' ? (
            <>
              <TetrisGame />
              <div className="game-tips">
                <strong>Desktop:</strong> ← → bergerak &nbsp;·&nbsp; ↑ rotate &nbsp;·&nbsp; ↓ turun &nbsp;·&nbsp; Space drop<br/>
                <strong>Mobile:</strong> Swipe kiri/kanan bergerak &nbsp;·&nbsp; Swipe atas rotate &nbsp;·&nbsp; Swipe bawah drop &nbsp;·&nbsp; Tap rotate
              </div>
            </>
          ) : (
            renderGame()
          )}
        </main>
      </div>
    </>
  );
}