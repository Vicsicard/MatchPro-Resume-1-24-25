'use client'

import { login, signup } from './actions'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

interface AuthError {
  message: string;
}

export default function LoginPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const message = searchParams.get('message')
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState('')

  const handleSubmit = async (action: typeof login | typeof signup, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setFormError('')

    try {
      const formData = new FormData(e.currentTarget)
      const { error } = await action(formData)
      if (error) throw error
    } catch (error: unknown) {
      const authError = error as AuthError
      setFormError(authError.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-gray-800 rounded-xl shadow-lg">
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4 text-sm">
            {error}
          </div>
        )}
        {message && (
          <div className="bg-blue-500/10 border border-blue-500 text-blue-500 rounded-lg p-4 text-sm">
            {message}
          </div>
        )}
        {formError && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4 text-sm">
            {formError}
          </div>
        )}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Welcome back</h2>
          <p className="mt-2 text-sm text-gray-400">Sign in to your account or create a new one</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={(e) => handleSubmit(login, e)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isLoading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Loading...' : 'Log in'}
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={(e) => handleSubmit(signup, e)}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                isLoading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Loading...' : 'Sign up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
