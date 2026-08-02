import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  onComplete: () => void
}

export default function SplashScreen({ onComplete }: Props) {
  const text = 'Future Power AI'
  const [visibleChars, setVisibleChars] = useState(0)
  const [phase, setPhase] = useState<'typing' | 'hold' | 'exit'>('typing')

  useEffect(() => {
    if (phase !== 'typing') return
    if (visibleChars < text.length) {
      const t = setTimeout(() => setVisibleChars((c) => c + 1), 55)
      return () => clearTimeout(t)
    }
    const hold = setTimeout(() => setPhase('hold'), 400)
    return () => clearTimeout(hold)
  }, [visibleChars, phase])

  useEffect(() => {
    if (phase === 'hold') {
      const t = setTimeout(() => setPhase('exit'), 700)
      return () => clearTimeout(t)
    }
  }, [phase])

  useEffect(() => {
    if (phase === 'exit') {
      const t = setTimeout(onComplete, 600)
      return () => clearTimeout(t)
    }
  }, [phase, onComplete])

  return (
    <AnimatePresence>
      {phase !== 'exit' ? (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative">
            <motion.div
              className="absolute inset-0 -m-8 rounded-full bg-blue-500/20 blur-3xl"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 0.6, scale: 1.2 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
            <h1 className="relative text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white">
              {text.slice(0, visibleChars)}
              <motion.span
                className="inline-block w-[2px] h-[1.1em] ml-0.5 bg-cyan-400 align-middle"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse' }}
              />
            </h1>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="splash-exit"
          className="fixed inset-0 z-[9999] bg-black"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.55 }}
        />
      )}
    </AnimatePresence>
  )
}
