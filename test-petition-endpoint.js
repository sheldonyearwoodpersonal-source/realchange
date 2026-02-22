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
    console.log('No .env file found');
  }
}

loadEnvFile();

async function testPetitionEndpoint() {
  console.log('Testing petition generation endpoint...\n');

  const testData = {
    issue: 'Need more bike lanes for safer cycling',
    location: 'San Francisco, CA',
    organizationName: 'San Francisco Department of Transportation'
  };

  console.log('Test data:', testData);
  console.log('\nMaking request to localhost:3000/api/generate-petition...\n');

  try {
    const response = await fetch('http://localhost:3000/api/generate-petition', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log('Status:', response.status);
    console.log('Status text:', response.statusText);

    const data = await response.json();

    if (!response.ok) {
      console.error('\n❌ Error response:');
      console.error(JSON.stringify(data, null, 2));
    } else {
      console.log('\n✅ Success! Petition generated:');
      console.log('\nTitle:', data.petition.title);
      console.log('\nProblem:', data.petition.problem.substring(0, 200) + '...');
      console.log('\nDemands:', data.petition.demands.substring(0, 200) + '...');
      console.log('\nCall to Action:', data.petition.call_to_action);
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.cause) {
      console.error('Cause:', error.cause);
    }
  }
}

testPetitionEndpoint();
