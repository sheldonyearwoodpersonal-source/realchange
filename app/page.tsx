'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, Users, TrendingUp, Shield } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [issue, setIssue] = useState('');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issue.trim() || !location.trim()) return;

    setIsLoading(true);
    const params = new URLSearchParams({
      issue: issue,
      location: location,
    });
    router.push(`/match?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Turn Your Concerns Into Action
            </h1>
            <p className="text-xl text-gray-600">
              Connect with organizations that have the power to address your local issues
            </p>
          </div>

          <Card className="shadow-lg mb-16">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="issue" className="text-base font-semibold">
                    What issue do you want to address?
                  </Label>
                  <Textarea
                    id="issue"
                    placeholder="Describe the issue you're facing... (e.g., 'There are no bike lanes on Main Street making it dangerous for cyclists')"
                    value={issue}
                    onChange={(e) => setIssue(e.target.value)}
                    className="min-h-[120px] text-base"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-base font-semibold">
                    Where is this happening?
                  </Label>
                  <Input
                    id="location"
                    placeholder="City, State (e.g., 'San Francisco, CA')"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="text-base"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full text-base font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? 'Starting Your Service...' : 'Start Your Service'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AI-Powered Matching</h3>
              <p className="text-sm text-gray-600">
                Get connected to the right organizations instantly
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Build Support</h3>
              <p className="text-sm text-gray-600">
                Rally your community around important issues
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Track Progress</h3>
              <p className="text-sm text-gray-600">
                Stay updated on petition progress and outcomes
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Make an Impact</h3>
              <p className="text-sm text-gray-600">
                Create real change in your community
              </p>
            </div>
          </div>

          <div className="bg-blue-600 text-white rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Join thousands creating change
            </h2>
            <p className="text-blue-100 mb-6">
              Every petition starts with someone who cares. What will you change today?
            </p>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => router.push('/petitions')}
            >
              Browse Active Petitions
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
