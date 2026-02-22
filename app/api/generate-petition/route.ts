import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export async function POST(request: NextRequest) {
  try {
    const { issue, location, organizationName } = await request.json();

    console.log('Generate petition request:', { issue, location, organizationName });

    if (!issue || !location || !organizationName) {
      return NextResponse.json(
        { error: 'Issue, location, and organization name are required' },
        { status: 400 }
      );
    }

    const groqApiKey = process.env.GROQ_API_KEY;

    if (!groqApiKey) {
      console.error('GROQ_API_KEY not found in environment');
      return NextResponse.json(
        { error: 'Groq API key not configured. Please add GROQ_API_KEY to your .env file.' },
        { status: 500 }
      );
    }

    console.log('Groq API key found, making request...');

    const groq = new Groq({ apiKey: groqApiKey });

    const prompt = `You are an expert petition writer specializing in civic engagement and social change. Create a compelling petition addressing this issue:

Issue: "${issue}"
Location: ${location}
Target Organization: ${organizationName}

Generate a petition with these components:

1. title - A clear, action-oriented title (max 10 words)
2. problem - A detailed explanation of the problem (3-4 paragraphs, 150-200 words)
   - Start with the immediate issue
   - Explain why it matters to the community
   - Include relevant context about ${location}
   - Use compelling but factual language

3. demands - Specific, actionable demands (3-5 bullet points)
   - Each should be concrete and measurable
   - Address what ${organizationName} should do
   - Be realistic and achievable

4. call_to_action - A powerful closing statement (2-3 sentences)
   - Urgent but respectful tone
   - Emphasize community impact
   - Encourage people to sign

Return ONLY a valid JSON object with these four fields. Use professional, persuasive language that would appear on change.org.

Example format:
{
  "title": "Demand Safe Bike Lanes on Main Street Now",
  "problem": "Main Street in downtown San Francisco has become increasingly dangerous for cyclists...",
  "demands": "• Install protected bike lanes on both sides of Main Street within 6 months\\n• Add clear signage and road markings for driver awareness\\n• Implement traffic calming measures to reduce vehicle speeds",
  "call_to_action": "Our community deserves safe streets for all users. Sign this petition to tell SFMTA that cyclist safety on Main Street cannot wait any longer."
}

Return ONLY the JSON object, no markdown formatting, no explanations.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 2048,
    });

    console.log('Received response from Groq');

    const content = chatCompletion.choices[0]?.message?.content?.trim() || '';

    let petition;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        petition = JSON.parse(jsonMatch[0]);
      } else {
        petition = JSON.parse(content);
      }
      console.log('Successfully parsed petition JSON');
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      console.error('Parse error:', parseError);
      return NextResponse.json(
        { error: 'Invalid AI response format. The AI did not return valid JSON.' },
        { status: 500 }
      );
    }

    const safetyCheckPrompt = `Review this petition for any harmful, offensive, or inappropriate content:

Title: ${petition.title}
Problem: ${petition.problem}
Demands: ${petition.demands}

Respond with ONLY "SAFE" if the petition is appropriate for a civic platform, or "UNSAFE: [reason]" if it contains problematic content.`;

    const safetyCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: safetyCheckPrompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 100,
    });

    const safetyCheck = safetyCompletion.choices[0]?.message?.content?.trim() || '';

    console.log('Safety check result:', safetyCheck);

    if (!safetyCheck.startsWith('SAFE')) {
      console.warn('Petition failed safety check:', safetyCheck);
      return NextResponse.json(
        { error: 'Petition content did not pass safety review: ' + safetyCheck },
        { status: 400 }
      );
    }

    console.log('Petition generation successful');
    return NextResponse.json({ petition });
  } catch (error: any) {
    console.error('Error generating petition:', error);
    console.error('Error details:', error?.message, error?.stack);

    let errorMessage = 'Internal server error';
    if (error?.message?.includes('API key')) {
      errorMessage = 'Groq API key is invalid or not configured';
    } else if (error?.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
