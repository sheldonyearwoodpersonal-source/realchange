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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthModal } from '@/components/auth/AuthModal';
import { Loader2, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function CreateEventContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const petitionId = searchParams.get('petitionId');

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [petition, setPetition] = useState<any>(null);

  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    event_date: '',
    event_time: '',
    location: '',
    ticketmaster_url: '',
    max_attendees: '',
  });

  useEffect(() => {
    if (!petitionId) {
      router.push('/my-petitions');
      return;
    }

    if (!user) {
      setAuthModalOpen(true);
      setLoading(false);
      return;
    }

    fetchPetition();
  }, [petitionId, user]);

  const fetchPetition = async () => {
    try {
      const { data, error } = await supabase
        .from('petitions')
        .select('*')
        .eq('id', petitionId)
        .single();

      if (error) throw error;

      if (data.creator_id !== user?.id) {
        toast({
          title: 'Error',
          description: 'You can only create events for your own petitions',
          variant: 'destructive',
        });
        router.push('/my-petitions');
        return;
      }

      setPetition(data);
      setEventData((prev) => ({
        ...prev,
        title: `Rally for ${data.title}`,
        description: `Join us to support: ${data.title}`,
      }));
    } catch (error) {
      console.error('Error fetching petition:', error);
      toast({
        title: 'Error',
        description: 'Failed to load petition',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    setSaving(true);

    try {
      const eventDateTime = new Date(`${eventData.event_date}T${eventData.event_time}`);

      const { data: eventRecord, error: eventError } = await supabase
        .from('events')
        .insert({
          petition_id: petitionId,
          creator_id: user.id,
          title: eventData.title,
          description: eventData.description,
          event_date: eventDateTime.toISOString(),
          location: eventData.location,
          ticketmaster_url: eventData.ticketmaster_url || null,
          max_attendees: eventData.max_attendees ? parseInt(eventData.max_attendees) : null,
        })
        .select()
        .single();

      if (eventError) throw eventError;

      toast({
        title: 'Success!',
        description: 'Your event has been created.',
      });

      router.push(`/petition/${petitionId}`);
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: 'Error',
        description: 'Failed to create event. Please try again.',
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
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto">
            <CardContent className="py-16 text-center">
              <Calendar className="h-16 w-16 text-primary mx-auto mb-4" />
              <p className="text-xl text-gray-900 mb-2">Sign in to create an event</p>
              <p className="text-gray-600 mb-6">
                You need to be signed in to create events for your petitions
              </p>
              <Button onClick={() => setAuthModalOpen(true)}>Sign In</Button>
            </CardContent>
          </Card>
        </main>
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={() => {
            setAuthModalOpen(false);
            window.location.reload();
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Event</h1>
            <p className="text-gray-600">
              Organize a community event for: <span className="font-semibold">{petition?.title}</span>
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
              <CardDescription>
                Create an event to mobilize supporters. You can link to Ticketmaster for RSVPs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    value={eventData.title}
                    onChange={(e) =>
                      setEventData({ ...eventData, title: e.target.value })
                    }
                    required
                    placeholder="Rally for Change"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={eventData.description}
                    onChange={(e) =>
                      setEventData({ ...eventData, description: e.target.value })
                    }
                    required
                    className="min-h-[120px]"
                    placeholder="Describe what attendees can expect at the event..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="event_date">Date *</Label>
                    <Input
                      id="event_date"
                      type="date"
                      value={eventData.event_date}
                      onChange={(e) =>
                        setEventData({ ...eventData, event_date: e.target.value })
                      }
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="event_time">Time *</Label>
                    <Input
                      id="event_time"
                      type="time"
                      value={eventData.event_time}
                      onChange={(e) =>
                        setEventData({ ...eventData, event_time: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={eventData.location}
                    onChange={(e) =>
                      setEventData({ ...eventData, location: e.target.value })
                    }
                    required
                    placeholder="City Hall, 1 Dr Carlton B Goodlett Pl, San Francisco, CA"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ticketmaster_url">
                    Ticketmaster URL (Optional)
                  </Label>
                  <Input
                    id="ticketmaster_url"
                    type="url"
                    value={eventData.ticketmaster_url}
                    onChange={(e) =>
                      setEventData({ ...eventData, ticketmaster_url: e.target.value })
                    }
                    placeholder="https://www.ticketmaster.com/event/..."
                  />
                  <p className="text-sm text-gray-500">
                    If provided, the RSVP button will redirect to Ticketmaster
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_attendees">
                    Max Attendees (Optional)
                  </Label>
                  <Input
                    id="max_attendees"
                    type="number"
                    min="1"
                    value={eventData.max_attendees}
                    onChange={(e) =>
                      setEventData({ ...eventData, max_attendees: e.target.value })
                    }
                    placeholder="100"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    size="lg"
                    className="flex-1"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Event...
                      </>
                    ) : (
                      'Create Event'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => router.back()}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function CreateEventPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            </div>
          </main>
        </div>
      }
    >
      <CreateEventContent />
    </Suspense>
  );
}
