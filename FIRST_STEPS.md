# Real Change - Your First Steps

Follow these steps in order to get your project on GitHub and deployed.

## Step 1: Create GitHub Repository (5 minutes)

### Option A: Using GitHub Website

1. Go to [github.com](https://github.com) and sign in
2. Click the **"+"** button (top right) → **"New repository"**
3. Fill in the details:
   - **Repository name:** `real-change`
   - **Description:** "A platform for civic engagement through AI-powered petitions and organization matching"
   - **Visibility:** Choose Public or Private
   - **DO NOT check** "Add a README file" (you already have one)
   - **DO NOT check** "Add .gitignore" (you already have one)
   - **DO NOT check** "Choose a license" (you already have one)
4. Click **"Create repository"**

### Option B: Using GitHub CLI (if you have it installed)

```bash
gh repo create real-change --public --description "A platform for civic engagement through AI-powered petitions"
```

## Step 2: Push Your Code to GitHub (2 minutes)

Open your terminal in the project directory and run:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Create your first commit
git commit -m "Initial commit: Real Change platform"

# Add your GitHub repository as the remote
# Replace YOUR_USERNAME with your actual GitHub username
git remote add origin https://github.com/YOUR_USERNAME/real-change.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Your code is now on GitHub!**

Visit `https://github.com/YOUR_USERNAME/real-change` to see it.

## Step 3: Set Up Supabase Database (5 minutes)

1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Click **"New Project"**
3. Fill in:
   - **Name:** `real-change`
   - **Database Password:** Generate a strong password (save it somewhere safe!)
   - **Region:** Choose closest to your location
   - **Pricing Plan:** Free tier is fine to start
4. Click **"Create new project"**
5. Wait 2-3 minutes for the database to initialize
6. Once ready, go to **Project Settings** → **API**
7. Copy these two values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public key** (long string starting with `eyJ...`)

### Apply Database Migrations

The database schema needs to be set up. You have two options:

#### Option A: Using Supabase Dashboard (Easiest)

1. In your Supabase project, go to **SQL Editor**
2. Open each migration file from `supabase/migrations/` in your code editor
3. Copy the SQL content
4. Paste into Supabase SQL Editor and click **Run**
5. Repeat for all migration files in order:
   - `20260221234844_create_civicspark_schema.sql`
   - `20260222022103_add_petition_features.sql`
   - `20260222063021_add_events_table.sql`
   - `20260222065751_add_petition_goals.sql`

#### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project (get project ref from Supabase dashboard URL)
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

**Verify:** Go to **Table Editor** in Supabase. You should see tables: `profiles`, `petitions`, `signatures`, `updates`, `events`, `organizations`

## Step 4: Get API Keys (10 minutes)

You need 3 API keys for the AI features to work:

### 4.1 Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the key (starts with `AIza...`)

### 4.2 Groq API Key

1. Go to [Groq Console](https://console.groq.com)
2. Sign up/sign in
3. Navigate to **API Keys** (in the sidebar)
4. Click **"Create API Key"**
5. Give it a name (e.g., "Real Change")
6. Copy the key (starts with `gsk_...`)

### 4.3 Pexels API Key

1. Go to [Pexels API](https://www.pexels.com/api/)
2. Click **"Get Started"**
3. Fill out the form (describe it as a civic engagement platform)
4. Check your email and verify your account
5. Go to your [Pexels API dashboard](https://www.pexels.com/api/documentation/)
6. Copy your API key

## Step 5: Configure Environment Variables Locally (2 minutes)

1. In your project folder, find the `.env.example` file
2. Copy it to create a new `.env` file:
   ```bash
   cp .env.example .env
   ```
3. Open `.env` in your code editor
4. Fill in all the values you collected:

```env
# Supabase (from Step 3)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Google Gemini (from Step 4.1)
GEMINI_API_KEY=AIza...

# Groq (from Step 4.2)
GROQ_API_KEY=gsk_...

# Pexels (from Step 4.3)
PEXELS_API_KEY=your_pexels_key_here
```

5. Save the file

## Step 6: Test Locally (5 minutes)

Run your application locally to make sure everything works:

```bash
# Install dependencies (if you haven't already)
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Test these features:**
- ✅ Homepage loads
- ✅ Click "Sign Up" and create an account
- ✅ Click "Find Organizations" and try matching (enter any issue and location)
- ✅ Try creating a petition with the AI
- ✅ Browse all petitions
- ✅ Try creating an event

If everything works, you're ready to deploy!

## Step 7: Deploy to Netlify (10 minutes)

### 7.1 Connect to Netlify

1. Go to [netlify.com](https://netlify.com)
2. Sign up or sign in (use your GitHub account for easy connection)
3. Click **"Add new site"** → **"Import an existing project"**
4. Click **"Deploy with GitHub"**
5. Authorize Netlify to access your GitHub repositories
6. Select your **real-change** repository
7. Configure settings:
   - **Branch to deploy:** `main`
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
8. Click **"Show advanced"** → **"New variable"**

### 7.2 Add Environment Variables to Netlify

Add each of these (same values from your `.env` file):

1. `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
3. `GEMINI_API_KEY` = your Gemini API key
4. `GROQ_API_KEY` = your Groq API key
5. `PEXELS_API_KEY` = your Pexels API key

### 7.3 Deploy

1. Click **"Deploy real-change"**
2. Wait 2-5 minutes for the build to complete
3. You'll get a URL like `https://real-change-xxxxx.netlify.app`
4. Click the URL to open your live site!

### 7.4 Configure Supabase for Production

**IMPORTANT:** Tell Supabase about your new production URL:

1. Go to your Supabase dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Under **Site URL**, add your Netlify URL:
   ```
   https://real-change-xxxxx.netlify.app
   ```
4. Under **Redirect URLs**, add:
   ```
   https://real-change-xxxxx.netlify.app/**
   ```
5. Click **Save**

## Step 8: Test Your Live Site (5 minutes)

Visit your Netlify URL and test:

- ✅ Sign up with a new account
- ✅ Create a petition
- ✅ Sign a petition
- ✅ Create an event
- ✅ Match organizations

## Optional: Set Up Custom Domain

If you have a custom domain (like `realchange.com`):

1. In Netlify, go to **Domain settings**
2. Click **"Add custom domain"**
3. Enter your domain name
4. Follow the instructions to configure your DNS
5. Netlify will automatically provision an SSL certificate

Don't forget to update Supabase redirect URLs with your custom domain!

## What's Next?

**Your platform is live!** Here's what you can do:

1. **Share it:** Send the link to friends, family, or your community
2. **Customize:** Update colors, text, or features in the code
3. **Monitor:** Check Netlify for deployment logs and Supabase for usage
4. **Improve:** Add new features or fix bugs
5. **Contribute:** Share your improvements with the community

## Need Help?

- **Can't push to GitHub?** Check that you replaced `YOUR_USERNAME` with your actual username
- **Build failing?** Make sure all environment variables are set in Netlify
- **Database errors?** Verify migrations were applied in Supabase
- **Auth not working?** Check that redirect URLs are set in Supabase
- **API errors?** Verify all API keys are valid and have no typos

Check the full documentation:
- [README.md](./README.md) - Complete documentation
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Detailed deployment guide
- [GITHUB_SETUP.md](./GITHUB_SETUP.md) - GitHub configuration

## Quick Command Reference

```bash
# Daily workflow
git add .
git commit -m "Description of changes"
git push

# Restart dev server
npm run dev

# Build for production
npm run build

# Check for errors
npm run lint
npm run typecheck
```

---

**Congratulations!** You've successfully set up, deployed, and launched Real Change. Now go make a difference in your community!
