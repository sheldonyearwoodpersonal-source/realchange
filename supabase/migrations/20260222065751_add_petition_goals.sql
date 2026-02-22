/*
  # Add Goal Tracking to Petitions

  ## Overview
  This migration adds goal tracking functionality to petitions, allowing creators
  to set a target goal (number of signatures or custom goal) and track progress.

  ## Changes

  ### Modified Tables
  
  #### `petitions`
  - `goal_type` (text) - Type of goal: 'signatures' or 'custom'
  - `goal_target` (integer) - Target number for the goal
  - `goal_description` (text, nullable) - Custom description for non-signature goals

  ## Notes
  - goal_type defaults to 'signatures' for backward compatibility
  - goal_target can be null if no goal is set
  - goal_description is only used for custom goals
*/

-- Add goal fields to petitions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'petitions' AND column_name = 'goal_type'
  ) THEN
    ALTER TABLE petitions ADD COLUMN goal_type text DEFAULT 'signatures';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'petitions' AND column_name = 'goal_target'
  ) THEN
    ALTER TABLE petitions ADD COLUMN goal_target integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'petitions' AND column_name = 'goal_description'
  ) THEN
    ALTER TABLE petitions ADD COLUMN goal_description text;
  END IF;
END $$;