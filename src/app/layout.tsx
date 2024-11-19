import './globals.css'
import './supabase.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Next.js SaaS Template',
  description: 'Next.js SaaS Template with Supabase, Stripe, and TailwindCSS',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="container">
          {children}
        </div>
      </body>
    </html>
  )
}
