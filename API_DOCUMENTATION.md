# Real Change API Documentation

This document describes all API endpoints available in Real Change.

## Table of Contents

- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
  - [Match Organizations](#match-organizations)
  - [Generate Petition](#generate-petition)
  - [Generate Image](#generate-image)
- [Database API](#database-api)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

## Authentication

Most API endpoints require authentication via Supabase Auth. The authentication token is automatically included in requests when using the Supabase client.

### Authentication Flow

```typescript
import { supabase } from '@/lib/supabase';

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});

// Sign out
await supabase.auth.signOut();

// Get current session
const { data: { session } } = await supabase.auth.getSession();
```

## API Endpoints

### Match Organizations

Matches a user's civic issue with relevant organizations that have the authority to address it.

**Endpoint:** `POST /api/match-organizations`

**Authentication:** Not required

**Request Body:**

```typescript
{
  issue: string;      // Description of the civic issue
  location: string;   // Geographic location (city, state, country)
}
```

**Example Request:**

```typescript
const response = await fetch('/api/match-organizations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    issue: 'Poor air quality and pollution in downtown area',
    location: 'San Francisco, CA',
  }),
});

const data = await response.json();
```

**Success Response (200):**

```typescript
{
  organizations: [
    {
      name: string;              // Organization name
      description: string;       // Mission and overview
      why_they_can_help: string; // Why they're relevant to this issue
      power_authority: string;   // What authority they have
      contact: string;           // Contact information
    }
  ]
}
```

**Example Response:**

```json
{
  "organizations": [
    {
      "name": "San Francisco Department of Environment",
      "description": "The SF Department of Environment is responsible for environmental policy and programs in San Francisco.",
      "why_they_can_help": "They have direct authority over air quality monitoring and pollution control in the city.",
      "power_authority": "Can enforce air quality regulations, issue citations, and implement pollution reduction programs.",
      "contact": "Website: sfenvironment.org | Phone: (415) 355-3700 | Email: sfenvironment@sfgov.org"
    },
    {
      "name": "Bay Area Air Quality Management District",
      "description": "Regional agency responsible for air quality in the Bay Area.",
      "why_they_can_help": "They regulate industrial emissions and monitor air quality across the region.",
      "power_authority": "Can issue permits, enforce regulations, and take legal action against polluters.",
      "contact": "Website: baaqmd.gov | Phone: 1-800-334-ODOR"
    },
    {
      "name": "California Air Resources Board",
      "description": "State agency responsible for air quality and climate programs.",
      "why_they_can_help": "They set state-wide air quality standards and can override local regulations.",
      "power_authority": "Can create and enforce state-wide air quality policies and regulations.",
      "contact": "Website: arb.ca.gov | Phone: (800) 242-4450"
    }
  ]
}
```

**Error Responses:**

```typescript
// 400 Bad Request
{
  error: "Missing required fields: issue and location are required"
}

// 500 Internal Server Error
{
  error: "Failed to match organizations"
}
```

---

### Generate Petition

Generates AI-powered petition content based on the issue, location, and target organization.

**Endpoint:** `POST /api/generate-petition`

**Authentication:** Not required (but recommended for tracking)

**Request Body:**

```typescript
{
  issue: string;         // The civic issue to address
  location: string;      // Geographic location
  organization: string;  // Target organization name
}
```

**Example Request:**

```typescript
const response = await fetch('/api/generate-petition', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    issue: 'Poor air quality in downtown',
    location: 'San Francisco, CA',
    organization: 'San Francisco Department of Environment',
  }),
});

const data = await response.json();
```

**Success Response (200):**

```typescript
{
  title: string;         // Compelling petition title
  description: string;   // Detailed problem description
  demands: string;       // Specific, actionable demands
  callToAction: string;  // Strong call to action
}
```

**Example Response:**

```json
{
  "title": "Demand Immediate Action on Downtown Air Quality Crisis",
  "description": "Downtown San Francisco residents are breathing dangerously polluted air every day. Recent EPA monitoring shows PM2.5 levels consistently exceeding safe limits, particularly during rush hours. This isn't just an inconvenience—it's a serious public health crisis affecting thousands of workers, residents, and visitors.\n\nChildren attending downtown schools are developing respiratory issues at alarming rates. Elderly residents report increased hospital visits for breathing difficulties. The economic impact is significant, with businesses losing foot traffic as people avoid the area.\n\nWe deserve clean air. The technology and solutions exist—we need the political will to implement them.",
  "demands": "We demand that the San Francisco Department of Environment immediately:\n\n1. Install real-time air quality monitors at every major downtown intersection\n2. Implement a congestion pricing system to reduce vehicle emissions by 30% within 6 months\n3. Create car-free zones on Market Street and surrounding blocks\n4. Invest $10 million in electric bus infrastructure to replace diesel vehicles\n5. Launch a public awareness campaign about air quality and health impacts\n6. Publish monthly air quality reports and action plans",
  "callToAction": "Sign this petition to demand clean air for downtown San Francisco. Our health cannot wait. Every signature brings us closer to the air quality we deserve. Share this petition with friends, family, and colleagues who care about our community's health."
}
```

**Error Responses:**

```typescript
// 400 Bad Request
{
  error: "Missing required fields"
}

// 500 Internal Server Error
{
  error: "Failed to generate petition"
}
```

---

### Generate Image

Searches for relevant stock images using the Pexels API.

**Endpoint:** `GET /api/generate-image`

**Authentication:** Not required

**Query Parameters:**

```typescript
query: string;  // Search term for images
```

**Example Request:**

```typescript
const response = await fetch('/api/generate-image?query=community protest');
const data = await response.json();
```

**Success Response (200):**

```typescript
{
  images: [
    {
      id: number;           // Pexels image ID
      url: string;          // Full-size image URL
      photographer: string; // Photographer name
      photographer_url: string; // Photographer profile URL
    }
  ]
}
```

**Example Response:**

```json
{
  "images": [
    {
      "id": 3183197,
      "url": "https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg",
      "photographer": "fauxels",
      "photographer_url": "https://www.pexels.com/@fauxels"
    },
    {
      "id": 2422290,
      "url": "https://images.pexels.com/photos/2422290/pexels-photo-2422290.jpeg",
      "photographer": "Rosemary Ketchum",
      "photographer_url": "https://www.pexels.com/@rosemary"
    }
  ]
}
```

**Error Responses:**

```typescript
// 400 Bad Request
{
  error: "Query parameter is required"
}

// 500 Internal Server Error
{
  error: "Failed to fetch images"
}
```

---

## Database API

All database operations use Supabase client with Row Level Security (RLS).

### Petitions

#### Create Petition

```typescript
const { data, error } = await supabase
  .from('petitions')
  .insert({
    creator_id: userId,
    organization_id: orgId,
    title: 'Petition Title',
    description: 'Description',
    demands: 'Demands',
    goal: 1000,
    status: 'draft',
  })
  .select()
  .single();
```

#### Get All Published Petitions

```typescript
const { data, error } = await supabase
  .from('petitions')
  .select(`
    *,
    profiles:creator_id(full_name),
    organizations:organization_id(name)
  `)
  .eq('status', 'published')
  .order('created_at', { ascending: false });
```

#### Get Single Petition

```typescript
const { data, error } = await supabase
  .from('petitions')
  .select(`
    *,
    profiles:creator_id(full_name, email),
    organizations:organization_id(name, description, contact_info),
    signatures(count)
  `)
  .eq('id', petitionId)
  .single();
```

#### Update Petition

```typescript
const { data, error } = await supabase
  .from('petitions')
  .update({
    title: 'Updated Title',
    description: 'Updated Description',
  })
  .eq('id', petitionId)
  .eq('creator_id', userId);
```

#### Publish Petition

```typescript
const { data, error } = await supabase
  .from('petitions')
  .update({
    status: 'published',
    published_at: new Date().toISOString(),
  })
  .eq('id', petitionId)
  .eq('creator_id', userId);
```

### Signatures

#### Add Signature

```typescript
const { data, error } = await supabase
  .from('signatures')
  .insert({
    petition_id: petitionId,
    signer_name: 'John Doe',
    signer_email: 'john@example.com',
    comment: 'Optional comment',
  })
  .select()
  .single();
```

#### Get Petition Signatures

```typescript
const { data, error } = await supabase
  .from('signatures')
  .select('*')
  .eq('petition_id', petitionId)
  .order('signed_at', { ascending: false });
```

#### Count Signatures

```typescript
const { count, error } = await supabase
  .from('signatures')
  .select('*', { count: 'exact', head: true })
  .eq('petition_id', petitionId);
```

### Updates

#### Create Update

```typescript
const { data, error } = await supabase
  .from('updates')
  .insert({
    petition_id: petitionId,
    creator_id: userId,
    content: 'Update content',
  })
  .select()
  .single();
```

#### Get Petition Updates

```typescript
const { data, error } = await supabase
  .from('updates')
  .select('*')
  .eq('petition_id', petitionId)
  .order('created_at', { ascending: false });
```

### Events

#### Create Event

```typescript
const { data, error } = await supabase
  .from('events')
  .insert({
    creator_id: userId,
    title: 'Event Title',
    description: 'Event Description',
    location: 'Event Location',
    event_date: '2026-03-15T18:00:00',
    image_url: 'https://example.com/image.jpg',
  })
  .select()
  .single();
```

#### Get All Events

```typescript
const { data, error } = await supabase
  .from('events')
  .select(`
    *,
    profiles:creator_id(full_name)
  `)
  .gte('event_date', new Date().toISOString())
  .order('event_date', { ascending: true });
```

### Organizations

#### Create Organization

```typescript
const { data, error } = await supabase
  .from('organizations')
  .insert({
    name: 'Organization Name',
    description: 'Description',
    contact_info: 'Contact details',
    authority: 'What authority they have',
  })
  .select()
  .single();
```

## Error Handling

All API endpoints follow consistent error handling patterns:

### Error Response Format

```typescript
{
  error: string;  // Error message
  details?: any;  // Optional additional details
}
```

### HTTP Status Codes

- `200` - Success
- `400` - Bad Request (missing/invalid parameters)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

### Example Error Handling

```typescript
try {
  const response = await fetch('/api/match-organizations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ issue, location }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Request failed');
  }

  const data = await response.json();
  return data;
} catch (error) {
  console.error('API Error:', error);
  // Handle error appropriately
}
```

## Rate Limiting

Currently, rate limiting is not enforced at the application level. However, be aware of limits from external services:

- **Gemini API**: Check Google AI Studio quotas
- **Groq API**: Check Groq Console quotas
- **Pexels API**: 200 requests per hour for free tier
- **Supabase**: Based on your plan tier

### Best Practices

1. Implement client-side caching for repeated requests
2. Debounce user input before making API calls
3. Show loading states during API calls
4. Handle rate limit errors gracefully
5. Consider implementing exponential backoff for retries

## Security Considerations

1. **Never expose API keys** in client-side code
2. **Validate all inputs** on the server side
3. **Use HTTPS** for all API requests (enforced in production)
4. **Implement CORS** properly for external requests
5. **Rate limit** sensitive endpoints
6. **Sanitize user input** to prevent XSS attacks
7. **Use parameterized queries** to prevent SQL injection

## Support

For API issues or questions:

- Check the error response for details
- Review this documentation
- Open an issue on GitHub
- Contact the development team

---

Last updated: 2026-02-22
