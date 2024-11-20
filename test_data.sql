-- First, declare variables for our test user IDs
DO $$
DECLARE
    john_id uuid := gen_random_uuid();
    jane_id uuid := gen_random_uuid();
    mike_id uuid := gen_random_uuid();
    sarah_id uuid := gen_random_uuid();
    david_id uuid := gen_random_uuid();
    your_id uuid := '0cd83266-ae35-4061-9ebb-5a56ef77bb35';
BEGIN

-- First clean up any existing friendships involving you
DELETE FROM public.friendships 
WHERE user_id = your_id OR friend_id = your_id;

-- Delete existing test profiles if they exist
DELETE FROM auth.users 
WHERE id IN (
  john_id,
  jane_id,
  mike_id,
  sarah_id,
  david_id
);

DELETE FROM public.profiles 
WHERE id IN (
  john_id,
  jane_id,
  mike_id,
  sarah_id,
  david_id
);

-- Create test users in auth.users table
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES
  -- Test User 1 (John Doe)
  (john_id, '00000000-0000-0000-0000-000000000000', 'john.doe@example.com', 
   crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}',
   '{"name":"John Doe"}', false, 'authenticated', '', '', '', ''),
  
  -- Test User 2 (Jane Smith)
  (jane_id, '00000000-0000-0000-0000-000000000000', 'jane.smith@example.com',
   crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}',
   '{"name":"Jane Smith"}', false, 'authenticated', '', '', '', ''),
  
  -- Test User 3 (Mike Johnson)
  (mike_id, '00000000-0000-0000-0000-000000000000', 'mike.johnson@example.com',
   crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}',
   '{"name":"Mike Johnson"}', false, 'authenticated', '', '', '', ''),
  
  -- Test User 4 (Sarah Williams)
  (sarah_id, '00000000-0000-0000-0000-000000000000', 'sarah.williams@example.com',
   crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}',
   '{"name":"Sarah Williams"}', false, 'authenticated', '', '', '', ''),
  
  -- Test User 5 (David Brown)
  (david_id, '00000000-0000-0000-0000-000000000000', 'david.brown@example.com',
   crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}',
   '{"name":"David Brown"}', false, 'authenticated', '', '', '', '');

-- Create the profile records for test users
INSERT INTO public.profiles (id, first_name, last_name, email, profile_image_url)
VALUES
  (john_id, 'John', 'Doe', 'john.doe@example.com', 'https://ui-avatars.com/api/?name=John+Doe'),
  (jane_id, 'Jane', 'Smith', 'jane.smith@example.com', 'https://ui-avatars.com/api/?name=Jane+Smith'),
  (mike_id, 'Mike', 'Johnson', 'mike.johnson@example.com', 'https://ui-avatars.com/api/?name=Mike+Johnson'),
  (sarah_id, 'Sarah', 'Williams', 'sarah.williams@example.com', 'https://ui-avatars.com/api/?name=Sarah+Williams'),
  (david_id, 'David', 'Brown', 'david.brown@example.com', 'https://ui-avatars.com/api/?name=David+Brown');

-- Create friendships with your actual UUID
INSERT INTO public.friendships (user_id, friend_id, status)
VALUES
  -- Accepted friendships
  (your_id, john_id, 'accepted'),
  (jane_id, your_id, 'accepted'),
  
  -- Pending friend requests to you
  (mike_id, your_id, 'pending'),
  (sarah_id, your_id, 'pending'),
  
  -- Pending friend request from you
  (your_id, david_id, 'pending');

END $$;
