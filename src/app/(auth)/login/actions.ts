'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase'

export async function signIn(formData: FormData) {
  const supabase = createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })

  if (error) {
    return redirect('/login?error=Invalid email or password')
  }

  revalidatePath('/', 'layout')
  return redirect('/account')
}

export async function signUp(formData: FormData) {
  const supabase = createClient()

  const { error } = await supabase.auth.signUp({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      emailRedirectTo: `${process.env.NEXT_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    return redirect('/login?error=Could not authenticate user')
  }

  return redirect('/login?message=Check email to continue sign in process')
}
