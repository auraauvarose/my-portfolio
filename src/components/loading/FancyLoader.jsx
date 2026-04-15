'use client';

import { motion } from 'framer-motion';

export function FancyLoader({ size = 60, color = '#d4eb00' }) {
  return (
    <div className="flex items-center justify-center" style={{ minHeight: '200px' }}>
      <motion.div
        className="relative"
        style={{ width: size, height: size }}
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: size * 0.15,
              height: size * 0.15,
              backgroundColor: color,
              top: '50%',
              left: '50%',
              marginLeft: -(size * 0.075),
              marginTop: -(size * 0.075),
            }}
            animate={{
              x: Math.cos((i * Math.PI) / 2) * (size * 0.35),
              y: Math.sin((i * Math.PI) / 2) * (size * 0.35),
              scale: [1, 1.3, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut',
            }}
          />
        ))}
        <motion.div
          className="absolute rounded-full border-2"
          style={{
            width: size * 0.8,
            height: size * 0.8,
            borderColor: color,
            top: '10%',
            left: '10%',
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3],
            rotate: -360,
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </motion.div>
    </div>
  );
}

export function PulseLoader({ text = 'Loading...', color = '#d4eb00' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4" style={{ minHeight: '200px' }}>
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
      <motion.span
        className="text-sm font-medium opacity-70"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {text}
      </motion.span>
    </div>
  );
}

export function CircularLoader({ size = 50, strokeWidth = 4, color = '#d4eb00' }) {
  return (
    <div className="flex items-center justify-center" style={{ minHeight: '150px' }}>
      <motion.svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      >
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={(size - strokeWidth) / 2}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${size * 2} ${size * 2}`}
          animate={{
            strokeDashoffset: [size * 2, 0, -size * 2],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.svg>
    </div>
  );
}

export function WaveLoader({ count = 5, color = '#d4eb00', height = 40 }) {
  return (
    <div className="flex items-center justify-center gap-1" style={{ minHeight: '100px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full"
          style={{ backgroundColor: color, height: height * 0.3 }}
          animate={{
            height: [height * 0.3, height, height * 0.3],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.1,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

export function TypingLoader({ text = 'Thinking', color = '#d4eb00' }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 dark:bg-white/5">
      <span className="text-sm font-medium opacity-70">{text}</span>
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: color }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function CardLoader() {
  return (
    <div className="flex items-center justify-center p-8">
      <motion.div
        className="w-full max-w-sm h-48 rounded-xl bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 bg-[length:200%_100%]"
        animate={{
          backgroundPosition: ['200% 0', '-200% 0'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
}