import Link from 'next/link'
import Button from '@/components/ui/Button'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 min-h-[60vh] text-center px-4">
      <span className="font-display text-8xl font-bold text-white/10">404</span>
      <div className="space-y-2">
        <p className="font-display text-2xl text-white/50">Page not found</p>
        <p className="text-sm text-white/25 font-body">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>
      <Link href="/">
        <Button variant="primary">
          <Home className="h-4 w-4" /> Back to Home
        </Button>
      </Link>
    </div>
  )
}
