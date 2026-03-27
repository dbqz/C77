'use client';

import { motion, useMotionValue, useSpring, AnimatePresence } from 'motion/react';
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
    <main className="min-h-screen bg-[#080c13] relative overflow-hidden md:cursor-none md:[&_*]:cursor-none">
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

      {/* The White Page Background as an expanding/shrinking circle */}
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

      {/* Content */}
      <AnimatePresence>
        {!isLeaving && (
          <motion.div
            className="fixed inset-0 z-[110] text-black flex flex-col items-center justify-center min-h-screen w-full pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
              className="flex flex-col items-center max-w-2xl text-center px-6 pointer-events-auto"
            >
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
              
              <motion.button 
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: isFinished ? 1 : 0,
                  y: isFinished ? 0 : 20
                }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                onClick={handleReturn}
                className="px-8 py-3 border border-black/10 rounded-full text-sm tracking-widest uppercase hover:bg-black hover:text-white transition-all duration-500"
                style={{ pointerEvents: isFinished ? 'auto' : 'none' }}
              >
                Return
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
