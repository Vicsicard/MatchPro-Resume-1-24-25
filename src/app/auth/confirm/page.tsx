import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: { token_hash?: string; type?: string }
}) {
  const supabase = createClient()

  if (searchParams.token_hash && searchParams.type) {
    const { error } = await supabase.auth.verifyOtp({
      type: searchParams.type as 'email' | 'recovery' | 'invite',
      token_hash: searchParams.token_hash,
    })
    if (!error) {
      redirect('/account')
    }
  }

  return redirect('/login')
}
