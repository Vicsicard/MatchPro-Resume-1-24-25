'use client'

import { signIn, signUp } from './actions'
import { useState } from 'react'

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = async (action: typeof signIn | typeof signUp, event: React.MouseEvent) => {
    console.group('LoginForm Submission')
    try {
      event.preventDefault()
      console.debug('Event prevented default behavior')
      
      setIsLoading(true)
      setFormError(null)
      console.debug('Loading state set to true')

      const form = event.currentTarget.closest('form')
      if (!form) {
        const errorMsg = 'Form not found'
        console.error(errorMsg)
        setFormError(errorMsg)
        setIsLoading(false)
        return
      }

      const formData = new FormData(form)
      console.debug('Form data collected:', Object.fromEntries(formData.entries()))

      console.log(`Starting ${action.name} action...`)
      const result = await action(formData) as { success?: boolean; redirect?: string; error?: string }
      console.log('Action completed successfully:', result)
      
      if (result?.success && result.redirect) {
        // Construct full URL from redirect path
        const redirectUrl = new URL(result.redirect, window.location.origin)
        window.location.href = redirectUrl.toString()
      } else if (result?.error) {
        setFormError(result.error)
      }
      
    } catch (error: unknown) {
      console.groupCollapsed('Error Details')
      if (error instanceof Error) {
        console.error('Error name:', error.name)
        console.error('Error message:', error.message)
        console.error('Stack trace:', error.stack)
        setFormError(error.message)
      } else if (typeof error === 'string') {
        console.error('Error string:', error)
        setFormError(error)
      } else {
        const errorMsg = 'An unexpected error occurred during authentication'
        console.error('Unknown error type:', error)
        setFormError(errorMsg)
      }
      console.groupEnd()
    } finally {
      setIsLoading(false)
      console.debug('Loading state reset to false')
      console.groupEnd()
    }
  }

  return (
    <form className="mt-8 space-y-6">
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
            autoComplete="username"
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
            autoComplete="current-password"
            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {formError && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4 text-sm">
          {formError}
        </div>
      )}

      <div className="flex space-x-4">
        <button
          type="button"
          disabled={isLoading}
          onClick={(e) => handleSubmit(signIn, e)}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Sign in
        </button>
        <button
          type="button"
          disabled={isLoading}
          onClick={(e) => handleSubmit(signUp, e)}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Sign up
        </button>
      </div>
    </form>
  )
}
