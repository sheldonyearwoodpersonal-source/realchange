# CivicSpark API Documentation

## Overview

CivicSpark uses Next.js API routes for backend functionality. All routes are located in `/app/api/`.

## API Routes

### POST /api/match-organizations

Matches an issue to relevant organizations using AI.

**Request Body**:
```json
{
  "issue": "string (required) - Description of the issue",
  "location": "string (required) - City, State format"
}
```

**Response** (Success - 200):
```json
{
  "organizations": [
    {
      "name": "Organization Name",
      "why_they_can_help": "Explanation of relevance",
      "power_description": "What authority they have",
      "category": "local-government | state-government | non-profit | community-organization",
      "website": "https://example.com",
      "contact_email": "contact@example.com"
    }
  ]
}
```

**Response** (Error - 400):
```json
{
  "error": "Issue and location are required"
}
```

**Response** (Error - 500):
```json
{
  "error": "OpenAI API key not configured" | "Failed to get AI response" | "Invalid AI response format"
}
```

**Example Usage**:
```typescript
const response = await fetch('/api/match-organizations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    issue: 'Dangerous intersection needs traffic light',
    location: 'Portland, OR'
  })
});

const data = await response.json();
console.log(data.organizations);
```

**Notes**:
- Uses GPT-4o-mini model
- Temperature: 0.7
- Max tokens: 1500
- Returns exactly 3 organizations
- Automatically extracts JSON from response

---

### POST /api/generate-petition

Generates petition content using AI based on an issue and target organization.

**Request Body**:
```json
{
  "issue": "string (required) - Description of the issue",
  "location": "string (required) - City, State format",
  "organizationName": "string (required) - Name of target organization"
}
```

**Response** (Success - 200):
```json
{
  "petition": {
    "title": "Action-oriented petition title (max 10 words)",
    "problem": "Detailed problem description (3-4 paragraphs)",
    "demands": "Specific actionable demands (3-5 bullet points)",
    "call_to_action": "Urgent closing statement (2-3 sentences)"
  }
}
```

**Response** (Error - 400):
```json
{
  "error": "Issue, location, and organization name are required"
}
```
OR
```json
{
  "error": "Petition content did not pass safety review"
}
```

**Response** (Error - 500):
```json
{
  "error": "OpenAI API key not configured" | "Failed to get AI response" | "Invalid AI response format"
}
```

**Example Usage**:
```typescript
const response = await fetch('/api/generate-petition', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    issue: 'Dangerous intersection needs traffic light',
    location: 'Portland, OR',
    organizationName: 'Portland Department of Transportation'
  })
});

const data = await response.json();
console.log(data.petition);
```

**Notes**:
- Uses GPT-4o-mini model for generation
- Temperature: 0.7
- Max tokens: 1000
- Includes automatic safety check
- Safety check uses temperature 0.3
- Content must pass "SAFE" check before returning

---

## Database Operations

While not traditional API routes, here are the common Supabase operations used:

### Fetch Petitions

```typescript
const { data, error } = await supabase
  .from('petitions')
  .select('*')
  .eq('status', 'published')
  .order('created_at', { ascending: false });
```

### Create Petition

```typescript
const { data, error } = await supabase
  .from('petitions')
  .insert({
    creator_id: user.id,
    organization_id: organizationId,
    title: 'Petition Title',
    problem: 'Problem description',
    demands: 'List of demands',
    call_to_action: 'Call to action',
    issue: 'Original issue',
    location: 'City, State',
    status: 'published'
  })
  .select()
  .single();
```

### Sign Petition

```typescript
const { error } = await supabase
  .from('signatures')
  .insert({
    petition_id: petitionId,
    user_id: user?.id || null,
    name: 'Signer Name',
    email: 'signer@email.com',
    comment: 'Optional comment'
  });
```

### Post Update

```typescript
const { error } = await supabase
  .from('updates')
  .insert({
    petition_id: petitionId,
    creator_id: user.id,
    title: 'Update Title',
    content: 'Update content'
  });
```

### Check Existing Signature

```typescript
const { data } = await supabase
  .from('signatures')
  .select('id')
  .eq('petition_id', petitionId)
  .eq('email', userEmail)
  .maybeSingle();

const hasSigned = !!data;
```

## Authentication

### Sign Up

```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
});

// Create profile
if (data.user) {
  await supabase.from('profiles').insert({
    id: data.user.id,
    email: data.user.email,
    full_name: 'User Name'
  });
}
```

### Sign In

```typescript
const { error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});
```

### Sign Out

```typescript
await supabase.auth.signOut();
```

### Get Current User

```typescript
const { data: { session } } = await supabase.auth.getSession();
const user = session?.user;
```

### Listen to Auth Changes

```typescript
const { data: { subscription } } = supabase.auth.onAuthStateChange(
  (event, session) => {
    console.log('Auth event:', event);
    console.log('User:', session?.user);
  }
);

// Cleanup
subscription.unsubscribe();
```

## Error Handling

### API Routes

All API routes follow this error handling pattern:

```typescript
try {
  // Operation
  return NextResponse.json({ data });
} catch (error) {
  console.error('Error:', error);
  return NextResponse.json(
    { error: 'Error message' },
    { status: 500 }
  );
}
```

### Common Error Codes

- `400` - Bad Request (missing or invalid parameters)
- `500` - Internal Server Error (API failures, parsing errors)
- `23505` - Database unique constraint violation (duplicate signature)

### Database Errors

```typescript
const { data, error } = await supabase.from('table').insert(data);

if (error) {
  if (error.code === '23505') {
    // Handle duplicate entry
  } else {
    // Handle other errors
  }
}
```

## Rate Limiting

Currently, no rate limiting is implemented. For production:

1. **Implement rate limiting**:
   - Use Vercel's edge middleware
   - Or use a service like Upstash Rate Limit

2. **OpenAI rate limits**:
   - Free tier: 3 RPM (requests per minute)
   - Tier 1: 500 RPM
   - Monitor usage in OpenAI dashboard

3. **Supabase rate limits**:
   - Free tier: Unlimited requests
   - Database: 2GB bandwidth/month
   - Auth: 50,000 MAU

## Security Best Practices

### API Routes

1. **Validate input**: Always validate and sanitize user input
2. **Server-side only**: API keys never exposed to client
3. **Error messages**: Generic messages to users, detailed logs server-side
4. **CORS**: Configured by Next.js automatically

### Database

1. **RLS enabled**: All tables have Row Level Security
2. **Policies enforced**: Access control at database level
3. **Prepared statements**: Supabase client uses parameterized queries
4. **No SQL injection**: Client library handles escaping

### Authentication

1. **Session-based**: Supabase handles JWT tokens
2. **HTTPOnly cookies**: Not accessible via JavaScript
3. **Secure transmission**: HTTPS only in production
4. **Password requirements**: Minimum 6 characters (configurable)

## Testing

### Test Organization Matching

```bash
curl -X POST http://localhost:3000/api/match-organizations \
  -H "Content-Type: application/json" \
  -d '{
    "issue": "No bike lanes on Main Street",
    "location": "San Francisco, CA"
  }'
```

### Test Petition Generation

```bash
curl -X POST http://localhost:3000/api/generate-petition \
  -H "Content-Type: application/json" \
  -d '{
    "issue": "No bike lanes on Main Street",
    "location": "San Francisco, CA",
    "organizationName": "San Francisco Department of Transportation"
  }'
```

## API Costs

### OpenAI API (GPT-4o-mini)

**Pricing**:
- Input: $0.150 per 1M tokens
- Output: $0.600 per 1M tokens

**Estimated costs per request**:
- Organization matching: ~$0.01 (1000 input + 1500 output tokens)
- Petition generation: ~$0.005 (800 input + 1000 output tokens)
- Safety check: ~$0.001 (500 input + 50 output tokens)

**Total per petition creation**: ~$0.016

### Supabase

**Free tier includes**:
- Unlimited API requests
- 500 MB database
- 2 GB bandwidth
- 50,000 monthly active users

## Monitoring

### Recommended Monitoring

1. **OpenAI Usage**:
   - Check OpenAI dashboard regularly
   - Set up usage alerts
   - Monitor token consumption

2. **Supabase Usage**:
   - Database size
   - Bandwidth usage
   - Active users
   - Query performance

3. **Application Errors**:
   - Set up error tracking (Sentry, LogRocket)
   - Monitor API route failures
   - Track user-facing errors

4. **Performance**:
   - Page load times
   - API response times
   - Database query performance

## Webhooks (Future Enhancement)

Currently not implemented, but could add:

1. **Petition milestones**: Trigger when reaching signature goals
2. **New signatures**: Notify creator of new signatures
3. **Updates**: Notify signers of new updates
4. **Email integration**: SendGrid, Mailgun, or Resend

Example webhook structure:
```typescript
// POST /api/webhooks/signature
{
  "event": "signature.created",
  "petition_id": "uuid",
  "signature": {
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```
