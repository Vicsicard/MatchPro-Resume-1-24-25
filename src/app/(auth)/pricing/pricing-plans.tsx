'use client'

import { Stripe, loadStripe } from '@stripe/stripe-js'
import { useState, useEffect } from 'react'

// Initialize stripe outside component to avoid re-initialization
let stripePromise: Promise<Stripe | null> | null = null

interface Price {
  id: string;
  product_id: string;
  active: boolean;
  unit_amount: number;
  currency: string;
  interval: string;
  metadata: {
    stripe_price_id: string;
  };
  products: {
    name: string;
    description: string;
    metadata: {
      stripe_product_id: string;
    };
  };
}

interface PricingPlansProps {
  prices: Price[]
}

export default function PricingPlans({ prices }: PricingPlansProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Initialize Stripe in useEffect to avoid SSR issues
    if (!stripePromise && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
    } 
  }, [])

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
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      window.location.href = data.url
    } catch (error: unknown) {
      const err = error as Error
      setError(err.message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
        <button
          onClick={() => setError(null)}
          className="text-blue-600 hover:text-blue-800 font-semibold"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-3 gap-8">
      {prices.map((price) => (
        <div
          key={price.id}
          className="border rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow"
        >
          <h3 className="text-2xl font-bold mb-4">{price.products.name}</h3>
          <div className="mb-4">
            <span className="text-4xl font-bold">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: price.currency,
                minimumFractionDigits: 0,
              }).format(price.unit_amount / 100)}
            </span>
            <span className="text-gray-600">/{price.interval}</span>
          </div>
          <p className="text-gray-600 mb-6">{price.products.description}</p>
          <ul className="mb-8 space-y-2">
            <li className="flex items-center">
              <svg
                className="h-5 w-5 text-green-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Unlimited Resume Optimizations
            </li>
            <li className="flex items-center">
              <svg
                className="h-5 w-5 text-green-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              AI-Powered Suggestions
            </li>
            <li className="flex items-center">
              <svg
                className="h-5 w-5 text-green-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              24/7 Support
            </li>
          </ul>
          <button
            onClick={() => handleSubscribe(price.id)}
            disabled={!!loading}
            className={`w-full py-2 px-4 rounded-md bg-blue-600 text-white font-semibold
              hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Processing...' : 'Subscribe'}
          </button>
        </div>
      ))}
    </div>
  )
}
