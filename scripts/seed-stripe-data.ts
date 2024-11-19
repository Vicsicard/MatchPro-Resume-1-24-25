const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Make sure to add this to your .env.local

async function seedStripeData() {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing environment variables')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Create product
  const { data: product, error: productError } = await supabase
    .from('products')
    .insert([
      {
        name: 'Unlimited Resume Optimizer',
        description: 'AI-powered resume optimization with unlimited usage',
        active: true,
        metadata: {
          features: [
            'Unlimited AI Resume Analysis',
            'Real-time Optimization Suggestions',
            'Industry-specific Keywords',
            'ATS Compatibility Check',
            'Format Optimization',
            'Priority Support'
          ]
        }
      }
    ])
    .select()
    .single()

  if (productError) {
    console.error('Error creating product:', productError)
    process.exit(1)
  }

  console.log('Created product:', product)

  // Create price
  const { data: price, error: priceError } = await supabase
    .from('prices')
    .insert([
      {
        product_id: product.id,
        active: true,
        description: 'Monthly subscription',
        unit_amount: 1999, // $19.99
        currency: 'usd',
        type: 'recurring',
        interval: 'month',
        interval_count: 1
      }
    ])
    .select()
    .single()

  if (priceError) {
    console.error('Error creating price:', priceError)
    process.exit(1)
  }

  console.log('Created price:', price)
}

seedStripeData()
  .then(() => {
    console.log('Successfully seeded Stripe data')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Error seeding Stripe data:', error)
    process.exit(1)
  })
