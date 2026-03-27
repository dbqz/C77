'use client';

import { motion } from 'motion/react';
import { PlaySquare, Music, Mail, MessageCircle, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';

function CanvasRain({ isMuted }: { isMuted: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMutedRef = useRef(isMuted);
  const rainAudioRef = useRef<HTMLAudioElement | null>(null);
  const thunderAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    rainAudioRef.current = new Audio('/rain.ogg');
    rainAudioRef.current.loop = true;
    rainAudioRef.current.volume = 0.15;

    thunderAudioRef.current = new Audio('/thunder.ogg');
    thunderAudioRef.current.volume = 0.3;

    return () => {
      rainAudioRef.current?.pause();
      thunderAudioRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    if (!isMuted) {
      rainAudioRef.current?.play().catch(() => {});
    } else {
      rainAudioRef.current?.pause();
    }
  }, [isMuted]);

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
    const lightnings: any[] = [];
    const numDrops = window.innerWidth < 768 ? 100 : 400; // Increased for wider spawn area

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

    // Initialize raindrops
    for (let i = 0; i < numDrops; i++) {
      raindrops.push({
        x: Math.random() * (width + 800) - 400, // Spawn widely to account for wind
        y: Math.random() * height - height,
        l: Math.random() * 30 + 20, // length
        xs: Math.random() * 1, // base horizontal speed
        ys: Math.random() * 15 + 20 // vertical speed
      });
    }

    // Initialize clouds
    const clouds: any[] = [];
    const numClouds = window.innerWidth < 768 ? 12 : 25;
    for (let i = 0; i < numClouds; i++) {
      const puffs = [];
      const numPuffs = Math.floor(Math.random() * 5) + 4; // 4 to 8 puffs per cloud
      for (let j = 0; j < numPuffs; j++) {
        puffs.push({
          offsetX: (Math.random() - 0.5) * 250, // horizontal spread
          offsetY: (Math.random() - 0.5) * 80,  // vertical spread
          radius: Math.random() * 100 + 80,     // puff size
          phase: Math.random() * Math.PI * 2,   // animation phase
          speed: Math.random() * 0.001 + 0.0005 // animation speed
        });
      }

      clouds.push({
        x: Math.random() * width,
        y: Math.random() * 100 - 50, // Top area
        vx: (Math.random() - 0.5) * 0.3, // Base speed
        opacity: Math.random() * 0.3 + 0.15, // 0.15 to 0.45
        colorOffset: Math.random() * 15 - 5, // Slight color variation
        scale: Math.random() * 0.5 + 0.8,
        puffs: puffs
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Update wind
      windChangeTimer++;
      if (windChangeTimer > 120) {
        if (Math.random() < 0.3) {
          // Wind can shift between -4 (left) and 6 (right)
          targetWind = (Math.random() - 0.3) * 10;
        }
        windChangeTimer = 0;
      }
      currentWind += (targetWind - currentWind) * 0.01;

      // Calculate max lightning alpha for cloud illumination
      let maxLightningAlpha = 0;
      for (let i = 0; i < lightnings.length; i++) {
        const l = lightnings[i];
        const alpha = 1 - (l.life / l.maxLife);
        if (alpha > maxLightningAlpha) maxLightningAlpha = Math.max(0, alpha);
      }

      const time = Date.now();

      // Draw clouds
      for (let i = 0; i < clouds.length; i++) {
        const c = clouds[i];
        c.x += c.vx + (currentWind * 0.1); // Wind effect
        
        // Wrap around
        if (c.x - 300 > width) c.x = -300;
        if (c.x + 300 < 0) c.x = width + 300;

        // Calculate color based on lightning
        const baseR = 12 + c.colorOffset;
        const baseG = 14 + c.colorOffset;
        const baseB = 20 + c.colorOffset;
        
        const flashR = 210;
        const flashG = 220;
        const flashB = 240;

        const r = Math.floor(baseR + (flashR - baseR) * maxLightningAlpha);
        const g = Math.floor(baseG + (flashG - baseG) * maxLightningAlpha);
        const b = Math.floor(baseB + (flashB - baseB) * maxLightningAlpha);

        for (let j = 0; j < c.puffs.length; j++) {
          const puff = c.puffs[j];
          // Morphing animation
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

      // Draw raindrops
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      
      for (let i = 0; i < raindrops.length; i++) {
        const p = raindrops[i];
        const totalXs = p.xs + currentWind;
        
        ctx.moveTo(p.x, p.y);
        // Calculate the drop's visual tilt based on current wind
        const dropLengthX = (totalXs / p.ys) * p.l;
        ctx.lineTo(p.x + dropLengthX, p.y + p.l);

        p.x += totalXs;
        p.y += p.ys;

        if (p.y > height || p.x > width + 400 || p.x < -400) {
          // Reset drop if it goes off screen vertically or too far horizontally
          p.x = Math.random() * (width + 800) - 400;
          p.y = -50;
        }
      }
      ctx.stroke();

      // Randomly spawn lightning
      if (Math.random() < 0.003) {
        lightnings.push(createLightning());
        if (!isMutedRef.current && thunderAudioRef.current) {
          const thunderClone = thunderAudioRef.current.cloneNode() as HTMLAudioElement;
          thunderClone.volume = Math.random() * 0.2 + 0.1;
          thunderClone.play().catch(() => {});
        }
        if (Math.random() < 0.5) {
          setTimeout(() => {
            lightnings.push(createLightning());
            if (!isMutedRef.current && thunderAudioRef.current) {
              const thunderClone = thunderAudioRef.current.cloneNode() as HTMLAudioElement;
              thunderClone.volume = Math.random() * 0.2 + 0.1;
              thunderClone.play().catch(() => {});
            }
          }, Math.random() * 100 + 50);
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
        
        // Glow
        ctx.shadowBlur = 30;
        ctx.shadowColor = 'rgba(200, 230, 255, 1)';
        ctx.strokeStyle = `rgba(255, 255, 255, ${l.alpha})`;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Core
        ctx.shadowBlur = 0;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        if (l.alpha > maxLightningAlpha) {
          maxLightningAlpha = l.alpha;
        }

        l.life++;
        l.alpha = 1 - (l.life / l.maxLife);
        if (l.life >= l.maxLife) {
          lightnings.splice(i, 1);
        }
      }

      // Screen flash
      if (maxLightningAlpha > 0) {
        ctx.fillStyle = `rgba(200, 230, 255, ${maxLightningAlpha * 0.15})`;
        ctx.fillRect(0, 0, width, height);
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
  const [isMuted, setIsMuted] = useState(true);

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

  return (
    <main className="min-h-screen flex flex-col justify-between p-8 md:p-16 lg:p-24 font-sans relative overflow-hidden bg-black">
      {/* Background Image of Big Ben from a bridge with blue tone */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src="/big-ben.jpg"
          alt="Big Ben from Westminster Bridge"
          fill
          className="object-cover opacity-60"
          referrerPolicy="no-referrer"
          priority
        />
        {/* Blue tone overlays */}
        <div className="absolute inset-0 bg-blue-950/50 mix-blend-multiply" />
        <div className="absolute inset-0 bg-slate-900/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
      </div>

      {/* Continuous Realistic Rain Effect with Physics */}
      <CanvasRain isMuted={isMuted} />

      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-neutral-900/30 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="flex justify-between items-center z-10 relative"
      >
        <div className="font-mono text-xs tracking-widest text-neutral-500 uppercase">
          // 已经阵亡
        </div>
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="text-neutral-500 hover:text-white transition-colors duration-300 p-2 rounded-full bg-neutral-900/40 border border-neutral-800/60 backdrop-blur-md"
          aria-label="Toggle sound"
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
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
          className="text-5xl md:text-9xl font-bold tracking-tighter text-white mb-6 w-fit"
        >
          C77<span className="text-neutral-600">.</span>
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
