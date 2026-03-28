import { redirect } from 'next/navigation'

// /pricing is an alias for /employers (which has the full pricing table)
export default function PricingPage() {
  redirect('/employers')
}
