import { createClient as CreateServerClient } from '@/utils/supabase/server'
import { isEmpty } from 'lodash'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { z } from 'zod'
import Bottleneck from 'bottleneck'

// Schema for request validation
const CheckoutSchema = z.object({
  lookup_key: z.string().min(1)
})

export async function POST(request: Request) {
  // Validate request body
  let body: unknown
  let supabaseServer
  let lookup_key: string
  
  try {
    body = await request.json()
    const parsedBody = CheckoutSchema.parse(body)
    supabaseServer = CreateServerClient({})
    lookup_key = parsedBody.lookup_key
  } catch (error) {
    console.error('Invalid request body:', error)
    return NextResponse.json(
      { 
        error: 'Invalid request body',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 400 }
    )
  }

  // Initialize rate limiter
  const limiter = new Bottleneck({
    maxConcurrent: 5,
    minTime: 200
  })

  // Wrap Stripe API calls with retry logic
  const withRetry = async <T>(
    fn: () => Promise<T>,
    retries = 3,
    delay = 1000
  ): Promise<T> => {
    try {
      return await fn()
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay))
        return withRetry(fn, retries - 1, delay * 2)
      }
      throw error
    }
  }

  const { data } = await withRetry(async () => 
    await supabaseServer
      .from('profiles')
      .select('email, is_subscribed, name, stripe_customer_id')
      .single()
  )

  if (!data) {
    return NextResponse.json(
      { error: 'Profile data not found' },
      { status: 404 }
    )
  }

  const { email, is_subscribed, name } = data
  let { stripe_customer_id } = data

  // Create Stripe customer if it doesn't exist
  if (!stripe_customer_id && email) {
    const customer = await withRetry(async () => 
      await limiter.schedule(() => 
        stripe.customers.create({ email, name })
      )
    )

    if (!customer?.id) {
      return NextResponse.json(
        { error: 'Failed to create customer' },
        { status: 500 }
      )
    }

    stripe_customer_id = customer.id
    await withRetry(async () => 
      await supabaseServer
        .from('profiles')
        .update({ stripe_customer_id })
        .eq('email', email)
    )
  }

  // Lookup the plan price in Stripe
  if (email && lookup_key) {
    const { data: prices } = await withRetry(async () => 
      await limiter.schedule(() => 
        stripe.prices.list({
          expand: ['data.product'],
          lookup_keys: [lookup_key],
        })
      )
    )

    if (isEmpty(prices)) {
      return NextResponse.json(
        { error: 'No prices found for lookup key' },
        { status: 404 }
      )
    }

    const planPrice = prices?.[0]
    if (!planPrice) {
      return NextResponse.json(
        { error: 'Invalid price data' },
        { status: 500 }
      )
    }

    // Check if user is already subscribed
    if (is_subscribed) {
      // Get the existing subscription
      const subscriptions = await withRetry(async () => 
        await limiter.schedule(() => 
          stripe.subscriptions.list({
            customer: stripe_customer_id,
            status: 'active',
            limit: 1,
          })
        )
      )

      const activeSubscription = subscriptions.data?.[0]

      if (activeSubscription) {
        // Update the subscription with the new price ID
        await withRetry(async () => 
          await limiter.schedule(() => 
            stripe.subscriptions.update(activeSubscription.id, {
              items: [
                {
                  id: activeSubscription.items.data[0].id,
                  price: planPrice.id,
                },
              ],
            })
          )
        )
        return NextResponse.json({ 
          success: true, 
          message: 'Subscription updated',
          subscriptionId: activeSubscription.id
        })
      }
    }

    // Create a new checkout session if not subscribed
    const session = await withRetry(async () => 
      await limiter.schedule(() => 
        stripe.checkout.sessions.create({
          customer: stripe_customer_id,
          billing_address_collection: 'auto',
          line_items: [
            {
              price: planPrice.id,
              quantity: 1,
            },
          ],
          mode: 'subscription',
          success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
          cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}`,
        })
      )
    )

    return NextResponse.json({ 
      success: true, 
      session_id: session.id, 
      plan_id: planPrice.id, 
      url: session?.url 
    })
  }
}
