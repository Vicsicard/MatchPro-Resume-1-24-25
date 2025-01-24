import { LoginForm } from './LoginForm'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; message?: string }
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-gray-800 rounded-xl shadow-lg">
        {searchParams.error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4 text-sm">
            {searchParams.error}
          </div>
        )}
        {searchParams.message && (
          <div className="bg-blue-500/10 border border-blue-500 text-blue-500 rounded-lg p-4 text-sm">
            {searchParams.message}
          </div>
        )}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Welcome back</h2>
          <p className="mt-2 text-sm text-gray-400">Sign in to your account or create a new one</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
