'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function FloatingParticles() {
  const [particles, setParticles] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const newParticles = Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      startX: Math.random() * 100,
      startY: Math.random() * 100,
      size: Math.random() * 2 + 2,
      duration: Math.random() * 15 + 15,
      delay: Math.random() * 5,
      color: Math.random() > 0.5 ? '#FFFFFF' : '#00FF94',
      opacity: Math.random() * 0.2 + 0.2,
      moveX: Math.random() * 20 - 10,
    }));
    setParticles(newParticles);
  }, []);

  if (!isMounted) return null;

  return (
    <>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${particle.startX}%`,
            top: `${particle.startY}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            opacity: particle.opacity,
            zIndex: 5,
          }}
          animate={{
            y: [-100, 100],
            x: [0, particle.moveX],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'easeInOut',
          }}
        />
      ))}
    </>
  );
}
