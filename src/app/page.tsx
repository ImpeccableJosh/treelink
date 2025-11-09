import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#A8E6CF] to-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
          Gather
        </h1>
        <p className="text-xl text-gray-600">
          Digital business cards with NFC-powered application workflows
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/dashboard">
            <Button>Get Started</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="secondary">Learn More</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
