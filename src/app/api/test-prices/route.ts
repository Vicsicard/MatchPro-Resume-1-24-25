import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Fetch prices with their associated products
    const { data: prices, error } = await supabase
      .from('prices')
      .select(`
        *,
        products (
          name,
          description,
          metadata
        )
      `)
      .eq('active', true)
      .order('unit_amount')

    if (error) {
      console.error('Error fetching prices:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ prices })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch prices' },
      { status: 500 }
    )
  }
}
