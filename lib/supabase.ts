import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          created_at?: string;
        };
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          power_description: string | null;
          website: string | null;
          contact_email: string | null;
          category: string | null;
          location: string | null;
          created_at: string;
        };
      };
      petitions: {
        Row: {
          id: string;
          creator_id: string;
          organization_id: string | null;
          title: string;
          problem: string;
          demands: string;
          call_to_action: string;
          issue: string | null;
          location: string | null;
          signature_count: number;
          status: 'draft' | 'published' | 'closed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          creator_id: string;
          organization_id?: string | null;
          title: string;
          problem: string;
          demands: string;
          call_to_action: string;
          issue?: string | null;
          location?: string | null;
          signature_count?: number;
          status?: 'draft' | 'published' | 'closed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          problem?: string;
          demands?: string;
          call_to_action?: string;
          status?: 'draft' | 'published' | 'closed';
          updated_at?: string;
        };
      };
      signatures: {
        Row: {
          id: string;
          petition_id: string;
          user_id: string | null;
          name: string;
          email: string;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          petition_id: string;
          user_id?: string | null;
          name: string;
          email: string;
          comment?: string | null;
          created_at?: string;
        };
      };
      updates: {
        Row: {
          id: string;
          petition_id: string;
          creator_id: string;
          title: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          petition_id: string;
          creator_id: string;
          title: string;
          content: string;
          created_at?: string;
        };
      };
    };
  };
};
