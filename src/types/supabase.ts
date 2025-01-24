export interface Profile {
  id: string
  user_id: string
  full_name: string
  email: string
  avatar_url: string
  is_subscribed: boolean
  updated_at: string
}

export interface PricingPlan {
  id: string
  name: string
  description: string
  price_monthly: number
  price_yearly: number
  features: string[]
  most_popular: boolean
  cta: string
  slug: string
}

export interface Subscription {
  id: string
  user_id: string
  status: string
  stripe_customer_id: string
  stripe_subscription_id: string
  stripe_price_id: string
  created_at: string
  current_period_end: string
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'id' | 'created_at'>
        Update: Partial<Profile>
      }
      pricing_plans: {
        Row: PricingPlan
        Insert: Omit<PricingPlan, 'id'>
        Update: Partial<PricingPlan>
      }
      subscriptions: {
        Row: Subscription
        Insert: Omit<Subscription, 'id' | 'created_at'>
        Update: Partial<Subscription>
      }
    }
    Views: {
      [key: string]: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
      }
    }
    Functions: {
      [key: string]: {
        Args: Record<string, unknown>
        Returns: unknown
      }
    }
    Enums: {
      [key: string]: string[]
    }
  }
}
