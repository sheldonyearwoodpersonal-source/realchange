'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Building2, ExternalLink, Mail } from 'lucide-react';

type Organization = {
  name: string;
  why_they_can_help: string;
  power_description: string;
  category: string;
  website: string;
  contact_email: string;
};

function MatchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const issue = searchParams.get('issue');
  const location = searchParams.get('location');

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!issue || !location) {
      router.push('/');
      return;
    }

    fetchOrganizations();
  }, [issue, location]);

  const fetchOrganizations = async () => {
    try {
      console.log('Fetching organizations for:', { issue, location });

      const response = await fetch('/api/match-organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issue, location }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error:', errorData);
        throw new Error(errorData.error || 'Failed to fetch organizations');
      }

      const data = await response.json();
      console.log('Received organizations:', data.organizations?.length);
      setOrganizations(data.organizations);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to find organizations. Please try again.';
      setError(errorMessage);
      console.error('Error fetching organizations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOrganization = (org: Organization) => {
    const params = new URLSearchParams({
      issue: issue!,
      location: location!,
      orgName: org.name,
      orgWebsite: org.website,
      orgEmail: org.contact_email,
    });
    router.push(`/create-petition?${params.toString()}`);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'local-government':
        return 'bg-blue-100 text-blue-800';
      case 'state-government':
        return 'bg-indigo-100 text-indigo-800';
      case 'non-profit':
        return 'bg-green-100 text-green-800';
      case 'community-organization':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Finding organizations that can help...
            </h2>
            <p className="text-gray-600">
              Our AI is analyzing your issue and matching you with the right organizations
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => router.push('/')}>
              Try Again
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Organizations That Can Help
            </h1>
            <p className="text-gray-600">
              We found these organizations in <span className="font-semibold">{location}</span> that can address your issue
            </p>
          </div>

          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Your issue:</span> {issue}
              </p>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {organizations.map((org, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-xl">{org.name}</CardTitle>
                      </div>
                      <Badge className={getCategoryColor(org.category)}>
                        {org.category.replace('-', ' ')}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Why they can help:</h4>
                    <p className="text-gray-700">{org.why_they_can_help}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">What power they have:</h4>
                    <p className="text-gray-700">{org.power_description}</p>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-2">
                    <a
                      href={org.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Visit Website
                    </a>
                    <a
                      href={`mailto:${org.contact_email}`}
                      className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      {org.contact_email}
                    </a>
                  </div>

                  <Button
                    onClick={() => handleSelectOrganization(org)}
                    className="w-full mt-4"
                    size="lg"
                  >
                    Create Petition for {org.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button
              variant="outline"
              onClick={() => router.push('/')}
            >
              Start Over
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function MatchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          </div>
        </main>
      </div>
    }>
      <MatchContent />
    </Suspense>
  );
}
