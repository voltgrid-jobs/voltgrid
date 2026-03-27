import type { Metadata } from 'next'
import { PostJobForm } from '@/components/jobs/PostJobForm'

export const metadata: Metadata = {
  title: 'Post a Job — VoltGrid Jobs',
}

export default function PostJobPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Post a Job</h1>
        <p className="text-gray-400">
          Reach electricians, HVAC techs, and low voltage specialists actively looking for data center work.
        </p>
      </div>
      <PostJobForm />
    </div>
  )
}
