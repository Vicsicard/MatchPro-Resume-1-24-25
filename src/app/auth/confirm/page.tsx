'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/ssr'

export default function ConfirmPage() {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const confirmEmail = async () => {
      const token_hash = searchParams.get('token_hash')
      const type = searchParams.get('type')

      if (token_hash && type) {
        try {
          const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: 'email',
          })

          if (error) {
            setError(error.message)
          } else {
            setSuccess(true)
            // Redirect to account page after 2 seconds
            setTimeout(() => {
              router.push('/account')
            }, 2000)
          }
        } catch (err: any) {
          setError(err.message)
        }
      }
    }

    confirmEmail()
  }, [router, searchParams, supabase.auth])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-gray-800 rounded-xl shadow-lg">
        {error ? (
          <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4">
            <p>Error: {error}</p>
            <button
              onClick={() => router.push('/login')}
              className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Back to Login
            </button>
          </div>
        ) : success ? (
          <div className="bg-green-500/10 border border-green-500 text-green-500 rounded-lg p-4 text-center">
            <p>Email confirmed successfully!</p>
            <p className="text-sm mt-2">Redirecting to your account...</p>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        )}
      </div>
    </div>
  )
}
