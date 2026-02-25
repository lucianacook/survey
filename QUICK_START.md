# Quick Start Guide

Get your wellness survey live in 1-2 hours. Follow these steps in order.

---

## Step 1: Supabase Setup (30 min)

### 1.1 Create Account & Project
1. Go to [supabase.com](https://supabase.com) → Sign up (free)
2. Click "New Project"
3. Project name: `wellness-survey`
4. Generate strong database password → **SAVE IT!**
5. Region: Choose closest to your users
6. Wait 2 minutes for project creation

### 1.2 Run Database Migration
1. In Supabase dashboard: **SQL Editor** (left sidebar)
2. Click "New Query"
3. Open `supabase/migrations/001_initial_schema.sql`
4. Copy **entire file** → Paste into SQL editor
5. Click "Run" (bottom right)
6. Verify: Go to **Table Editor** → See 3 tables:
   - `survey_responses`
   - `follow_up_contacts`
   - `rate_limits`

### 1.3 Enable Anonymous Auth
1. Go to **Authentication** → **Providers**
2. Find "Anonymous" → Toggle **ON**

### 1.4 Get API Keys
1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (starts with `eyJhbGc...`)
3. **Save both** in a secure note

---

## Step 2: Deploy Edge Functions (15 min)

### 2.1 Install Supabase CLI
```bash
npm install -g supabase
supabase login
```

### 2.2 Link Project
```bash
cd /Users/LC/projects/survey
supabase init
supabase link --project-ref YOUR_PROJECT_REF
```

Find YOUR_PROJECT_REF:
- Supabase dashboard → **Settings** → **General** → **Reference ID**
- It's the part of your URL between `https://` and `.supabase.co`

### 2.3 Deploy Functions
```bash
supabase functions deploy survey-init
supabase functions deploy survey-save
supabase functions deploy survey-submit
supabase functions deploy contact-submit
```

Verify: Supabase dashboard → **Edge Functions** → All 4 should show "deployed"

---

## Step 3: Configure Survey (5 min)

### 3.1 Update API Keys
Open `wellness_survey.html` in your editor.

**Find line ~520** and update:
```javascript
const SUPABASE_URL = 'https://YOUR_PROJECT_REF.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
```

Replace with your actual values from Step 1.4.

### 3.2 Update Contact Email
**Find line ~527** and update:
```html
<a href="mailto:your@email.com">your@email.com</a>
```

Change to your actual email.

---

## Step 4: Test Locally (10 min)

### 4.1 Test Survey
```bash
# Open survey in browser
open wellness_survey.html
```

1. Check consent box → Click "Let's get started"
2. Answer 5 questions
3. Close browser
4. Reopen `wellness_survey.html` → Verify progress restored
5. Complete survey → Submit
6. Check Supabase: **Table Editor** → **survey_responses** → See new row

### 4.2 Test Duplicate Prevention
1. Try to take survey again in same browser
2. Should see "Already submitted" screen
3. Open incognito window → Should allow new submission

---

## Step 5: Set Up Admin Dashboard (10 min)

### 5.1 Update Admin Config
Open `admin-dashboard/src/App.js` in your editor.

**Find line ~8** and update:
```javascript
const supabase = createClient(
  'https://YOUR_PROJECT_REF.supabase.co',
  'YOUR_ANON_KEY'
);
```

### 5.2 Create Admin User
1. Supabase dashboard → **Authentication** → **Users**
2. Click "Add User" → "Create new user"
3. Enter your email and strong password
4. Click "Create User"
5. **Save credentials** in password manager

### 5.3 Install Dependencies & Test
```bash
cd admin-dashboard
npm install
npm start
```

Opens at http://localhost:3000:
1. Login with admin credentials
2. Should see your test response
3. Click through all tabs (Overview, Responses, Contacts, Analytics)
4. Export CSV to test download
5. Press Ctrl+C to stop server

---

## Step 6: Deploy to GitHub Pages (20 min)

### 6.1 Deploy Survey

**Initialize Git:**
```bash
cd /Users/LC/projects/survey
git init
git add .
git commit -m "Initial commit: wellness survey"
```

**Create GitHub Repo:**
1. Go to github.com → Click "New repository"
2. Name: `wellness-survey`
3. **Don't** initialize with README
4. Copy the repository URL

**Push to GitHub:**
```bash
git remote add origin https://github.com/YOUR_USERNAME/wellness-survey.git
git branch -M main
git push -u origin main
```

**Enable GitHub Pages:**
1. Go to your repo → **Settings** → **Pages**
2. Source: Branch `main`, folder `/ (root)`
3. Click **Save**
4. Wait 2-3 minutes

Your survey is now live at:
```
https://YOUR_USERNAME.github.io/wellness-survey/wellness_survey.html
```

### 6.2 Deploy Admin Dashboard

**Build & Deploy:**
```bash
cd admin-dashboard
npm run build
cd build
git init
git add .
git commit -m "Deploy admin dashboard"
```

**Create GitHub Repo:**
1. Go to github.com → New repository
2. Name: `wellness-survey-admin`
3. Copy URL

**Push:**
```bash
git remote add origin https://github.com/YOUR_USERNAME/wellness-survey-admin.git
git branch -M main
git push -u origin main
```

**Enable GitHub Pages:**
1. Repo Settings → Pages
2. Source: Branch `main`, folder `/ (root)`
3. Click Save
4. Wait 2-3 minutes

Your dashboard is now live at:
```
https://YOUR_USERNAME.github.io/wellness-survey-admin/
```

### 6.3 Update CORS

**Important:** Update edge functions to allow your domain.

In each function file (`supabase/functions/*/index.ts`), find:
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
```

Change to:
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://YOUR_USERNAME.github.io',
```

**Redeploy all functions:**
```bash
supabase functions deploy survey-init
supabase functions deploy survey-save
supabase functions deploy survey-submit
supabase functions deploy contact-submit
```

---

## Step 7: Production Test (10 min)

### Test Complete Flow
1. Open deployed survey URL (from Step 6.1)
2. Complete entire survey
3. Submit with follow-up contact
4. Open deployed admin dashboard URL (from Step 6.2)
5. Login
6. Verify response appears
7. Verify contact appears
8. Export CSV
9. Check analytics charts

### Test on Mobile
1. Open survey on your phone
2. Complete survey
3. Verify it works smoothly

---

## Step 8: Launch! 🚀

### Bookmark These URLs
- Survey: `https://YOUR_USERNAME.github.io/wellness-survey/wellness_survey.html`
- Admin: `https://YOUR_USERNAME.github.io/wellness-survey-admin/`
- Supabase: `https://supabase.com/dashboard/project/YOUR_PROJECT_REF`

### Share Your Survey

**Sample Message:**
> I'm conducting research for an early-stage startup focused on mental wellness. This 5-10 minute survey helps me understand the habits, tools, and practices people use to better understand themselves. Your honest input is anonymous and incredibly valuable.
>
> Survey: [your-survey-url]
>
> Thank you!

**Where to Share:**
- LinkedIn (your network)
- Twitter/X
- Email to friends/colleagues
- Relevant Reddit communities (r/SampleSize, r/mentalhealth)
- Discord servers
- Facebook groups

### Monitor Progress
1. Check admin dashboard daily (first week)
2. Watch for completion rate
3. Respond to follow-up contacts
4. Export weekly backups

---

## 📋 Quick Troubleshooting

**Survey not saving?**
- Check browser console for errors
- Verify API keys in `wellness_survey.html`
- Check Supabase Functions logs

**Admin dashboard blank?**
- Verify you created admin user in Supabase
- Check API keys in `App.js`
- Look for errors in browser console

**CORS errors?**
- Update corsHeaders in all 4 edge functions
- Redeploy functions
- Make sure domain matches exactly (including https://)

**"Already submitted" appearing wrong?**
- Clear browser localStorage
- Try incognito mode
- Check rate_limits table in Supabase

---

## 🎯 Success Checklist

You're ready to launch when:
- ✅ Survey loads on deployed URL
- ✅ Submissions save to Supabase
- ✅ Admin dashboard shows responses
- ✅ CSV export works
- ✅ Mobile version works
- ✅ Tested with 2-3 friends successfully

---

## 📚 Full Documentation

For detailed information, see:
- **README.md** - Complete system documentation
- **SUPABASE_SETUP.md** - Detailed Supabase configuration
- **DEPLOYMENT_CHECKLIST.md** - Comprehensive deployment checklist

---

## 💰 Cost

**Total: $0/month**
- Supabase free tier: 500MB database (10,000+ responses)
- GitHub Pages: Unlimited static hosting
- No credit card required!

---

## ⏱️ Time Estimate

- Supabase setup: 30 min
- Edge functions: 15 min
- Configuration: 5 min
- Local testing: 10 min
- Admin setup: 10 min
- Deployment: 20 min
- **Total: ~90 minutes**

---

## 🆘 Need Help?

1. Check browser console for errors
2. Review Supabase logs
3. Verify all steps completed in order
4. Test in incognito mode
5. Check DEPLOYMENT_CHECKLIST.md

---

**You're all set! Time to collect some data! 🎉**
