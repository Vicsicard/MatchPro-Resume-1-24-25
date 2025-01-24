import { createClient } from '@/utils/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createClient()

    // Fetch prices with their associated products
    const { data: prices, error } = await supabase
      .from('prices')
      .select('*, products(*)')
      .eq('active', true)
      .order('unit_amount', { ascending: true })

    if (error) throw error

    return NextResponse.json({ prices })
  } catch (error) {
    console.error('Error fetching prices:', error)
    return NextResponse.json({ error: 'Failed to fetch prices' }, { status: 500 })
  }
}
