"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function FlappyBirdPage() {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let bird = { y: 200, vy: 0, gravity: 0.6, jump: -9 };
    let pipes = [];
    let frame = 0;
    let animId;
    let running = true;

    function spawnPipe() {
      const gap = 150;
      const top = 40 + Math.random() * (canvas.height - gap - 100);
      pipes.push({ x: canvas.width, top, gap, passed: false });
    }

    function reset() {
      bird.y = 200;
      bird.vy = 0;
      pipes = [];
      frame = 0;
      setScore(0);
      setStarted(true);
      setGameOver(false);
    }

    function gameLoop() {
      if (!running) return;
      if (!gameOver && started) {
        // Background
        ctx.fillStyle = "#87CEEB";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Bird
        ctx.fillStyle = "#ffd700";
        ctx.beginPath();
        ctx.arc(80, bird.y, 22, 0, Math.PI * 2);
        ctx.fill();

        // Pipes
        ctx.fillStyle = "#228B22";
        for (let p of pipes) {
          ctx.fillRect(p.x, 0, 50, p.top);
          ctx.fillRect(p.x, p.top + p.gap, 50, canvas.height);
          p.x -= 2.5;
          // Score
          if (!p.passed && p.x + 50 < 80) {
            p.passed = true;
            setScore((s) => s + 1);
          }
        }
        pipes = pipes.filter((p) => p.x > -50);

        // Collision
        for (let p of pipes) {
          const birdLeft = 80 - 22;
          const birdRight = 80 + 22;
          const birdTop = bird.y - 22;
          const birdBottom = bird.y + 22;
          if (
            birdRight > p.x &&
            birdLeft < p.x + 50 &&
            (birdTop < p.top || birdBottom > p.top + p.gap)
          ) {
            setGameOver(true);
            running = false;
            return;
          }
        }
        if (bird.y < 0 || bird.y > canvas.height) {
          setGameOver(true);
          running = false;
          return;
        }

        bird.vy += bird.gravity;
        bird.y += bird.vy;
        if (frame % 85 === 0) spawnPipe();
        frame++;
      }
      // Draw even when not started so bird is visible
      if (!started && !gameOver) {
        ctx.fillStyle = "#87CEEB";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ffd700";
        ctx.beginPath();
        ctx.arc(80, bird.y, 22, 0, Math.PI * 2);
        ctx.fill();
      }
      animId = requestAnimationFrame(gameLoop);
    }

    animId = requestAnimationFrame(gameLoop);

    function jump() {
      if (gameOver) {
        reset();
        bird.vy = bird.jump;
      } else {
        bird.vy = bird.jump;
        if (!started) {
          reset();
        }
      }
    }

    const handleKey = (e) => {
      if (e.key === " " || e.key === "ArrowUp") {
        e.preventDefault();
        jump();
      }
    };

    window.addEventListener("keydown", handleKey);
    canvas.addEventListener("click", jump);

    return () => {
      running = false;
      cancelAnimationFrame(animId);
      window.removeEventListener("keydown", handleKey);
      canvas.removeEventListener("click", jump);
    };
  }, [started, gameOver]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse at 50% 0%, #4a9eff 0%, #1a4a8c 40%, #0b1d35 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "100px 24px 60px",
        fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
        color: "#fff",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Sky gradient overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "60%",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.08), transparent)",
          pointerEvents: "none",
        }}
      />

      <Link
        href="/game"
        style={{
          position: "fixed",
          top: 28,
          left: 28,
          zIndex: 10,
          color: "#fff",
          textDecoration: "none",
          fontSize: "14px",
          fontWeight: 600,
          letterSpacing: "0.02em",
          background: "rgba(255,255,255,0.08)",
          padding: "10px 22px",
          borderRadius: "100px",
          backdropFilter: "blur(14px)",
          border: "1px solid rgba(255,255,255,0.12)",
          transition: "all 0.25s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.16)";
          e.currentTarget.style.transform = "translateX(-3px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.08)";
          e.currentTarget.style.transform = "translateX(0)";
        }}
      >
        ← Game Menu
      </Link>

      <div style={{ zIndex: 2, textAlign: "center", marginBottom: "28px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "12px",
            padding: "8px 18px 8px 8px",
            borderRadius: "100px",
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(12px)",
            marginBottom: "16px",
          }}
        >
          <span
            style={{
              fontSize: "24px",
              filter: "drop-shadow(0 2px 8px rgba(255,215,0,0.5))",
            }}
          >
            🐦
          </span>
          <span
            style={{
              fontSize: "10px",
              fontWeight: 800,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#ffd700",
              textShadow: "0 0 10px rgba(255,215,0,0.5)",
            }}
          >
            Flappy Bird
          </span>
        </div>
        <h1
          style={{
            fontSize: "clamp(2.5rem, 6vw, 4rem)",
            fontWeight: 900,
            letterSpacing: "-0.04em",
            margin: 0,
            lineHeight: 1.05,
            color: "#fff",
            textShadow: "0 8px 30px rgba(0,0,0,0.35)",
          }}
        >
          Flappy Bird
        </h1>
      </div>

      <div
        style={{
          zIndex: 2,
          fontSize: "22px",
          fontWeight: 800,
          letterSpacing: "0.08em",
          color: "#ffd700",
          marginBottom: "16px",
          textShadow: "0 0 20px rgba(255,215,0,0.4)",
        }}
      >
        Score: {score}
      </div>

      <div style={{ position: "relative", zIndex: 2 }}>
        <canvas
          ref={canvasRef}
          width={400}
          height={550}
          style={{
            border: "3px solid rgba(255,255,255,0.15)",
            borderRadius: "20px",
            boxShadow:
              "0 20px 60px rgba(0,0,0,0.5), inset 0 0 40px rgba(255,255,255,0.05)",
            background: "#87CEEB",
          }}
        />
      </div>

      {gameOver && (
        <div
          style={{
            zIndex: 2,
            marginTop: "24px",
            textAlign: "center",
            animation: "fadeUp 0.5s ease-out",
          }}
        >
          <p
            style={{
              color: "#ff6b6b",
              fontWeight: 800,
              fontSize: "22px",
              margin: 0,
              textShadow: "0 0 20px rgba(255,107,107,0.4)",
            }}
          >
            Game Over!
          </p>
          <p style={{ color: "#ccc", fontSize: "13px", marginTop: "4px" }}>
            Klik atau Space untuk restart
          </p>
        </div>
      )}

      <p
        style={{
          zIndex: 2,
          color: "#ccc",
          fontSize: "14px",
          marginTop: "14px",
          opacity: 0.9,
          letterSpacing: "0.03em",
        }}
      >
        Space / Klik → terbang
      </p>

      <style jsx global>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
