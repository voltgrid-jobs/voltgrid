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
    <header style={{ borderBottom: '1px solid var(--border)', background: 'rgba(10,10,10,0.92)', backdropFilter: 'blur(8px)', position: 'sticky', top: 0, zIndex: 50 }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo-wordmark-transparent.png"
            alt="VoltGrid Jobs"
            width={233}
            height={36}
            className="h-8 w-auto"
            priority
            unoptimized
          />
        </Link>

        <nav className="hidden md:flex items-center gap-1 text-sm">
          {[
            { href: '/jobs', label: 'Browse Jobs' },
            { href: '/trades', label: 'Trades' },
            { href: '/locations', label: 'Locations' },
            { href: '/employers', label: 'For Employers' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-3 py-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--fg-muted)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--fg)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-muted)')}
            >
              {label}
            </Link>
          ))}
          {user ? (
            <>
              <Link href="/dashboard" className="px-3 py-1.5 rounded-lg transition-colors" style={{ color: 'var(--fg-muted)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--fg)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-muted)')}>
                Dashboard
              </Link>
              <Link href="/account" className="ml-1 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: 'var(--yellow-dim)', color: 'var(--yellow)' }}>
                {user.email?.[0].toUpperCase()}
              </Link>
            </>
          ) : (
            <Link href="/auth/login" className="px-3 py-1.5 rounded-lg transition-colors" style={{ color: 'var(--fg-muted)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--fg)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-muted)')}>
              Sign In
            </Link>
          )}
          <Link
            href="/post-job"
            className="ml-2 px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
            style={{ background: 'var(--yellow)', color: '#0A0A0A' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Post a Job
          </Link>
        </nav>

        <button
          className="md:hidden p-1"
          style={{ color: 'var(--fg-muted)' }}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div style={{ borderTop: '1px solid var(--border)', background: 'var(--bg)' }} className="md:hidden px-4 py-4 flex flex-col gap-3 text-sm">
          {[
            { href: '/jobs', label: 'Browse Jobs' },
            { href: '/trades', label: 'Trades' },
            { href: '/locations', label: 'Locations' },
            { href: '/employers', label: 'For Employers' },
          ].map(({ href, label }) => (
            <Link key={href} href={href} style={{ color: 'var(--fg-muted)' }} onClick={() => setMenuOpen(false)}>{label}</Link>
          ))}
          {user ? (
            <>
              <Link href="/dashboard" style={{ color: 'var(--fg-muted)' }} onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <Link href="/account" style={{ color: 'var(--fg-muted)' }} onClick={() => setMenuOpen(false)}>My Account</Link>
            </>
          ) : (
            <Link href="/auth/login" style={{ color: 'var(--fg-muted)' }} onClick={() => setMenuOpen(false)}>Sign In</Link>
          )}
          <Link href="/post-job"
            className="px-4 py-2.5 rounded-lg font-semibold text-center"
            style={{ background: 'var(--yellow)', color: '#0A0A0A' }}
            onClick={() => setMenuOpen(false)}>
            Post a Job
          </Link>
        </div>
      )}
    </header>
  )
}
