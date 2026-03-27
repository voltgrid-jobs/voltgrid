import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20 text-center">
      <div className="text-6xl mb-6">⚡</div>
      <h1 className="text-3xl font-bold text-white mb-4">Page not found</h1>
      <p className="text-gray-400 mb-8">This page doesn&apos;t exist or the job may have expired.</p>
      <Link
        href="/jobs"
        className="bg-yellow-400 text-gray-950 px-8 py-3 rounded-xl font-semibold hover:bg-yellow-300 transition-colors"
      >
        Browse All Jobs
      </Link>
    </div>
  )
}
