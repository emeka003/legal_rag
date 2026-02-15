# 🚀 Deployment Guide - Vercel & Railway

## ✅ LOCAL TESTING - CURRENT STATUS

Your app is now **running locally** at:
- **Local**: http://localhost:3000
- **Network**: http://192.168.68.149:3000

### Test These Features:
1. ✅ Open http://localhost:3000 in your browser
2. ✅ Sign up for a new account
3. ✅ Log in
4. ✅ Upload a PDF/document
5. ✅ Test the AI chat
6. ✅ Try the legal tools

---

## 🚀 PLATFORM 1: VERCEL (Recommended)

### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

### Step 2: Login & Deploy
```bash
# Login (opens browser)
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Step 3: Configure Environment Variables
After deployment, go to https://vercel.com/dashboard:

1. Select your project
2. Click **Settings** → **Environment Variables**
3. Add these variables:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_production_service_key
GEMINI_API_KEY=your_production_gemini_key
AUTH_SECRET=your_32_char_secret_here
```

### Step 4: Redeploy
```bash
vercel --prod
```

### Step 5: Configure Custom Domain (Optional)
1. Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Follow DNS instructions

---

## 🚂 PLATFORM 2: RAILWAY

### Option A: Deploy from GitHub (Recommended)

1. **Push to GitHub**:
```bash
git add -A
git commit -m "feat(deploy): production-ready with security fixes"
git push origin main
```

2. **Connect to Railway**:
   - Go to https://railway.app
   - Click **New Project** → **Deploy from GitHub repo**
   - Select your repository
   - Railway will auto-detect Next.js

3. **Add Environment Variables**:
   - Railway Dashboard → Your Project → Variables
   - Add the same env vars as above

4. **Generate Domain**:
   - Railway auto-generates a domain
   - Or add custom domain in Settings

### Option B: CLI Deployment

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
railway up

# Open in browser
railway open
```

---

## 🔐 CRITICAL: Pre-Deployment Security Checklist

### ⚠️ MUST DO BEFORE DEPLOYING:

1. **Rotate API Keys** (exposed in git history):
   ```bash
   # Generate new auth secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Update Supabase**:
   - Go to https://supabase.com/dashboard
   - Project Settings → API → Regenerate keys
   - Update RLS policies for production

3. **Update Gemini API**:
   - Go to https://aistudio.google.com/apikey
   - Delete old key, create new one

4. **Database Setup**:
   - Apply schema: `supabase/schema.sql`
   - Enable pgvector extension
   - Test `match_chunks` function

---

## 📊 Environment Variables Template

Create `.env.production` for reference (don't commit):

```bash
# Supabase Production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# Google Gemini
GEMINI_API_KEY=AIzaSy...

# Auth (32+ chars)
AUTH_SECRET=your-super-secret-key-min-32-characters-long-here

# Node
NODE_ENV=production
```

---

## 🧪 Testing Production Build Locally

```bash
# Build production
npm run build

# Start production server
npm start

# Test at http://localhost:3000
```

---

## 🐛 Troubleshooting

### Build Fails on Vercel
- Check build logs in Vercel Dashboard
- Ensure all env vars are set
- Verify `npm run build` works locally

### Database Connection Issues
- Check Supabase IP allowlist
- Verify service role key permissions
- Test connection: `curl https://your-project.supabase.co/rest/v1/`

### 504 Timeout Errors
- Vercel: Document processing may timeout (>10s)
- Solution: Use Railway for long processes or implement background jobs

### Rate Limiting
- Built-in: 5 login attempts/min, 3 signup/hour per IP
- Monitor in application logs

---

## 🎯 Quick Deploy Commands

### Deploy to Both Platforms:

```bash
# 1. Commit changes
git add -A
git commit -m "feat: ready for production deployment"
git push

# 2. Deploy to Vercel
vercel --prod

# 3. Deploy to Railway
railway up

# 4. Update environment variables on both platforms
```

---

## 📈 Monitoring & Analytics

### Vercel:
- Built-in Analytics (enable in dashboard)
- Real-time logs in dashboard
- Performance insights

### Railway:
- Metrics dashboard
- Log streaming
- Resource usage

### Both:
- Add Sentry for error tracking (optional)
- Monitor Supabase usage
- Track Gemini API quotas

---

## 🎉 Post-Deployment Checklist

- [ ] App loads without errors
- [ ] Can sign up new users
- [ ] Can log in existing users
- [ ] Document upload works
- [ ] AI chat responds
- [ ] Legal tools function
- [ ] Rate limiting active (test by spamming login)
- [ ] Security headers present (check in DevTools)
- [ ] HTTPS enabled
- [ ] Custom domain configured (optional)

---

## 💰 Cost Estimates

### Vercel (Hobby/Pro):
- **Free**: 100GB bandwidth, 6,000 execution hours
- **Pro**: $20/month, more bandwidth & longer timeouts

### Railway:
- **Free**: $5 credit/month, ~500 hours runtime
- **Starter**: $5/month, persistent service

### Supabase:
- **Free**: 500MB database, 2GB bandwidth
- **Pro**: $25/month, more resources

### Gemini API:
- **Free**: 1,500 requests/day
- **Pay-as-you-go**: $0.000125 per 1K tokens

---

## 🆘 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Supabase Docs**: https://supabase.com/docs

---

**Ready to deploy? Start with Vercel for the easiest setup, or Railway for more control!** 🚀
