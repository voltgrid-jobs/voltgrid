'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  return (
    <header className="border-b border-gray-800 bg-gray-950/90 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo-wordmark-transparent.png"
            alt="VoltGrid Jobs"
            width={160}
            height={40}
            className="h-9 w-auto"
            priority
          />
        </Link>

        <nav className="hidden md:flex items-center gap-5 text-sm text-gray-400">
          <Link href="/jobs" className="hover:text-white transition-colors">Browse Jobs</Link>
          <Link href="/employers" className="hover:text-white transition-colors">For Employers</Link>
          {user ? (
            <>
              <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
              <Link href="/account" className="hover:text-white transition-colors flex items-center gap-1">
                <span className="w-7 h-7 rounded-full bg-yellow-400/20 text-yellow-400 flex items-center justify-center text-xs font-bold">
                  {user.email?.[0].toUpperCase()}
                </span>
              </Link>
            </>
          ) : (
            <Link href="/auth/login" className="hover:text-white transition-colors">Sign In</Link>
          )}
          <Link href="/post-job" className="bg-yellow-400 text-gray-950 px-4 py-2 rounded-lg font-semibold hover:bg-yellow-300 transition-colors">
            Post a Job
          </Link>
        </nav>

        <button
          className="md:hidden text-gray-400 hover:text-white"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-gray-800 bg-gray-950 px-4 py-4 flex flex-col gap-4 text-sm">
          <Link href="/jobs" className="text-gray-400 hover:text-white" onClick={() => setMenuOpen(false)}>Browse Jobs</Link>
          <Link href="/employers" className="text-gray-400 hover:text-white" onClick={() => setMenuOpen(false)}>For Employers</Link>
          {user ? (
            <>
              <Link href="/dashboard" className="text-gray-400 hover:text-white" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <Link href="/account" className="text-gray-400 hover:text-white" onClick={() => setMenuOpen(false)}>My Account</Link>
            </>
          ) : (
            <Link href="/auth/login" className="text-gray-400 hover:text-white" onClick={() => setMenuOpen(false)}>Sign In</Link>
          )}
          <Link href="/post-job" className="bg-yellow-400 text-gray-950 px-4 py-2 rounded-lg font-semibold text-center hover:bg-yellow-300" onClick={() => setMenuOpen(false)}>
            Post a Job
          </Link>
        </div>
      )}
    </header>
  )
}
