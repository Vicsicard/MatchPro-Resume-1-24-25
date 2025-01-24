# Vercel Deployment Guide

## Prerequisites
1. A Vercel account (sign up at vercel.com)
2. A Supabase project
3. A Stripe account

## Environment Variables
When deploying to Vercel, you'll need to set up the following environment variables in your Vercel project settings:

```env
NEXT_PUBLIC_SUPABASE_URL=            # Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=       # Your Supabase anonymous key
SUPABASE_SERVICE_ROLE_KEY=           # Your Supabase service role key
NEXT_SITE_URL=                       # Your Vercel deployment URL (e.g., https://your-project.vercel.app)
STRIPE_WEBHOOK_SECRET=               # Your Stripe webhook secret
STRIPE_SECRET_KEY=                   # Your Stripe secret key
NEXT_PUBLIC_STRIPE_PUBLISAHEBLE_KEY= # Your Stripe publishable key
```

## Deployment Steps

1. Push your code to GitHub

2. Connect to Vercel:
   - Go to vercel.com
   - Click "Add New Project"
   - Import your GitHub repository
   - Select the "Next.js" framework preset

3. Configure Environment Variables:
   - In your Vercel project settings, go to "Environment Variables"
   - Add all the required variables listed above
   - For NEXT_SITE_URL, use your Vercel deployment URL (you can update this after the first deployment)

4. Deploy:
   - Click "Deploy"
   - Vercel will automatically build and deploy your application

5. Set up Stripe Webhook:
   - In your Stripe dashboard, go to Developers > Webhooks
   - Add a new webhook endpoint: `https://your-vercel-url.vercel.app/api/stripe/webhook`
   - Select the events you want to listen to (typically payment and subscription events)
   - Copy the webhook secret and add it to your Vercel environment variables

6. Update Supabase Settings:
   - Go to your Supabase project settings
   - Under "Authentication" > "URL Configuration"
   - Add your Vercel URL as an authorized redirect URL
   - Format: `https://your-vercel-url.vercel.app/**`

## Post-Deployment Checklist
- [ ] Verify all environment variables are set in Vercel
- [ ] Test authentication flow
- [ ] Test Stripe payments
- [ ] Verify webhook functionality
- [ ] Check Supabase connections

## Automatic Deployments
Vercel will automatically deploy:
- Every push to the main branch
- Pull request previews (great for testing changes)

## Troubleshooting
If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables are set correctly
3. Ensure Supabase and Stripe configurations match your Vercel URL
