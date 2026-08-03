"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";

/* ── Helpers ────────────────────────────────────────────────────────── */
const hexToRgb = (hex) => {
  if (!hex) return [212, 235, 0];
  const c = hex.replace("#", "");
  const full = c.length === 3 ? c.split("").map((x) => x + x).join("") : c;
  return [
    parseInt(full.slice(0, 2), 16) || 212,
    parseInt(full.slice(2, 4), 16) || 235,
    parseInt(full.slice(4, 6), 16) || 0,
  ];
};

const CW = 400; // canvas width
const CH = 550; // canvas height

/* ── Game constants ─────────────────────────────────────────────────── */
const GRAVITY = 0.5;
const JUMP = -8.5;
const PIPE_W = 62;
const BASE_SPEED = 2.6;
const BASE_GAP = 160;
const MIN_GAP = 120;
const SPAWN_FRAMES = 90;
const GROUND_H = 48;
const BIRD_R = 13; // visual radius
const BIRD_HIT = 10; // forgiving hitbox

export default function FlappyBirdPage() {
  const { themeColor, isDark } = useTheme();

  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const rafRef = useRef(null);

  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [phase, setPhase] = useState("idle"); // idle | playing | dead
  const [muted, setMuted] = useState(false);

  const phaseRef = useRef("idle");
  const mutedRef = useRef(false);
  const themeRgbRef = useRef([212, 235, 0]);
  const isDarkRef = useRef(true);

  /* ── Sound (Web Audio API, zero files) ─────────────────────────────── */
  const audioRef = useRef(null);
  const initAudio = useCallback(() => {
    if (audioRef.current) return;
    try {
      audioRef.current = new (window.AudioContext || window.webkitAudioContext)();
    } catch {}
  }, []);

  const playSound = useCallback((type) => {
    if (mutedRef.current) return;
    const ctx = audioRef.current;
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;
    if (type === "jump") {
      osc.type = "square";
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(720, now + 0.08);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === "score") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(660, now);
      osc.frequency.exponentialRampToValueAtTime(990, now + 0.12);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.start(now);
      osc.stop(now + 0.14);
    } else if (type === "hit") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.3);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  }, []);

  /* ── Load best score ───────────────────────────────────────────────── */
  useEffect(() => {
    const saved = localStorage.getItem("flappy_highscore");
    if (saved) setBest(parseInt(saved) || 0);
    const m = localStorage.getItem("flappy_muted");
    if (m === "1") setMuted(true);
  }, []);

  useEffect(() => {
    mutedRef.current = muted;
    localStorage.setItem("flappy_muted", muted ? "1" : "0");
  }, [muted]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    themeRgbRef.current = hexToRgb(themeColor);
  }, [themeColor]);

  useEffect(() => {
    isDarkRef.current = isDark;
  }, [isDark]);

  /* ── Init game object ──────────────────────────────────────────────── */
  const initGame = useCallback(() => {
    return {
      bird: { x: 90, y: CH / 2, vy: 0, rot: 0 },
      pipes: [],
      particles: [],
      bgParticles: [],
      frame: 0,
      shake: 0,
      speed: BASE_SPEED,
      gap: BASE_GAP,
      scored: false,
    };
  }, []);

  /* ── Spawn helpers ─────────────────────────────────────────────────── */
  const spawnPipe = (g) => {
    const top = 50 + Math.random() * (CH - GROUND_H - g.gap - 120);
    g.pipes.push({ x: CW, top, passed: false });
  };

  const spawnBgParticle = (g) => {
    g.bgParticles.push({
      x: CW + Math.random() * 50,
      y: Math.random() * (CH - GROUND_H),
      r: 1 + Math.random() * 2,
      vx: -0.3 - Math.random() * 0.5,
      a: 0.1 + Math.random() * 0.3,
    });
  };

  const burst = (g, x, y, color, count = 8) => {
    for (let i = 0; i < count; i++) {
      const ang = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const sp = 1 + Math.random() * 3;
      g.particles.push({
        x, y,
        vx: Math.cos(ang) * sp,
        vy: Math.sin(ang) * sp,
        life: 1,
        color,
        r: 2 + Math.random() * 2,
      });
    }
  };

  /* ── Input ─────────────────────────────────────────────────────────── */
  const flap = useCallback(() => {
    initAudio();
    const g = gameRef.current;
    if (!g) return;
    if (phaseRef.current === "idle") {
      gameRef.current = initGame();
      gameRef.current.bird.vy = JUMP;
      setScore(0);
      setPhase("playing");
      playSound("jump");
      return;
    }
    if (phaseRef.current === "playing") {
      g.bird.vy = JUMP;
      playSound("jump");
      return;
    }
    if (phaseRef.current === "dead") {
      gameRef.current = initGame();
      setScore(0);
      setPhase("playing");
      playSound("jump");
    }
  }, [initAudio, initGame, playSound]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === " " || e.key === "ArrowUp" || e.key === "Enter") {
        e.preventDefault();
        flap();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flap]);

  /* ── Main game loop ────────────────────────────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    gameRef.current = initGame();

    // Pre-fill bg particles
    const g0 = gameRef.current;
    for (let i = 0; i < 30; i++) spawnBgParticle(g0);

    let last = performance.now();

    const draw = (now) => {
      const dt = Math.min((now - last) / 16.67, 2.5);
      last = now;
      const g = gameRef.current;
      if (!g) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      const [r, gr, b] = themeRgbRef.current;
      const dark = isDarkRef.current;
      const accent = `rgb(${r},${gr},${b})`;
      const accentSoft = `rgba(${r},${gr},${b},0.15)`;

      /* ── Background ──────────────────────────────────────────────── */
      const bgTop = dark ? "#0a0e17" : "#1a2332";
      const bgBot = dark ? "#121826" : "#243447";
      const grad = ctx.createLinearGradient(0, 0, 0, CH);
      grad.addColorStop(0, bgTop);
      grad.addColorStop(1, bgBot);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, CW, CH);

      // Grid parallax
      ctx.strokeStyle = `rgba(${r},${gr},${b},0.06)`;
      ctx.lineWidth = 1;
      const gridOff = (g.frame * (g.speed * 0.3)) % 40;
      for (let x = -gridOff; x < CW; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CH - GROUND_H);
        ctx.stroke();
      }
      for (let y = 0; y < CH - GROUND_H; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CW, y);
        ctx.stroke();
      }

      // BG particles
      for (const p of g.bgParticles) {
        p.x += p.vx * dt;
        ctx.fillStyle = `rgba(${r},${gr},${b},${p.a})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      g.bgParticles = g.bgParticles.filter((p) => p.x > -10);
      if (g.frame % 20 === 0) spawnBgParticle(g);

      /* ── Update (playing only) ───────────────────────────────────── */
      const playing = phaseRef.current === "playing";

      if (playing) {
        g.bird.vy += GRAVITY * dt;
        g.bird.y += g.bird.vy * dt;
        g.bird.rot = Math.max(-0.5, Math.min(1.4, g.bird.vy * 0.06));

        // Difficulty scaling
        g.speed = BASE_SPEED + Math.min(2.5, score * 0.03);
        g.gap = Math.max(MIN_GAP, BASE_GAP - Math.floor(score / 5) * 8);

        if (g.frame % SPAWN_FRAMES === 0) spawnPipe(g);

        for (const p of g.pipes) {
          p.x -= g.speed * dt;
          if (!p.passed && p.x + PIPE_W < g.bird.x) {
            p.passed = true;
            setScore((s) => s + 1);
            playSound("score");
            burst(g, g.bird.x + 15, g.bird.y, accent, 6);
          }
        }
        g.pipes = g.pipes.filter((p) => p.x > -PIPE_W);

        // Collision
        let dead = false;
        if (g.bird.y - BIRD_HIT < 0 || g.bird.y + BIRD_HIT > CH - GROUND_H) {
          dead = true;
        }
        for (const p of g.pipes) {
          if (
            g.bird.x + BIRD_HIT > p.x &&
            g.bird.x - BIRD_HIT < p.x + PIPE_W &&
            (g.bird.y - BIRD_HIT < p.top || g.bird.y + BIRD_HIT > p.top + g.gap)
          ) {
            dead = true;
            break;
          }
        }
        if (dead) {
          playSound("hit");
          burst(g, g.bird.x, g.bird.y, "#ff4466", 16);
          g.shake = 14;
          setPhase("dead");
          phaseRef.current = "dead";
          setBest((prev) => {
            const nb = Math.max(prev, score + 1);
            localStorage.setItem("flappy_highscore", String(nb));
            return nb;
          });
        }
        g.frame++;
      }

      /* ── Screen shake ────────────────────────────────────────────── */
      let sx = 0, sy = 0;
      if (g.shake > 0) {
        sx = (Math.random() - 0.5) * g.shake;
        sy = (Math.random() - 0.5) * g.shake;
        g.shake *= 0.88;
        if (g.shake < 0.3) g.shake = 0;
      }
      ctx.save();
      ctx.translate(sx, sy);

      /* ── Pipes ───────────────────────────────────────────────────── */
      for (const p of g.pipes) {
        ctx.save();
        ctx.shadowBlur = 18;
        ctx.shadowColor = accent;
        // Body gradient
        const pg = ctx.createLinearGradient(p.x, 0, p.x + PIPE_W, 0);
        pg.addColorStop(0, accentSoft);
        pg.addColorStop(0.5, `rgba(${r},${gr},${b},0.25)`);
        pg.addColorStop(1, accentSoft);
        ctx.fillStyle = pg;
        // Top pipe
        ctx.fillRect(p.x, 0, PIPE_W, p.top);
        // Bottom pipe
        ctx.fillRect(p.x, p.top + g.gap, PIPE_W, CH - GROUND_H - p.top - g.gap);
        // Caps
        ctx.fillStyle = `rgba(${r},${gr},${b},0.35)`;
        ctx.fillRect(p.x - 4, p.top - 18, PIPE_W + 8, 18);
        ctx.fillRect(p.x - 4, p.top + g.gap, PIPE_W + 8, 18);
        // Neon outline
        ctx.strokeStyle = accent;
        ctx.lineWidth = 2;
        ctx.strokeRect(p.x, 0, PIPE_W, p.top);
        ctx.strokeRect(p.x, p.top + g.gap, PIPE_W, CH - GROUND_H - p.top - g.gap);
        ctx.restore();
      }

      /* ── Ground ──────────────────────────────────────────────────── */
      ctx.save();
      ctx.shadowBlur = 12;
      ctx.shadowColor = accent;
      ctx.fillStyle = `rgba(${r},${gr},${b},0.12)`;
      ctx.fillRect(0, CH - GROUND_H, CW, GROUND_H);
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, CH - GROUND_H);
      ctx.lineTo(CW, CH - GROUND_H);
      ctx.stroke();
      // Moving stripes
      const stripeOff = (g.frame * g.speed * 0.5) % 30;
      ctx.strokeStyle = `rgba(${r},${gr},${b},0.2)`;
      ctx.lineWidth = 1;
      for (let x = -stripeOff; x < CW; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, CH - GROUND_H + 8);
        ctx.lineTo(x + 15, CH - GROUND_H + 8);
        ctx.stroke();
      }
      ctx.restore();

      /* ── Bird trail ──────────────────────────────────────────────── */
      // trail particles emanate during play
      if (playing && g.frame % 3 === 0) {
        g.particles.push({
          x: g.bird.x - 8,
          y: g.bird.y + 4,
          vx: -1 - Math.random(),
          vy: (Math.random() - 0.5) * 0.5,
          life: 1,
          color: `rgba(${r},${gr},${b},0.5)`,
          r: 1.5 + Math.random() * 2,
        });
      }

      /* ── Particles ───────────────────────────────────────────────── */
      for (const p of g.particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 0.05 * dt;
        p.life -= 0.02 * dt;
        if (p.life <= 0) continue;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      g.particles = g.particles.filter((p) => p.life > 0);

      /* ── Bird ────────────────────────────────────────────────────── */
      ctx.save();
      ctx.translate(g.bird.x, g.bird.y);
      ctx.rotate(g.bird.rot);
      ctx.shadowBlur = 24;
      ctx.shadowColor = accent;
      // Diamond body
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.moveTo(BIRD_R, 0);
      ctx.lineTo(0, -BIRD_R);
      ctx.lineTo(-BIRD_R, 0);
      ctx.lineTo(0, BIRD_R);
      ctx.closePath();
      ctx.fill();
      // Inner glow
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.beginPath();
      ctx.moveTo(BIRD_R * 0.5, 0);
      ctx.lineTo(0, -BIRD_R * 0.5);
      ctx.lineTo(-BIRD_R * 0.5, 0);
      ctx.lineTo(0, BIRD_R * 0.5);
      ctx.closePath();
      ctx.fill();
      // Eye
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(3, -3, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#0a0e17";
      ctx.beginPath();
      ctx.arc(4, -3, 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.restore(); // shake

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Render ────────────────────────────────────────────────────────── */
  const accent = themeColor || "#d4eb00";
  const [ar, ag, ab] = hexToRgb(accent);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: isDark
          ? "radial-gradient(ellipse at 50% 0%, #131826 0%, #0a0e17 60%, #05070d 100%)"
          : "radial-gradient(ellipse at 50% 0%, #1a2332 0%, #111827 60%, #0a0f17 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "90px 24px 40px",
        fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
        color: "#fff",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* ── Back link ──────────────────────────────────────────────── */}
      <Link
        href="/game"
        style={{
          position: "fixed",
          top: 24,
          left: 24,
          zIndex: 100,
          color: "#fff",
          textDecoration: "none",
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: "0.02em",
          background: "rgba(255,255,255,0.06)",
          padding: "9px 18px",
          borderRadius: 100,
          backdropFilter: "blur(12px)",
          border: `1px solid rgba(${ar},${ag},${ab},0.2)`,
          transition: "all 0.25s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = `rgba(${ar},${ag},${ab},0.15)`;
          e.currentTarget.style.transform = "translateX(-3px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.06)";
          e.currentTarget.style.transform = "translateX(0)";
        }}
      >
        ← Game Menu
      </Link>

      {/* ── Mute toggle ────────────────────────────────────────────── */}
      <button
        onClick={() => setMuted((m) => !m)}
        style={{
          position: "fixed",
          top: 24,
          right: 24,
          zIndex: 10,
          background: "rgba(255,255,255,0.06)",
          border: `1px solid rgba(${ar},${ag},${ab},0.2)`,
          borderRadius: 100,
          padding: "10px 16px",
          color: "#fff",
          fontSize: 16,
          cursor: "pointer",
          backdropFilter: "blur(14px)",
          transition: "all 0.25s ease",
          lineHeight: 1,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = `rgba(${ar},${ag},${ab},0.15)`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.06)";
        }}
        aria-label="Toggle sound"
      >
        {muted ? "🔇" : "🔊"}
      </button>

      {/* ── Title badge ────────────────────────────────────────────── */}
      <div style={{ zIndex: 2, textAlign: "center", marginBottom: 20 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "7px 16px 7px 7px",
            borderRadius: 100,
            background: "rgba(255,255,255,0.05)",
            border: `1px solid rgba(${ar},${ag},${ab},0.2)`,
            backdropFilter: "blur(12px)",
            marginBottom: 12,
          }}
        >
          <span
            style={{
              fontSize: 20,
              filter: `drop-shadow(0 2px 8px rgba(${ar},${ag},${ab},0.5))`,
            }}
          >
            💎
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: accent,
              textShadow: `0 0 10px rgba(${ar},${ag},${ab},0.5)`,
            }}
          >
            Neon Bird
          </span>
        </div>
      </div>

      {/* ── Score + Best ───────────────────────────────────────────── */}
      <div
        style={{
          zIndex: 2,
          display: "flex",
          gap: 16,
          marginBottom: 16,
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontSize: 26,
            fontWeight: 900,
            letterSpacing: "0.06em",
            color: accent,
            textShadow: `0 0 20px rgba(${ar},${ag},${ab},0.5)`,
          }}
        >
          {score}
        </div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "rgba(255,255,255,0.4)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            borderLeft: "1px solid rgba(255,255,255,0.15)",
            paddingLeft: 16,
          }}
        >
          Best {best}
        </div>
      </div>

      {/* ── Canvas + Overlays ──────────────────────────────────────── */}
      <div style={{ position: "relative", zIndex: 2 }}>
        <canvas
          ref={canvasRef}
          width={CW}
          height={CH}
          onClick={() => flap()}
          onTouchStart={(e) => {
            e.preventDefault();
            flap();
          }}
          style={{
            border: `2px solid rgba(${ar},${ag},${ab},0.25)`,
            borderRadius: 20,
            boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 80px rgba(${ar},${ag},${ab},0.08), inset 0 0 40px rgba(255,255,255,0.03)`,
            background: "#0a0e17",
            cursor: "pointer",
            display: "block",
            touchAction: "none",
          }}
        />

        {/* Start overlay */}
        <AnimatePresence>
          {phase === "idle" && (
            <motion.div
              key="start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 14,
                borderRadius: 20,
                background: "rgba(10,14,23,0.65)",
                backdropFilter: "blur(4px)",
              }}
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                style={{ fontSize: 42, filter: `drop-shadow(0 0 16px rgba(${ar},${ag},${ab},0.6))` }}
              >
                💎
              </motion.div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: accent,
                  textShadow: `0 0 12px rgba(${ar},${ag},${ab},0.5)`,
                }}
              >
                Neon Bird
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.6)",
                  letterSpacing: "0.04em",
                }}
              >
                Space / Klik / Tap → terbang
              </div>
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                style={{
                  marginTop: 6,
                  padding: "10px 28px",
                  borderRadius: 100,
                  background: `rgba(${ar},${ag},${ab},0.12)`,
                  border: `1px solid rgba(${ar},${ag},${ab},0.3)`,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: accent,
                }}
              >
                ▶ Mulai
              </motion.div>
            </motion.div>
          )}

          {/* Game over overlay */}
          {phase === "dead" && (
            <motion.div
              key="dead"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                borderRadius: 20,
                background: "rgba(10,14,23,0.72)",
                backdropFilter: "blur(6px)",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#ff4466",
                  textShadow: "0 0 16px rgba(255,68,102,0.5)",
                }}
              >
                Game Over
              </div>
              <div style={{ display: "flex", gap: 24, alignItems: "baseline", marginTop: 4 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 32, fontWeight: 900, color: accent, textShadow: `0 0 18px rgba(${ar},${ag},${ab},0.5)` }}>
                    {score}
                  </div>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>
                    Score
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 32, fontWeight: 900, color: "rgba(255,255,255,0.5)" }}>
                    {best}
                  </div>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>
                    Best
                  </div>
                </div>
              </div>
              {score > 0 && score >= best && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.15, type: "spring", stiffness: 400, damping: 12 }}
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: accent,
                    padding: "4px 12px",
                    borderRadius: 100,
                    background: `rgba(${ar},${ag},${ab},0.12)`,
                    border: `1px solid rgba(${ar},${ag},${ab},0.3)`,
                  }}
                >
                  ✦ New Best!
                </motion.div>
              )}
              <motion.button
                onClick={() => flap()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  marginTop: 8,
                  padding: "12px 36px",
                  borderRadius: 100,
                  background: `rgba(${ar},${ag},${ab},0.15)`,
                  border: `1px solid rgba(${ar},${ag},${ab},0.4)`,
                  color: accent,
                  fontSize: 13,
                  fontWeight: 800,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  boxShadow: `0 0 24px rgba(${ar},${ag},${ab},0.15)`,
                }}
              >
                ↻ Restart
              </motion.button>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
                Space / Klik untuk main lagi
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div
        style={{
          zIndex: 2,
          marginTop: 18,
          display: "flex",
          gap: 8,
          alignItems: "center",
          color: "rgba(255,255,255,0.35)",
          fontSize: 12,
          letterSpacing: "0.05em",
        }}
      >
        <span style={{ opacity: 0.6 }}>⌨ Space</span>
        <span>·</span>
        <span style={{ opacity: 0.6 }}>👆 Click</span>
        <span>·</span>
        <span style={{ opacity: 0.6 }}>📱 Tap</span>
      </div>

      <style jsx global>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
