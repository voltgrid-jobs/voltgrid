import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Job Posted! — VoltGrid Jobs',
}

export default function SuccessPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20 text-center">
      <div className="text-6xl mb-6">⚡</div>
      <h1 className="text-3xl font-bold text-white mb-4">Your job is live!</h1>
      <p className="text-gray-400 text-lg mb-8">
        Your listing is now live on VoltGrid Jobs and will be seen by electricians,
        HVAC techs, and low voltage specialists looking for data center work.
      </p>
      <p className="text-gray-500 mb-10">
        A confirmation has been sent to your email. Your listing will remain active for 30 days.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/jobs"
          className="bg-yellow-400 text-gray-950 px-8 py-3 rounded-xl font-semibold hover:bg-yellow-300 transition-colors"
        >
          View All Jobs
        </Link>
        <Link
          href="/post-job"
          className="border border-gray-700 text-gray-300 px-8 py-3 rounded-xl font-semibold hover:border-gray-500 hover:text-white transition-colors"
        >
          Post Another Job
        </Link>
      </div>
    </div>
  )
}
