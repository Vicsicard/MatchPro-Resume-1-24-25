import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/utils/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
})

const relevantEvents = new Set([
  'checkout.session.completed',
  'customer.subscription.updated',
  'customer.subscription.deleted'
])

export async function POST(req: Request) {
  const body = await req.text()
  const sig = headers().get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event: Stripe.Event

  try {
    if (!sig || !webhookSecret) {
      console.error('Missing stripe signature or webhook secret')
      return NextResponse.json(
        { error: 'Missing stripe signature or webhook secret' },
        { status: 400 }
      )
    }

    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(`❌ Error message: ${err.message}`)
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Unknown error occurred' },
      { status: 400 }
    )
  }

  if (relevantEvents.has(event.type)) {
    try {
      const supabase = createClient()

      switch (event.type) {
        case 'checkout.session.completed': {
          const checkoutSession = event.data.object as Stripe.Checkout.Session
          
          if (checkoutSession.subscription) {
            await supabase
              .from('subscriptions')
              .insert([
                {
                  user_id: checkoutSession.metadata?.userId,
                  stripe_subscription_id: checkoutSession.subscription,
                  stripe_customer_id: checkoutSession.customer,
                  stripe_price_id: checkoutSession.metadata?.priceId,
                  status: 'active'
                }
              ])
          }
          break
        }

        case 'customer.subscription.updated':
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription
          await supabase
            .from('subscriptions')
            .update({ status: subscription.status })
            .eq('stripe_subscription_id', subscription.id)
          break
        }

        default:
          throw new Error(`Unhandled relevant event: ${event.type}`)
      }
    } catch (error) {
      console.error(error)
      return NextResponse.json(
        { error: 'Webhook handler failed' },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({ received: true })
}
