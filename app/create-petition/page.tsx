'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AuthModal } from '@/components/auth/AuthModal';
import { ImageSelector } from '@/components/ImageSelector';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function CreatePetitionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const issue = searchParams.get('issue');
  const location = searchParams.get('location');
  const orgName = searchParams.get('orgName');
  const orgWebsite = searchParams.get('orgWebsite');
  const orgEmail = searchParams.get('orgEmail');

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [petitionData, setPetitionData] = useState({
    title: '',
    problem: '',
    demands: '',
    call_to_action: '',
  });

  const [goalData, setGoalData] = useState({
    goalType: 'signatures' as 'signatures' | 'custom',
    goalTarget: '',
    goalDescription: '',
  });

  const [selectedImage, setSelectedImage] = useState('');
  const [imageAlt, setImageAlt] = useState('');

  useEffect(() => {
    if (!issue || !location || !orgName) {
      router.push('/');
      return;
    }

    generatePetition();
  }, [issue, location, orgName]);

  const generatePetition = async () => {
    try {
      const response = await fetch('/api/generate-petition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issue,
          location,
          organizationName: orgName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('API Error:', data);
        throw new Error(data.error || 'Failed to generate petition');
      }

      setPetitionData(data.petition);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to generate petition. Please try again.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      console.error('Full error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    setSaving(true);

    try {
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: orgName!,
          website: orgWebsite,
          contact_email: orgEmail,
          location: location,
        })
        .select()
        .single();

      if (orgError && orgError.code !== '23505') {
        throw orgError;
      }

      const organizationId = orgData?.id || null;

      const { data: petitionRecord, error: petitionError } = await supabase
        .from('petitions')
        .insert({
          creator_id: user.id,
          organization_id: organizationId,
          title: petitionData.title,
          problem: petitionData.problem,
          demands: petitionData.demands,
          call_to_action: petitionData.call_to_action,
          issue: issue,
          location: location,
          status: 'published',
          goal_type: goalData.goalType,
          goal_target: goalData.goalTarget ? parseInt(goalData.goalTarget) : null,
          goal_description: goalData.goalType === 'custom' ? goalData.goalDescription : null,
        })
        .select()
        .single();

      if (petitionError) throw petitionError;

      if (selectedImage) {
        const { error: imageError } = await supabase
          .from('petition_images')
          .insert({
            petition_id: petitionRecord.id,
            image_url: selectedImage,
            alt_text: imageAlt || petitionData.title,
            is_primary: true,
          });

        if (imageError) console.error('Error saving image:', imageError);
      }

      toast({
        title: 'Success!',
        description: 'Your petition has been published.',
      });

      router.push(`/petition/${petitionRecord.id}`);
    } catch (error) {
      console.error('Error publishing petition:', error);
      toast({
        title: 'Error',
        description: 'Failed to publish petition. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
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
              Generating your petition...
            </h2>
            <p className="text-gray-600">
              Our AI is crafting a compelling petition for your cause
            </p>
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
              Review Your Petition
            </h1>
            <p className="text-gray-600">
              Edit any section before publishing to <span className="font-semibold">{orgName}</span>
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Petition Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={petitionData.title}
                  onChange={(e) =>
                    setPetitionData({ ...petitionData, title: e.target.value })
                  }
                  className="text-lg font-semibold"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="problem">The Problem</Label>
                <Textarea
                  id="problem"
                  value={petitionData.problem}
                  onChange={(e) =>
                    setPetitionData({ ...petitionData, problem: e.target.value })
                  }
                  className="min-h-[200px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="demands">Our Demands</Label>
                <Textarea
                  id="demands"
                  value={petitionData.demands}
                  onChange={(e) =>
                    setPetitionData({ ...petitionData, demands: e.target.value })
                  }
                  className="min-h-[150px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="call_to_action">Call to Action</Label>
                <Textarea
                  id="call_to_action"
                  value={petitionData.call_to_action}
                  onChange={(e) =>
                    setPetitionData({
                      ...petitionData,
                      call_to_action: e.target.value,
                    })
                  }
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label>Petition Image (Optional)</Label>
                <ImageSelector
                  keywords={issue || ''}
                  onImageSelect={(url, alt) => {
                    setSelectedImage(url);
                    setImageAlt(alt);
                  }}
                  selectedImage={selectedImage}
                />
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-lg">Goal Settings</h3>

                <div className="space-y-2">
                  <Label htmlFor="goal-type">Goal Type</Label>
                  <Select
                    value={goalData.goalType}
                    onValueChange={(value: 'signatures' | 'custom') =>
                      setGoalData({ ...goalData, goalType: value })
                    }
                  >
                    <SelectTrigger id="goal-type">
                      <SelectValue placeholder="Select goal type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="signatures">Number of Signatures</SelectItem>
                      <SelectItem value="custom">Custom Goal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goal-target">
                    {goalData.goalType === 'signatures' ? 'Signature Goal' : 'Goal Target'}
                  </Label>
                  <Input
                    id="goal-target"
                    type="number"
                    placeholder={goalData.goalType === 'signatures' ? 'e.g., 1000' : 'e.g., 50'}
                    value={goalData.goalTarget}
                    onChange={(e) =>
                      setGoalData({ ...goalData, goalTarget: e.target.value })
                    }
                    min="1"
                  />
                </div>

                {goalData.goalType === 'custom' && (
                  <div className="space-y-2">
                    <Label htmlFor="goal-description">What are you measuring?</Label>
                    <Input
                      id="goal-description"
                      placeholder="e.g., Volunteers recruited, Dollars raised"
                      value={goalData.goalDescription}
                      onChange={(e) =>
                        setGoalData({ ...goalData, goalDescription: e.target.value })
                      }
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  onClick={handlePublish}
                  size="lg"
                  className="flex-1"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    'Publish Petition'
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => router.back()}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          setAuthModalOpen(false);
          handlePublish();
        }}
      />
    </div>
  );
}

export default function CreatePetitionPage() {
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
      <CreatePetitionContent />
    </Suspense>
  );
}
