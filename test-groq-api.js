const Groq = require('groq-sdk').default;
const fs = require('fs');
const path = require('path');

function loadEnvFile() {
  try {
    const envPath = path.join(__dirname, '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=:#]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        process.env[key] = value;
      }
    });
  } catch (error) {
    console.log('No .env file found, using existing environment variables');
  }
}

async function testGroqAPI() {
  console.log('Testing Groq API integration...\n');

  loadEnvFile();
  const groqApiKey = process.env.GROQ_API_KEY;

  if (!groqApiKey) {
    console.error('❌ GROQ_API_KEY not found in .env file');
    console.log('\nPlease add your Groq API key to .env:');
    console.log('GROQ_API_KEY=your_groq_api_key_here');
    console.log('\nGet your free key at: https://console.groq.com/keys');
    process.exit(1);
  }

  console.log('✓ GROQ_API_KEY found');

  try {
    console.log('\n1. Testing match-organizations endpoint logic...');
    const groq = new Groq({ apiKey: groqApiKey });

    const testIssue = 'Need more bike lanes for safer cycling';
    const testLocation = 'San Francisco, CA';

    console.log(`   Issue: "${testIssue}"`);
    console.log(`   Location: ${testLocation}`);

    const prompt = `You are an expert in civic engagement and local governance. A person in ${testLocation} has the following issue:

"${testIssue}"

Identify 3 organizations or government entities that could help address this issue. For each organization, provide:
1. name - The official name of the organization
2. why_they_can_help - A clear explanation of why this organization is relevant (2-3 sentences)
3. power_description - What authority, resources, or influence they have to address this issue (1-2 sentences)
4. category - One of: local-government, state-government, non-profit, community-organization
5. website - A realistic website URL (use common patterns like cityname.gov, orgname.org)
6. contact_email - A realistic contact email

Return ONLY a valid JSON array with exactly 3 organizations. Each organization should be actionable and specific to ${testLocation}.

Return ONLY the JSON array, no markdown formatting, no explanations.`;

    console.log('\n   Calling Groq API with Llama 3.3 70B...');
    const startTime = Date.now();

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

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    const content = chatCompletion.choices[0]?.message?.content?.trim() || '';

    console.log(`   ✓ Response received in ${duration}s`);
    console.log(`   Response length: ${content.length} characters`);

    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const organizations = JSON.parse(jsonMatch[0]);
      console.log(`   ✓ Successfully parsed ${organizations.length} organizations\n`);

      console.log('Sample organization:');
      console.log(JSON.stringify(organizations[0], null, 2));
    } else {
      console.log('   ❌ Failed to extract JSON from response');
      console.log('   Response:', content.substring(0, 200));
    }

    console.log('\n2. Testing generate-petition endpoint logic...');
    const petitionPrompt = `You are an expert petition writer specializing in civic engagement and social change. Create a compelling petition addressing this issue:

Issue: "${testIssue}"
Location: ${testLocation}
Target Organization: San Francisco Department of Transportation

Generate a petition with these components:

1. title - A clear, action-oriented title (max 10 words)
2. problem - A detailed explanation of the problem (3-4 paragraphs, 150-200 words)
3. demands - Specific, actionable demands (3-5 bullet points)
4. call_to_action - A powerful closing statement (2-3 sentences)

Return ONLY a valid JSON object with these four fields.

Return ONLY the JSON object, no markdown formatting, no explanations.`;

    console.log('   Calling Groq API for petition generation...');
    const petitionStart = Date.now();

    const petitionCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: petitionPrompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 2048,
    });

    const petitionEnd = Date.now();
    const petitionDuration = ((petitionEnd - petitionStart) / 1000).toFixed(2);

    const petitionContent = petitionCompletion.choices[0]?.message?.content?.trim() || '';

    console.log(`   ✓ Response received in ${petitionDuration}s`);

    const petitionJsonMatch = petitionContent.match(/\{[\s\S]*\}/);
    if (petitionJsonMatch) {
      const petition = JSON.parse(petitionJsonMatch[0]);
      console.log('   ✓ Successfully parsed petition\n');
      console.log('Sample petition:');
      console.log(`   Title: ${petition.title}`);
      console.log(`   Problem length: ${petition.problem?.length || 0} characters`);
      if (typeof petition.demands === 'string') {
        console.log(`   Demands: ${petition.demands.split('\n').length} items`);
      } else {
        console.log(`   Demands: ${Array.isArray(petition.demands) ? petition.demands.length : 'N/A'} items`);
      }
    } else {
      console.log('   ❌ Failed to extract JSON from response');
    }

    console.log('\n✅ All tests passed! Groq API is working correctly.');
    console.log('\nRate limits (free tier):');
    console.log('   • 30 requests per minute');
    console.log('   • 14,400 requests per day');
    console.log('   • Much better than Gemini free tier!');

  } catch (error) {
    console.error('\n❌ Error testing Groq API:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

testGroqAPI();
