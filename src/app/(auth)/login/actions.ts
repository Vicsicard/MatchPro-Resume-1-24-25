'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function login(formData: FormData) {
  try {
    const supabase = createServerActionClient({ cookies })

    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    // Validate inputs
    if (!data.email || !data.password) {
      return redirect('/login?error=' + encodeURIComponent('Email and password are required'))
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
      console.error('Login error:', error)
      return redirect('/login?error=' + encodeURIComponent(error.message))
    }

    revalidatePath('/', 'layout')
    redirect('/account')
  } catch (error) {
    console.error('Unexpected error during login:', error)
    return redirect('/login?error=' + encodeURIComponent('An unexpected error occurred'))
  }
}

export async function signup(formData: FormData) {
  try {
    const supabase = createServerActionClient({ cookies })

    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    // Validate inputs
    if (!data.email || !data.password) {
      return redirect('/login?error=' + encodeURIComponent('Email and password are required'))
    }

    if (data.password.length < 6) {
      return redirect('/login?error=' + encodeURIComponent('Password must be at least 6 characters'))
    }

    const { error } = await supabase.auth.signUp({
      ...data,
      options: {
        emailRedirectTo: `${process.env.NEXT_SITE_URL}/auth/callback`,
      },
    })

    if (error) {
      console.error('Signup error:', error)
      return redirect('/login?error=' + encodeURIComponent(error.message))
    }

    return redirect('/login?message=' + encodeURIComponent('Check your email for the confirmation link'))
  } catch (error) {
    console.error('Unexpected error during signup:', error)
    return redirect('/login?error=' + encodeURIComponent('An unexpected error occurred'))
  }
}
