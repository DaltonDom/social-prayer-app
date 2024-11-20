-- Check the current structure of the prayers table
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default,
    tc.constraint_name,
    tc.constraint_type
FROM information_schema.columns c
LEFT JOIN information_schema.constraint_column_usage ccu 
    ON c.column_name = ccu.column_name 
    AND c.table_name = ccu.table_name
LEFT JOIN information_schema.table_constraints tc
    ON ccu.constraint_name = tc.constraint_name
WHERE c.table_name = 'prayers'
ORDER BY ordinal_position;
