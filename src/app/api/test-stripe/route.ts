import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
})

export async function GET() {
  try {
    const price = await stripe.prices.retrieve('price_1QMemHGEHfPiJwM4TihBXm2n')
    return NextResponse.json({ 
      priceId: price.id,
      productId: price.product,
      unitAmount: price.unit_amount,
      currency: price.currency
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to retrieve price' }, { status: 500 })
  }
}
