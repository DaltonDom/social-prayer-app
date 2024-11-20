-- Get the IDs of our test groups
WITH group_ids AS (
  SELECT id FROM groups WHERE name IN ('Prayer Warriors', 'Family Circle') LIMIT 2
)
-- Update some existing prayers to be associated with these groups
UPDATE prayers
SET group_id = (
  SELECT id 
  FROM group_ids 
  ORDER BY random() 
  LIMIT 1
)
WHERE id IN (
  SELECT id 
  FROM prayers 
  ORDER BY created_at DESC 
  LIMIT 5
);
