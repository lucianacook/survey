# Deployment Checklist

Use this checklist to track your progress deploying the wellness survey system.

## ✅ Pre-Deployment Setup

### Supabase Setup
- [ ] Created Supabase account at supabase.com
- [ ] Created new project named "wellness-survey"
- [ ] Saved database password securely
- [ ] Ran SQL migration (001_initial_schema.sql)
- [ ] Verified 3 tables created: survey_responses, follow_up_contacts, rate_limits
- [ ] Enabled Anonymous authentication in Auth settings
- [ ] Copied Project URL from Settings → API
- [ ] Copied anon public key from Settings → API
- [ ] Copied service_role key from Settings → API (keep secret!)
- [ ] Saved Project Reference ID from Settings → General

### Supabase CLI Setup
- [ ] Installed Supabase CLI: `npm install -g supabase`
- [ ] Logged in: `supabase login`
- [ ] Initialized project: `supabase init`
- [ ] Linked project: `supabase link --project-ref YOUR_REF`
- [ ] Deployed survey-init function
- [ ] Deployed survey-save function
- [ ] Deployed survey-submit function
- [ ] Deployed contact-submit function
- [ ] Verified all functions show as "deployed" in Supabase dashboard

### Frontend Configuration
- [ ] Updated SUPABASE_URL in wellness_survey.html (line ~520)
- [ ] Updated SUPABASE_ANON_KEY in wellness_survey.html (line ~521)
- [ ] Updated contact email in "Already Submitted" screen (line ~527)
- [ ] Tested survey locally by opening wellness_survey.html in browser

### Admin Dashboard Configuration
- [ ] Updated SUPABASE_URL in admin-dashboard/src/App.js (line ~8)
- [ ] Updated SUPABASE_ANON_KEY in admin-dashboard/src/App.js (line ~9)
- [ ] Created admin user in Supabase: Auth → Users → Add User
- [ ] Saved admin email and password
- [ ] Installed dependencies: `cd admin-dashboard && npm install`
- [ ] Tested locally: `npm start` → http://localhost:3000
- [ ] Logged in with admin credentials
- [ ] Verified test data loads correctly

---

## ✅ Local Testing

### Survey Flow Testing
- [ ] Opened wellness_survey.html in browser
- [ ] Clicked consent checkbox → "Let's get started" button enabled
- [ ] Started survey → questions load correctly
- [ ] Answered 5 questions → closed browser
- [ ] Reopened survey → progress restored (resumed where left off)
- [ ] Completed survey → submitted successfully
- [ ] Checked Supabase → survey_responses table has new row with status="completed"
- [ ] Tried submitting again → "Already submitted" screen shown
- [ ] Tested in incognito mode → able to submit again (different fingerprint)

### Follow-up Contact Testing
- [ ] After survey submission → clicked "Yes, I'm open to it"
- [ ] Entered name and contact info → submitted
- [ ] Checked Supabase → follow_up_contacts table has new row
- [ ] Verified no link between contact and survey response (true anonymity)

### Admin Dashboard Testing
- [ ] Started admin dashboard: `cd admin-dashboard && npm start`
- [ ] Logged in with admin credentials
- [ ] Overview tab shows correct response count
- [ ] Responses tab displays test submissions
- [ ] Clicked "View responses" → JSON data displayed correctly
- [ ] Exported responses to CSV → file downloaded successfully
- [ ] Contacts tab shows test contact info
- [ ] Marked contact as "contacted" → checkbox updated
- [ ] Exported contacts to CSV → file downloaded successfully
- [ ] Analytics tab displays charts for Q1, Q3, Q12, Q17

### Edge Case Testing
- [ ] Submitted survey with only required questions answered
- [ ] Submitted survey with all questions answered including "Other" fields
- [ ] Tested "Prefer not to answer" selections
- [ ] Tested multi-select questions
- [ ] Tested open-ended text responses with long text
- [ ] Tested on mobile device (responsive design works)
- [ ] Tested in different browsers (Chrome, Safari, Firefox)

---

## ✅ Deployment

### GitHub Setup
- [ ] Created GitHub account (if needed)
- [ ] Initialized git in project: `git init`
- [ ] Added files: `git add wellness_survey.html`
- [ ] Created first commit: `git commit -m "Initial commit"`
- [ ] Created GitHub repository named "wellness-survey"
- [ ] Pushed to GitHub: `git push -u origin main`
- [ ] Verified files visible on GitHub

### GitHub Pages - Survey Deployment
- [ ] Went to repository Settings → Pages
- [ ] Selected Source: Branch "main", folder "/ (root)"
- [ ] Clicked Save
- [ ] Waited 2-3 minutes for deployment
- [ ] Verified survey live at: https://YOUR_USERNAME.github.io/wellness-survey/wellness_survey.html
- [ ] Tested survey works on deployed URL
- [ ] Submitted test response from deployed site
- [ ] Verified submission appears in Supabase

### GitHub Pages - Admin Dashboard Deployment
- [ ] Built admin dashboard: `cd admin-dashboard && npm run build`
- [ ] Navigated to build folder: `cd build`
- [ ] Initialized git: `git init`
- [ ] Added files: `git add .`
- [ ] Committed: `git commit -m "Deploy admin dashboard"`
- [ ] Created GitHub repository named "wellness-survey-admin"
- [ ] Pushed: `git push -u origin main`
- [ ] Enabled GitHub Pages (same steps as survey)
- [ ] Waited 2-3 minutes for deployment
- [ ] Verified dashboard live at: https://YOUR_USERNAME.github.io/wellness-survey-admin/
- [ ] Logged in from deployed URL
- [ ] Verified data loads correctly

### CORS Configuration
- [ ] Updated CORS in supabase/functions/survey-init/index.ts
- [ ] Updated CORS in supabase/functions/survey-save/index.ts
- [ ] Updated CORS in supabase/functions/survey-submit/index.ts
- [ ] Updated CORS in supabase/functions/contact-submit/index.ts
- [ ] Changed `'Access-Control-Allow-Origin': '*'` to `'Access-Control-Allow-Origin': 'https://YOUR_USERNAME.github.io'`
- [ ] Redeployed all functions: `supabase functions deploy survey-init` (repeat for all 4)
- [ ] Tested deployed survey still works after CORS update

---

## ✅ Production Testing

### End-to-End Production Test
- [ ] Opened deployed survey URL in fresh browser/incognito
- [ ] Completed full survey from start to finish
- [ ] Submitted with follow-up contact info
- [ ] Verified response in admin dashboard
- [ ] Verified contact in admin dashboard
- [ ] Exported CSV files from production data
- [ ] Viewed analytics charts with real data
- [ ] Tested "already submitted" by trying again in same browser
- [ ] Shared survey with 2-3 friends for beta testing
- [ ] Collected feedback on survey flow and questions

### Performance Testing
- [ ] Survey loads in under 3 seconds
- [ ] Questions transition smoothly
- [ ] Auto-save works (checked browser console logs)
- [ ] Submit button response time under 2 seconds
- [ ] Admin dashboard loads in under 5 seconds
- [ ] Charts render correctly on dashboard
- [ ] Export CSV completes in under 2 seconds

### Mobile Testing
- [ ] Tested on iPhone/iOS
- [ ] Tested on Android
- [ ] Verified responsive design works
- [ ] All buttons tappable on mobile
- [ ] Text readable without zooming
- [ ] Progress bar visible and updating
- [ ] Admin dashboard usable on tablet

---

## ✅ Launch Preparation

### Documentation
- [ ] Read README.md completely
- [ ] Bookmarked admin dashboard URL
- [ ] Bookmarked survey URL
- [ ] Saved Supabase dashboard URL
- [ ] Documented admin credentials in password manager
- [ ] Created sharing message for social media
- [ ] Prepared email template for network

### Analytics Setup
- [ ] Decided on target response count (e.g., 100 responses)
- [ ] Set timeline for data collection (e.g., 2 weeks)
- [ ] Planned weekly check-ins to review responses
- [ ] Scheduled follow-up interviews with first contacts

### Backup Plan
- [ ] Exported initial empty CSV files as templates
- [ ] Saved copy of survey HTML locally
- [ ] Documented all configuration values in secure location
- [ ] Set calendar reminder for weekly data backups

---

## ✅ Launch

### Soft Launch (10-20 people)
- [ ] Shared survey with close friends/family
- [ ] Asked for feedback on:
  - Survey length
  - Question clarity
  - Technical issues
  - Overall experience
- [ ] Made any necessary adjustments based on feedback
- [ ] Verified no critical bugs reported

### Full Launch
- [ ] Posted on social media (LinkedIn, Twitter, etc.)
- [ ] Emailed personal network
- [ ] Shared in relevant communities
- [ ] Tracked initial response rate
- [ ] Monitored admin dashboard daily
- [ ] Responded to any technical issues quickly

---

## ✅ Post-Launch Monitoring

### Daily (First Week)
- [ ] Check admin dashboard for new responses
- [ ] Monitor completion rate (completed / started)
- [ ] Watch for duplicate submission patterns
- [ ] Respond to any user questions/issues
- [ ] Track where responses are coming from

### Weekly
- [ ] Export CSV backup of all data
- [ ] Review analytics charts for insights
- [ ] Reach out to new follow-up contacts
- [ ] Analyze drop-off points in survey
- [ ] Adjust sharing strategy based on response rate

### Monthly
- [ ] Review database size in Supabase
- [ ] Check Supabase logs for any errors
- [ ] Update README with lessons learned
- [ ] Plan follow-up interviews with contacts

---

## 🎯 Success Criteria

Your launch is successful if:
- [ ] Survey URL is publicly accessible
- [ ] Responses are being saved to Supabase
- [ ] Admin dashboard shows real-time data
- [ ] No critical bugs reported by users
- [ ] Reaching target response rate
- [ ] Follow-up contacts coming in
- [ ] Data quality looks good (thoughtful responses)

---

## 🚨 Troubleshooting Reference

If something breaks, check:
1. Browser console for JavaScript errors
2. Supabase dashboard → Functions → Logs for backend errors
3. Network tab in DevTools for failed API calls
4. This checklist to see if a step was missed
5. SUPABASE_SETUP.md for backend configuration issues
6. README.md troubleshooting section

---

## 📞 Support Resources

- **Supabase Docs:** https://supabase.com/docs
- **GitHub Pages Docs:** https://docs.github.com/en/pages
- **React Docs:** https://react.dev
- **Recharts Docs:** https://recharts.org

---

## ✨ Optional Enhancements

After successful launch, consider:
- [ ] Custom domain for survey (e.g., survey.yourstartup.com)
- [ ] Custom domain for admin dashboard
- [ ] Email notifications for new responses
- [ ] Automated weekly summary emails
- [ ] More advanced analytics (sentiment analysis, word clouds)
- [ ] A/B testing different question orders
- [ ] Integration with email marketing tool
- [ ] Automated follow-up email sequences

---

**Current Status:** _Mark completed sections as you progress_

**Last Updated:** _[Date]_

**Launch Date:** _[Planned/Actual]_

**Target Responses:** _[Number]_

**Current Responses:** _[Number]_
