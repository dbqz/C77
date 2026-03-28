'use client';

import { motion, useMotionValue, useSpring, AnimatePresence, useScroll, useTransform, useMotionTemplate } from 'motion/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const sentences = [
  "真心，\n是下意识的惦记，\n和控制不住的想念。",
  "是即使相隔万里，\n也想把清晨的第一缕阳光分享给你。",
  "是在茫茫人海中，\n目光总能第一眼锁定你的身影。",
  "是不需要刻意想起，\n因为从未忘记。"
];

export default function LovePage() {
  const router = useRouter();
  const [isLeaving, setIsLeaving] = useState(false);
  const [hoverState, setHoverState] = useState<'default' | 'clickable' | 'text'>('default');
  const [clickPos, setClickPos] = useState({ x: '50%', y: '50%' });
  
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const { scrollYProgress } = useScroll();
  
  // Section 1 (White)
  const sec1Opacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const sec1Y = useTransform(scrollYProgress, [0, 0.15], [0, -50]);
  const sec1Scale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);
  const scrollIndicatorOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);

  // Black background expansion (Circle clip-path)
  const blackRadius = useTransform(scrollYProgress, [0.1, 0.25], [0, 150]);
  const blackClipPath = useMotionTemplate`circle(${blackRadius}vmax at 50% 50%)`;

  // Section 2 (Black)
  const sec2Opacity = useTransform(scrollYProgress, [0.2, 0.3, 0.4, 0.45], [0, 1, 1, 0]);
  const sec2Y = useTransform(scrollYProgress, [0.2, 0.3, 0.4, 0.45], [50, 0, 0, -50]);

  // Section 3 (Black)
  const sec3Opacity = useTransform(scrollYProgress, [0.45, 0.55, 0.65, 0.7], [0, 1, 1, 0]);
  const sec3Y = useTransform(scrollYProgress, [0.45, 0.55, 0.65, 0.7], [50, 0, 0, -50]);

  // Section 4 (Black)
  const sec4Opacity = useTransform(scrollYProgress, [0.7, 0.85, 1], [0, 1, 1]);
  const sec4Y = useTransform(scrollYProgress, [0.7, 0.85, 1], [50, 0, 0]);

  const isFinished = sentenceIndex === sentences.length - 1 && typedText.length === sentences[sentenceIndex].length && !isFadingOut;

  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);
  const springConfig = { damping: 25, stiffness: 250 };
  const cursorXSpring = useSpring(mouseX, springConfig);
  const cursorYSpring = useSpring(mouseY, springConfig);

  useEffect(() => {
    const startTimer = setTimeout(() => setHasStarted(true), 600);
    return () => clearTimeout(startTimer);
  }, []);

  useEffect(() => {
    if (!hasStarted || sentenceIndex >= sentences.length) return;

    const currentSentence = sentences[sentenceIndex];

    if (isFadingOut) {
      const timer = setTimeout(() => {
        setTypedText('');
        setIsFadingOut(false);
        setSentenceIndex(prev => prev + 1);
      }, 800);
      return () => clearTimeout(timer);
    }

    if (typedText.length < currentSentence.length) {
      const timer = setTimeout(() => {
        setTypedText(currentSentence.slice(0, typedText.length + 1));
      }, 150);
      return () => clearTimeout(timer);
    } else {
      if (sentenceIndex < sentences.length - 1) {
        const timer = setTimeout(() => setIsFadingOut(true), 2500);
        return () => clearTimeout(timer);
      }
    }
  }, [typedText, isFadingOut, sentenceIndex, hasStarted]);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a') || target.closest('button')) {
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

  const handleReturn = (e: React.MouseEvent) => {
    setClickPos({ x: `${e.clientX}px`, y: `${e.clientY}px` });
    setIsLeaving(true);
    setTimeout(() => {
      router.push('/');
    }, 1000);
  };

  return (
    <main className="bg-[#080c13] relative md:cursor-none md:[&_*]:cursor-none h-[400vh]">
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

      {/* Background 1: White Entry Circle */}
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
        initial={{ scale: 400 }}
        animate={{ scale: isLeaving ? 0 : 400 }}
        transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
      />

      {/* Background 2: Black Expanding Circle (Scroll) */}
      <motion.div
        className="fixed inset-0 z-[101] bg-[#050505] pointer-events-none"
        style={{
          clipPath: blackClipPath,
          opacity: isLeaving ? 0 : 1
        }}
        transition={{ duration: 0.5 }}
      />

      {/* Content Container (Fixed) */}
      <AnimatePresence>
        {!isLeaving && (
          <motion.div
            className="fixed inset-0 z-[110] w-full pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Section 1: Typewriter */}
            <motion.section 
              style={{ opacity: sec1Opacity, y: sec1Y, scale: sec1Scale }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              <div className="flex flex-col items-center max-w-2xl text-center px-6 pointer-events-auto">
                <div className="min-h-[200px] flex items-center justify-center mb-16">
                  <motion.h1 
                    className="text-xl md:text-3xl font-light tracking-[0.2em] leading-[2.5] whitespace-pre-line text-neutral-800"
                    animate={{ opacity: isFadingOut ? 0 : 1 }}
                    transition={{ duration: 0.8 }}
                  >
                    {typedText}
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      className="inline-block w-[2px] h-[1em] bg-neutral-800 ml-1 align-middle"
                    />
                  </motion.h1>
                </div>
                
                {/* Scroll Indicator */}
                <motion.div
                  style={{ opacity: scrollIndicatorOpacity }}
                  className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-neutral-400"
                >
                  <motion.div
                    animate={{ opacity: isFinished ? 1 : 0 }}
                    transition={{ duration: 1 }}
                    className="flex flex-col items-center gap-3"
                  >
                    <span className="text-xs tracking-widest uppercase font-light">向下滑动</span>
                    <motion.div
                      animate={{ y: [0, 8, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                      className="w-px h-12 bg-gradient-to-b from-neutral-400 to-transparent"
                    />
                  </motion.div>
                </motion.div>
              </div>
            </motion.section>

            {/* Section 2: Black Page Content 1 */}
            <motion.section 
              style={{ opacity: sec2Opacity, y: sec2Y }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              <div className="text-white max-w-2xl text-center px-6 pointer-events-auto flex flex-col items-center">
                <h2 className="text-2xl md:text-4xl font-light tracking-widest mb-12 leading-relaxed text-white/90">
                  "在无尽的暗夜里，<br/>你是我唯一的星光。"
                </h2>
                <p className="text-neutral-400 leading-[2.5] tracking-widest font-light text-sm md:text-base">
                  时间或许会冲淡许多记忆，<br/>
                  但那些关于你的瞬间，<br/>
                  却在岁月的沉淀中愈发清晰。
                </p>
              </div>
            </motion.section>

            {/* Section 3: Black Page Content 2 */}
            <motion.section 
              style={{ opacity: sec3Opacity, y: sec3Y }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              <div className="text-white max-w-2xl text-center px-6 pointer-events-auto flex flex-col items-center">
                <h2 className="text-2xl md:text-4xl font-light tracking-widest mb-12 leading-relaxed text-white/90">
                  "我曾跨越千山万水，<br/>只为寻找心停靠的港湾。"
                </h2>
                <p className="text-neutral-400 leading-[2.5] tracking-widest font-light text-sm md:text-base">
                  直到遇见你，<br/>
                  我才知道，<br/>
                  原来所有的跋涉，都是为了这一刻的相逢。
                </p>
              </div>
            </motion.section>

            {/* Section 4: Black Page Content 3 */}
            <motion.section 
              style={{ opacity: sec4Opacity, y: sec4Y }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              <div className="text-white max-w-2xl text-center px-6 pointer-events-auto flex flex-col items-center">
                <h2 className="text-2xl md:text-4xl font-light tracking-widest mb-12 leading-relaxed text-white/90">
                  "世界喧嚣，人潮拥挤，<br/>而你，是我心底最温柔的静谧。"
                </h2>
                <p className="text-neutral-400 leading-[2.5] tracking-widest mb-16 font-light text-sm md:text-base">
                  愿岁月的长河里，<br/>
                  始终有你，<br/>
                  也始终有我。
                </p>
                
                <button 
                  onClick={handleReturn}
                  className="px-10 py-3 border border-white/20 rounded-full text-xs tracking-[0.3em] uppercase hover:bg-white hover:text-black transition-all duration-500"
                >
                  返回
                </button>
              </div>
            </motion.section>

          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
