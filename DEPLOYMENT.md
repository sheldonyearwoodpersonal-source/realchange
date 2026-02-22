# Real Change Deployment Guide

This guide will walk you through deploying Real Change to production using Netlify (recommended) or Vercel.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Deployment Options](#deployment-options)
- [Deploy to Netlify](#deploy-to-netlify)
- [Deploy to Vercel](#deploy-to-vercel)
- [Post-Deployment Configuration](#post-deployment-configuration)
- [Database Migrations](#database-migrations)
- [Google OAuth Setup](#google-oauth-setup)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

1. **GitHub Repository**: Your code pushed to GitHub
2. **Supabase Project**: Created and configured
3. **API Keys**: All required API keys (Gemini, Groq, Pexels)
4. **Local Testing**: App runs successfully locally

## Deployment Options

### Option 1: Netlify (Recommended)

**Pros:**
- Automatic deployments on git push
- Built-in Next.js support
- Generous free tier
- Easy environment variable management
- Excellent performance

**Cons:**
- Slightly more complex initial setup than Vercel for Next.js

### Option 2: Vercel

**Pros:**
- Created by Next.js team
- Zero-config Next.js deployment
- Automatic HTTPS
- Preview deployments for PRs

**Cons:**
- Free tier limitations on serverless functions

## Deploy to Netlify

### Step 1: Prepare Your Repository

1. Ensure your code is pushed to GitHub:
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

2. Verify `netlify.toml` exists in your root directory (already included):
```toml
[[plugins]]
package = "@netlify/plugin-nextjs"
```

### Step 2: Create Netlify Account

1. Go to [netlify.com](https://netlify.com)
2. Sign up with your GitHub account
3. Authorize Netlify to access your repositories

### Step 3: Import Project

1. Click **"Add new site"** → **"Import an existing project"**
2. Choose **"Deploy with GitHub"**
3. Select your Real Change repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - **Functions directory**: (leave empty)

### Step 4: Add Environment Variables

In the Netlify dashboard, go to **Site settings** → **Environment variables** → **Add a variable**:

Add each of these variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
PEXELS_API_KEY=your_pexels_api_key
```

**Where to get these values:**

- **Supabase URL & Key**: Supabase Dashboard → Project Settings → API
- **Gemini Key**: [Google AI Studio](https://makersuite.google.com/app/apikey)
- **Groq Key**: [Groq Console](https://console.groq.com)
- **Pexels Key**: [Pexels API](https://www.pexels.com/api/)

### Step 5: Deploy

1. Click **"Deploy [your-site-name]"**
2. Wait for the build to complete (usually 2-5 minutes)
3. Your site will be live at `https://[your-site-name].netlify.app`

### Step 6: Custom Domain (Optional)

1. In Netlify dashboard, go to **Domain settings**
2. Click **"Add custom domain"**
3. Follow the instructions to configure your DNS
4. Netlify automatically provisions SSL certificate

### Step 7: Configure Continuous Deployment

Netlify automatically deploys when you push to your main branch.

To deploy from other branches:
1. Go to **Site settings** → **Build & deploy** → **Deploy contexts**
2. Enable branch deploys or deploy previews as needed

## Deploy to Vercel

### Step 1: Install Vercel CLI

```bash
npm i -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy

From your project root:

```bash
vercel
```

Follow the prompts:
- **Set up and deploy**: Yes
- **Which scope**: Choose your account
- **Link to existing project**: No
- **Project name**: civicspark (or your preference)
- **Directory**: `./` (default)
- **Override settings**: No

### Step 4: Add Environment Variables

In the Vercel dashboard:

1. Go to your project
2. Click **Settings** → **Environment Variables**
3. Add each variable:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY`
   - `GROQ_API_KEY`
   - `PEXELS_API_KEY`

4. Set each variable for **Production**, **Preview**, and **Development** environments

### Step 5: Redeploy

After adding environment variables:

```bash
vercel --prod
```

Your site will be live at the provided URL.

### Step 6: Custom Domain (Optional)

1. In Vercel dashboard, go to **Settings** → **Domains**
2. Add your custom domain
3. Configure DNS according to Vercel's instructions
4. SSL is automatic

## Post-Deployment Configuration

### Update Supabase Settings

After deployment, configure your Supabase project to allow authentication from your production domain.

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **URL Configuration**

3. **Add Site URL:**
   ```
   https://your-site.netlify.app
   ```
   or
   ```
   https://your-site.vercel.app
   ```

4. **Add Redirect URLs:**
   ```
   https://your-site.netlify.app/**
   https://your-site.netlify.app/
   ```

5. If using a custom domain, add it as well:
   ```
   https://yourdomain.com
   https://yourdomain.com/**
   ```

### Test Your Deployment

1. Visit your production URL
2. Test authentication (sign up, sign in, sign out)
3. Create a test petition
4. Test organization matching
5. Verify image selection works
6. Test event creation
7. Confirm signature collection works

## Database Migrations

Your database migrations in `supabase/migrations/` should already be applied to your Supabase project.

### Verify Migrations

1. Go to Supabase Dashboard → **Table Editor**
2. Confirm these tables exist:
   - `profiles`
   - `organizations`
   - `petitions`
   - `signatures`
   - `updates`
   - `events`

### Apply Missing Migrations

If migrations haven't been applied:

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Link your project:
```bash
supabase link --project-ref your-project-ref
```

3. Apply migrations:
```bash
supabase db push
```

## Google OAuth Setup

To enable Google authentication in production:

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
5. Choose **Web application**
6. Add authorized redirect URIs:
   ```
   https://[your-project-ref].supabase.co/auth/v1/callback
   ```

### Step 2: Configure Supabase

1. Copy your Google Client ID and Client Secret
2. Go to Supabase Dashboard → **Authentication** → **Providers**
3. Enable **Google**
4. Paste Client ID and Secret
5. Save

### Step 3: Test Google Sign-In

1. Visit your production site
2. Click sign in/up
3. Click "Continue with Google"
4. Complete OAuth flow
5. Verify you're signed in

## Environment-Specific Configuration

### Production Optimizations

1. **Enable Analytics** (Optional):
   - Netlify Analytics or Vercel Analytics
   - Google Analytics

2. **Performance Monitoring**:
   - Set up error tracking (Sentry, LogRocket)
   - Monitor API response times

3. **Rate Limiting**:
   - Consider implementing rate limiting for AI endpoints
   - Use Vercel Edge Config or similar

### Staging Environment

Create a staging environment for testing:

**On Netlify:**
1. Deploy from a `staging` branch
2. Use separate environment variables if needed

**On Vercel:**
1. Preview deployments are automatic for PRs
2. Or deploy to a separate project

## Monitoring and Maintenance

### Check Application Health

1. **Supabase Dashboard**:
   - Monitor database usage
   - Check auth stats
   - Review logs

2. **Deployment Platform**:
   - Check build logs
   - Monitor function execution
   - Review bandwidth usage

3. **API Providers**:
   - Monitor Gemini API usage
   - Check Groq API limits
   - Review Pexels quota

### Regular Maintenance

- **Weekly**: Check error logs
- **Monthly**: Review API usage and costs
- **Quarterly**: Update dependencies
- **As needed**: Apply security patches

## Troubleshooting

### Build Failures

**Error: "Module not found"**
```bash
# Solution: Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

**Error: "Environment variable not set"**
- Verify all environment variables are added in deployment platform
- Check variable names match exactly (case-sensitive)
- Redeploy after adding variables

### Runtime Errors

**Error: "Failed to fetch"**
- Check API keys are valid
- Verify CORS settings
- Check API rate limits

**Authentication Errors**
- Verify Supabase redirect URLs
- Check Site URL in Supabase settings
- Ensure NEXT_PUBLIC_SUPABASE_URL is correct

**Database Errors**
- Verify migrations are applied
- Check RLS policies
- Review Supabase logs

### Performance Issues

**Slow Page Loads**
- Enable Next.js Image Optimization
- Check database query performance
- Review network waterfall in DevTools

**High API Costs**
- Implement caching for AI responses
- Add rate limiting
- Review API call frequency

### Rollback Deployment

**On Netlify:**
1. Go to **Deploys**
2. Find previous successful deploy
3. Click **"Publish deploy"**

**On Vercel:**
1. Go to **Deployments**
2. Find previous deployment
3. Click **"Promote to Production"**

## Security Checklist

Before going live, verify:

- [ ] All API keys are in environment variables (not hardcoded)
- [ ] Supabase RLS policies are enabled on all tables
- [ ] Google OAuth is configured with correct redirect URIs
- [ ] HTTPS is enabled (automatic on Netlify/Vercel)
- [ ] Rate limiting is implemented for AI endpoints
- [ ] Error messages don't expose sensitive data
- [ ] Authentication flows work correctly
- [ ] Form inputs are validated
- [ ] SQL injection prevention is in place

## Next Steps

After successful deployment:

1. **Monitor**: Set up error tracking and analytics
2. **Backup**: Configure Supabase automated backups
3. **Scale**: Upgrade plans as usage grows
4. **Optimize**: Review performance metrics
5. **Market**: Share your platform with communities

## Support

For deployment issues:

- **Netlify**: [Netlify Support](https://www.netlify.com/support/)
- **Vercel**: [Vercel Support](https://vercel.com/support)
- **Supabase**: [Supabase Discord](https://discord.supabase.com/)
- **Project Issues**: [GitHub Issues](https://github.com/yourusername/real-change/issues)

---

Congratulations on deploying Real Change! Your platform is now ready to empower citizens and create positive change.
