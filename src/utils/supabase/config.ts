export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const SUPABASE_AUTH_CONFIG = {
  redirectTo: `${SITE_URL}/auth/callback`,
  flowType: 'pkce',
  autoRefreshToken: true,
  detectSessionInUrl: true,
  persistSession: true,
  cookies: {
    name: 'sb-auth-token',
    lifetime: 60 * 60 * 24 * 7, // 7 days
    domain: 'localhost',
    path: '/',
    sameSite: 'lax',
    secure: true,
  },
}
