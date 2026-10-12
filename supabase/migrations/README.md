Migrations applied to the Supabase project (triple-e-planner) for petpost:
- petpost_init: petpost_* tables, row-level security policies, petpost-media storage bucket
- petpost_username_available: RPC for checking usernames during sign-up
- petpost_admin_avatars: avatar_path on profiles, petpost_admins table, admin policies for reports/posts/media
- petpost_media_select: lets owners/admins see their media rows (storage deletes need this)

To make someone an admin (run in the Supabase SQL editor, replacing the username):
  insert into public.petpost_admins (user_id)
  select id from public.petpost_profiles where lower(username) = lower('YOUR_USERNAME');
