'use client'

import { useState, useEffect } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'

interface Profile {
  id: string
  user_id: string
  full_name: string
  avatar_url: string
  updated_at: string
}

interface UseUserProfileProps {
  supabaseService: SupabaseClient
}

export function useUserProfile({ supabaseService }: UseUserProfileProps) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      if (!supabaseService) return
      setLoading(true)

      try {
        const { data, error } = await supabaseService
          .from('profiles')
          .select('*')
          .single()

        if (error) throw error
        setProfile(data)
      } catch (error) {
        console.error('Error loading profile:', error)
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }

    if (supabaseService) {
      loadProfile()
    }
  }, [supabaseService])

  return { profile, loading }
}
