# Supabase Setup Instructions

## 1. Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Fill in project details:
   - Name: Your project name
   - Database Password: Create a secure password
   - Region: Choose nearest to your users
   - Pricing Plan: Free tier is sufficient for starting

## 2. Get Project Credentials

1. In your Supabase project dashboard, go to Project Settings
2. Find the "API" section
3. Copy these values:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

## 3. Set Up Database Schema

Run these SQL commands in Supabase SQL Editor:

```sql
-- Create profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT,
    last_name TEXT,
    email TEXT UNIQUE,
    picture TEXT,
    name TEXT,
    is_subscribed BOOLEAN DEFAULT FALSE,
    plan_id UUID REFERENCES pricing_plans(id) ON DELETE SET NULL,
    stripe_customer_id TEXT,
    last_plan_update TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE
    ON profiles
    FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- Create trigger for creating profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, first_name, last_name, email, picture, name)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data ->>'first_name',
        NEW.raw_user_meta_data ->>'last_name',
        NEW.raw_user_meta_data ->>'email',
        COALESCE(NEW.raw_user_meta_data ->>'picture', NEW.raw_user_meta_data ->>'avatar_url'),
        NEW.raw_user_meta_data ->>'name'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

## 4. Configure Authentication Providers

### GitHub OAuth Setup:
1. Go to GitHub Developer Settings
2. Create new OAuth App
3. Set Authorization callback URL to:
   `https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback`
4. Copy Client ID and Client Secret
5. In Supabase Dashboard:
   - Go to Authentication > Providers
   - Enable GitHub
   - Paste Client ID and Client Secret

### LinkedIn OAuth Setup:
1. Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/)
2. Create new app
3. Set OAuth 2.0 redirect URL to:
   `https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback`
4. Copy Client ID and Client Secret
5. In Supabase Dashboard:
   - Go to Authentication > Providers
   - Enable LinkedIn
   - Paste Client ID and Client Secret

## 5. Environment Variables Setup

1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Fill in the values:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_SITE_URL=http://localhost:3216
```

## 6. Row Level Security (RLS) Policies

Run these SQL commands to set up basic security policies:

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone."
    ON profiles FOR SELECT
    USING ( true );

CREATE POLICY "Users can insert their own profile."
    ON profiles FOR INSERT
    WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile."
    ON profiles FOR UPDATE
    USING ( auth.uid() = id );
```

## Testing Authentication

1. Start the development server:
```bash
yarn dev
```

2. Visit http://localhost:3216/login
3. Test both GitHub and LinkedIn login flows
4. Verify user data is being stored in profiles table

## Troubleshooting

1. **OAuth Callback Issues**:
   - Verify callback URLs are correct
   - Check provider settings in Supabase dashboard
   - Ensure environment variables are set correctly

2. **Database Issues**:
   - Check RLS policies
   - Verify trigger functions
   - Look for SQL errors in Supabase logs

3. **Auth State Issues**:
   - Clear browser cookies/local storage
   - Check browser console for errors
   - Verify Supabase client initialization

## Additional Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Next.js Auth Helper](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
