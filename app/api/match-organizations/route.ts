import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export async function POST(request: NextRequest) {
  console.log('[match-organizations] Request received');

  try {
    const body = await request.json();
    const { issue, location } = body;

    console.log('[match-organizations] Issue:', issue);
    console.log('[match-organizations] Location:', location);

    if (!issue || !location) {
      console.error('[match-organizations] Missing issue or location');
      return NextResponse.json(
        { error: 'Issue and location are required' },
        { status: 400 }
      );
    }

    const groqApiKey = process.env.GROQ_API_KEY;

    if (!groqApiKey) {
      console.error('[match-organizations] GROQ_API_KEY not found in environment');
      return NextResponse.json(
        { error: 'Groq API key not configured' },
        { status: 500 }
      );
    }

    console.log('[match-organizations] Initializing Groq API...');
    const groq = new Groq({ apiKey: groqApiKey });
    console.log('[match-organizations] Client initialized');

    const prompt = `You are an expert in civic engagement and local governance. A person in ${location} has the following issue:

"${issue}"

Identify 3 organizations or government entities that could help address this issue. For each organization, provide:
1. name - The official name of the organization
2. why_they_can_help - A clear explanation of why this organization is relevant (2-3 sentences)
3. power_description - What authority, resources, or influence they have to address this issue (1-2 sentences)
4. category - One of: local-government, state-government, non-profit, community-organization
5. website - A realistic website URL (use common patterns like cityname.gov, orgname.org)
6. contact_email - A realistic contact email

Return ONLY a valid JSON array with exactly 3 organizations. Each organization should be actionable and specific to ${location}.

Example format:
[
  {
    "name": "San Francisco Department of Transportation",
    "why_they_can_help": "SFMTA is responsible for all transportation infrastructure in the city, including bike lanes and cyclist safety. They have the authority to approve and implement new bike infrastructure projects.",
    "power_description": "Can allocate budget for bike lane construction, approve street modifications, and enforce traffic safety regulations.",
    "category": "local-government",
    "website": "https://www.sfmta.com",
    "contact_email": "info@sfmta.com"
  }
]

Return ONLY the JSON array, no markdown formatting, no explanations.`;

    console.log('[match-organizations] Calling Groq API...');
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
      max_tokens: 2048,
    });

    const content = chatCompletion.choices[0]?.message?.content?.trim() || '';
    console.log('[match-organizations] Received response, length:', content.length);

    let organizations;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        console.log('[match-organizations] Found JSON array in response');
        organizations = JSON.parse(jsonMatch[0]);
      } else {
        console.log('[match-organizations] Parsing entire response as JSON');
        organizations = JSON.parse(content);
      }
      console.log('[match-organizations] Successfully parsed', organizations.length, 'organizations');
    } catch (parseError: any) {
      console.error('[match-organizations] Failed to parse AI response:', content.substring(0, 200));
      console.error('[match-organizations] Parse error:', parseError.message);
      return NextResponse.json(
        { error: 'Invalid AI response format' },
        { status: 500 }
      );
    }

    if (!Array.isArray(organizations) || organizations.length === 0) {
      console.error('[match-organizations] Invalid organizations array');
      return NextResponse.json(
        { error: 'No organizations found' },
        { status: 500 }
      );
    }

    console.log('[match-organizations] Returning', organizations.length, 'organizations');
    return NextResponse.json({ organizations });
  } catch (error: any) {
    console.error('[match-organizations] Error:', error);
    console.error('[match-organizations] Error message:', error?.message);
    console.error('[match-organizations] Error stack:', error?.stack);
    return NextResponse.json(
      { error: error?.message || 'Internal server error', details: error?.toString() },
      { status: 500 }
    );
  }
}
