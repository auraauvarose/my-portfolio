'use client';

import { useEffect, useRef } from 'react';

const hexToRgb = (hex) => {
  if (!hex) return [129, 140, 248];
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return [r, g, b];
  }
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.slice(0, 2), 16);
    const g = parseInt(cleanHex.slice(2, 4), 16);
    const b = parseInt(cleanHex.slice(4, 6), 16);
    return [r, g, b];
  }
  return [129, 140, 248]; // default to indigo
};

export default function BackgroundCanvas({ bgAnimation = 'none', themeColor = '#818cf8', isDark = true }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const mouseRef = useRef({ x: null, y: null });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseLeave = () => {
      mouseRef.current = { x: null, y: null };
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }

    if (bgAnimation === 'none') {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseleave', handleMouseLeave);
      };
    }

    const [r, g, b] = hexToRgb(themeColor);
    let t = 0;
    let particles = [];

    // ─── INITIALIZE ANIMATIONS ───
    if (bgAnimation === 'particles') {
      particles = Array.from({ length: 65 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2.5 + 1,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        a: Math.random() * 0.5 + 0.1,
      }));
    } else if (bgAnimation === 'bubbles') {
      particles = Array.from({ length: 25 }, () => ({
        x: Math.random() * canvas.width,
        y: canvas.height + Math.random() * 200,
        r: Math.random() * 25 + 8,
        vy: -(Math.random() * 0.4 + 0.15),
        a: Math.random() * 0.12 + 0.04,
      }));
    } else if (bgAnimation === 'stars') {
      particles = Array.from({ length: 120 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.3,
        speed: Math.random() * 0.015 + 0.005,
        phase: Math.random() * Math.PI * 2,
      }));
    } else if (bgAnimation === 'matrix') {
      const cols = Math.floor(canvas.width / 18) + 2;
      particles = Array(cols).fill(1);
    } else if (bgAnimation === 'rain') {
      particles = Array.from({ length: 100 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: Math.random() * 6 + 10,
        length: Math.random() * 20 + 12,
        w: Math.random() * 0.8 + 0.5,
      }));
    } else if (bgAnimation === 'fireflies') {
      particles = Array.from({ length: 35 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        r: Math.random() * 2.5 + 1.2,
        speed: Math.random() * 0.02 + 0.01,
        phase: Math.random() * Math.PI * 2,
      }));
    } else if (bgAnimation === 'snow') {
      particles = Array.from({ length: 55 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 3 + 1,
        vy: Math.random() * 0.5 + 0.25,
        sway: Math.random() * Math.PI * 2,
        swaySpeed: Math.random() * 0.015 + 0.005,
        a: Math.random() * 0.4 + 0.15,
      }));
    } else if (bgAnimation === 'constellation') {
      particles = Array.from({ length: 60 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2.5 + 1,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        a: Math.random() * 0.5 + 0.2,
      }));
    } else if (bgAnimation === 'nebula') {
      particles = Array.from({ length: 15 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 120 + 80,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        a: Math.random() * 0.04 + 0.02,
      }));
    } else if (bgAnimation === 'vortex') {
      particles = Array.from({ length: 150 }, () => {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * Math.max(canvas.width, canvas.height) * 0.5 + 20;
        return {
          angle,
          dist,
          r: Math.random() * 1.5 + 0.5,
          speed: (Math.random() * 0.002 + 0.0005) * (Math.random() > 0.5 ? 1 : -1),
          a: Math.random() * 0.6 + 0.2,
        };
      });
    } else if (bgAnimation === 'meteor') {
      particles = Array.from({ length: 8 }, () => ({
        x: Math.random() * canvas.width * 1.5 - canvas.width * 0.5,
        y: -100 - Math.random() * 200,
        r: Math.random() * 1.5 + 1,
        speed: Math.random() * 4 + 6,
        len: Math.random() * 80 + 60,
        angle: Math.PI / 4, // 45 degrees
      }));
    } else if (bgAnimation === 'dna') {
      // DNA helix spiral particles
      particles = Array.from({ length: 80 }, (_, i) => ({
        index: i,
        r: Math.random() * 1.5 + 1,
        a: Math.random() * 0.4 + 0.3,
      }));
    } else if (bgAnimation === 'tunnel') {
      particles = Array.from({ length: 8 }, (_, i) => ({
        index: i,
        scale: i / 8,
        angle: Math.random() * Math.PI * 2,
      }));
    } else if (bgAnimation === 'confetti') {
      const colors = [
        `rgba(${r},${g},${b},`,
        'rgba(244,63,94,',  // Rose
        'rgba(34,211,238,', // Cyan
        'rgba(250,204,21,', // Yellow
        'rgba(168,85,247,', // Violet
      ];
      particles = Array.from({ length: 60 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * (canvas.height * -0.5) - 20,
        r: Math.random() * 5 + 3,
        vx: (Math.random() - 0.5) * 1.5,
        vy: Math.random() * 1.5 + 1,
        colorPrefix: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.05,
      }));
    } else if (bgAnimation === 'wave_mesh') {
      // Grid dimensions
      const rows = 12;
      const cols = 16;
      particles = [];
      for (let rIdx = 0; rIdx < rows; rIdx++) {
        const rowArr = [];
        for (let cIdx = 0; cIdx < cols; cIdx++) {
          rowArr.push({
            origX: (cIdx / (cols - 1)) * canvas.width,
            origY: (rIdx / (rows - 1)) * canvas.height,
            x: (cIdx / (cols - 1)) * canvas.width,
            y: (rIdx / (rows - 1)) * canvas.height,
            phase: Math.random() * Math.PI * 2,
          });
        }
        particles.push(rowArr);
      }
    } else if (bgAnimation === 'chaos') {
      particles = Array.from({ length: 6 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        history: [],
      }));
    }

    // ─── DRAW / RENDER LOOP ───
    const draw = () => {
      // Default clean frame unless matrix/chaos which needs trails
      if (bgAnimation !== 'matrix' && bgAnimation !== 'chaos') {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      t += 0.016;

      // ─── 1. PARTICLES ───
      if (bgAnimation === 'particles') {
        particles.forEach(p => {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0) p.x = canvas.width;
          if (p.x > canvas.width) p.x = 0;
          if (p.y < 0) p.y = canvas.height;
          if (p.y > canvas.height) p.y = 0;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},${b},${p.a})`;
          ctx.fill();
        });

        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = `rgba(${r},${g},${b},${0.06 * (1 - dist / 120)})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
      }

      // ─── 2. BUBBLES ───
      else if (bgAnimation === 'bubbles') {
        particles.forEach(p => {
          p.y += p.vy;
          if (p.y + p.r < 0) {
            p.y = canvas.height + p.r;
            p.x = Math.random() * canvas.width;
          }
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${r},${g},${b},${p.a})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();

          const grd = ctx.createRadialGradient(p.x - p.r * 0.3, p.y - p.r * 0.3, 0, p.x, p.y, p.r);
          grd.addColorStop(0, `rgba(${r},${g},${b},${p.a * 0.4})`);
          grd.addColorStop(1, 'transparent');
          ctx.fillStyle = grd;
          ctx.fill();
        });
      }

      // ─── 3. STARS ───
      else if (bgAnimation === 'stars') {
        particles.forEach(p => {
          const alpha = (Math.sin(t * p.speed * 20 + p.phase) + 1) / 2 * 0.7 + 0.15;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
          ctx.fill();
        });
      }

      // ─── 4. MATRIX ───
      else if (bgAnimation === 'matrix') {
        ctx.fillStyle = isDark ? 'rgba(9,9,12,0.06)' : 'rgba(255,255,255,0.06)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = `rgba(${r},${g},${b},0.45)`;
        ctx.font = '13px monospace';

        const chars = '01アイウエオカキクケコサシスセソタチツテト#$@%&'.split('');
        particles.forEach((y, i) => {
          const char = chars[Math.floor(Math.random() * chars.length)];
          ctx.fillText(char, i * 18, y * 18);
          if (y * 18 > canvas.height && Math.random() > 0.98) {
            particles[i] = 0;
          }
          particles[i]++;
        });
      }

      // ─── 5. WAVES ───
      else if (bgAnimation === 'waves') {
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.moveTo(0, canvas.height * 0.5);
          for (let x = 0; x < canvas.width; x += 8) {
            const y = Math.sin(x * 0.008 + t * 0.8 + i * 0.6) * 45 + canvas.height * 0.5 + i * 25;
            ctx.lineTo(x, y);
          }
          ctx.strokeStyle = `rgba(${r},${g},${b},${0.08 - i * 0.015})`;
          ctx.lineWidth = 1.8;
          ctx.stroke();
        }
      }

      // ─── 6. AURORA ───
      else if (bgAnimation === 'aurora') {
        // Slow glowing gradient aurora bands
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, `rgba(${r},${g},${b},0)`);
        gradient.addColorStop(0.5, `rgba(${r},${g},${b},${0.08 + Math.sin(t * 0.4) * 0.03})`);
        gradient.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(0, canvas.height);
          for (let x = 0; x <= canvas.width; x += 15) {
            const y = canvas.height - 120 - Math.sin(x * 0.002 + t * 0.3 + i * 1.5) * 60 - i * 40;
            ctx.lineTo(x, y);
          }
          ctx.lineTo(canvas.width, canvas.height);
          ctx.closePath();

          const grad = ctx.createLinearGradient(0, canvas.height - 180, 0, canvas.height);
          grad.addColorStop(0, `rgba(${r},${g},${b},0)`);
          grad.addColorStop(0.5, `rgba(${r},${g},${b},${0.1 - i * 0.03})`);
          grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
          ctx.fillStyle = grad;
          ctx.fill();
        }
      }

      // ─── 7. GRID ───
      else if (bgAnimation === 'grid') {
        const offset = (t * 22) % 60;
        ctx.strokeStyle = `rgba(${r},${g},${b},0.07)`;
        ctx.lineWidth = 1;

        // Vertical lines
        for (let x = offset; x < canvas.width; x += 60) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
        // Horizontal lines
        for (let y = offset; y < canvas.height; y += 60) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
      }

      // ─── 8. RAIN ───
      else if (bgAnimation === 'rain') {
        ctx.strokeStyle = `rgba(${r},${g},${b},0.25)`;
        particles.forEach(drop => {
          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x, drop.y + drop.length);
          ctx.lineWidth = drop.w;
          ctx.stroke();
          drop.y += drop.speed;
          if (drop.y > canvas.height) {
            drop.y = -drop.length;
            drop.x = Math.random() * canvas.width;
          }
        });
      }

      // ─── 9. FIREFLIES ───
      else if (bgAnimation === 'fireflies') {
        particles.forEach(f => {
          f.x += f.vx;
          f.y += f.vy;

          if (f.x < 0) f.x = canvas.width;
          if (f.x > canvas.width) f.x = 0;
          if (f.y < 0) f.y = canvas.height;
          if (f.y > canvas.height) f.y = 0;

          const alpha = (Math.sin(t * f.speed * 8 + f.phase) + 1) / 2 * 0.55 + 0.15;

          // Outer halo glow
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.r * 3.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},${b},${alpha * 0.14})`;
          ctx.fill();

          // Inner bright core
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
          ctx.fill();
        });
      }

      // ─── 10. SNOW ───
      else if (bgAnimation === 'snow') {
        ctx.fillStyle = isDark ? `rgba(255,255,255,` : `rgba(${r},${g},${b},`;
        particles.forEach(s => {
          s.y += s.vy;
          s.sway += s.swaySpeed;
          const currentX = s.x + Math.sin(s.sway) * 12;

          if (s.y > canvas.height) {
            s.y = -10;
            s.x = Math.random() * canvas.width;
          }

          ctx.beginPath();
          ctx.arc(currentX, s.y, s.r, 0, Math.PI * 2);
          ctx.fillStyle = isDark ? `rgba(255,255,255,${s.a})` : `rgba(${r},${g},${b},${s.a * 0.6})`;
          ctx.fill();
        });
      }

      // ─── 11. CONSTELLATION ───
      else if (bgAnimation === 'constellation') {
        const mouse = mouseRef.current;
        particles.forEach(p => {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
          if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

          // Cursor magnetism
          if (mouse.x !== null && mouse.y !== null) {
            const dx = mouse.x - p.x;
            const dy = mouse.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 160) {
              p.x += dx * 0.006;
              p.y += dy * 0.006;
            }
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},${b},${p.a})`;
          ctx.fill();
        });

        // Lines between close nodes & nodes to mouse
        for (let i = 0; i < particles.length; i++) {
          // Connection to mouse
          if (mouse.x !== null && mouse.y !== null) {
            const mDx = particles[i].x - mouse.x;
            const mDy = particles[i].y - mouse.y;
            const mDist = Math.sqrt(mDx * mDx + mDy * mDy);
            if (mDist < 160) {
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(mouse.x, mouse.y);
              ctx.strokeStyle = `rgba(${r},${g},${b},${0.12 * (1 - mDist / 160)})`;
              ctx.lineWidth = 0.7;
              ctx.stroke();
            }
          }

          // Connections between particles
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 100) {
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = `rgba(${r},${g},${b},${0.08 * (1 - dist / 100)})`;
              ctx.lineWidth = 0.4;
              ctx.stroke();
            }
          }
        }
      }

      // ─── 12. NEBULA ───
      else if (bgAnimation === 'nebula') {
        particles.forEach(p => {
          p.x += p.vx; p.y += p.vy;
          if (p.x - p.r < 0 || p.x + p.r > canvas.width) p.vx *= -1;
          if (p.y - p.r < 0 || p.y + p.r > canvas.height) p.vy *= -1;

          const gld = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
          gld.addColorStop(0, `rgba(${r},${g},${b},${p.a})`);
          gld.addColorStop(0.5, `rgba(${r},${g},${b},${p.a * 0.3})`);
          gld.addColorStop(1, 'transparent');

          ctx.fillStyle = gld;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // ─── 13. VORTEX ───
      else if (bgAnimation === 'vortex') {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        particles.forEach(p => {
          p.angle += p.speed;
          // Slowly pulsate radial distance
          const d = p.dist + Math.sin(t + p.dist) * 12;
          const x = cx + Math.cos(p.angle) * d;
          const y = cy + Math.sin(p.angle) * d;

          ctx.beginPath();
          ctx.arc(x, y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},${b},${p.a})`;
          ctx.fill();
        });
      }

      // ─── 14. METEOR ───
      else if (bgAnimation === 'meteor') {
        particles.forEach(p => {
          p.x += p.speed * Math.cos(p.angle);
          p.y += p.speed * Math.sin(p.angle);

          // Draw shooting star line trail
          const startX = p.x - p.len * Math.cos(p.angle);
          const startY = p.y - p.len * Math.sin(p.angle);

          const trail = ctx.createLinearGradient(startX, startY, p.x, p.y);
          trail.addColorStop(0, 'transparent');
          trail.addColorStop(1, `rgba(${r},${g},${b},0.6)`);

          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = trail;
          ctx.lineWidth = p.r * 1.5;
          ctx.stroke();

          // Reset meteor when it hits bottom or sides
          if (p.y > canvas.height + 150 || p.x > canvas.width + 150) {
            p.x = Math.random() * canvas.width * 0.8 - canvas.width * 0.3;
            p.y = -100 - Math.random() * 200;
            p.speed = Math.random() * 4 + 6;
          }
        });
      }

      // ─── 15. DNA (HELIX) ───
      else if (bgAnimation === 'dna') {
        const cx = canvas.width / 2;
        const helixWidth = Math.min(220, canvas.width * 0.25);
        particles.forEach(p => {
          // DNA rotating math
          const y = (p.index / particles.length) * (canvas.height - 100) + 50;
          const rotPhase = t * 1.2 + p.index * 0.18;

          // Strand 1
          const x1 = cx + Math.sin(rotPhase) * helixWidth;
          const cosVal = Math.cos(rotPhase);
          const sizeScale1 = (cosVal + 1.2) * 1.3;

          // Strand 2
          const x2 = cx - Math.sin(rotPhase) * helixWidth;
          const sizeScale2 = (-cosVal + 1.2) * 1.3;

          // Draw connector bar (rungs)
          ctx.beginPath();
          ctx.moveTo(x1, y);
          ctx.lineTo(x2, y);
          ctx.strokeStyle = `rgba(${r},${g},${b},${0.03 * (cosVal + 1.5)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();

          // Draw node 1
          ctx.beginPath();
          ctx.arc(x1, y, p.r * sizeScale1, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},${b},${p.a * (cosVal * 0.3 + 0.7)})`;
          ctx.fill();

          // Draw node 2
          ctx.beginPath();
          ctx.arc(x2, y, p.r * sizeScale2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},${b},${p.a * (-cosVal * 0.3 + 0.7)})`;
          ctx.fill();
        });
      }

      // ─── 16. TUNNEL ───
      else if (bgAnimation === 'tunnel') {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const maxRadius = Math.max(canvas.width, canvas.height);

        particles.forEach(p => {
          p.scale += 0.0035;
          if (p.scale > 1) {
            p.scale = 0;
            p.angle = Math.random() * Math.PI * 2;
          }

          const currentRadius = p.scale * maxRadius;
          ctx.beginPath();
          // Draw geometric circles or polygons
          ctx.arc(cx, cy, currentRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${r},${g},${b},${0.08 * (1 - p.scale) * p.scale})`;
          ctx.lineWidth = 0.8 + p.scale * 2.5;
          ctx.stroke();
        });
      }

      // ─── 17. CONFETTI ───
      else if (bgAnimation === 'confetti') {
        particles.forEach(p => {
          p.y += p.vy;
          p.x += p.vx + Math.sin(t * 1.5 + p.rotation) * 0.3;
          p.rotation += p.rotationSpeed;

          // Wrap around or fall off screen
          if (p.y > canvas.height) {
            p.y = -20;
            p.x = Math.random() * canvas.width;
          }

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.beginPath();
          // Draw little confetti rectangles
          ctx.rect(-p.r, -p.r * 0.6, p.r * 2, p.r * 1.2);
          ctx.fillStyle = `${p.colorPrefix}0.45)`;
          ctx.fill();
          ctx.restore();
        });
      }

      // ─── 18. WAVE MESH (3D wireframe effect) ───
      else if (bgAnimation === 'wave_mesh') {
        const mouse = mouseRef.current;
        const grid = particles;
        const rows = grid.length;
        const cols = grid[0].length;

        // Step 1: Update points with wave math + mouse push
        for (let rIdx = 0; rIdx < rows; rIdx++) {
          for (let cIdx = 0; cIdx < cols; cIdx++) {
            const pt = grid[rIdx][cIdx];
            let offsetZ = Math.sin(pt.phase + t * 1.2) * 15;

            if (mouse.x !== null && mouse.y !== null) {
              const dx = pt.origX - mouse.x;
              const dy = pt.origY - mouse.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 220) {
                // Interactive ripple
                const force = (1 - dist / 220) * 35;
                offsetZ -= force;
              }
            }

            pt.x = pt.origX;
            pt.y = pt.origY + offsetZ;
          }
        }

        // Step 2: Draw wireframe lines
        ctx.strokeStyle = `rgba(${r},${g},${b},0.045)`;
        ctx.lineWidth = 0.6;
        for (let rIdx = 0; rIdx < rows; rIdx++) {
          for (let cIdx = 0; cIdx < cols; cIdx++) {
            // Line to right neighbor
            if (cIdx < cols - 1) {
              ctx.beginPath();
              ctx.moveTo(grid[rIdx][cIdx].x, grid[rIdx][cIdx].y);
              ctx.lineTo(grid[rIdx][cIdx + 1].x, grid[rIdx][cIdx + 1].y);
              ctx.stroke();
            }
            // Line to bottom neighbor
            if (rIdx < rows - 1) {
              ctx.beginPath();
              ctx.moveTo(grid[rIdx][cIdx].x, grid[rIdx][cIdx].y);
              ctx.lineTo(grid[rIdx + 1][cIdx].x, grid[rIdx + 1][cIdx].y);
              ctx.stroke();
            }
          }
        }
      }

      // ─── 19. CHAOS (LIGHT WALKER TRAILS) ───
      else if (bgAnimation === 'chaos') {
        ctx.fillStyle = isDark ? 'rgba(9,9,12,0.015)' : 'rgba(255,255,255,0.015)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = `rgba(${r},${g},${b},0.16)`;
        ctx.lineWidth = 0.8;

        particles.forEach(walker => {
          const prevX = walker.x;
          const prevY = walker.y;

          // Random walk physics
          walker.vx += (Math.random() - 0.5) * 0.8;
          walker.vy += (Math.random() - 0.5) * 0.8;

          // Clamp speed
          const speed = Math.sqrt(walker.vx * walker.vx + walker.vy * walker.vy);
          if (speed > 2.2) {
            walker.vx = (walker.vx / speed) * 2.2;
            walker.vy = (walker.vy / speed) * 2.2;
          }

          walker.x += walker.vx;
          walker.y += walker.vy;

          // Boundary bounce
          if (walker.x < 0 || walker.x > canvas.width) walker.vx *= -1.2;
          if (walker.y < 0 || walker.y > canvas.height) walker.vy *= -1.2;

          walker.x = Math.max(0, Math.min(canvas.width, walker.x));
          walker.y = Math.max(0, Math.min(canvas.height, walker.y));

          // Draw segment line
          ctx.beginPath();
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(walker.x, walker.y);
          ctx.stroke();
        });
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [bgAnimation, themeColor, isDark]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1,
        opacity: isDark ? 0.6 : 0.35,
        display: bgAnimation === 'none' ? 'none' : 'block',
      }}
    />
  );
}
