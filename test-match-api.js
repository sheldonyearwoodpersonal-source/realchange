const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

async function testMatchAPI() {
  const envPath = path.join(__dirname, '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n');
  let apiKey = '';

  for (const line of envLines) {
    if (line.startsWith('GEMINI_API_KEY=')) {
      apiKey = line.split('=')[1].trim();
      break;
    }
  }

  console.log('Testing match-organizations API logic...\n');

  const issue = "We need better bike lanes";
  const location = "San Francisco";

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

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

    console.log('Calling Gemini API...');
    const result = await model.generateContent(prompt);
    const content = result.response.text().trim();

    console.log('\n--- RAW API RESPONSE ---');
    console.log(content);
    console.log('--- END RESPONSE ---\n');

    let organizations;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        console.log('✓ Found JSON array in response');
        organizations = JSON.parse(jsonMatch[0]);
      } else {
        console.log('Attempting to parse entire response as JSON');
        organizations = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('❌ Failed to parse response:', parseError.message);
      throw new Error('Invalid AI response format');
    }

    if (!Array.isArray(organizations) || organizations.length === 0) {
      console.error('❌ Not a valid array or empty');
      throw new Error('No organizations found');
    }

    console.log(`✓ Successfully parsed ${organizations.length} organizations\n`);

    organizations.forEach((org, i) => {
      console.log(`Organization ${i + 1}:`);
      console.log(`  Name: ${org.name}`);
      console.log(`  Category: ${org.category}`);
      console.log(`  Website: ${org.website}`);
      console.log(`  Email: ${org.contact_email}`);
      console.log('');
    });

    console.log('✅ Test completed successfully!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

testMatchAPI();
