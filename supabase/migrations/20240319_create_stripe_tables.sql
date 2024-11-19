-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create prices table
CREATE TABLE IF NOT EXISTS prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  active boolean DEFAULT true,
  description text,
  unit_amount integer NOT NULL,
  currency text NOT NULL DEFAULT 'usd',
  type text NOT NULL DEFAULT 'recurring',
  interval text NOT NULL DEFAULT 'month',
  interval_count integer NOT NULL DEFAULT 1,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  status text NOT NULL,
  price_id uuid REFERENCES prices(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  cancel_at timestamp with time zone,
  canceled_at timestamp with time zone,
  current_period_start timestamp with time zone NOT NULL,
  current_period_end timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  ended_at timestamp with time zone,
  trial_start timestamp with time zone,
  trial_end timestamp with time zone,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Add RLS policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Products policy: everyone can read, only authenticated users can create
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

CREATE POLICY "Products can be created by authenticated users" ON products
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Prices policy: everyone can read, only authenticated users can create
CREATE POLICY "Prices are viewable by everyone" ON prices
  FOR SELECT USING (true);

CREATE POLICY "Prices can be created by authenticated users" ON prices
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Subscriptions policy: users can only view their own subscriptions
CREATE POLICY "Users can view their own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
