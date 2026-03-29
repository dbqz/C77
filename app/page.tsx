'use client';

import { motion, useMotionValue, useSpring, AnimatePresence } from 'motion/react';
import { PlaySquare, Music, Mail, MessageCircle, CloudRain, Snowflake, Leaf, Volume2, VolumeX, Sparkles, Menu, X } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

type Theme = 'rain' | 'snow' | 'autumn' | 'fireworks';

const themeMusic = {
  rain: 'https://music.163.com/song/media/outer/url?id=436667409.mp3',
  snow: 'https://music.163.com/song/media/outer/url?id=2139196813.mp3',
  autumn: 'https://music.163.com/song/media/outer/url?id=28912659.mp3',
  fireworks: 'https://music.163.com/song/media/outer/url?id=3353184295.mp3'
};

function CanvasWeather({ theme }: { theme: Theme }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const themeRef = useRef(theme);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', resize);
    resize();

    const raindrops: any[] = [];
    const snowflakes: any[] = [];
    const giantSnowflakes: any[] = [];
    const leaves: any[] = [];
    const giantLeaves: any[] = [];
    const lightnings: any[] = [];
    const fireworksList: any[] = [];
    const fireworkParticles: any[] = [];

    const numDrops = window.innerWidth < 768 ? 100 : 400;
    const numSnowflakes = window.innerWidth < 768 ? 50 : 200;
    const numLeaves = window.innerWidth < 768 ? 20 : 60;

    let currentWind = 1.5;
    let targetWind = 1.5;
    let windChangeTimer = 0;
    let loveSalvoTimer = 0;
    let salvoSequenceIndex = 0;
    const salvoSequences = [['L', 'O', 'V', 'E'], ['我', '爱', '你']];

    function createLightning() {
      const startX = Math.random() * width;
      let x = startX;
      let y = 0;
      const segments = [{ x, y }];
      const branches: any[] = [];

      while (y < height) {
        x += (Math.random() - 0.5) * 60;
        y += Math.random() * 40 + 20;
        segments.push({ x, y });

        if (Math.random() < 0.15) {
          let bx = x;
          let by = y;
          const branchSegments = [{ x: bx, y: by }];
          const branchLength = Math.random() * 150 + 50;
          let currentLength = 0;
          while (currentLength < branchLength) {
            bx += (Math.random() - 0.5) * 50;
            by += Math.random() * 30 + 10;
            branchSegments.push({ x: bx, y: by });
            currentLength += 30;
          }
          branches.push(branchSegments);
        }
      }

      return {
        segments,
        branches,
        life: 0,
        maxLife: Math.floor(Math.random() * 15) + 10,
        alpha: 1,
      };
    }

    function createRaindrop(yStart = -50) {
      return {
        x: Math.random() * (width + 800) - 400,
        y: yStart,
        l: Math.random() * 30 + 20,
        xs: Math.random() * 1,
        ys: Math.random() * 15 + 20
      };
    }

    function createSnowflake(yStart = -50) {
      return {
        x: Math.random() * (width + 800) - 400,
        y: yStart,
        r: Math.random() * 2 + 1,
        xs: (Math.random() - 0.5) * 1,
        ys: Math.random() * 2 + 1,
        phase: Math.random() * Math.PI * 2
      };
    }

    function createLeaf(yStart = -50) {
      const colors = ['#d97736', '#a64d14', '#e8b044', '#7a2e00'];
      return {
        x: Math.random() * (width + 800) - 400,
        y: yStart,
        size: Math.random() * 8 + 6,
        xs: (Math.random() - 0.5) * 2,
        ys: Math.random() * 2 + 2,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.1,
        color: colors[Math.floor(Math.random() * colors.length)]
      };
    }

    function createFirework() {
      const startX = Math.random() * (width * 0.8) + width * 0.1;
      const startY = height;
      const targetX = startX + (Math.random() - 0.5) * 300;
      const targetY = Math.random() * (height * 0.4) + height * 0.1;

      const angle = Math.atan2(targetY - startY, targetX - startX);
      const speed = Math.random() * 2 + 4;

      const coords = [];
      for (let i = 0; i < 3; i++) coords.push({ x: startX, y: startY });

      return {
        startX,
        startY,
        x: startX,
        y: startY,
        tx: targetX,
        ty: targetY,
        distanceToTarget: Math.hypot(targetX - startX, targetY - startY),
        distanceTraveled: 0,
        coordinates: coords,
        angle,
        speed,
        acceleration: 1.02,
        brightness: Math.random() * 20 + 50,
        hue: Math.random() * 360,
      };
    }

    function createFireworkParticles(x: number, y: number, baseHue: number) {
      const particleCount = Math.random() * 80 + 120;
      const particles: any[] = [];
      const isMultiColor = Math.random() < 0.2;
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 12 + 2;
        const coords = [];
        for (let j = 0; j < 5; j++) coords.push({ x, y });

        particles.push({
          x,
          y,
          coordinates: coords,
          angle,
          speed,
          friction: 0.95,
          gravity: 0.15,
          hue: isMultiColor ? Math.random() * 360 : baseHue + (Math.random() * 40 - 20),
          brightness: Math.random() * 30 + 50,
          alpha: 1,
          decay: Math.random() * 0.015 + 0.01,
        });
      }
      return particles;
    }

    function launchTextFireworks(letters: string[]) {
      const spacing = width / (letters.length + 1);
      const startY = height;
      const targetY = height * 0.25;
      const hues = [340, 350, 0, 10, 330, 320]; // Pink/Red/Purple hues

      letters.forEach((letter, index) => {
        const targetX = spacing * (index + 1);
        const startX = targetX + (Math.random() - 0.5) * 50;

        const angle = Math.atan2(targetY - startY, targetX - startX);
        const speed = Math.random() * 1 + 6;

        const coords = [];
        for (let i = 0; i < 3; i++) coords.push({ x: startX, y: startY });

        fireworksList.push({
          startX, startY,
          x: startX, y: startY,
          tx: targetX, ty: targetY,
          distanceToTarget: Math.hypot(targetX - startX, targetY - startY),
          distanceTraveled: 0,
          coordinates: coords,
          angle,
          speed,
          acceleration: 1.01,
          brightness: 80,
          hue: hues[index % hues.length],
          letter: letter
        });
      });
    }

    function createLetterParticles(x: number, y: number, baseHue: number, letter: string) {
      const particles: any[] = [];
      const isChinese = letter.charCodeAt(0) > 255;
      // Increase scale significantly for Chinese characters to make them larger
      const scale = (window.innerWidth < 768 ? 3 : 4.5) * (isChinese ? 1.8 : 1);

      // Use an offscreen canvas to render the text and extract pixel data
      // Increased canvas size for better resolution of complex Chinese characters
      const tc = document.createElement('canvas');
      tc.width = 100;
      tc.height = 100;
      const tctx = tc.getContext('2d', { willReadFrequently: true });
      if (!tctx) return particles;

      tctx.font = 'bold 75px sans-serif';
      tctx.textAlign = 'center';
      tctx.textBaseline = 'middle';
      tctx.fillStyle = 'white';
      tctx.fillText(letter, 50, 50);

      const data = tctx.getImageData(0, 0, 100, 100).data;
      
      // Slightly higher particle density for Chinese characters to keep strokes clear when scaled up
      const particleProb = isChinese ? 0.8 : 0.6;

      for (let py = 0; py < 100; py += 2) {
        for (let px = 0; px < 100; px += 2) {
          const alpha = data[(py * 100 + px) * 4 + 3];
          // Only create a particle if the pixel is opaque enough, with some randomness
          if (alpha > 128 && Math.random() < particleProb) {
            let vx = (px - 50) * 0.05;
            let vy = (py - 50) * 0.05;

            // Add slight randomness to make it look like a real firework
            vx += (Math.random() - 0.5) * 0.1;
            vy += (Math.random() - 0.5) * 0.1;

            vx *= scale;
            vy *= scale;

            const angle = Math.atan2(vy, vx);
            const speed = Math.hypot(vx, vy);

            const coords = [];
            for (let j = 0; j < 5; j++) coords.push({ x, y });

            particles.push({
              x, y,
              coordinates: coords,
              angle,
              speed,
              friction: 0.92, // Higher friction so the letter holds its shape
              gravity: 0.02,  // Low gravity so it floats
              hue: baseHue + (Math.random() * 20 - 10),
              brightness: Math.random() * 20 + 80,
              alpha: 1,
              decay: Math.random() * 0.015 + 0.005,
            });
          }
        }
      }
      return particles;
    }

    function createGiantSnowflake() {
      const fromRight = Math.random() > 0.5;
      return {
        x: fromRight ? width + 150 : -150,
        y: Math.random() * (height * 0.3) - 100,
        size: Math.random() * 40 + 60, // 60 to 100 radius
        xs: fromRight ? -(Math.random() * 5 + 4) : (Math.random() * 5 + 4), // Faster horizontal
        ys: Math.random() * 4 + 3, // Faster vertical fall
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.05,
        opacity: 0.6
      };
    }

    function createGiantLeaf() {
      const colors = ['#d97736', '#a64d14', '#e8b044', '#7a2e00'];
      const fromRight = Math.random() > 0.5;
      return {
        x: fromRight ? width + 150 : -150,
        y: Math.random() * (height * 0.3) - 100,
        size: Math.random() * 40 + 60, // 60 to 100 radius
        xs: fromRight ? -(Math.random() * 5 + 4) : (Math.random() * 5 + 4), // Faster horizontal
        ys: Math.random() * 4 + 3, // Faster vertical fall
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.05,
        opacity: 0.7,
        color: colors[Math.floor(Math.random() * colors.length)]
      };
    }

    // Pre-fill particles for the initial theme
    for (let i = 0; i < numDrops; i++) raindrops.push(createRaindrop(Math.random() * height));

    let prevTheme = themeRef.current;
    let lastGiantSpawnTime = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Update wind
      windChangeTimer++;
      if (windChangeTimer > 120) {
        if (Math.random() < 0.3) {
          targetWind = (Math.random() - 0.3) * 10;
        }
        windChangeTimer = 0;
      }
      currentWind += (targetWind - currentWind) * 0.01;

      const time = Date.now();
      const currentTheme = themeRef.current;

      // Reset timer on theme switch to trigger immediately
      if (currentTheme !== prevTheme) {
        lastGiantSpawnTime = 0;
      }
      prevTheme = currentTheme;

      // Trigger giant particles every 10 seconds
      if (time - lastGiantSpawnTime > 10000) {
        if (currentTheme === 'snow') {
          giantSnowflakes.push(createGiantSnowflake());
          if (Math.random() > 0.5) {
            setTimeout(() => giantSnowflakes.push(createGiantSnowflake()), 1500);
          }
        } else if (currentTheme === 'autumn') {
          giantLeaves.push(createGiantLeaf());
          if (Math.random() > 0.5) {
            setTimeout(() => giantLeaves.push(createGiantLeaf()), 1500);
          }
        }
        lastGiantSpawnTime = time;
      }

      // Calculate max lightning alpha for cloud illumination (kept for potential future use or general ambient flash)
      let maxLightningAlpha = 0;
      for (let i = 0; i < lightnings.length; i++) {
        const l = lightnings[i];
        const alpha = 1 - (l.life / l.maxLife);
        if (alpha > maxLightningAlpha) maxLightningAlpha = Math.max(0, alpha);
      }

      // Spawn lightning only in rain
      if (currentTheme === 'rain' && Math.random() < 0.003) {
        lightnings.push(createLightning());
        if (Math.random() < 0.5) {
          setTimeout(() => lightnings.push(createLightning()), Math.random() * 100 + 50);
        }
      }

      // Draw lightnings
      for (let i = lightnings.length - 1; i >= 0; i--) {
        const l = lightnings[i];
        
        ctx.beginPath();
        ctx.moveTo(l.segments[0].x, l.segments[0].y);
        for (let j = 1; j < l.segments.length; j++) {
          ctx.lineTo(l.segments[j].x, l.segments[j].y);
        }
        
        for (let b = 0; b < l.branches.length; b++) {
          ctx.moveTo(l.branches[b][0].x, l.branches[b][0].y);
          for (let j = 1; j < l.branches[b].length; j++) {
            ctx.lineTo(l.branches[b][j].x, l.branches[b][j].y);
          }
        }

        ctx.lineJoin = 'miter';
        ctx.shadowBlur = 30;
        ctx.shadowColor = 'rgba(200, 230, 255, 1)';
        ctx.strokeStyle = `rgba(255, 255, 255, ${l.alpha})`;
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        l.life++;
        l.alpha = 1 - (l.life / l.maxLife);
        if (l.life >= l.maxLife) lightnings.splice(i, 1);
      }

      // Screen flash
      if (maxLightningAlpha > 0) {
        ctx.fillStyle = `rgba(200, 230, 255, ${maxLightningAlpha * 0.15})`;
        ctx.fillRect(0, 0, width, height);
      }

      // --- RAIN ---
      if (currentTheme === 'rain' && raindrops.length < numDrops) {
        raindrops.push(createRaindrop());
      }
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      for (let i = raindrops.length - 1; i >= 0; i--) {
        const p = raindrops[i];
        const totalXs = p.xs + currentWind;
        
        ctx.moveTo(p.x, p.y);
        const dropLengthX = (totalXs / p.ys) * p.l;
        ctx.lineTo(p.x + dropLengthX, p.y + p.l);

        p.x += totalXs;
        p.y += p.ys;

        if (p.y > height || p.x > width + 400 || p.x < -400) {
          if (currentTheme === 'rain') {
            Object.assign(p, createRaindrop());
          } else {
            raindrops.splice(i, 1);
          }
        }
      }
      ctx.stroke();

      // --- SNOW ---
      if (currentTheme === 'snow' && snowflakes.length < numSnowflakes) {
        snowflakes.push(createSnowflake());
      }
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      for (let i = snowflakes.length - 1; i >= 0; i--) {
        const p = snowflakes[i];
        p.phase += 0.02;
        const wobble = Math.sin(p.phase) * 0.5;
        const totalXs = p.xs + currentWind * 0.5 + wobble;
        
        ctx.moveTo(p.x, p.y);
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);

        p.x += totalXs;
        p.y += p.ys;

        if (p.y > height || p.x > width + 400 || p.x < -400) {
          if (currentTheme === 'snow') {
            Object.assign(p, createSnowflake());
          } else {
            snowflakes.splice(i, 1);
          }
        }
      }
      ctx.fill();

      // --- GIANT SNOWFLAKES ---
      for (let i = giantSnowflakes.length - 1; i >= 0; i--) {
        const p = giantSnowflakes[i];
        p.x += p.xs;
        p.y += p.ys;
        p.angle += p.spin;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.strokeStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.lineWidth = p.size / 10;
        ctx.lineCap = 'round';

        for (let j = 0; j < 6; j++) {
          ctx.rotate(Math.PI / 3);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, -p.size);
          
          // Snowflake branches
          ctx.moveTo(0, -p.size * 0.4);
          ctx.lineTo(p.size * 0.3, -p.size * 0.7);
          ctx.moveTo(0, -p.size * 0.4);
          ctx.lineTo(-p.size * 0.3, -p.size * 0.7);

          ctx.moveTo(0, -p.size * 0.7);
          ctx.lineTo(p.size * 0.2, -p.size * 0.9);
          ctx.moveTo(0, -p.size * 0.7);
          ctx.lineTo(-p.size * 0.2, -p.size * 0.9);
          ctx.stroke();
        }
        ctx.restore();

        if (p.y > height + p.size || p.x < -p.size * 2 || p.x > width + p.size * 2) {
          giantSnowflakes.splice(i, 1);
        }
      }

      // --- AUTUMN LEAVES ---
      if (currentTheme === 'autumn' && leaves.length < numLeaves) {
        leaves.push(createLeaf());
      }
      for (let i = leaves.length - 1; i >= 0; i--) {
        const p = leaves[i];
        p.angle += p.spin;
        const totalXs = p.xs + currentWind * 0.8;
        
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        
        // Draw a simple leaf shape
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.quadraticCurveTo(p.size, -p.size/2, 0, p.size);
        ctx.quadraticCurveTo(-p.size, -p.size/2, 0, -p.size);
        ctx.fill();
        ctx.restore();

        p.x += totalXs;
        p.y += p.ys;

        if (p.y > height || p.x > width + 400 || p.x < -400) {
          if (currentTheme === 'autumn') {
            Object.assign(p, createLeaf());
          } else {
            leaves.splice(i, 1);
          }
        }
      }

      // --- GIANT AUTUMN LEAVES ---
      for (let i = giantLeaves.length - 1; i >= 0; i--) {
        const p = giantLeaves[i];
        p.x += p.xs;
        p.y += p.ys;
        p.angle += p.spin;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        
        // Draw a giant leaf shape
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.quadraticCurveTo(p.size, -p.size/2, 0, p.size);
        ctx.quadraticCurveTo(-p.size, -p.size/2, 0, -p.size);
        ctx.fill();
        
        // Leaf veins
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -p.size * 0.9);
        ctx.lineTo(0, p.size * 0.8);
        ctx.moveTo(0, 0);
        ctx.lineTo(p.size * 0.4, -p.size * 0.3);
        ctx.moveTo(0, 0);
        ctx.lineTo(-p.size * 0.4, -p.size * 0.3);
        ctx.moveTo(0, p.size * 0.4);
        ctx.lineTo(p.size * 0.3, p.size * 0.1);
        ctx.moveTo(0, p.size * 0.4);
        ctx.lineTo(-p.size * 0.3, p.size * 0.1);
        ctx.stroke();

        ctx.restore();

        if (p.y > height + p.size || p.x < -p.size * 2 || p.x > width + p.size * 2) {
          giantLeaves.splice(i, 1);
        }
      }

      // --- FIREWORKS ---
      if (currentTheme === 'fireworks') {
        loveSalvoTimer++;
        if (loveSalvoTimer > 500) { // About 8 seconds
          launchTextFireworks(salvoSequences[salvoSequenceIndex]);
          salvoSequenceIndex = (salvoSequenceIndex + 1) % salvoSequences.length;
          loveSalvoTimer = 0;
        } else if (Math.random() < 0.03 && fireworksList.length < 5 && loveSalvoTimer < 400) {
          fireworksList.push(createFirework());
        }
      } else {
        loveSalvoTimer = 0;
      }

      for (let i = fireworksList.length - 1; i >= 0; i--) {
        const f = fireworksList[i];
        f.coordinates.pop();
        f.coordinates.unshift({ x: f.x, y: f.y });

        f.speed *= f.acceleration;
        const vx = Math.cos(f.angle) * f.speed;
        const vy = Math.sin(f.angle) * f.speed;
        f.distanceTraveled = Math.hypot(f.x + vx - f.startX, f.y + vy - f.startY);

        if (f.distanceTraveled >= f.distanceToTarget) {
          if (f.letter) {
            fireworkParticles.push(...createLetterParticles(f.tx, f.ty, f.hue, f.letter));
          } else {
            fireworkParticles.push(...createFireworkParticles(f.tx, f.ty, f.hue));
          }
          fireworksList.splice(i, 1);
        } else {
          f.x += vx;
          f.y += vy;

          ctx.beginPath();
          ctx.moveTo(f.coordinates[f.coordinates.length - 1].x, f.coordinates[f.coordinates.length - 1].y);
          ctx.lineTo(f.x, f.y);
          ctx.strokeStyle = `hsl(${f.hue}, 100%, ${f.brightness}%)`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      ctx.globalCompositeOperation = 'screen';
      for (let i = fireworkParticles.length - 1; i >= 0; i--) {
        const p = fireworkParticles[i];
        p.coordinates.pop();
        p.coordinates.unshift({ x: p.x, y: p.y });

        p.speed *= p.friction;
        p.x += Math.cos(p.angle) * p.speed;
        p.y += Math.sin(p.angle) * p.speed + p.gravity;
        p.alpha -= p.decay;

        if (p.alpha <= p.decay) {
          fireworkParticles.splice(i, 1);
        } else {
          ctx.beginPath();
          ctx.moveTo(p.coordinates[p.coordinates.length - 1].x, p.coordinates[p.coordinates.length - 1].y);
          ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = `hsla(${p.hue}, 100%, ${p.brightness}%, ${p.alpha})`;
          ctx.lineWidth = Math.random() < 0.2 ? 2 : 1;
          ctx.stroke();
        }
      }
      ctx.globalCompositeOperation = 'source-over';

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}

export default function PersonalPage() {
  const router = useRouter();
  const [theme, setTheme] = useState<Theme>('rain');
  const [hoverState, setHoverState] = useState<'default' | 'clickable' | 'text'>('default');
  const [transitionState, setTransitionState] = useState<'idle' | 'expanding'>('idle');
  const [clickPos, setClickPos] = useState({ x: 0, y: 0 });
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);
  const springConfig = { damping: 25, stiffness: 250 };
  const cursorXSpring = useSpring(mouseX, springConfig);
  const cursorYSpring = useSpring(mouseY, springConfig);

  const handleDotClick = (e: React.MouseEvent) => {
    setClickPos({ x: e.clientX, y: e.clientY });
    setTransitionState('expanding');
    
    setTimeout(() => {
      router.push('/love');
    }, 1000);
  };

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.secret-dot') || target.closest('a') || target.closest('button')) {
        setHoverState('clickable');
      } else if (target.closest('h1') || target.closest('h2') || target.closest('h3') || target.closest('p') || target.closest('span')) {
        setHoverState('text');
      } else {
        setHoverState('default');
      }
    };
    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);
    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [mouseX, mouseY]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = themeMusic[theme];
      if (isMusicPlaying) {
        audioRef.current.play().catch(e => {
          console.log("Autoplay prevented", e);
          setIsMusicPlaying(false);
        });
      }
    }
  }, [theme, isMusicPlaying]);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause();
        setIsMusicPlaying(false);
      } else {
        audioRef.current.play().then(() => {
          setIsMusicPlaying(true);
        }).catch(e => {
          console.log("Play prevented", e);
        });
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  const themeBg = {
    rain: 'bg-[#080c13]',
    snow: 'bg-[#0b1320]',
    autumn: 'bg-[#170b05]',
    fireworks: 'bg-[#020202]'
  };

  const themeGlow = {
    rain: 'bg-[#1e3a5f]/30',
    snow: 'bg-[#3b82f6]/20',
    autumn: 'bg-[#d97736]/20',
    fireworks: 'bg-[#ff0055]/10'
  };

  const spotlightColor = {
    rain: 'rgba(30, 58, 95, 0.15)',
    snow: 'rgba(59, 130, 246, 0.15)',
    autumn: 'rgba(217, 119, 54, 0.15)',
    fireworks: 'rgba(255, 100, 150, 0.1)'
  };

  return (
    <main className={`min-h-screen flex flex-col justify-between p-6 md:p-16 lg:p-24 font-sans relative overflow-hidden transition-colors duration-[2500ms] ease-in-out md:cursor-none md:[&_*]:cursor-none ${themeBg[theme]}`}>
      <audio ref={audioRef} loop />
      
      {/* Mouse Spotlight */}
      <motion.div
        className="fixed top-0 left-0 w-[800px] h-[800px] rounded-full pointer-events-none z-0 hidden md:block"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: '-50%',
          translateY: '-50%',
          background: `radial-gradient(circle, ${spotlightColor[theme]} 0%, transparent 50%)`,
          transition: 'background 2.5s ease-in-out'
        }}
      />

      {/* Custom Cursor */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 bg-white rounded-full pointer-events-none z-[999] mix-blend-difference hidden md:block"
        style={{ x: mouseX, y: mouseY, translateX: '-50%', translateY: '-50%' }}
        animate={{ scale: hoverState !== 'default' ? 0 : 1 }}
        transition={{ duration: 0.2 }}
      />
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 border border-white/50 rounded-full pointer-events-none z-[999] mix-blend-difference hidden md:block"
        style={{ x: cursorXSpring, y: cursorYSpring, translateX: '-50%', translateY: '-50%' }}
        animate={{ 
          scale: hoverState === 'clickable' ? 1.5 : hoverState === 'text' ? 3.5 : 1,
          backgroundColor: hoverState !== 'default' ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0)',
          borderWidth: hoverState === 'text' ? '0px' : '1px'
        }}
        transition={{ duration: 0.2 }}
      />

      {/* Transition Circle */}
      <AnimatePresence>
        {transitionState !== 'idle' && (
          <motion.div
            className="fixed z-[100] rounded-full bg-white pointer-events-none"
            style={{
              left: clickPos.x,
              top: clickPos.y,
              x: '-50%',
              y: '-50%',
              width: 20,
              height: 20,
            }}
            initial={{ scale: 1 }}
            animate={{ scale: 400 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
          />
        )}
      </AnimatePresence>

      {/* Weather Canvas */}
      <CanvasWeather theme={theme} />

      {/* Subtle background glow */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] blur-[120px] rounded-full pointer-events-none transition-colors duration-[2500ms] ease-in-out ${themeGlow[theme]}`} />
      <div className={`absolute bottom-0 right-0 w-[600px] h-[500px] blur-[150px] rounded-full pointer-events-none transition-colors duration-[2500ms] ease-in-out opacity-50 ${themeGlow[theme]}`} />

      {/* Texture Overlays */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="flex justify-end z-10 relative w-full"
      >
        {/* Desktop Theme Switcher */}
        <div className="hidden md:flex w-auto justify-end gap-1 bg-neutral-900/40 border border-neutral-700/30 backdrop-blur-md rounded-full p-1.5 shadow-md">
          <button
            onClick={() => setTheme('rain')}
            className={`px-4 py-2 rounded-full transition-all duration-300 flex items-center justify-center ${theme === 'rain' ? 'bg-white/20 text-white shadow-sm' : 'text-neutral-400 hover:text-white hover:bg-white/10'}`}
            aria-label="Rain mode"
            title="雨天模式"
          >
            <CloudRain size={16} />
          </button>
          <button
            onClick={() => setTheme('snow')}
            className={`px-4 py-2 rounded-full transition-all duration-300 flex items-center justify-center ${theme === 'snow' ? 'bg-white/20 text-white shadow-sm' : 'text-neutral-400 hover:text-white hover:bg-white/10'}`}
            aria-label="Snow mode"
            title="下雪模式"
          >
            <Snowflake size={16} />
          </button>
          <button
            onClick={() => setTheme('autumn')}
            className={`px-4 py-2 rounded-full transition-all duration-300 flex items-center justify-center ${theme === 'autumn' ? 'bg-white/20 text-white shadow-sm' : 'text-neutral-400 hover:text-white hover:bg-white/10'}`}
            aria-label="Autumn mode"
            title="秋叶模式"
          >
            <Leaf size={16} />
          </button>
          <button
            onClick={() => setTheme('fireworks')}
            className={`px-4 py-2 rounded-full transition-all duration-300 flex items-center justify-center ${theme === 'fireworks' ? 'bg-white/20 text-white shadow-sm' : 'text-neutral-400 hover:text-white hover:bg-white/10'}`}
            aria-label="Fireworks mode"
            title="烟花模式"
          >
            <Sparkles size={16} />
          </button>
          
          <div className="w-px h-5 bg-neutral-700/50 mx-1 self-center" />
          
          <button
            onClick={toggleMusic}
            className={`px-4 py-2 rounded-full transition-all duration-300 flex items-center justify-center ${isMusicPlaying ? 'bg-white/20 text-white shadow-sm' : 'text-neutral-400 hover:text-white hover:bg-white/10'}`}
            aria-label="Toggle music"
            title={isMusicPlaying ? "暂停音乐" : "播放音乐"}
          >
            {isMusicPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>

        {/* Mobile Horizontal Retractable Menu */}
        <motion.div
          layout
          className="md:hidden flex items-center bg-neutral-900/40 border border-neutral-700/30 backdrop-blur-md rounded-full p-1.5 shadow-md"
        >
          <AnimatePresence initial={false}>
            {isMenuOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 'auto', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="flex items-center gap-1 overflow-hidden whitespace-nowrap pr-1"
              >
                <button
                  onClick={() => { setTheme('rain'); setIsMenuOpen(false); }}
                  className={`p-2 rounded-full transition-all duration-300 flex items-center justify-center ${theme === 'rain' ? 'bg-white/20 text-white shadow-sm' : 'text-neutral-400 hover:text-white hover:bg-white/10'}`}
                  aria-label="Rain mode"
                >
                  <CloudRain size={18} />
                </button>
                <button
                  onClick={() => { setTheme('snow'); setIsMenuOpen(false); }}
                  className={`p-2 rounded-full transition-all duration-300 flex items-center justify-center ${theme === 'snow' ? 'bg-white/20 text-white shadow-sm' : 'text-neutral-400 hover:text-white hover:bg-white/10'}`}
                  aria-label="Snow mode"
                >
                  <Snowflake size={18} />
                </button>
                <button
                  onClick={() => { setTheme('autumn'); setIsMenuOpen(false); }}
                  className={`p-2 rounded-full transition-all duration-300 flex items-center justify-center ${theme === 'autumn' ? 'bg-white/20 text-white shadow-sm' : 'text-neutral-400 hover:text-white hover:bg-white/10'}`}
                  aria-label="Autumn mode"
                >
                  <Leaf size={18} />
                </button>
                <button
                  onClick={() => { setTheme('fireworks'); setIsMenuOpen(false); }}
                  className={`p-2 rounded-full transition-all duration-300 flex items-center justify-center ${theme === 'fireworks' ? 'bg-white/20 text-white shadow-sm' : 'text-neutral-400 hover:text-white hover:bg-white/10'}`}
                  aria-label="Fireworks mode"
                >
                  <Sparkles size={18} />
                </button>
                
                <div className="w-px h-4 bg-neutral-700/50 mx-1" />
                
                <button
                  onClick={() => { toggleMusic(); setIsMenuOpen(false); }}
                  className={`p-2 rounded-full transition-all duration-300 flex items-center justify-center ${isMusicPlaying ? 'bg-white/20 text-white shadow-sm' : 'text-neutral-400 hover:text-white hover:bg-white/10'}`}
                  aria-label="Toggle music"
                >
                  {isMusicPlaying ? <Volume2 size={18} /> : <VolumeX size={18} />}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`p-2 rounded-full flex items-center justify-center transition-all duration-300 z-10 shrink-0 ${isMenuOpen ? 'bg-white/20 text-white shadow-sm' : 'text-neutral-300 hover:text-white hover:bg-white/10'}`}
            aria-label="Toggle menu"
          >
            <motion.div animate={{ rotate: isMenuOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
              {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </motion.div>
          </button>
        </motion.div>
      </motion.header>

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col max-w-3xl z-10 relative mt-12 md:mt-0"
      >
        <motion.h1
          id="title-c77"
          variants={itemVariants}
          className="text-6xl md:text-9xl font-bold tracking-tighter text-white mb-6 w-fit relative z-20"
        >
          C77<span 
               className="text-neutral-600 secret-dot cursor-pointer transition-colors hover:text-white"
               onClick={handleDotClick}
             >.</span>
        </motion.h1>

        <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-2 md:gap-3 px-3 py-2 md:px-4 rounded-lg bg-neutral-900/40 border border-neutral-800/60 backdrop-blur-md w-fit mb-8">
          <span className="text-neutral-400 text-[10px] md:text-xs font-mono tracking-wider">2月22日</span>
          <div className="w-1 h-1 rounded-full bg-neutral-700" />
          <span className="text-neutral-400 text-[10px] md:text-xs font-mono tracking-wider">17岁</span>
          <div className="w-1 h-1 rounded-full bg-neutral-700" />
          <span className="text-neutral-400 text-[10px] md:text-xs font-mono tracking-wider">实验中学</span>
        </motion.div>

        <motion.div variants={itemVariants} className="h-px w-16 bg-neutral-800 mb-8" />

        <motion.p
          variants={itemVariants}
          className="text-base md:text-xl text-neutral-400 font-light leading-relaxed max-w-xl mb-12"
        >
          我对你何止半分真心
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-wrap gap-4 md:gap-6">
          <SocialLink href="https://www.kuaishou.com/profile/3xa389b27p7s9eu" icon={<PlaySquare size={20} />} label="快手" />
          <SocialLink href="https://www.douyin.com/user/MS4wLjABAAAA8hDi4p4CZZC8ALhQ25mOtr_R8ul1H3J4R3MV5kjL5bMIuhRV9POfdAsHOZVv3Y3J" icon={<Music size={20} />} label="抖音" />
          <SocialLink href="mailto:kalilinux012@outlook.com" icon={<Mail size={20} />} label="邮箱" />
          <SocialLink href="mqqapi://card/show_pslcard?src_type=internal&version=1&uin=368306428&card_type=person&source=qrcode" icon={<MessageCircle size={20} />} label="QQ" />
        </motion.div>
      </motion.div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="flex justify-center md:justify-start items-center md:items-end gap-6 md:gap-4 z-10 relative text-neutral-600 font-mono text-xs uppercase tracking-wider mt-16 md:mt-0 w-full"
      >
        <div className="text-center md:text-left">
          <p>常驻外太空</p>
          <p className="mt-1">© {new Date().getFullYear()} C77</p>
        </div>
      </motion.footer>
    </main>
  );
}

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="social-link-item group flex items-center gap-3 text-neutral-500 hover:text-white transition-colors duration-300"
    >
      <span className="p-3 rounded-full border border-neutral-800 group-hover:border-neutral-600 transition-colors duration-300 bg-neutral-950">
        {icon}
      </span>
      <span className="font-mono text-sm tracking-wide">{label}</span>
    </a>
  );
}
