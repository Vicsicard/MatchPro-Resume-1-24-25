'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'

interface User {
  id: string;
  email: string;
}

interface Subscription {
  id: string;
  status: string;
  current_period_end: string;
  prices: {
    products: {
      name: string;
    };
    unit_amount: number;
    interval: string;
  };
}

interface SubscriptionError {
  message: string;
}

interface SubscriptionFormProps {
  user: User;
  subscription?: Subscription;
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function SubscriptionForm({ user, subscription }: SubscriptionFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubscribe = async (priceId: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId: user.id,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      const stripe = await stripePromise

      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId })
        if (error) {
          throw error
        }
      }
    } catch (error: unknown) {
      setError((error as SubscriptionError).message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleManageSubscription = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      window.location.href = data.url
    } catch (error: unknown) {
      setError((error as SubscriptionError).message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-500 text-red-700 p-4 rounded-md">
          {error}
        </div>
      )}
      {subscription ? (
        <div className="bg-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-white">
                {subscription.prices?.products?.name}
              </h3>
              <p className="text-gray-300">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }).format(subscription.prices?.unit_amount / 100)}{' '}
                / {subscription.prices?.interval}
              </p>
            </div>
            <button
              onClick={handleManageSubscription}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Manage Subscription'}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gray-700 rounded-lg p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-white">Pro Plan</h3>
                <p className="text-gray-300">$9.99 / month</p>
              </div>
              <button
                onClick={() => handleSubscribe('price_H5ggYwtDq4fbrJ')}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Subscribe'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
