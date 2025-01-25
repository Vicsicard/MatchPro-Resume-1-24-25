import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: { token_hash?: string; type?: string }
}) {
  const supabase = createClient()

  if (searchParams.token_hash && searchParams.type) {
    try {
      const { error } = await supabase.auth.verifyOtp({
        type: searchParams.type as 'email' | 'recovery' | 'invite',
        token_hash: searchParams.token_hash,
      })

      if (!error) {
        // Refresh session to ensure user is authenticated
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          return redirect('/account')
        } else {
          console.error('No session found after email confirmation')
          return redirect('/login?error=no_session')
        }
      } else {
        console.error('Email confirmation error:', error)
        return redirect('/login?error=confirmation_failed')
      }
    } catch (error) {
      console.error('Unexpected error during email confirmation:', error)
      return redirect('/login?error=unexpected_error')
    }
  }

  return redirect('/login?error=invalid_token')
}
