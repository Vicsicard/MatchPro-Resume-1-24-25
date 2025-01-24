import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const supabase = createServerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Fetch subscription data
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', session.user.id)
    .single()

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Account Settings</h1>
      
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Profile Information</h2>
        <p className="text-gray-600 mb-2">Email: {session.user.email}</p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Subscription Status</h2>
        <p className="text-sm text-gray-500">
          Here&apos;s your account details and subscription status.
        </p>
        {subscription ? (
          <div>
            <p className="text-gray-600 mb-2">
              Status: <span className="capitalize">{subscription.status}</span>
            </p>
            {subscription.current_period_end && (
              <p className="text-gray-600 mb-4">
                Current Period Ends: {new Date(subscription.current_period_end).toLocaleDateString()}
              </p>
            )}
            <Link 
              href="/pricing" 
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Manage Subscription
            </Link>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 mb-4">You don't have an active subscription.</p>
            <Link 
              href="/pricing" 
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              View Plans
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
