import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans, DM_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import AnimatedBackground from '@/components/AnimatedBackground'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BackToTop from '@/components/BackToTop'
import MobileNav from '@/components/MobileNav'
import { AuthProvider } from '@/context/AuthContext'
import './globals.css'

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-display', display: 'swap' })
const dmSans   = DM_Sans({ subsets: ['latin'], variable: '--font-body', display: 'swap' })
const dmMono   = DM_Mono({ subsets: ['latin'], variable: '--font-mono', weight: ['400', '500'], display: 'swap' })

export const metadata: Metadata = {
  title:       'ALONE recipes — Craft. Cook. Savour.',
  description: 'A curated collection of handcrafted recipes with step-by-step instructions.',
  icons:       { icon: '/favicon.ico' },
  openGraph: {
    title:       'ALONE recipes',
    description: 'Handcrafted recipes — cooked alone, shared forever.',
    type:        'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} ${dmMono.variable}`}>
      <body className="font-body antialiased text-white min-h-screen flex flex-col">
        <AuthProvider>
          <AnimatedBackground />
          <Navbar />
          <main className="pt-24 pb-20 sm:pb-4 min-h-screen flex-1">{children}</main>
          <Footer />
          <BackToTop />
          <MobileNav />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background:     'rgba(15,15,20,0.9)',
                backdropFilter: 'blur(24px)',
                border:         '1px solid rgba(255,255,255,0.12)',
                color:          '#fff',
                fontFamily:     'var(--font-body)',
                borderRadius:   '14px',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}
