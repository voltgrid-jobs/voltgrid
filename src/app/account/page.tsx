import { redirect } from 'next/navigation'

// Account page is now unified with the dashboard.
// Redirect all traffic here to /dashboard.
export default function AccountPage() {
  redirect('/dashboard')
}
