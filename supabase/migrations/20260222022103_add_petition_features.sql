/*
  # Add Petition Features - Images, Opt-in Tracking, and Community Chat

  ## Overview
  This migration adds comprehensive features for petition images, signature opt-ins, 
  progress tracking updates, and community chat boards.

  ## Changes

  ### 1. New Tables
  
  #### `petition_images`
  - `id` (uuid, primary key) - Unique identifier
  - `petition_id` (uuid, foreign key) - Links to petitions table
  - `image_url` (text) - URL to the petition image (Pexels or uploaded)
  - `alt_text` (text, nullable) - Accessibility description
  - `is_primary` (boolean) - Whether this is the main petition image
  - `created_at` (timestamptz) - Creation timestamp

  #### `community_messages`
  - `id` (uuid, primary key) - Unique identifier
  - `petition_id` (uuid, foreign key) - Links to petitions table
  - `user_id` (uuid, foreign key) - Links to profiles table
  - `message` (text) - The chat message content
  - `created_at` (timestamptz) - Creation timestamp

  ### 2. Modified Tables
  
  #### `signatures`
  - Added `opt_in_tracking` (boolean) - User opted into progress updates
  - Added `opt_in_community` (boolean) - User opted into community chat access

  ## Security
  - RLS enabled on all new tables
  - Petition images: Anyone can view, only creators can add/modify
  - Community messages: Only users who opted in can post/view
  - Signatures opt-in fields: Only signature owner can modify
*/

-- Add opt-in fields to signatures table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'signatures' AND column_name = 'opt_in_tracking'
  ) THEN
    ALTER TABLE signatures ADD COLUMN opt_in_tracking boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'signatures' AND column_name = 'opt_in_community'
  ) THEN
    ALTER TABLE signatures ADD COLUMN opt_in_community boolean DEFAULT false;
  END IF;
END $$;

-- Create petition_images table
CREATE TABLE IF NOT EXISTS petition_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  petition_id uuid NOT NULL REFERENCES petitions(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  alt_text text,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE petition_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view petition images"
  ON petition_images FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Petition creators can add images"
  ON petition_images FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM petitions
      WHERE petitions.id = petition_images.petition_id
      AND petitions.creator_id = auth.uid()
    )
  );

CREATE POLICY "Petition creators can update their images"
  ON petition_images FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM petitions
      WHERE petitions.id = petition_images.petition_id
      AND petitions.creator_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM petitions
      WHERE petitions.id = petition_images.petition_id
      AND petitions.creator_id = auth.uid()
    )
  );

CREATE POLICY "Petition creators can delete their images"
  ON petition_images FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM petitions
      WHERE petitions.id = petition_images.petition_id
      AND petitions.creator_id = auth.uid()
    )
  );

-- Create community_messages table
CREATE TABLE IF NOT EXISTS community_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  petition_id uuid NOT NULL REFERENCES petitions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE community_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users who opted in can view messages"
  ON community_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM signatures
      WHERE signatures.petition_id = community_messages.petition_id
      AND signatures.user_id = auth.uid()
      AND signatures.opt_in_community = true
    )
    OR
    EXISTS (
      SELECT 1 FROM petitions
      WHERE petitions.id = community_messages.petition_id
      AND petitions.creator_id = auth.uid()
    )
  );

CREATE POLICY "Users who opted in can post messages"
  ON community_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND (
      EXISTS (
        SELECT 1 FROM signatures
        WHERE signatures.petition_id = community_messages.petition_id
        AND signatures.user_id = auth.uid()
        AND signatures.opt_in_community = true
      )
      OR
      EXISTS (
        SELECT 1 FROM petitions
        WHERE petitions.id = community_messages.petition_id
        AND petitions.creator_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete own messages"
  ON community_messages FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_petition_images_petition_id ON petition_images(petition_id);
CREATE INDEX IF NOT EXISTS idx_petition_images_is_primary ON petition_images(petition_id, is_primary);
CREATE INDEX IF NOT EXISTS idx_community_messages_petition_id ON community_messages(petition_id);
CREATE INDEX IF NOT EXISTS idx_community_messages_created_at ON community_messages(petition_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_signatures_opt_in ON signatures(petition_id, opt_in_community) WHERE opt_in_community = true;