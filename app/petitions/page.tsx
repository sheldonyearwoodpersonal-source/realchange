'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Users, MapPin, Search, Target } from 'lucide-react';
import { formatDistance } from 'date-fns';

type Petition = {
  id: string;
  title: string;
  location: string;
  signature_count: number;
  created_at: string;
  problem: string;
  goal_type: string | null;
  goal_target: number | null;
  goal_description: string | null;
  petition_images: {
    image_url: string;
    alt_text: string | null;
  }[];
};

export default function PetitionsPage() {
  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [filteredPetitions, setFilteredPetitions] = useState<Petition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    fetchPetitions();
  }, []);

  useEffect(() => {
    let filtered = [...petitions];

    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.problem.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === 'popular') {
      filtered.sort((a, b) => b.signature_count - a.signature_count);
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }

    setFilteredPetitions(filtered);
  }, [petitions, searchTerm, sortBy]);

  const fetchPetitions = async () => {
    try {
      const { data, error } = await supabase
        .from('petitions')
        .select(`
          id,
          title,
          location,
          signature_count,
          created_at,
          problem,
          goal_type,
          goal_target,
          goal_description,
          petition_images(image_url, alt_text)
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processedData = data?.map(petition => ({
        ...petition,
        petition_images: petition.petition_images?.filter((img: any) => img) || []
      })) || [];

      setPetitions(processedData);
    } catch (error) {
      console.error('Error fetching petitions:', error);
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Active Petitions
            </h1>
            <p className="text-gray-600 mb-6">
              Browse and support petitions making change in communities
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search petitions by title, location, or issue..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {petitions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-600 mb-4">
                  No petitions yet. Be the first to create one!
                </p>
                <Button asChild>
                  <Link href="/">Start a Petition</Link>
                </Button>
              </CardContent>
            </Card>
          ) : filteredPetitions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-600">
                  No petitions match your search criteria.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredPetitions.map((petition) => (
                <Card key={petition.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                  {petition.petition_images && petition.petition_images.length > 0 && (
                    <div className="relative h-48 w-full">
                      <img
                        src={petition.petition_images[0].image_url}
                        alt={petition.petition_images[0].alt_text || petition.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
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
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {petition.location}
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
                    <p className="text-gray-700 line-clamp-3 mb-4">
                      {petition.problem}
                    </p>

                    {petition.goal_target && (
                      <div className="mb-4 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            Goal
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
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Started{' '}
                        {formatDistance(new Date(petition.created_at), new Date(), {
                          addSuffix: true,
                        })}
                      </span>
                      <Button asChild>
                        <Link href={`/petition/${petition.id}`}>Sign Petition</Link>
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
