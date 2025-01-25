'use server'

import { createClient } from '@/utils/supabase/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Simple in-memory store implementation
class MemoryStore {
  private store: Map<string, number> = new Map()

  async incr(key: string): Promise<number> {
    const current = this.store.get(key) || 0
    this.store.set(key, current + 1)
    return current + 1
  }

  async get<TData>(key: string): Promise<TData | null> {
    const value = this.valueStore.get(key)
    if (value === undefined) return null
    try {
      return JSON.parse(value) as TData
    } catch {
      return null
    }
  }

  async reset(key: string): Promise<void> {
    this.store.delete(key)
  }

  private valueStore: Map<string, string> = new Map()

  async set<TData>(key: string, value: TData): Promise<TData | "OK" | null> {
    if (typeof value === 'number') {
      this.store.set(key, value)
      this.valueStore.set(key, value.toString())
      return value
    }
    // For non-number values, convert to string and store
    const stringValue = JSON.stringify(value)
    this.valueStore.set(key, stringValue)
    return "OK"
  }
}

// Initialize rate limiter with error handling
let ratelimit: Ratelimit

try {
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, '10 s'),
    analytics: true,
    timeout: 1000 // 1 second timeout
  })
} catch (error) {
  console.error('Failed to initialize rate limiter:', error)
  // Fallback to in-memory rate limiting if Redis fails
  ratelimit = new Ratelimit({
    redis: new MemoryStore(), // Use in-memory store
    limiter: Ratelimit.slidingWindow(5, '10 s'),
    analytics: true
  })
}

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  // Rate limiting
  const { success } = await ratelimit.limit(email)
  if (!success) {
    console.warn(`Rate limit exceeded for email: ${email}`)
    return JSON.stringify({ success: false, error: 'Too many attempts. Please try again later.' })
  }

  const supabase = createClient()

  try {
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.error('Sign in error:', {
        email,
        error: error.message,
        status: error.status
      })
      
      let errorMessage = 'Could not authenticate user'
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password'
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Please confirm your email before signing in'
      }

      return JSON.stringify({ success: false, error: errorMessage })
    }

    console.log('Successful sign in:', { email, userId: data.user?.id })
    return JSON.stringify({ success: true, redirect: '/account' })
  } catch (error) {
    console.error('Unexpected sign in error:', error)
    return JSON.stringify({ success: false, error: 'An unexpected error occurred. Please try again.' })
  }
}

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  // Rate limiting
  const { success } = await ratelimit.limit(email)
  if (!success) {
    console.warn(`Rate limit exceeded for email: ${email}`)
    return JSON.stringify({ success: false, error: 'Too many attempts. Please try again later.' })
  }

  const supabase = createClient()

  try {
    // Debug log environment variables
    console.log('Sign up environment:', {
      NEXT_SITE_URL: process.env.NEXT_SITE_URL,
      NODE_ENV: process.env.NODE_ENV
    })

    const redirectUrl = `${process.env.NEXT_SITE_URL}/auth/callback`
    if (!redirectUrl.startsWith('http')) {
      throw new Error(`Invalid redirect URL: ${redirectUrl}`)
    }

    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    })

    if (error) {
      console.error('Sign up error:', {
        email,
        error: error.message,
        status: error.status,
        details: error
      })
      
      let errorMessage = 'Could not create user'
      if (error.message.includes('User already registered')) {
        errorMessage = 'Email already registered. Please sign in instead.'
      } else if (error.message.includes('Password should be at least')) {
        errorMessage = 'Password must be at least 6 characters'
      } else if (error.message.includes('email must be a valid email')) {
        errorMessage = 'Please enter a valid email address'
      } else if (error.message.includes('password')) {
        errorMessage = 'Invalid password format'
      }

      return JSON.stringify({ 
        success: false, 
        error: errorMessage,
        details: error 
      })
    }

    console.log('Successful sign up:', { email, userId: data.user?.id })
    return JSON.stringify({ success: true, redirect: '/login?message=Check your email to continue the sign in process' })
  } catch (error) {
    console.error('Unexpected sign up error:', error)
    return JSON.stringify({ success: false, error: 'An unexpected error occurred. Please try again.' })
  }
}
