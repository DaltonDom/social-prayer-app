-- Add group_id column to prayers table
ALTER TABLE prayers
ADD COLUMN group_id UUID REFERENCES groups(id);

-- Add foreign key constraint
ALTER TABLE prayers
ADD CONSTRAINT prayers_group_id_fkey 
FOREIGN KEY (group_id) 
REFERENCES groups(id)
ON DELETE SET NULL;
