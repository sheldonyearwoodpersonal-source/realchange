'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, ExternalLink, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  ticketmaster_url: string | null;
  max_attendees: number | null;
  petition_id: string;
  petitions: {
    title: string;
  };
  rsvp_count: number;
}

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  const fetchEvents = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('events')
        .select(`
          *,
          petitions!inner(title),
          event_rsvps(count)
        `)
        .order('event_date', { ascending: true });

      if (filter === 'upcoming') {
        query = query.gte('event_date', new Date().toISOString());
      } else if (filter === 'past') {
        query = query.lt('event_date', new Date().toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      const eventsWithCounts = data?.map((event: any) => ({
        ...event,
        rsvp_count: event.event_rsvps?.[0]?.count || 0,
      })) || [];

      setEvents(eventsWithCounts);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = (event: Event) => {
    if (event.ticketmaster_url) {
      window.open(event.ticketmaster_url, '_blank');
    } else {
      router.push(`/petition/${event.petition_id}#event-${event.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="flex justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Events</h1>
            <p className="text-xl text-gray-600">
              Join community events organized around active petitions
            </p>
          </div>

          <div className="flex gap-2 mb-8">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
            >
              All Events
            </Button>
            <Button
              variant={filter === 'upcoming' ? 'default' : 'outline'}
              onClick={() => setFilter('upcoming')}
            >
              Upcoming
            </Button>
            <Button
              variant={filter === 'past' ? 'default' : 'outline'}
              onClick={() => setFilter('past')}
            >
              Past Events
            </Button>
          </div>

          {events.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-xl text-gray-600 mb-2">No events found</p>
                <p className="text-gray-500">
                  {filter === 'upcoming'
                    ? 'Check back soon for upcoming events'
                    : 'No events match your filter'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {events.map((event) => {
                const eventDate = new Date(event.event_date);
                const isPast = eventDate < new Date();

                return (
                  <Card key={event.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">{event.title}</CardTitle>
                          <CardDescription className="line-clamp-2">
                            {event.description}
                          </CardDescription>
                        </div>
                        {isPast && (
                          <Badge variant="secondary">Past Event</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
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

                      <div className="pt-4 border-t">
                        <p className="text-sm text-gray-500 mb-3">
                          Related to: <span className="font-medium">{event.petitions.title}</span>
                        </p>
                        <div className="flex gap-2">
                          {!isPast && (
                            <Button
                              onClick={() => handleRSVP(event)}
                              className="flex-1"
                            >
                              {event.ticketmaster_url ? (
                                <>
                                  RSVP on Ticketmaster
                                  <ExternalLink className="ml-2 h-4 w-4" />
                                </>
                              ) : (
                                'View Details'
                              )}
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            onClick={() => router.push(`/petition/${event.petition_id}`)}
                          >
                            View Petition
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
