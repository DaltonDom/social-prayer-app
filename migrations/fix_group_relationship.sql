-- First, make sure the groups table exists
CREATE TABLE IF NOT EXISTS groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Drop existing foreign key if it exists
ALTER TABLE prayers 
DROP CONSTRAINT IF EXISTS prayers_group_id_fkey;

-- Add the foreign key constraint with the correct name
ALTER TABLE prayers
ADD CONSTRAINT prayers_group_id_fkey 
FOREIGN KEY (group_id) 
REFERENCES groups(id)
ON DELETE SET NULL;

-- Enable RLS on groups table
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

-- Create policy for groups
CREATE POLICY "Enable read access for authenticated users"
ON groups FOR SELECT
TO authenticated
USING (true);

-- Create some test groups
INSERT INTO groups (name, description, created_by)
VALUES 
('Prayer Warriors', 'A group dedicated to daily prayer', '0cd83266-ae35-4061-9ebb-5a56ef77bb35'),
('Family Circle', 'Family prayer support group', '0cd83266-ae35-4061-9ebb-5a56ef77bb35')
ON CONFLICT (id) DO NOTHING;
