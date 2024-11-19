'use client'

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import toast from 'react-hot-toast'

// Initialize stripe outside component to avoid re-initialization
let stripePromise: Promise<any> | null = null

interface Product {
  name: string
  description: string
  metadata: {
    stripe_product_id: string
  }
}

interface Price {
  id: string
  product_id: string
  unit_amount: number
  currency: string
  interval: string
  metadata: {
    stripe_price_id: string
  }
  products?: Product
}

interface PricingPlansProps {
  userId: string
  userEmail: string
  prices: Price[]
}

export default function PricingPlans({ userId, userEmail, prices }: PricingPlansProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [stripeError, setStripeError] = useState<boolean>(false)

  useEffect(() => {
    // Initialize Stripe in useEffect to avoid SSR issues
    if (!stripePromise && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
    } else if (!stripePromise) {
      setStripeError(true)
    }
  }, [])

  const handleSubscribe = async (priceId: string) => {
    try {
      setLoading(true)
      console.log('Creating checkout session for price:', priceId)

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId, // Use the priceId parameter instead of hardcoded value
          userId,
          userEmail,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create checkout session')
      }

      const data = await response.json()
      console.log('Checkout session created:', data)

      if (!data.url) {
        throw new Error('No checkout URL returned')
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch (error) {
      console.error('Error creating checkout session:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to start checkout')
    } finally {
      setLoading(false)
    }
  }

  if (stripeError) {
    return (
      <div className="text-center p-4">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Notice: </strong>
          <span className="block sm:inline">
            Payment system is currently unavailable. Please contact support.
          </span>
        </div>
      </div>
    )
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
          <h3 className="text-2xl font-bold mb-4">{price.products?.name}</h3>
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
          <p className="text-gray-600 mb-6">{price.products?.description}</p>
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
              ${loading === price.id ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {loading === price.id ? 'Processing...' : 'Subscribe'}
          </button>
        </div>
      ))}
    </div>
  )
}
