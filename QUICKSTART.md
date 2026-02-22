# Real Change Quick Start Guide

Get Real Change up and running in 5 minutes!

## Prerequisites Checklist

- [ ] Node.js 18+ installed ([Download](https://nodejs.org/))
- [ ] Git installed
- [ ] Supabase account ([Sign up free](https://supabase.com))
- [ ] Google Gemini API key ([Get key](https://makersuite.google.com/app/apikey))
- [ ] Groq API key ([Get key](https://console.groq.com))
- [ ] Pexels API key ([Get key](https://www.pexels.com/api/))

## 5-Minute Setup

### 1. Clone and Install (1 minute)

```bash
git clone https://github.com/yourusername/real-change.git
cd real-change
npm install
```

### 2. Create Supabase Project (2 minutes)

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in:
   - Project name: `real-change`
   - Database password: (generate strong password)
   - Region: (choose closest to you)
4. Wait for project to initialize (~2 min)
5. Go to **Project Settings** → **API**
6. Copy:
   - Project URL
   - anon/public key

### 3. Configure Environment (1 minute)

Create `.env` file in project root:

```bash
cp .env.example .env
```

Edit `.env` and add your keys:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

GEMINI_API_KEY=your_gemini_key_here
GROQ_API_KEY=your_groq_key_here
PEXELS_API_KEY=your_pexels_key_here
```

### 4. Initialize Database (1 minute)

The migrations will be applied automatically by Supabase. Verify in your Supabase dashboard:

1. Go to **Table Editor**
2. You should see tables: `profiles`, `petitions`, `signatures`, `updates`, `events`, `organizations`

If tables don't exist, apply migrations manually:

```bash
# Install Supabase CLI
npm install -g supabase

# Link project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

### 5. Start Development Server (30 seconds)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Verify Installation

Test each feature:

1. **Homepage** - Should load without errors
2. **Sign Up** - Create a test account
3. **Match Organizations** - Enter issue and location
4. **Create Petition** - Use AI to generate content
5. **View Petitions** - See all petitions
6. **Create Event** - Add a civic event

## What's Next?

### Enable Google OAuth (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add redirect URI: `https://[your-project-ref].supabase.co/auth/v1/callback`
4. In Supabase: **Authentication** → **Providers** → Enable Google
5. Add Client ID and Secret

### Deploy to Production

Choose your deployment platform:

**Netlify (Recommended):**
```bash
# Push to GitHub
git add .
git commit -m "Initial commit"
git push

# Then connect repo in Netlify dashboard
```

**Vercel:**
```bash
npm i -g vercel
vercel
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## Common Issues

### "Module not found" error

```bash
rm -rf node_modules package-lock.json
npm install
```

### Build errors

```bash
rm -rf .next
npm run build
```

### Database connection issues

- Verify Supabase URL and key in `.env`
- Check project is not paused in Supabase dashboard
- Ensure migrations have been applied

### Authentication not working

- Check Supabase Site URL in dashboard
- Verify environment variables are set
- Clear browser cookies and try again

## Getting API Keys

### Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key

### Groq API Key

1. Go to [Groq Console](https://console.groq.com)
2. Sign up/login
3. Navigate to API Keys
4. Create new key
5. Copy the key

### Pexels API Key

1. Go to [Pexels API](https://www.pexels.com/api/)
2. Click "Get Started"
3. Fill out form
4. Verify email
5. Copy API key from dashboard

## Project Structure

```
real-change/
├── app/              # Next.js pages and API routes
├── components/       # React components
├── contexts/         # React contexts (Auth)
├── lib/              # Utilities and Supabase client
├── supabase/         # Database migrations
└── public/           # Static assets
```

## Key Commands

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run typecheck  # Check TypeScript
```

## Documentation

- [README.md](./README.md) - Full documentation
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API reference
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines

## Need Help?

- Check existing [GitHub Issues](https://github.com/yourusername/real-change/issues)
- Review the [README](./README.md)
- Check [Supabase Docs](https://supabase.com/docs)
- Check [Next.js Docs](https://nextjs.org/docs)

## Success!

You're now ready to build civic engagement tools! Create your first petition and start making a difference in your community.

---

**Happy Coding!** If you encounter any issues, please open an issue on GitHub.
