import { createClient } from '@/utils/supabase'
import PricingPlans from './pricing-plans'

export const dynamic = 'force-dynamic'

export default async function PricingPage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return null
  }

  const { data: prices } = await supabase
    .from('prices')
    .select('*, products(*)')
    .eq('active', true)
    .order('unit_amount', { ascending: true })

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="sm:align-center sm:flex sm:flex-col">
        <h1 className="text-4xl font-extrabold text-white sm:text-center">Pricing Plans</h1>
        <p className="mt-5 text-xl text-zinc-200 sm:text-center">
          Start building for free, then add a site plan to go live. Account plans unlock additional features.
        </p>
      </div>
      <div className="mt-12 space-y-4 sm:mt-16 sm:grid sm:grid-cols-2 sm:gap-6 sm:space-y-0 lg:mx-auto lg:max-w-4xl xl:mx-0 xl:max-w-none xl:grid-cols-3">
        <PricingPlans prices={prices || []} />
      </div>
    </div>
  )
}
