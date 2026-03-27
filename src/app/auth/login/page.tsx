import type { Metadata } from 'next'
import { AuthForm } from '@/components/auth/AuthForm'

export const metadata: Metadata = { title: 'Sign In — VoltGrid Jobs' }

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">⚡</div>
          <h1 className="text-2xl font-bold text-white">Sign in to VoltGrid</h1>
          <p className="text-gray-400 mt-2">Save jobs and get alerts for new listings</p>
        </div>
        <AuthForm mode="login" />
      </div>
    </div>
  )
}
