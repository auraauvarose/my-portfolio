'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const EMOJIS = ['🎮', '🎯', '🎲', '🎸', '🎨', '🚀', '💎', '🔥', '🌟', '💡', '🎵', '🌈'];

export default function MemoryGame() {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  const [bestTime, setBestTime] = useState({ easy: null, medium: null, hard: null });

  const DIFFICULTY_CONFIG = {
    easy: { pairs: 6, cols: 4 },
    medium: { pairs: 8, cols: 4 },
    hard: { pairs: 12, cols: 6 },
  };

  useEffect(() => {
    const saved = localStorage.getItem('memory_best_times');
    if (saved) {
      requestAnimationFrame(() => setBestTime(JSON.parse(saved)));
    }
  }, []);

  useEffect(() => {
    let interval;
    if (isPlaying && !gameWon) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, gameWon]);

  const initGame = useCallback(() => {
    const { pairs } = DIFFICULTY_CONFIG[difficulty];
    const selectedEmojis = EMOJIS.slice(0, pairs);
    const gameCards = [...selectedEmojis, ...selectedEmojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({ id: index, emoji, isFlipped: false }));
    
    setCards(gameCards);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setTimer(0);
    setIsPlaying(true);
    setGameWon(false);
  }, [difficulty]);

  const handleCardClick = (index) => {
    if (!isPlaying || flipped.includes(index) || matched.includes(index) || flipped.length >= 2) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);
    setMoves(m => m + 1);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      if (cards[first].emoji === cards[second].emoji) {
        setTimeout(() => {
          setMatched(m => [...m, first, second]);
          setFlipped([]);
          
          if (matched.length + 2 === cards.length) {
            setGameWon(true);
            setIsPlaying(false);
            const newBestTime = { ...bestTime };
            if (!newBestTime[difficulty] || timer < newBestTime[difficulty]) {
              newBestTime[difficulty] = timer;
              setBestTime(newBestTime);
              localStorage.setItem('memory_best_times', JSON.stringify(newBestTime));
            }
          }
        }, 500);
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const { cols } = DIFFICULTY_CONFIG[difficulty];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {/* Navigation */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        padding: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 100,
      }}>
        <Link href="/" style={{ color: '#fff', textDecoration: 'none', fontSize: '18px', fontWeight: 700 }}>
          aura<span style={{ color: '#e94560' }}>a</span>uvarose
        </Link>
        <Link href="/game" style={{ color: '#888', textDecoration: 'none', fontSize: '14px' }}>
          ← Kembali ke Game
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginTop: '60px', textAlign: 'center', width: '100%', maxWidth: '700px' }}
      >
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          fontWeight: 800,
          marginBottom: '20px',
          background: 'linear-gradient(135deg, #e94560, #ff6b6b)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          🧠 Memory Game
        </h1>

        {/* Difficulty Selector */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
          {['easy', 'medium', 'hard'].map((level) => (
            <button
              key={level}
              onClick={() => { setDifficulty(level); initGame(); }}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: 'none',
                background: difficulty === level ? '#e94560' : 'rgba(255,255,255,0.1)',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 600,
                textTransform: 'capitalize',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {level}
              {bestTime[level] && <span style={{ marginLeft: '5px', opacity: 0.7 }}>({formatTime(bestTime[level])})</span>}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex',
          gap: '30px',
          justifyContent: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
        }}>
          <div style={{ color: '#e94560', fontSize: '18px', fontWeight: 600 }}>
            ⏱️ {formatTime(timer)}
          </div>
          <div style={{ color: '#ffd700', fontSize: '18px', fontWeight: 600 }}>
            🎯 Moves: {moves}
          </div>
          <div style={{ color: '#00d9ff', fontSize: '18px', fontWeight: 600 }}>
            ✅ {matched.length / 2}/{cards.length / 2}
          </div>
        </div>

        {/* Game Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: '10px',
          maxWidth: '600px',
          margin: '0 auto 20px',
          padding: '20px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '20px',
        }}>
          <AnimatePresence>
            {cards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ scale: 0, rotateY: 180 }}
                animate={{ 
                  scale: 1, 
                  rotateY: flipped.includes(index) || matched.includes(index) ? 0 : 180,
                }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => handleCardClick(index)}
                style={{
                  aspectRatio: '1',
                  background: matched.includes(index) 
                    ? 'linear-gradient(135deg, #00d9ff, #00a8e8)'
                    : flipped.includes(index)
                    ? 'linear-gradient(135deg, #fff, #f0f0f0)'
                    : 'linear-gradient(135deg, #e94560, #c73e54)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                  cursor: 'pointer',
                  boxShadow: matched.includes(index) 
                    ? '0 0 20px rgba(0, 217, 255, 0.5)'
                    : '0 4px 15px rgba(0,0,0,0.3)',
                  transformStyle: 'preserve-3d',
                }}
              >
                {(flipped.includes(index) || matched.includes(index)) ? card.emoji : '❓'}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={initGame}
            style={{
              padding: '12px 30px',
              background: 'linear-gradient(135deg, #e94560, #ff6b6b)',
              border: 'none',
              borderRadius: '25px',
              color: '#fff',
              fontSize: '16px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            🔄 New Game
          </motion.button>
        </div>

        {/* Win Modal */}
        <AnimatePresence>
          {gameWon && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
              }}
            >
              <motion.div
                initial={{ y: 50 }}
                animate={{ y: 0 }}
                style={{
                  background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
                  padding: '40px',
                  borderRadius: '20px',
                  textAlign: 'center',
                  color: '#fff',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                }}
              >
                <h2 style={{ fontSize: '32px', marginBottom: '10px', color: '#00d9ff' }}>🎉 Congratulations!</h2>
                <p style={{ fontSize: '18px', marginBottom: '20px' }}>You completed the game!</p>
                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '20px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#ffd700' }}>{moves}</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>Moves</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#e94560' }}>{formatTime(timer)}</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>Time</div>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={initGame}
                  style={{
                    padding: '12px 30px',
                    background: 'linear-gradient(135deg, #00d9ff, #00a8e8)',
                    border: 'none',
                    borderRadius: '25px',
                    color: '#000',
                    fontSize: '16px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Play Again
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
