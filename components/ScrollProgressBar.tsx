'use client'

import { useScroll, useSpring, motion } from 'framer-motion'

export default function ScrollProgressBar() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 220, damping: 32 })

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-700 via-brand-500 to-brand-300 origin-left z-[200] print:hidden"
      style={{
        scaleX,
        boxShadow: '0 0 8px rgba(249,115,22,0.55)',
      }}
    />
  )
}
