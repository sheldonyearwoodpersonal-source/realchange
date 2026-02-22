/*
  # CivicSpark Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, references auth.users)
      - `email` (text)
      - `full_name` (text)
      - `created_at` (timestamptz)
    
    - `organizations`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `power_description` (text) - what power/authority they have
      - `website` (text)
      - `contact_email` (text)
      - `category` (text) - e.g., local-government, non-profit, etc.
      - `location` (text)
      - `created_at` (timestamptz)
    
    - `petitions`
      - `id` (uuid, primary key)
      - `creator_id` (uuid, references profiles)
      - `organization_id` (uuid, references organizations)
      - `title` (text)
      - `problem` (text)
      - `demands` (text)
      - `call_to_action` (text)
      - `issue` (text) - original user issue
      - `location` (text)
      - `signature_count` (integer)
      - `status` (text) - draft, published, closed
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `signatures`
      - `id` (uuid, primary key)
      - `petition_id` (uuid, references petitions)
      - `user_id` (uuid, references profiles, nullable for anonymous)
      - `name` (text) - for display
      - `email` (text)
      - `comment` (text, optional)
      - `created_at` (timestamptz)
    
    - `updates`
      - `id` (uuid, primary key)
      - `petition_id` (uuid, references petitions)
      - `creator_id` (uuid, references profiles)
      - `title` (text)
      - `content` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Profiles: users can read all, update own
    - Organizations: public read, authenticated insert
    - Petitions: public read published, creators manage own
    - Signatures: public read, authenticated insert
    - Updates: public read, creators insert for own petitions
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  power_description text,
  website text,
  contact_email text,
  category text,
  location text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizations are viewable by everyone"
  ON organizations FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can create organizations"
  ON organizations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create petitions table
CREATE TABLE IF NOT EXISTS petitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  title text NOT NULL,
  problem text NOT NULL,
  demands text NOT NULL,
  call_to_action text NOT NULL,
  issue text,
  location text,
  signature_count integer DEFAULT 0,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE petitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published petitions are viewable by everyone"
  ON petitions FOR SELECT
  TO anon, authenticated
  USING (status = 'published' OR creator_id = auth.uid());

CREATE POLICY "Users can create own petitions"
  ON petitions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update own petitions"
  ON petitions FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can delete own petitions"
  ON petitions FOR DELETE
  TO authenticated
  USING (auth.uid() = creator_id);

-- Create signatures table
CREATE TABLE IF NOT EXISTS signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  petition_id uuid NOT NULL REFERENCES petitions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL,
  comment text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(petition_id, email)
);

ALTER TABLE signatures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Signatures are viewable by everyone"
  ON signatures FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can sign petitions"
  ON signatures FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Create updates table
CREATE TABLE IF NOT EXISTS updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  petition_id uuid NOT NULL REFERENCES petitions(id) ON DELETE CASCADE,
  creator_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Updates are viewable by everyone"
  ON updates FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Petition creators can post updates"
  ON updates FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM petitions
      WHERE petitions.id = petition_id
      AND petitions.creator_id = auth.uid()
    )
  );

-- Create function to auto-update petition signature count
CREATE OR REPLACE FUNCTION update_petition_signature_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE petitions
  SET signature_count = (
    SELECT COUNT(*) FROM signatures WHERE petition_id = NEW.petition_id
  )
  WHERE id = NEW.petition_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for signature count
DROP TRIGGER IF EXISTS trigger_update_signature_count ON signatures;
CREATE TRIGGER trigger_update_signature_count
  AFTER INSERT ON signatures
  FOR EACH ROW
  EXECUTE FUNCTION update_petition_signature_count();

-- Create function to auto-update petition updated_at
CREATE OR REPLACE FUNCTION update_petition_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_petition_updated_at ON petitions;
CREATE TRIGGER trigger_update_petition_updated_at
  BEFORE UPDATE ON petitions
  FOR EACH ROW
  EXECUTE FUNCTION update_petition_updated_at();