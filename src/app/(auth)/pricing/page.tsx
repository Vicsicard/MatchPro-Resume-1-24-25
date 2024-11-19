import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import PricingPlans from './pricing-plans'

export const dynamic = 'force-dynamic'

export default async function PricingPage() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Hardcoded product and price data
  const prices = [
    {
      id: 'price_1QMemHGEHfPiJwM4TihBXm2n',
      product_id: 'prod_RF94blp3I2PINl',
      active: true,
      unit_amount: 1999,
      currency: 'usd',
      interval: 'month',
      metadata: {
        stripe_price_id: 'price_1QMemHGEHfPiJwM4TihBXm2n'
      },
      products: {
        name: 'Unlimited Resume Optimizer',
        description: 'AI-powered resume optimization with unlimited usage',
        metadata: {
          stripe_product_id: 'prod_RF94blp3I2PINl'
        }
      }
    }
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-xl text-gray-600">
          Get started with our flexible pricing options
        </p>
      </div>
      
      <PricingPlans
        userId={session.user.id}
        userEmail={session.user.email!}
        prices={prices}
      />
    </div>
  )
}
