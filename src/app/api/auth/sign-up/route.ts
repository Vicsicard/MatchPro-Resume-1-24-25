import { createClient } from '@/utils/supabase/client'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { email, password } = await request.json()
  
  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email and password are required' },
      { status: 400 }
    )
  }

  const supabase = createClient()
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_SITE_URL}/auth/confirm`
      }
    })

    if (error) throw error
    
    return NextResponse.json({ 
      success: true,
      user: data.user 
    })
    
  } catch (error: unknown) {
    let errorMessage = 'Sign up failed'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
