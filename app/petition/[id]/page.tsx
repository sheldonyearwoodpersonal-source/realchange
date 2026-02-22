'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AuthModal } from '@/components/auth/AuthModal';
import { Loader2, Users, Calendar, Share2, Edit, MessageSquare, Send, Plus, MapPin, ExternalLink, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistance, format } from 'date-fns';

type Petition = {
  id: string;
  title: string;
  problem: string;
  demands: string;
  call_to_action: string;
  signature_count: number;
  location: string;
  created_at: string;
  creator_id: string;
  status: string;
  goal_type: string | null;
  goal_target: number | null;
  goal_description: string | null;
};

type PetitionImage = {
  id: string;
  image_url: string;
  alt_text: string | null;
  is_primary: boolean;
};

type Organization = {
  name: string;
  website: string;
  contact_email: string;
};

type Update = {
  id: string;
  title: string;
  content: string;
  created_at: string;
};

type CommunityMessage = {
  id: string;
  message: string;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string | null;
    email: string;
  };
};

type Event = {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  ticketmaster_url: string | null;
  max_attendees: number | null;
  rsvp_count: number;
};

export default function PetitionPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const petitionId = params.id as string;

  const [petition, setPetition] = useState<Petition | null>(null);
  const [petitionImage, setPetitionImage] = useState<PetitionImage | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [communityMessages, setCommunityMessages] = useState<CommunityMessage[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [hasOptedInCommunity, setHasOptedInCommunity] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  const [signatureData, setSignatureData] = useState({
    name: '',
    email: '',
    comment: '',
    optInTracking: false,
    optInCommunity: false,
  });

  const [updateData, setUpdateData] = useState({
    title: '',
    content: '',
  });

  useEffect(() => {
    fetchPetitionData();
  }, [petitionId, user]);

  const fetchPetitionData = async () => {
    try {
      const { data: petitionData, error: petitionError } = await supabase
        .from('petitions')
        .select('*')
        .eq('id', petitionId)
        .single();

      if (petitionError) throw petitionError;

      setPetition(petitionData);

      const { data: imageData } = await supabase
        .from('petition_images')
        .select('id, image_url, alt_text, is_primary')
        .eq('petition_id', petitionId)
        .eq('is_primary', true)
        .maybeSingle();

      if (imageData) setPetitionImage(imageData);

      if (petitionData.organization_id) {
        const { data: orgData } = await supabase
          .from('organizations')
          .select('name, website, contact_email')
          .eq('id', petitionData.organization_id)
          .single();

        if (orgData) setOrganization(orgData);
      }

      const { data: updatesData } = await supabase
        .from('updates')
        .select('*')
        .eq('petition_id', petitionId)
        .order('created_at', { ascending: false });

      if (updatesData) setUpdates(updatesData);

      const { data: eventsData } = await supabase
        .from('events')
        .select('*, event_rsvps(count)')
        .eq('petition_id', petitionId)
        .order('event_date', { ascending: true });

      if (eventsData) {
        const eventsWithCounts = eventsData.map((event: any) => ({
          ...event,
          rsvp_count: event.event_rsvps?.[0]?.count || 0,
        }));
        setEvents(eventsWithCounts);
      }

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', user.id)
          .single();

        if (profile) {
          const { data: signatureCheck } = await supabase
            .from('signatures')
            .select('id, opt_in_community')
            .eq('petition_id', petitionId)
            .eq('email', profile.email)
            .maybeSingle();

          setHasSigned(!!signatureCheck);
          setHasOptedInCommunity(signatureCheck?.opt_in_community || false);

          if (signatureCheck?.opt_in_community || petitionData.creator_id === user.id) {
            const { data: messagesData } = await supabase
              .from('community_messages')
              .select('*, profiles(full_name, email)')
              .eq('petition_id', petitionId)
              .order('created_at', { ascending: true });

            if (messagesData) setCommunityMessages(messagesData);
          }
        }
      }
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

  const handleSign = async (e: React.FormEvent) => {
    e.preventDefault();
    setSigning(true);

    try {
      const { error } = await supabase.from('signatures').insert({
        petition_id: petitionId,
        user_id: user?.id || null,
        name: signatureData.name,
        email: signatureData.email,
        comment: signatureData.comment || null,
        opt_in_tracking: signatureData.optInTracking,
        opt_in_community: signatureData.optInCommunity,
      });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: 'Already Signed',
            description: 'You have already signed this petition',
            variant: 'destructive',
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: 'Success!',
          description: 'Thank you for signing this petition',
        });
        setHasSigned(true);
        fetchPetitionData();
      }
    } catch (error) {
      console.error('Error signing petition:', error);
      toast({
        title: 'Error',
        description: 'Failed to sign petition',
        variant: 'destructive',
      });
    } finally {
      setSigning(false);
    }
  };

  const handlePostUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase.from('updates').insert({
        petition_id: petitionId,
        creator_id: user!.id,
        title: updateData.title,
        content: updateData.content,
      });

      if (error) throw error;

      toast({
        title: 'Update Posted',
        description: 'Your update has been shared with supporters',
      });

      setUpdateData({ title: '', content: '' });
      setShowUpdateForm(false);
      fetchPetitionData();
    } catch (error) {
      console.error('Error posting update:', error);
      toast({
        title: 'Error',
        description: 'Failed to post update',
        variant: 'destructive',
      });
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim()) return;

    setSendingMessage(true);
    try {
      const { error } = await supabase.from('community_messages').insert({
        petition_id: petitionId,
        user_id: user.id,
        message: newMessage,
      });

      if (error) throw error;

      setNewMessage('');
      fetchPetitionData();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: petition?.title,
          text: `Sign this petition: ${petition?.title}`,
          url: url,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(url);
      toast({
        title: 'Link Copied',
        description: 'Petition link copied to clipboard',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          </div>
        </main>
      </div>
    );
  }

  if (!petition) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Petition not found</h2>
            <Button onClick={() => router.push('/')} className="mt-4">
              Go Home
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const isCreator = user?.id === petition.creator_id;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              {petitionImage && (
                <Card className="overflow-hidden">
                  <img
                    src={petitionImage.image_url}
                    alt={petitionImage.alt_text || petition.title}
                    className="w-full h-64 md:h-96 object-cover"
                  />
                </Card>
              )}

              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <Badge variant="secondary">{petition.location}</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleShare}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                  <CardTitle className="text-3xl">{petition.title}</CardTitle>
                  {organization && (
                    <p className="text-gray-600 mt-2">
                      Addressed to: <span className="font-semibold">{organization.name}</span>
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-3">The Problem</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{petition.problem}</p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-xl font-semibold mb-3">Our Demands</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{petition.demands}</p>
                  </div>

                  <Separator />

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-gray-900 font-medium">{petition.call_to_action}</p>
                  </div>

                  {organization && (
                    <div className="flex gap-4">
                      {organization.website && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={organization.website} target="_blank" rel="noopener noreferrer">
                            Visit Website
                          </a>
                        </Button>
                      )}
                      {organization.contact_email && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={`mailto:${organization.contact_email}`}>
                            Contact Directly
                          </a>
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {(updates.length > 0 || hasOptedInCommunity || isCreator) && (
                <Card>
                  <Tabs defaultValue="updates">
                    <CardHeader>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="updates">Updates</TabsTrigger>
                        <TabsTrigger value="community" disabled={!hasOptedInCommunity && !isCreator}>
                          Community
                        </TabsTrigger>
                      </TabsList>
                    </CardHeader>
                    <CardContent>
                      <TabsContent value="updates" className="space-y-4">
                        {updates.length > 0 ? (
                          updates.map((update) => (
                            <div key={update.id} className="border-l-4 border-blue-600 pl-4">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">{update.title}</h4>
                                <span className="text-sm text-gray-500">
                                  {formatDistance(new Date(update.created_at), new Date(), {
                                    addSuffix: true,
                                  })}
                                </span>
                              </div>
                              <p className="text-gray-700 whitespace-pre-wrap">{update.content}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-center py-4">No updates yet</p>
                        )}
                      </TabsContent>
                      <TabsContent value="community" className="space-y-4">
                        {communityMessages.length > 0 ? (
                          <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
                            {communityMessages.map((msg) => (
                              <div key={msg.id} className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-sm">
                                    {msg.profiles.full_name || msg.profiles.email.split('@')[0]}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {formatDistance(new Date(msg.created_at), new Date(), {
                                      addSuffix: true,
                                    })}
                                  </span>
                                </div>
                                <p className="text-gray-700 text-sm">{msg.message}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-4">No messages yet. Start the conversation!</p>
                        )}
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                          <Input
                            placeholder="Write a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            disabled={sendingMessage}
                          />
                          <Button type="submit" size="icon" disabled={sendingMessage || !newMessage.trim()}>
                            <Send className="h-4 w-4" />
                          </Button>
                        </form>
                      </TabsContent>
                    </CardContent>
                  </Tabs>
                </Card>
              )}

              {isCreator && !showUpdateForm && (
                <Button
                  onClick={() => setShowUpdateForm(true)}
                  variant="outline"
                  className="w-full"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Post an Update
                </Button>
              )}

              {isCreator && showUpdateForm && (
                <Card>
                  <CardHeader>
                    <CardTitle>Post an Update</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePostUpdate} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="update-title">Update Title</Label>
                        <Input
                          id="update-title"
                          value={updateData.title}
                          onChange={(e) =>
                            setUpdateData({ ...updateData, title: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="update-content">Content</Label>
                        <Textarea
                          id="update-content"
                          value={updateData.content}
                          onChange={(e) =>
                            setUpdateData({ ...updateData, content: e.target.value })
                          }
                          className="min-h-[120px]"
                          required
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit">Post Update</Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowUpdateForm(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {events.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Events</CardTitle>
                      {isCreator && (
                        <Button
                          size="sm"
                          onClick={() => router.push(`/create-event?petitionId=${petitionId}`)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create Event
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {events.map((event) => {
                      const eventDate = new Date(event.event_date);
                      const isPast = eventDate < new Date();

                      return (
                        <div
                          key={event.id}
                          id={`event-${event.id}`}
                          className="border rounded-lg p-4 space-y-3"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <h4 className="font-semibold text-lg">{event.title}</h4>
                            {isPast && (
                              <Badge variant="secondary" className="text-xs">Past</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{event.description}</p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="h-4 w-4 text-primary" />
                              <span>{format(eventDate, 'EEEE, MMMM d, yyyy · h:mm a')}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="h-4 w-4 text-primary" />
                              <span>{event.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Users className="h-4 w-4 text-primary" />
                              <span>
                                {event.rsvp_count} RSVP{event.rsvp_count !== 1 ? 's' : ''}
                                {event.max_attendees && ` · ${event.max_attendees} max`}
                              </span>
                            </div>
                          </div>
                          {!isPast && event.ticketmaster_url && (
                            <Button
                              onClick={() => window.open(event.ticketmaster_url!, '_blank')}
                              size="sm"
                              className="w-full"
                            >
                              RSVP on Ticketmaster
                              <ExternalLink className="ml-2 h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}

              {isCreator && events.length === 0 && (
                <Card>
                  <CardContent className="py-8 text-center">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">No events yet</h3>
                    <p className="text-gray-600 mb-4">
                      Create an event to mobilize your supporters
                    </p>
                    <Button
                      onClick={() => router.push(`/create-event?petitionId=${petitionId}`)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Event
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {petition.signature_count}
                    </div>
                    <div className="text-gray-600 flex items-center justify-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>signatures</span>
                    </div>
                  </div>

                  {petition.goal_target && (
                    <div className="mb-6 space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          Goal Progress
                        </span>
                        <span className="font-semibold text-gray-900">
                          {petition.goal_type === 'signatures'
                            ? `${petition.signature_count} / ${petition.goal_target}`
                            : `${petition.signature_count} / ${petition.goal_target} ${petition.goal_description || ''}`
                          }
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min((petition.signature_count / petition.goal_target) * 100, 100)}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-center text-gray-500">
                        {Math.round((petition.signature_count / petition.goal_target) * 100)}% achieved
                      </p>
                    </div>
                  )}

                  {!hasSigned ? (
                    <form onSubmit={handleSign} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={signatureData.name}
                          onChange={(e) =>
                            setSignatureData({ ...signatureData, name: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={signatureData.email}
                          onChange={(e) =>
                            setSignatureData({ ...signatureData, email: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="comment">Comment (Optional)</Label>
                        <Textarea
                          id="comment"
                          value={signatureData.comment}
                          onChange={(e) =>
                            setSignatureData({ ...signatureData, comment: e.target.value })
                          }
                          placeholder="Why is this important to you?"
                          className="min-h-[80px]"
                        />
                      </div>
                      <div className="space-y-3 pt-2">
                        <div className="flex items-start space-x-2">
                          <Checkbox
                            id="opt-tracking"
                            checked={signatureData.optInTracking}
                            onCheckedChange={(checked) =>
                              setSignatureData({ ...signatureData, optInTracking: checked as boolean })
                            }
                          />
                          <label
                            htmlFor="opt-tracking"
                            className="text-sm text-gray-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            Keep me updated on progress and new developments
                          </label>
                        </div>
                        <div className="flex items-start space-x-2">
                          <Checkbox
                            id="opt-community"
                            checked={signatureData.optInCommunity}
                            onCheckedChange={(checked) =>
                              setSignatureData({ ...signatureData, optInCommunity: checked as boolean })
                            }
                          />
                          <label
                            htmlFor="opt-community"
                            className="text-sm text-gray-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            Join the community chat to connect with other supporters
                          </label>
                        </div>
                      </div>
                      <Button
                        type="submit"
                        className="w-full"
                        size="lg"
                        disabled={signing}
                      >
                        {signing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing...
                          </>
                        ) : (
                          'Sign This Petition'
                        )}
                      </Button>
                    </form>
                  ) : (
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-green-800 font-semibold">
                        You signed this petition
                      </p>
                      <p className="text-sm text-green-600 mt-1">
                        Thank you for your support!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Created{' '}
                      {formatDistance(new Date(petition.created_at), new Date(), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}
