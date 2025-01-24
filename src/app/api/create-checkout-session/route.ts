import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-10-28.acacia',
  typescript: true,
})

const origin = process.env.NEXT_SITE_URL!

interface RequestBody {
  price: { id: string };
  quantity?: number;
  metadata?: { [key: string]: string };
}

export async function POST(req: Request) {
  try {
    const headersList = headers()
    const { price, quantity = 1, metadata = {} }: RequestBody = await req.json()

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: price.id,
          quantity
        }
      ],
      success_url: `${origin}/account`,
      cancel_url: `${origin}/pricing`,
      metadata
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 })
  }
}
