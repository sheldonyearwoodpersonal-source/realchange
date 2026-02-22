# Real Change

A modern web application that empowers citizens to create meaningful change by connecting them with organizations that can address their local issues through AI-powered matching, petition creation, and community events.

![Real Change](https://img.shields.io/badge/Next.js-13-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue) ![Supabase](https://img.shields.io/badge/Supabase-2.0-green) ![License](https://img.shields.io/badge/license-MIT-blue)

## Features

### Core Functionality
- **AI-Powered Organization Matching**: Enter an issue and location to get matched with 3 relevant organizations that have the authority to help
- **Smart Petition Generator**: AI creates compelling, well-structured petition content automatically
- **Petition Management**: Full lifecycle - create, edit, publish, and track petitions
- **Digital Signatures**: Secure signature system with email verification and optional comments
- **Progress Updates**: Keep supporters informed with timeline updates
- **Community Events**: Discover and create civic engagement events
- **Social Sharing**: Share petitions and events via native sharing or clipboard

### Authentication
- Email/Password authentication
- Google OAuth integration
- Secure session management with Supabase Auth

### User Experience
- Responsive design for mobile, tablet, and desktop
- Real-time updates
- Beautiful UI with shadcn/ui components
- Fast performance with Next.js 13

## Tech Stack

- **Frontend**: Next.js 13 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **AI Services**:
  - Google Gemini API for petition generation
  - Groq API for organization matching
- **Image Service**: Pexels API for stock images
- **Deployment**: Netlify with Next.js plugin
- **Type Safety**: Full TypeScript with strict mode

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher
- **npm** or **yarn** package manager
- **Git** for version control

You'll also need accounts for:

- [Supabase](https://supabase.com) - Database and authentication
- [Google AI Studio](https://makersuite.google.com/app/apikey) - Gemini API key
- [Groq](https://console.groq.com) - Groq API key
- [Pexels](https://www.pexels.com/api/) - Image API key

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/real-change.git
cd real-change
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API to get your credentials
3. The database migrations are in `supabase/migrations/` and will be applied automatically

#### Configure Google OAuth (Optional)

To enable Google sign-in:

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Providers
3. Enable the Google provider
4. Follow Supabase's instructions to set up OAuth credentials from Google Cloud Console
5. Add authorized redirect URIs

### 4. Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI API Keys
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here

# Image Service
PEXELS_API_KEY=your_pexels_api_key_here
```

**How to get API keys:**

- **Supabase**: Project Settings > API in your Supabase dashboard
- **Gemini**: [Google AI Studio](https://makersuite.google.com/app/apikey)
- **Groq**: [Groq Console](https://console.groq.com)
- **Pexels**: [Pexels API](https://www.pexels.com/api/)

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Database Schema

The application uses PostgreSQL via Supabase with the following tables:

### Tables

- **profiles**: User profiles linked to Supabase auth users
  - `id`, `email`, `full_name`, `created_at`

- **organizations**: Organizations that can address civic issues
  - `id`, `name`, `description`, `contact_info`, `authority`, `created_at`

- **petitions**: User-created petitions
  - `id`, `creator_id`, `organization_id`, `title`, `description`, `demands`, `status`, `goal`, `created_at`, `published_at`

- **signatures**: Petition signatures
  - `id`, `petition_id`, `signer_name`, `signer_email`, `comment`, `signed_at`

- **updates**: Progress updates for petitions
  - `id`, `petition_id`, `creator_id`, `content`, `created_at`

- **events**: Community civic engagement events
  - `id`, `creator_id`, `title`, `description`, `location`, `event_date`, `image_url`, `created_at`

### Row Level Security (RLS)

All tables have RLS enabled with policies ensuring:
- Users can only manage their own content
- Public read access for published content
- Authenticated-only write access
- Creator-only update/delete access

## Project Structure

```
real-change/
├── app/
│   ├── api/
│   │   ├── generate-image/      # Pexels image search endpoint
│   │   ├── generate-petition/   # AI petition generation
│   │   └── match-organizations/ # AI organization matching
│   ├── create-event/            # Event creation page
│   ├── create-petition/         # Petition editor
│   ├── events/                  # Events listing
│   ├── match/                   # Organization matching flow
│   ├── my-petitions/            # User's petitions dashboard
│   ├── petition/[id]/           # Individual petition page
│   ├── petitions/               # All petitions listing
│   ├── layout.tsx               # Root layout with auth provider
│   ├── page.tsx                 # Homepage
│   └── globals.css              # Global styles
├── components/
│   ├── auth/
│   │   └── AuthModal.tsx        # Sign in/up modal
│   ├── ui/                      # shadcn/ui components
│   ├── Header.tsx               # Navigation header
│   └── ImageSelector.tsx        # Image picker component
├── contexts/
│   └── AuthContext.tsx          # Authentication state
├── hooks/
│   └── use-toast.ts             # Toast notifications
├── lib/
│   ├── supabase.ts              # Supabase client
│   └── utils.ts                 # Utility functions
├── supabase/
│   └── migrations/              # Database migrations
├── .env                         # Environment variables (gitignored)
├── .env.example                 # Example env file
└── package.json
```

## Key Features Implementation

### Organization Matching Flow

1. User enters their issue and location on the Match page
2. API endpoint calls Groq AI to analyze the issue
3. AI returns 3 organizations with:
   - Organization name and mission
   - Why they can help with this specific issue
   - What authority/power they have
   - Contact information
4. User selects an organization to create a petition

### AI Petition Generation

1. User provides issue details and selected organization
2. Gemini API generates structured petition content:
   - Compelling title
   - Detailed problem description
   - Specific, actionable demands
   - Strong call to action
3. User can edit all generated content
4. Safety check validates content before publishing

### Signature Collection

1. Published petitions display signature form
2. Signers provide name and email
3. Optional comment field for personal stories
4. Email uniqueness prevents duplicate signatures
5. Real-time signature count updates
6. Progress bar shows goal achievement

### Events System

1. Authenticated users can create civic events
2. AI-powered image selection via Pexels
3. Location-based event discovery
4. Event details include date, location, description
5. Visual cards with imagery

## API Routes

### POST `/api/match-organizations`

Matches user issues with relevant organizations.

**Request:**
```json
{
  "issue": "Poor air quality in downtown",
  "location": "San Francisco, CA"
}
```

**Response:**
```json
{
  "organizations": [
    {
      "name": "San Francisco Department of Environment",
      "description": "...",
      "why_they_can_help": "...",
      "power_authority": "...",
      "contact": "..."
    }
  ]
}
```

### POST `/api/generate-petition`

Generates petition content using AI.

**Request:**
```json
{
  "issue": "Poor air quality",
  "location": "San Francisco",
  "organization": "SF Dept of Environment"
}
```

**Response:**
```json
{
  "title": "...",
  "description": "...",
  "demands": "...",
  "callToAction": "..."
}
```

### GET `/api/generate-image`

Fetches relevant images from Pexels.

**Query Parameters:**
- `query`: Search term for images

**Response:**
```json
{
  "images": [
    {
      "id": "...",
      "url": "...",
      "photographer": "..."
    }
  ]
}
```

## Security Best Practices

### Authentication
- Secure session management with Supabase Auth
- HttpOnly cookies for session tokens
- OAuth integration with Google
- Password requirements enforced

### Database Security
- Row Level Security (RLS) on all tables
- Policies restrict access to owned resources
- SQL injection prevention via parameterized queries
- No direct database exposure

### API Security
- Server-side API key storage
- Rate limiting on AI endpoints
- Input validation and sanitization
- CORS configuration

### Content Safety
- AI-generated content review
- User input sanitization
- XSS prevention
- Safe HTML rendering

## Deployment

### Deploy to Netlify

1. **Connect Your Repository**
   - Sign up at [netlify.com](https://netlify.com)
   - Click "Add new site" > "Import an existing project"
   - Connect your GitHub repository

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - The `netlify.toml` file is already configured

3. **Add Environment Variables**
   - Go to Site settings > Environment variables
   - Add all variables from your `.env` file:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `GEMINI_API_KEY`
     - `GROQ_API_KEY`
     - `PEXELS_API_KEY`

4. **Deploy**
   - Click "Deploy site"
   - Netlify will automatically build and deploy your site
   - Get your live URL (e.g., `yoursite.netlify.app`)

5. **Update Supabase Settings**
   - Add your Netlify URL to Supabase:
     - Authentication > URL Configuration
     - Add Site URL: `https://yoursite.netlify.app`
     - Add Redirect URLs for OAuth

### Deploy to Vercel (Alternative)

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts to deploy
4. Add environment variables in Vercel dashboard
5. Update Supabase redirect URLs

## Development Tips

### Code Style
- Use TypeScript for type safety
- Follow React best practices
- Keep components focused and reusable
- Use shadcn/ui components for consistency

### Database Changes
- Always create migrations for schema changes
- Test RLS policies thoroughly
- Use transactions for related operations
- Keep queries efficient with indexes

### AI Integration
- Keep prompts focused and specific
- Handle API errors gracefully
- Implement loading states
- Cache results when appropriate

### Testing
- Test authentication flows
- Verify RLS policies
- Test form validations
- Check responsive design

## Troubleshooting

### Common Issues

**Build Errors**
- Ensure all environment variables are set
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

**Authentication Issues**
- Verify Supabase URL and keys
- Check redirect URLs in Supabase dashboard
- Clear browser cookies and try again

**Database Errors**
- Verify migrations have run
- Check RLS policies
- Ensure user has proper permissions

**API Errors**
- Verify all API keys are valid
- Check rate limits on AI services
- Review API endpoint logs

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please:
- Open an issue on GitHub
- Check existing documentation
- Review Supabase and Next.js docs

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Database and auth by [Supabase](https://supabase.com/)
- Icons by [Lucide](https://lucide.dev/)
- AI powered by Google Gemini and Groq

---

**Real Change** - Made with care for civic engagement and community empowerment.
