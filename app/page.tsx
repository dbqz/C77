'use client';

import { motion, useMotionValue, useSpring, AnimatePresence } from 'motion/react';
import { PlaySquare, Music, Mail, MessageCircle, CloudRain, Snowflake, Leaf, Sun, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

type Theme = 'rain' | 'snow' | 'autumn' | 'summer';

const themeMusic = {
  rain: 'https://music.163.com/song/media/outer/url?id=436667409.mp3',
  snow: 'https://music.163.com/song/media/outer/url?id=2139196813.mp3',
  autumn: 'https://music.163.com/song/media/outer/url?id=28912659.mp3',
  summer: 'https://music.163.com/song/media/outer/url?id=3947467.mp3'
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
    const fireflies: any[] = [];
    const lightnings: any[] = [];
    const clouds: any[] = [];

    const numDrops = window.innerWidth < 768 ? 100 : 400;
    const numSnowflakes = window.innerWidth < 768 ? 50 : 200;
    const numLeaves = window.innerWidth < 768 ? 20 : 60;
    const numFireflies = window.innerWidth < 768 ? 30 : 80;
    const numClouds = window.innerWidth < 768 ? 12 : 25;

    let currentWind = 1.5;
    let targetWind = 1.5;
    let windChangeTimer = 0;

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

    function createFirefly() {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5 + 1,
        xs: (Math.random() - 0.5) * 0.5,
        ys: (Math.random() - 0.5) * 0.5,
        life: Math.random() * Math.PI * 2,
        maxLife: Math.random() * 0.02 + 0.01,
        offset: Math.random() * 100
      };
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

    // Initialize clouds
    for (let i = 0; i < numClouds; i++) {
      const puffs = [];
      const numPuffs = Math.floor(Math.random() * 5) + 4;
      for (let j = 0; j < numPuffs; j++) {
        puffs.push({
          offsetX: (Math.random() - 0.5) * 250,
          offsetY: (Math.random() - 0.5) * 80,
          radius: Math.random() * 100 + 80,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.001 + 0.0005
        });
      }
      clouds.push({
        x: Math.random() * width,
        y: Math.random() * 100 - 50,
        vx: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.3 + 0.15,
        colorOffset: Math.random() * 15 - 5,
        scale: Math.random() * 0.5 + 0.8,
        puffs: puffs
      });
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

      // Calculate max lightning alpha for cloud illumination
      let maxLightningAlpha = 0;
      for (let i = 0; i < lightnings.length; i++) {
        const l = lightnings[i];
        const alpha = 1 - (l.life / l.maxLife);
        if (alpha > maxLightningAlpha) maxLightningAlpha = Math.max(0, alpha);
      }

      // Draw clouds (visible in all themes, but maybe adjust color)
      for (let i = 0; i < clouds.length; i++) {
        const c = clouds[i];
        c.x += c.vx + (currentWind * 0.1);
        
        if (c.x - 300 > width) c.x = -300;
        if (c.x + 300 < 0) c.x = width + 300;

        // Base colors depend on theme
        let baseR = 12 + c.colorOffset, baseG = 14 + c.colorOffset, baseB = 20 + c.colorOffset;
        if (currentTheme === 'snow') {
          baseR = 20 + c.colorOffset; baseG = 24 + c.colorOffset; baseB = 30 + c.colorOffset;
        } else if (currentTheme === 'autumn') {
          baseR = 25 + c.colorOffset; baseG = 18 + c.colorOffset; baseB = 12 + c.colorOffset;
        } else if (currentTheme === 'summer') {
          baseR = 10 + c.colorOffset; baseG = 16 + c.colorOffset; baseB = 12 + c.colorOffset;
        }
        
        const flashR = 210, flashG = 220, flashB = 240;

        const r = Math.floor(baseR + (flashR - baseR) * maxLightningAlpha);
        const g = Math.floor(baseG + (flashG - baseG) * maxLightningAlpha);
        const b = Math.floor(baseB + (flashB - baseB) * maxLightningAlpha);

        for (let j = 0; j < c.puffs.length; j++) {
          const puff = c.puffs[j];
          const animY = Math.sin(time * puff.speed + puff.phase) * 15;
          const animX = Math.cos(time * puff.speed + puff.phase) * 10;
          
          const px = c.x + puff.offsetX * c.scale + animX;
          const py = c.y + puff.offsetY * c.scale + animY;
          const pr = puff.radius * c.scale;

          const gradient = ctx.createRadialGradient(px, py, 0, px, py, pr);
          gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${c.opacity})`);
          gradient.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${c.opacity * 0.7})`);
          gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(px, py, pr, 0, Math.PI * 2);
          ctx.fill();
        }
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

      // --- SUMMER FIREFLIES ---
      if (currentTheme === 'summer' && fireflies.length < numFireflies) {
        fireflies.push(createFirefly());
      }
      for (let i = fireflies.length - 1; i >= 0; i--) {
        const p = fireflies[i];
        p.x += p.xs + Math.sin(p.offset) * 0.5;
        p.y += p.ys + Math.cos(p.offset) * 0.5;
        p.offset += 0.01;
        p.life += p.maxLife;

        if (p.x < -50) p.x = width + 50;
        if (p.x > width + 50) p.x = -50;
        if (p.y < -50) p.y = height + 50;
        if (p.y > height + 50) p.y = -50;

        if (currentTheme !== 'summer') {
          fireflies.splice(i, 1);
          continue;
        }

        const opacity = (Math.sin(p.life) + 1) / 2 * 0.8 + 0.2; // 0.2 to 1.0

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 255, 100, ${opacity})`;
        ctx.shadowBlur = 15;
        ctx.shadowColor = `rgba(200, 255, 100, ${opacity * 0.8})`;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }

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
    summer: 'bg-[#0a110a]'
  };

  const themeGlow = {
    rain: 'bg-[#1e3a5f]/30',
    snow: 'bg-[#3b82f6]/20',
    autumn: 'bg-[#d97736]/20',
    summer: 'bg-[#84cc16]/20'
  };

  const spotlightColor = {
    rain: 'rgba(30, 58, 95, 0.15)',
    snow: 'rgba(59, 130, 246, 0.15)',
    autumn: 'rgba(217, 119, 54, 0.15)',
    summer: 'rgba(132, 204, 22, 0.15)'
  };

  return (
    <main className={`min-h-screen flex flex-col justify-between p-8 md:p-16 lg:p-24 font-sans relative overflow-hidden transition-colors duration-[2500ms] ease-in-out md:cursor-none md:[&_*]:cursor-none ${themeBg[theme]}`}>
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
        className="flex justify-between items-center z-10 relative"
      >
        <div className="font-mono text-xs tracking-widest text-neutral-500 uppercase">
          {`// 已经阵亡`}
        </div>
        
        {/* Theme Switcher */}
        <div className="flex gap-2 bg-neutral-900/60 border border-neutral-700/50 backdrop-blur-md rounded-full p-1.5 shadow-lg">
          <button
            onClick={() => setTheme('rain')}
            className={`p-2.5 rounded-full transition-all duration-300 flex items-center justify-center ${theme === 'rain' ? 'bg-white/20 text-white shadow-sm' : 'text-neutral-400 hover:text-white hover:bg-white/10'}`}
            aria-label="Rain mode"
            title="雨天模式"
          >
            <CloudRain size={20} />
          </button>
          <button
            onClick={() => setTheme('snow')}
            className={`p-2.5 rounded-full transition-all duration-300 flex items-center justify-center ${theme === 'snow' ? 'bg-white/20 text-white shadow-sm' : 'text-neutral-400 hover:text-white hover:bg-white/10'}`}
            aria-label="Snow mode"
            title="下雪模式"
          >
            <Snowflake size={20} />
          </button>
          <button
            onClick={() => setTheme('autumn')}
            className={`p-2.5 rounded-full transition-all duration-300 flex items-center justify-center ${theme === 'autumn' ? 'bg-white/20 text-white shadow-sm' : 'text-neutral-400 hover:text-white hover:bg-white/10'}`}
            aria-label="Autumn mode"
            title="秋叶模式"
          >
            <Leaf size={20} />
          </button>
          <button
            onClick={() => setTheme('summer')}
            className={`p-2.5 rounded-full transition-all duration-300 flex items-center justify-center ${theme === 'summer' ? 'bg-white/20 text-white shadow-sm' : 'text-neutral-400 hover:text-white hover:bg-white/10'}`}
            aria-label="Summer mode"
            title="夏夜模式"
          >
            <Sun size={20} />
          </button>
          
          <div className="w-px h-6 bg-neutral-700/50 mx-1 self-center" />
          
          <button
            onClick={toggleMusic}
            className={`p-2.5 rounded-full transition-all duration-300 flex items-center justify-center ${isMusicPlaying ? 'bg-white/20 text-white shadow-sm' : 'text-neutral-400 hover:text-white hover:bg-white/10'}`}
            aria-label="Toggle music"
            title={isMusicPlaying ? "暂停音乐" : "播放音乐"}
          >
            {isMusicPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>
      </motion.header>

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col max-w-3xl z-10 relative mt-20 md:mt-0"
      >
        <motion.h1
          id="title-c77"
          variants={itemVariants}
          className="text-5xl md:text-9xl font-bold tracking-tighter text-white mb-6 w-fit relative z-20"
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
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 z-10 relative text-neutral-600 font-mono text-xs uppercase tracking-wider mt-20 md:mt-0"
      >
        <div>
          <p>常驻外太空</p>
          <p className="mt-1">© {new Date().getFullYear()} C77</p>
        </div>
        <div className="text-right">
          <p>自由中</p>
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
