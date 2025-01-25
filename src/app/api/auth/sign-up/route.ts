import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { email, password } = await request.json()
  
  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email and password are required' },
      { status: 400 }
    )
  }

  const supabase = createClient(true) // Use service role for sign-up
  
  try {
    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SITE_URL) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Server configuration error',
          details: {
            status: 500,
            code: 'missing_env_var'
          }
        },
        { status: 500 }
      )
    }

    // Ensure proper URL formatting
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
    const redirectUrl = `${baseUrl}/auth/confirm`

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    })

    if (error) {
      console.error('Signup error:', error)
      return NextResponse.json(
        { 
          success: false,
          error: error.message,
          details: {
            status: error.status,
            code: error.code
          }
        },
        { status: error.status || 500 }
      )
    }
    
    // If email confirmation is not required, redirect immediately
    if (data.user?.identities?.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'User already exists',
          details: {
            status: 409,
            code: 'user_already_exists'
          }
        },
        { status: 409 }
      )
    }
    
    // Check if email confirmation was sent
    if (!data.user?.email_confirmed_at && !data.user?.confirmation_sent_at) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Email confirmation not sent',
          details: {
            status: 500,
            code: 'email_not_sent'
          }
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      user: data.user,
      session: data.session,
      emailSent: !!data.user?.confirmation_sent_at
    })
    
  } catch (error: unknown) {
    console.error('Signup failed:', error)
    let errorMessage = 'Sign up failed'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
        details: {
          status: 500,
          code: 'unexpected_error'
        }
      },
      { status: 500 }
    )
  }
}
