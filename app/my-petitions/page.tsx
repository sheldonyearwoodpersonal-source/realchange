'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Users, Edit, Target } from 'lucide-react';
import { formatDistance } from 'date-fns';

type Petition = {
  id: string;
  title: string;
  location: string;
  signature_count: number;
  created_at: string;
  status: string;
  goal_type: string | null;
  goal_target: number | null;
  goal_description: string | null;
};

export default function MyPetitionsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
      return;
    }

    if (user) {
      fetchMyPetitions();
    }
  }, [user, authLoading]);

  const fetchMyPetitions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('petitions')
        .select('id, title, location, signature_count, created_at, status, goal_type, goal_target, goal_description')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPetitions(data || []);
    } catch (error) {
      console.error('Error fetching petitions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              My Petitions
            </h1>
            <p className="text-gray-600">
              Manage and track your petitions
            </p>
          </div>

          {petitions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-600 mb-4">
                  You haven't created any petitions yet
                </p>
                <Button asChild>
                  <Link href="/">Create Your First Petition</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {petitions.map((petition) => (
                <Card key={petition.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-2xl mb-3">
                          <Link
                            href={`/petition/${petition.id}`}
                            className="hover:text-blue-600 transition-colors"
                          >
                            {petition.title}
                          </Link>
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{petition.location}</Badge>
                          <Badge
                            variant={
                              petition.status === 'published'
                                ? 'default'
                                : petition.status === 'draft'
                                ? 'outline'
                                : 'secondary'
                            }
                          >
                            {petition.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-blue-600">
                          {petition.signature_count}
                        </div>
                        <div className="text-sm text-gray-600 flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>signatures</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {petition.goal_target && (
                      <div className="mb-4 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            Goal Progress
                          </span>
                          <span className="font-semibold text-gray-900">
                            {petition.goal_type === 'signatures'
                              ? `${petition.signature_count} / ${petition.goal_target}`
                              : `${petition.signature_count} / ${petition.goal_target} ${petition.goal_description || ''}`
                            }
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min((petition.signature_count / petition.goal_target) * 100, 100)}%`,
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          {Math.round((petition.signature_count / petition.goal_target) * 100)}% achieved
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Created{' '}
                        {formatDistance(new Date(petition.created_at), new Date(), {
                          addSuffix: true,
                        })}
                      </span>
                      <Button asChild>
                        <Link href={`/petition/${petition.id}`}>
                          <Edit className="h-4 w-4 mr-2" />
                          View & Manage
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
