'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;

export default function SnakeGame() {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState({ x: 0, y: -1 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const gameLoopRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('snake_highscore');
    if (saved) {
      requestAnimationFrame(() => setHighScore(parseInt(saved)));
    }
  }, []);

  const generateFood = useCallback((currentSnake) => {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, []);

  const resetGame = () => {
    const initialSnake = [{ x: 10, y: 10 }];
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setDirection({ x: 0, y: -1 });
    setGameOver(false);
    setScore(0);
    setIsPaused(false);
    setGameStarted(true);
  };

  const togglePause = () => {
    if (gameStarted && !gameOver) {
      setIsPaused(!isPaused);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!gameStarted || gameOver) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          resetGame();
        }
        return;
      }

      if (e.key === ' ') {
        e.preventDefault();
        togglePause();
        return;
      }

      if (isPaused) return;

      switch (e.key) {
        case 'ArrowUp':
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, gameStarted, gameOver, isPaused]);

  useEffect(() => {
    if (!gameStarted || gameOver || isPaused) {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    const speed = Math.max(50, INITIAL_SPEED - score * 2);

    gameLoopRef.current = setInterval(() => {
      setSnake(currentSnake => {
        const newSnake = [...currentSnake];
        const head = { ...newSnake[0] };
        head.x += direction.x;
        head.y += direction.y;

        // Check wall collision
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          setGameOver(true);
          return currentSnake;
        }

        // Check self collision
        if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
          setGameOver(true);
          return currentSnake;
        }

        newSnake.unshift(head);

        // Check food collision
        if (head.x === food.x && head.y === food.y) {
          const newScore = score + 10;
          setScore(newScore);
          if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem('snake_highscore', newScore.toString());
          }
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, speed);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [direction, food, gameStarted, gameOver, isPaused, score, highScore, generateFood]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
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
        <Link href="/" style={{
          color: '#fff',
          textDecoration: 'none',
          fontSize: '18px',
          fontWeight: 700,
        }}>
          aura<span style={{ color: '#00ff88' }}>a</span>uvarose
        </Link>
        <Link href="/game" style={{
          color: '#888',
          textDecoration: 'none',
          fontSize: '14px',
          transition: 'color 0.2s',
        }}>
          ← Kembali ke Game
        </Link>
      </div>

      {/* Game Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          textAlign: 'center',
        }}
      >
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          fontWeight: 800,
          marginBottom: '10px',
          background: 'linear-gradient(135deg, #00ff88, #00d4ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          🐍 Snake Game
        </h1>

        {/* Score Board */}
        <div style={{
          display: 'flex',
          gap: '30px',
          justifyContent: 'center',
          marginBottom: '20px',
          fontSize: '18px',
          fontWeight: 600,
        }}>
          <div style={{ color: '#00ff88' }}>Score: {score}</div>
          <div style={{ color: '#ffd700' }}>High Score: {highScore}</div>
        </div>

        {/* Game Board */}
        <div style={{
          position: 'relative',
          width: GRID_SIZE * CELL_SIZE,
          height: GRID_SIZE * CELL_SIZE,
          border: '3px solid #00ff88',
          borderRadius: '10px',
          background: '#0a0a0a',
          boxShadow: '0 0 30px rgba(0, 255, 136, 0.3), inset 0 0 30px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
        }}>
          {/* Grid */}
          {Array.from({ length: GRID_SIZE }).map((_, y) =>
            Array.from({ length: GRID_SIZE }).map((_, x) => (
              <div
                key={`${x}-${y}`}
                style={{
                  position: 'absolute',
                  left: x * CELL_SIZE,
                  top: y * CELL_SIZE,
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  border: '1px solid rgba(0, 255, 136, 0.05)',
                }}
              />
            ))
          )}

          {/* Snake */}
          {snake.map((segment, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{
                position: 'absolute',
                left: segment.x * CELL_SIZE + 1,
                top: segment.y * CELL_SIZE + 1,
                width: CELL_SIZE - 2,
                height: CELL_SIZE - 2,
                background: index === 0 
                  ? 'linear-gradient(135deg, #00ff88, #00cc6a)' 
                  : 'linear-gradient(135deg, #00cc6a, #00994d)',
                borderRadius: '4px',
                boxShadow: index === 0 ? '0 0 10px rgba(0, 255, 136, 0.8)' : 'none',
              }}
            />
          ))}

          {/* Food */}
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            style={{
              position: 'absolute',
              left: food.x * CELL_SIZE + 2,
              top: food.y * CELL_SIZE + 2,
              width: CELL_SIZE - 4,
              height: CELL_SIZE - 4,
              background: 'linear-gradient(135deg, #ff4757, #ff6348)',
              borderRadius: '50%',
              boxShadow: '0 0 15px rgba(255, 71, 87, 0.8)',
            }}
          />

          {/* Game Over / Start Overlay */}
          {(gameOver || !gameStarted) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.85)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <h2 style={{ fontSize: '24px', marginBottom: '10px', color: gameOver ? '#ff4757' : '#00ff88' }}>
                {gameOver ? '💀 Game Over!' : '🐍 Snake Game'}
              </h2>
              {gameOver && <p style={{ fontSize: '18px', marginBottom: '20px' }}>Final Score: {score}</p>}
              <p style={{ fontSize: '14px', color: '#888', marginBottom: '20px' }}>
                Press SPACE or ENTER to {gameOver ? 'restart' : 'start'}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetGame}
                style={{
                  padding: '12px 30px',
                  background: 'linear-gradient(135deg, #00ff88, #00cc6a)',
                  border: 'none',
                  borderRadius: '25px',
                  color: '#000',
                  fontSize: '16px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {gameOver ? 'Play Again' : 'Start Game'}
              </motion.button>
            </motion.div>
          )}

          {/* Pause Overlay */}
          {isPaused && gameStarted && !gameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <h2 style={{ fontSize: '28px', color: '#ffd700' }}>⏸️ Paused</h2>
            </motion.div>
          )}
        </div>

        {/* Controls */}
        <div style={{
          marginTop: '20px',
          display: 'flex',
          gap: '15px',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetGame}
            style={{
              padding: '10px 20px',
              background: 'transparent',
              border: '2px solid #00ff88',
              borderRadius: '20px',
              color: '#00ff88',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            🔄 Restart
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={togglePause}
            disabled={!gameStarted || gameOver}
            style={{
              padding: '10px 20px',
              background: gameStarted && !gameOver ? '#ffd700' : '#333',
              border: 'none',
              borderRadius: '20px',
              color: gameStarted && !gameOver ? '#000' : '#666',
              fontSize: '14px',
              fontWeight: 600,
              cursor: gameStarted && !gameOver ? 'pointer' : 'not-allowed',
            }}
          >
            {isPaused ? '▶️ Resume' : '⏸️ Pause'}
          </motion.button>
        </div>

        {/* Instructions */}
        <div style={{
          marginTop: '20px',
          padding: '15px 25px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '15px',
          fontSize: '13px',
          color: '#888',
          maxWidth: '400px',
        }}>
          <p style={{ margin: '0 0 5px 0' }}>🎮 <strong>Controls:</strong></p>
          <p style={{ margin: 0 }}>Arrow keys to move • SPACE to pause</p>
        </div>
      </motion.div>
    </div>
  );
}
