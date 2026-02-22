# CivicSpark Setup Guide

Quick setup guide for getting CivicSpark running locally.

## Prerequisites

1. **Node.js 18+** installed
2. **Supabase account** (free tier works)
3. **OpenAI API key**

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

Your Supabase database is already configured with the necessary tables and security policies.

Get your Supabase credentials:
1. Go to your Supabase project dashboard
2. Click on "Settings" → "API"
3. Copy your project URL and anon/public key

### 3. Get OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an account or sign in
3. Go to "API Keys" section
4. Create a new API key
5. Copy the key (you won't be able to see it again)

### 4. Set Environment Variables

The `.env` file already exists with Supabase credentials. Add your OpenAI key:

```env
NEXT_PUBLIC_SUPABASE_URL=your_value_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_value_here
OPENAI_API_KEY=your_openai_api_key_here
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Testing the Application

### Test the Complete Flow

1. **Create a Petition**:
   - Go to homepage
   - Enter an issue like "Dangerous intersection at Main St and Oak Ave needs a traffic light"
   - Enter location like "Portland, OR"
   - Click "Find Who Can Help"

2. **Review Organizations**:
   - View the 3 AI-matched organizations
   - Select one to create a petition for

3. **Edit & Publish**:
   - Review the AI-generated petition
   - Edit any sections as needed
   - Sign in/up when prompted
   - Click "Publish Petition"

4. **Sign Petition**:
   - Open the published petition
   - Fill out signature form
   - Add optional comment
   - Submit signature

5. **Post Updates** (as creator):
   - Go to "My Petitions"
   - Open your petition
   - Click "Post an Update"
   - Add title and content
   - Submit update

### Browse Petitions

- Click "Browse Petitions" in header
- View all published petitions
- Click any petition to view details

## Database Structure

The database includes these tables:

- `profiles` - User profiles
- `organizations` - Organizations that can help
- `petitions` - User-created petitions
- `signatures` - Petition signatures
- `updates` - Progress updates

All tables have Row Level Security enabled.

## Common Issues

### "OpenAI API key not configured" error
- Make sure `OPENAI_API_KEY` is set in `.env` file
- Restart the dev server after adding the key

### Authentication errors
- Check Supabase credentials are correct
- Verify email confirmation is disabled in Supabase Auth settings

### Build errors
- Run `npm install` to ensure all dependencies are installed
- Clear `.next` folder and rebuild

## Production Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Netlify

The project is pre-configured for Netlify:

1. Connect your GitHub repository to Netlify
2. Set environment variables in Netlify dashboard
3. Deploy

Build settings are already configured in `netlify.toml`.

## API Usage & Costs

### OpenAI API Costs

The app uses `gpt-4o-mini` which is very affordable:
- Organization matching: ~$0.01 per request
- Petition generation: ~$0.005 per request
- Safety check: ~$0.001 per request

Estimate: ~100 petition creations = ~$1.60

### Supabase Free Tier

The free tier includes:
- 500 MB database space
- 50,000 monthly active users
- 2 GB bandwidth
- Unlimited API requests

This is more than enough for a hackathon demo or MVP.

## Development Tips

1. **Test with realistic data**: Use actual civic issues from your community
2. **Check RLS policies**: Make sure users can only edit their own petitions
3. **Monitor API costs**: Keep an eye on OpenAI usage in the dashboard
4. **Test mobile**: The design is responsive, test on different screen sizes

## Support

For issues or questions:
- Check the README.md for detailed documentation
- Review the code comments
- Check Supabase logs for database issues
- Review OpenAI API logs for AI-related issues

## Next Steps

After basic setup:
1. Customize the AI prompts in `/app/api/` routes
2. Adjust the color scheme in `tailwind.config.ts`
3. Add more organization categories
4. Implement email notifications for updates
5. Add petition categories and tags
