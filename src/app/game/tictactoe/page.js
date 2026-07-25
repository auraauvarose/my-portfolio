"use client";
import { useState } from "react";
import Link from "next/link";

export default function TicTacToePage() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [vsAI, setVsAI] = useState(false);

  const winner = calculateWinner(board);
  const isDraw = !winner && board.every(Boolean);
  const status = winner
    ? `Winner: ${winner}`
    : isDraw
      ? "Draw"
      : vsAI && !xIsNext
        ? "AI thinking..."
        : `Next: ${xIsNext ? "X (You)" : vsAI ? "O (AI)" : "O"}`;

  function getAIMove(b) {
    // 1. Menang jika bisa
    for (let i = 0; i < 9; i++) {
      if (!b[i]) {
        const test = b.slice();
        test[i] = "O";
        if (calculateWinner(test) === "O") return i;
      }
    }
    // 2. Blok X menang
    for (let i = 0; i < 9; i++) {
      if (!b[i]) {
        const test = b.slice();
        test[i] = "X";
        if (calculateWinner(test) === "X") return i;
      }
    }
    // 3. Ambil tengah
    if (!b[4]) return 4;
    // 4. Ambil sudut
    const corners = [0, 2, 6, 8];
    for (const c of corners) if (!b[c]) return c;
    // 5. Ambil sisi
    const sides = [1, 3, 5, 7];
    for (const s of sides) if (!b[s]) return s;
    return null;
  }

  function handleClick(i) {
    if (board[i] || winner) return;
    if (vsAI && !xIsNext) return; // AI's turn, block click
    const newBoard = board.slice();
    newBoard[i] = xIsNext ? "X" : "O";
    setBoard(newBoard);
    const nextTurn = !xIsNext;
    setXIsNext(nextTurn);

    // AI turn (O plays after X)
    if (
      vsAI &&
      !nextTurn &&
      !calculateWinner(newBoard) &&
      !newBoard.every(Boolean)
    ) {
      setTimeout(() => {
        const aiMove = getAIMove(newBoard);
        if (aiMove !== null) {
          const aiBoard = newBoard.slice();
          aiBoard[aiMove] = "O";
          setBoard(aiBoard);
          setXIsNext(true);
        }
      }, 600);
    }
  }

  function reset() {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 50% 30%, #1a0f2e 0%, #0a0814 80%, #05020a 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "100px 24px 60px",
        fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
        color: "#f0efe8",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient glow orbs */}
      <div
        style={{
          position: "absolute",
          top: "-10%",
          left: "-10%",
          width: "500px",
          height: "500px",
          background:
            "radial-gradient(circle, rgba(212,235,0,0.15), transparent 70%)",
          borderRadius: "50%",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-10%",
          right: "-10%",
          width: "500px",
          height: "500px",
          background:
            "radial-gradient(circle, rgba(0,220,255,0.12), transparent 70%)",
          borderRadius: "50%",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />

      <Link
        href="/game"
        style={{
          position: "fixed",
          top: 28,
          left: 28,
          color: "#fff",
          textDecoration: "none",
          fontSize: "14px",
          fontWeight: 600,
          letterSpacing: "0.02em",
          background: "rgba(255,255,255,0.06)",
          padding: "10px 20px",
          borderRadius: "100px",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.1)",
          transition: "all 0.3s ease",
          zIndex: 50,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.14)";
          e.currentTarget.style.transform = "translateX(-2px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.06)";
          e.currentTarget.style.transform = "translateX(0)";
        }}
      >
        ← Game Menu
      </Link>

      <div style={{ textAlign: "center", marginBottom: "48px", zIndex: 2 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "14px",
            padding: "8px 20px 8px 8px",
            borderRadius: "100px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(12px)",
            marginBottom: "20px",
          }}
        >
          <span style={{ fontSize: "28px" }}>⭕</span>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#ffd700",
            }}
          >
            Tic Tac Toe
          </span>
        </div>
        <h1
          style={{
            fontSize: "clamp(2.5rem, 6vw, 4rem)",
            fontWeight: 900,
            letterSpacing: "-0.05em",
            margin: 0,
            lineHeight: 1.1,
            background: "linear-gradient(135deg, #ffd700, #ff6b6b)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 0 60px rgba(255,215,0,0.25)",
          }}
        >
          Tic Tac Toe
        </h1>
      </div>

      <div
        style={{
          display: "flex",
          gap: "12px",
          justifyContent: "center",
          marginBottom: "28px",
          zIndex: 2,
        }}
      >
        <button
          onClick={() => {
            setVsAI(!vsAI);
            setBoard(Array(9).fill(null));
            setXIsNext(true);
          }}
          style={{
            padding: "10px 20px",
            borderRadius: "100px",
            border: "1px solid rgba(255,255,255,0.15)",
            background: vsAI
              ? "rgba(255,215,0,0.15)"
              : "rgba(255,255,255,0.05)",
            color: vsAI ? "#ffd700" : "#ccc",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: "13px",
            transition: "all 0.2s ease",
            letterSpacing: "0.03em",
          }}
        >
          {vsAI
            ? "� AI ON — Klik untuk matikan"
            : "🤖 VS AI — Klik untuk nyalakan"}
        </button>
      </div>

      {/* Status */}
      <div
        style={{
          fontSize: "16px",
          fontWeight: 600,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          marginBottom: "36px",
          color: winner
            ? winner === "X"
              ? "#00ff88"
              : "#ff6b6b"
            : isDraw
              ? "#aaa"
              : "#ffd700",
          textShadow: "0 0 20px currentColor",
        }}
      >
        {status}
      </div>

      {/* Board */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 110px)",
          gap: "14px",
          background: "rgba(255,255,255,0.03)",
          padding: "18px",
          borderRadius: "28px",
          border: "1px solid rgba(255,255,255,0.06)",
          backdropFilter: "blur(16px)",
          boxShadow:
            "0 25px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {board.map((cell, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            disabled={!!cell || !!winner}
            style={{
              width: 110,
              height: 110,
              borderRadius: "20px",
              border: "none",
              background: cell
                ? "rgba(255,255,255,0.03)"
                : "rgba(255,255,255,0.02)",
              color: cell === "X" ? "#00ff88" : "#ff6b6b",
              fontSize: "3.2rem",
              fontWeight: 900,
              letterSpacing: "-0.08em",
              cursor: cell ? "default" : "pointer",
              transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
              boxShadow: cell ? "inset 0 0 30px rgba(0,0,0,0.3)" : "none",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              if (!cell && !winner) {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.transform = "translateY(-4px)";
              }
            }}
            onMouseLeave={(e) => {
              if (!cell && !winner) {
                e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                e.currentTarget.style.transform = "translateY(0)";
              }
            }}
          >
            {cell && (
              <span style={{ animation: "fadeInPop 0.35s ease-out" }}>
                {cell}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Reset */}
      <button
        onClick={reset}
        style={{
          marginTop: "36px",
          padding: "14px 36px",
          borderRadius: "100px",
          border: "none",
          background: "linear-gradient(135deg, #ffd700, #e6c200)",
          color: "#0a0814",
          fontSize: "15px",
          fontWeight: 800,
          letterSpacing: "0.06em",
          cursor: "pointer",
          boxShadow:
            "0 8px 30px rgba(255,215,0,0.35), 0 0 0 1px rgba(255,215,0,0.4) inset",
          transition: "all 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-3px) scale(1.04)";
          e.currentTarget.style.boxShadow =
            "0 16px 40px rgba(255,215,0,0.5), 0 0 0 1px rgba(255,215,0,0.6) inset";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0) scale(1)";
          e.currentTarget.style.boxShadow =
            "0 8px 30px rgba(255,215,0,0.35), 0 0 0 1px rgba(255,215,0,0.4) inset";
        }}
      >
        Reset Game
      </button>

      <style jsx global>{`
        @keyframes fadeInPop {
          0% {
            opacity: 0;
            transform: scale(0.5) rotate(-5deg);
          }
          70% {
            opacity: 1;
            transform: scale(1.15) rotate(2deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0);
          }
        }
      `}</style>
    </div>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c])
      return squares[a];
  }
  return null;
}
