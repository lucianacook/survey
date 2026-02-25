# Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up (free account)
2. Click "New Project"
3. Choose organization (or create new one)
4. Project settings:
   - **Name:** `wellness-survey`
   - **Database Password:** Generate strong password (SAVE THIS!)
   - **Region:** Choose closest to your target users (US East, EU West, etc.)
5. Wait 2 minutes for project to provision

## Step 2: Run Database Migration

1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
4. Paste into the SQL editor
5. Click **"Run"** (bottom right)
6. Verify tables created: Go to **"Table Editor"** and you should see:
   - `survey_responses`
   - `follow_up_contacts`
   - `rate_limits`

## Step 3: Enable Anonymous Authentication

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Find "Anonymous" provider
3. Toggle it **ON**
4. No additional configuration needed

## Step 4: Get Your API Keys

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public key** (starts with `eyJhbGc...`)
   - **service_role key** (starts with `eyJhbGc...`) - Keep this SECRET!

3. Save these in a secure location (you'll need them for deployment)

## Step 5: Install Supabase CLI and Deploy Edge Functions

**Install Supabase CLI:**
```bash
npm install -g supabase
supabase login
```

**Link to your project:**
```bash
cd /Users/LC/projects/survey
supabase init
supabase link --project-ref YOUR_PROJECT_REF
```

Find YOUR_PROJECT_REF: Settings → General → Reference ID (it's the part of your URL after `https://` and before `.supabase.co`)

**Deploy Edge Functions:**
```bash
supabase functions deploy survey-init
supabase functions deploy survey-save
supabase functions deploy survey-submit
supabase functions deploy contact-submit
```

## Step 6: Update Frontend Configuration

In `wellness_survey.html`, find these lines around line 520 and update them:

```javascript
const SUPABASE_URL = 'https://YOUR_PROJECT_REF.supabase.co'; // Replace with your Project URL
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY'; // Replace with your anon public key
```

## Step 7: Create Admin User Account

1. In Supabase dashboard, go to **Authentication** → **Users**
2. Click **"Add User"** → **"Create new user"**
3. Enter your email and a strong password
4. Click **"Create User"**
5. Use these credentials to log into the admin dashboard

## Troubleshooting

**If edge functions fail to deploy:**
- Make sure you're logged in: `supabase login`
- Check you've linked the project: `supabase link --project-ref YOUR_REF`
- Verify your project ref is correct in Settings → General

**If anonymous auth doesn't work:**
- Double-check it's enabled in Authentication → Providers
- Check browser console for error messages

**If database migration fails:**
- Make sure you copied the ENTIRE SQL file
- Check for any SQL syntax errors in the editor
- Try running each CREATE TABLE statement separately

## Next Steps

Once Supabase is set up, you can:
1. Update the frontend HTML with your API keys
2. Build and deploy the admin dashboard
3. Test the complete flow locally
4. Deploy to GitHub Pages

## Cost

Supabase free tier includes:
- 500MB database (10,000+ survey responses)
- 50,000 monthly active users
- 2GB file storage
- **$0/month forever**

You won't need to upgrade unless you get 10,000+ responses or need advanced features.
