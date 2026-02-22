# CivicSpark Architecture

## Overview

CivicSpark is a Next.js 13 application using the App Router, with Supabase for backend services and OpenAI for AI features.

## System Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│          Next.js Frontend           │
│  ┌──────────────────────────────┐   │
│  │  Pages (App Router)          │   │
│  │  - Landing                   │   │
│  │  - Match Organizations       │   │
│  │  - Create Petition           │   │
│  │  - View Petition             │   │
│  │  - Browse Petitions          │   │
│  └──────────────────────────────┘   │
│  ┌──────────────────────────────┐   │
│  │  Components                  │   │
│  │  - Header                    │   │
│  │  - Auth Modal                │   │
│  │  - UI Components (shadcn)    │   │
│  └──────────────────────────────┘   │
│  ┌──────────────────────────────┐   │
│  │  Contexts                    │   │
│  │  - AuthContext               │   │
│  └──────────────────────────────┘   │
└────────┬────────────────────┬───────┘
         │                    │
         ▼                    ▼
┌─────────────────┐  ┌─────────────────┐
│  API Routes     │  │   Supabase      │
│  - /api/match-  │  │   - Auth        │
│    organizations│  │   - Database    │
│  - /api/        │  │   - RLS         │
│    generate-    │  │                 │
│    petition     │  │                 │
└────────┬────────┘  └─────────────────┘
         │
         ▼
┌─────────────────┐
│   OpenAI API    │
│   - GPT-4o-mini │
└─────────────────┘
```

## Data Flow

### Creating a Petition

1. **User Input** → Landing page collects issue + location
2. **Organization Matching** → API calls OpenAI with issue/location context
3. **AI Processing** → OpenAI returns 3 matched organizations with details
4. **Organization Selection** → User chooses which organization to target
5. **Petition Generation** → API calls OpenAI to generate petition content
6. **Safety Check** → AI reviews content for inappropriate material
7. **User Review** → User can edit generated content
8. **Authentication** → User signs in/up if not authenticated
9. **Database Insert** → Petition saved to Supabase with published status
10. **Redirect** → User sent to petition page

### Signing a Petition

1. **View Petition** → Public can view published petitions
2. **Fill Form** → Name, email, optional comment
3. **Submit** → Signature inserted into database
4. **Trigger** → Database trigger updates signature count
5. **Update UI** → Count refreshes, form shows success state

### Posting Updates

1. **Creator Access** → Only petition creators see update form
2. **Write Update** → Title and content
3. **RLS Check** → Database verifies creator_id matches petition owner
4. **Insert** → Update saved and displayed on petition page

## Database Schema

### Tables

```sql
profiles (
  id uuid PRIMARY KEY (references auth.users),
  email text NOT NULL,
  full_name text,
  created_at timestamptz
)

organizations (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  description text,
  power_description text,
  website text,
  contact_email text,
  category text,
  location text,
  created_at timestamptz
)

petitions (
  id uuid PRIMARY KEY,
  creator_id uuid (references profiles),
  organization_id uuid (references organizations),
  title text NOT NULL,
  problem text NOT NULL,
  demands text NOT NULL,
  call_to_action text NOT NULL,
  issue text,
  location text,
  signature_count integer DEFAULT 0,
  status text (draft|published|closed),
  created_at timestamptz,
  updated_at timestamptz
)

signatures (
  id uuid PRIMARY KEY,
  petition_id uuid (references petitions),
  user_id uuid (references profiles, nullable),
  name text NOT NULL,
  email text NOT NULL,
  comment text,
  created_at timestamptz,
  UNIQUE(petition_id, email)
)

updates (
  id uuid PRIMARY KEY,
  petition_id uuid (references petitions),
  creator_id uuid (references profiles),
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamptz
)
```

### Row Level Security (RLS) Policies

#### Profiles
- SELECT: Authenticated users can view all profiles
- INSERT: Users can create their own profile
- UPDATE: Users can update only their own profile

#### Organizations
- SELECT: Anyone (anon + authenticated) can view
- INSERT: Authenticated users can create organizations

#### Petitions
- SELECT: Anyone can view published; creators can view their drafts
- INSERT: Authenticated users can create petitions
- UPDATE: Creators can update their own petitions
- DELETE: Creators can delete their own petitions

#### Signatures
- SELECT: Anyone can view signatures
- INSERT: Anyone can sign petitions

#### Updates
- SELECT: Anyone can view updates
- INSERT: Only petition creators can post updates

## AI Integration

### Organization Matching

**Model**: GPT-4o-mini
**Temperature**: 0.7
**Max Tokens**: 1500

**Input**:
- User's issue description
- Location

**Output**: JSON array with 3 organizations
```json
[
  {
    "name": "Organization Name",
    "why_they_can_help": "Explanation...",
    "power_description": "What authority they have...",
    "category": "local-government",
    "website": "https://...",
    "contact_email": "contact@..."
  }
]
```

### Petition Generation

**Model**: GPT-4o-mini
**Temperature**: 0.7
**Max Tokens**: 1000

**Input**:
- Issue description
- Location
- Target organization name

**Output**: JSON object
```json
{
  "title": "Clear, action-oriented title",
  "problem": "3-4 paragraph explanation",
  "demands": "Bullet point list of specific demands",
  "call_to_action": "Urgent closing statement"
}
```

### Safety Check

**Model**: GPT-4o-mini
**Temperature**: 0.3
**Max Tokens**: 50

**Input**: Generated petition content
**Output**: "SAFE" or "UNSAFE: [reason]"

## Authentication Flow

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│  Auth Required?  │
└────┬─────────┬───┘
     │Yes      │No
     ▼         ▼
┌─────────┐ ┌──────────┐
│Auth     │ │Continue  │
│Modal    │ │          │
└────┬────┘ └──────────┘
     │
     ▼
┌─────────────┐
│Sign In/Up   │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│Supabase Auth    │
│Creates Session  │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│Create Profile   │
│in Database      │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│AuthContext      │
│Updates State    │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│Proceed with     │
│Original Action  │
└─────────────────┘
```

## Security Considerations

### Frontend
- Auth state managed via React Context
- Protected routes redirect to auth modal
- No sensitive data in client-side code

### Backend
- All database operations through Supabase with RLS
- API routes validate input
- OpenAI calls happen server-side only
- No direct database manipulation from client

### Database
- RLS policies enforce access control
- Foreign key constraints maintain referential integrity
- Unique constraints prevent duplicate signatures
- Triggers auto-update counts

### AI Safety
- Content moderation before publishing
- Rate limiting through API keys
- Prompt injection protection via system messages

## Performance Optimizations

### Frontend
- Static generation where possible
- Client-side navigation via Next.js
- Lazy loading for large components
- Optimistic UI updates

### Database
- Indexes on frequently queried columns
- Signature count maintained via trigger (no COUNT queries)
- Select only needed columns
- Efficient RLS policies

### API
- Minimal token usage with focused prompts
- GPT-4o-mini for cost efficiency
- Error handling and retry logic

## Deployment Architecture

```
┌────────────────┐
│   GitHub       │
│   Repository   │
└────────┬───────┘
         │
         ▼
┌────────────────┐
│   Netlify      │
│   - Build      │
│   - Deploy     │
│   - CDN        │
└────────┬───────┘
         │
         ▼
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
┌────────┐      ┌──────────┐
│Supabase│      │ OpenAI   │
│Backend │      │   API    │
└────────┘      └──────────┘
```

## Environment Variables

### Required
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `OPENAI_API_KEY` - OpenAI API key (server-side only)

### Optional
- `NEXT_PUBLIC_SITE_URL` - For production deployments

## Error Handling

### Frontend
- Toast notifications for user feedback
- Loading states during async operations
- Graceful fallbacks for failed requests

### Backend
- Try-catch blocks in all API routes
- Detailed error logging
- Generic error messages to users
- Specific errors in console for debugging

### Database
- RLS policies prevent unauthorized access
- Foreign key constraints maintain data integrity
- Triggers handle automatic updates

## Future Enhancements

### Scalability
- Add caching layer (Redis)
- Implement pagination for petition lists
- Add search functionality
- Optimize database queries

### Features
- Email notifications for updates
- Petition categories and filtering
- User profiles and dashboards
- Petition victory tracking
- Social media integration

### AI Improvements
- Fine-tuned models for better matching
- Multi-language support
- Sentiment analysis on comments
- Trend detection across petitions
