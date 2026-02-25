# Wellness Survey - Production System

A production-ready mental wellness research survey with anonymous data collection, duplicate prevention, save/resume functionality, and admin analytics dashboard.

## 🎯 Features

- **Survey Features:**
  - 17 adaptive questions across 5 sections
  - Anonymous data collection with Supabase
  - Browser fingerprinting for ~80% duplicate prevention
  - Auto-save progress every 30 seconds
  - Resume incomplete surveys
  - Optional follow-up contact collection (stored separately)

- **Admin Dashboard:**
  - View all survey responses
  - Manage follow-up contacts
  - Export data to CSV
  - Analytics visualizations with charts
  - Track response rates and conversion metrics

- **Cost:** $0/month using free tiers (Supabase + GitHub Pages)

---

## 📁 Project Structure

```
survey/
├── wellness_survey.html          # Main survey (ready to deploy)
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql    # Database schema
│   └── functions/
│       ├── survey-init/              # Session initialization
│       ├── survey-save/              # Progress saving
│       ├── survey-submit/            # Final submission
│       └── contact-submit/           # Contact info
├── admin-dashboard/              # React admin app
│   ├── src/
│   │   ├── App.js               # Main dashboard component
│   │   └── App.css              # Dashboard styles
│   └── package.json
├── SUPABASE_SETUP.md            # Detailed Supabase setup guide
└── README.md                    # This file
```

---

## 🚀 Quick Start (Step-by-Step)

### Phase 1: Supabase Backend Setup (30 minutes)

**Follow the detailed guide in `SUPABASE_SETUP.md`**

Summary:
1. Create free Supabase account at [supabase.com](https://supabase.com)
2. Create new project (save database password!)
3. Run SQL migration from `supabase/migrations/001_initial_schema.sql`
4. Enable anonymous authentication
5. Install Supabase CLI and deploy edge functions
6. Copy API keys (Project URL + anon key)

### Phase 2: Configure Frontend (5 minutes)

1. **Update `wellness_survey.html`** (around line 520):

```javascript
const SUPABASE_URL = 'https://YOUR_PROJECT_REF.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
```

Replace with your actual Supabase credentials from Settings → API.

2. **Update email in "Already Submitted" screen** (line 527):
```html
<a href="mailto:your@email.com">your@email.com</a>
```

### Phase 3: Configure Admin Dashboard (5 minutes)

1. **Update `admin-dashboard/src/App.js`** (around line 8):

```javascript
const supabase = createClient(
  'https://YOUR_PROJECT_REF.supabase.co',
  'YOUR_ANON_KEY'
);
```

2. **Create admin user account:**
   - Go to Supabase dashboard → Authentication → Users
   - Click "Add User" → "Create new user"
   - Enter your email and password
   - Save these credentials to log into dashboard

### Phase 4: Test Locally (10 minutes)

1. **Test survey:**
   ```bash
   # Open wellness_survey.html in browser
   open wellness_survey.html

   # Complete a test survey
   # Check Supabase dashboard → Table Editor → survey_responses
   ```

2. **Test admin dashboard:**
   ```bash
   cd admin-dashboard
   npm start

   # Opens http://localhost:3000
   # Login with admin credentials
   # Verify you see test response
   ```

### Phase 5: Deploy (20 minutes)

#### Option A: GitHub Pages (FREE, Recommended)

**Deploy Survey:**

1. Initialize git (if not already):
   ```bash
   git init
   git add wellness_survey.html
   git commit -m "Initial commit: wellness survey"
   ```

2. Create GitHub repository:
   - Go to github.com → New repository
   - Name: `wellness-survey`
   - Don't initialize with README

3. Push to GitHub:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/wellness-survey.git
   git branch -M main
   git push -u origin main
   ```

4. Enable GitHub Pages:
   - Go to repository Settings → Pages
   - Source: Branch `main`, folder `/ (root)`
   - Click Save
   - Your survey will be live at: `https://YOUR_USERNAME.github.io/wellness-survey/wellness_survey.html`

**Deploy Admin Dashboard:**

1. Build admin app:
   ```bash
   cd admin-dashboard
   npm run build
   ```

2. Deploy build folder:
   ```bash
   cd build
   git init
   git add .
   git commit -m "Deploy admin dashboard"
   git remote add origin https://github.com/YOUR_USERNAME/wellness-survey-admin.git
   git branch -M main
   git push -u origin main
   ```

3. Enable GitHub Pages (same steps as survey)
   - Your dashboard will be live at: `https://YOUR_USERNAME.github.io/wellness-survey-admin/`

4. **Update CORS in Edge Functions:**

   Update all 4 edge function files to allow your GitHub Pages domain:
   ```typescript
   const corsHeaders = {
     'Access-Control-Allow-Origin': 'https://YOUR_USERNAME.github.io',
     'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
   }
   ```

   Redeploy functions:
   ```bash
   supabase functions deploy survey-init
   supabase functions deploy survey-save
   supabase functions deploy survey-submit
   supabase functions deploy contact-submit
   ```

#### Option B: Vercel (Also FREE)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy survey
vercel wellness_survey.html

# Deploy admin dashboard
cd admin-dashboard
npm run build
vercel build/
```

---

## 🧪 Testing Checklist

After deployment, test the complete flow:

- [ ] Open survey URL → consent checkbox works
- [ ] Complete survey → verify submission in Supabase
- [ ] Close browser → reopen survey URL → verify progress restored
- [ ] Complete and submit survey
- [ ] Try to submit again → verify "already submitted" message
- [ ] Test follow-up contact submission
- [ ] Log into admin dashboard
- [ ] View responses and contacts
- [ ] Export CSV files
- [ ] View analytics charts
- [ ] Test on mobile device

---

## 📊 Admin Dashboard Usage

### Login
Navigate to your deployed admin dashboard URL and log in with the credentials you created in Supabase.

### Overview Tab
- Total response count
- Follow-up contact count
- Conversion rate (% who opted in for follow-up)
- Refresh button to load latest data

### Responses Tab
- View all completed survey responses
- Expand to see full JSON response data
- Export all responses to CSV for deeper analysis

### Contacts Tab
- View all follow-up contacts
- Mark contacts as "contacted" to track outreach
- Export contacts to CSV

### Analytics Tab
- Visualize response distributions for key questions
- Bar charts for multi-select questions
- Pie charts for single-select questions
- Pre-configured charts for Q1, Q3, Q12, Q17

---

## 🔒 Privacy & Security

**Survey Responses:**
- Completely anonymous - no IP addresses or identifying info
- Each session gets anonymous Supabase UUID
- Browser fingerprinting used only for duplicate prevention (hashed)
- No tracking cookies or analytics

**Follow-up Contacts:**
- Stored in completely separate table
- NO link to survey responses (true anonymity)
- Only stored if user explicitly opts in

**Data Security:**
- Supabase Row Level Security (RLS) policies enabled
- Users can only access their own session data
- Admin access requires authentication
- Edge Functions use service role key securely

---

## 💰 Cost Breakdown

**Free Forever (0-500 responses/month):**
- Supabase: $0 (500MB database, 50k users/month)
- GitHub Pages: $0 (unlimited static hosting)
- **Total: $0/month**

**If you scale to 2000+ responses:**
- Supabase Pro: $25/month (optional, for more features)
- GitHub Pages: $0 (still free)
- **Total: $25/month** (but free tier will likely suffice)

---

## 🛠 Troubleshooting

### Survey not saving responses

1. Check browser console for errors
2. Verify SUPABASE_URL and SUPABASE_ANON_KEY in wellness_survey.html
3. Check Supabase dashboard → Database → Table Editor → survey_responses
4. Verify anonymous auth is enabled in Supabase

### Admin dashboard not loading data

1. Check browser console for errors
2. Verify Supabase credentials in App.js match survey
3. Ensure admin user was created in Supabase
4. Check RLS policies in Supabase (should auto-apply from migration)

### Edge functions failing

1. Check Supabase Functions dashboard for error logs
2. Verify CORS headers include your deployed domain
3. Redeploy functions: `supabase functions deploy <function-name>`
4. Test functions directly in Supabase dashboard

### Duplicate prevention not working

1. Check browser console for fingerprint errors
2. Verify rate_limits table has entries in Supabase
3. Test in incognito mode (should allow new submission)
4. Note: ~20% of cases may slip through (by design for privacy)

---

## 🎨 Customization

### Survey Questions
Edit `wellness_survey.html` line 520+ to modify QUESTIONS array.

### Branding
- Update colors in CSS variables (line 9-22)
- Change fonts in Google Fonts link (line 7)
- Update title and intro text (line 439-442)

### Analytics Charts
Edit `admin-dashboard/src/App.js` to add more charts:
```javascript
<div className="chart-section">
  <h3>Your Question Title</h3>
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={getQuestionStats('q##')}>
      {/* Chart configuration */}
    </BarChart>
  </ResponsiveContainer>
</div>
```

---

## 📈 Sharing Your Survey

**Recommended sharing message:**

> "I'm conducting research for an early-stage startup focused on mental wellness. This 5-10 minute survey helps me understand the habits, tools, and practices people use to better understand themselves. Your honest input is anonymous and incredibly valuable. Thank you!"
>
> **Survey link:** [your-deployed-url]

**Share on:**
- Social media (Twitter/X, LinkedIn)
- Email to friends/network
- Relevant communities (Reddit, Discord servers)
- Research participant platforms (Prolific, UserInterviews)

---

## 📞 Support

If you encounter issues:

1. Check browser console for error messages
2. Review Supabase dashboard logs
3. Verify all configuration steps completed
4. Test in different browser/incognito mode

**Common issues:**
- "Supabase not configured" → Update SUPABASE_URL and SUPABASE_ANON_KEY
- "Unauthorized" → Check RLS policies in Supabase
- "CORS error" → Update corsHeaders in edge functions with your domain
- "Already submitted" appearing incorrectly → Check rate_limits table

---

## 🗓 Maintenance Schedule

**Weekly:**
- Check admin dashboard for new responses
- Reach out to follow-up contacts
- Monitor for duplicate submission attempts

**Monthly:**
- Export backup CSV files
- Review database size (should stay under 100MB)
- Check Supabase logs for errors

---

## 📝 Next Steps After Launch

1. **Soft launch** with 10-20 people from your network
2. **Monitor completion rate** (started vs completed)
3. **Iterate on questions** if drop-off is high at specific points
4. **Schedule follow-up interviews** with contacts who opted in
5. **Analyze findings** using admin dashboard
6. **Export data** for deeper analysis if needed

---

## 🎯 Success Metrics

Track these metrics in your admin dashboard:

- **Response rate:** # of completed surveys
- **Completion rate:** completed / started
- **Follow-up conversion:** contacts / responses
- **Drop-off points:** Which questions lose people?
- **Response distribution:** Are answers balanced or skewed?

---

## 📄 License

This is your proprietary research tool. All responses and data belong to you.

---

Built with ❤️ for mental wellness research
