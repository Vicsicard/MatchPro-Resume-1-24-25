import { NextResponse } from 'next/server'
import Stripe from 'stripe'

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

interface RequestBody {
  priceId: string;
  userId: string;
  userEmail: string;
}

export async function POST(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe key not configured' }, { status: 500 })
  }

  try {
    const { priceId, userId, userEmail }: RequestBody = await req.json()

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: userEmail,
      success_url: `${process.env.NEXT_SITE_URL}/account`,
      cancel_url: `${process.env.NEXT_SITE_URL}/pricing`,
      metadata: { userId }
    })

    return NextResponse.json({ url: session.url })
  } catch (error: Error) {
    console.error('Stripe error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
