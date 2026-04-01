
-- Auto-create user record on auth signup to prevent race conditions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Unique constraint on driver_profiles(user_id) for upsert support
ALTER TABLE public.driver_profiles
  ADD CONSTRAINT driver_profiles_user_id_unique UNIQUE (user_id);

-- Unique constraint on route_channel_members for upsert support
ALTER TABLE public.route_channel_members
  ADD CONSTRAINT route_channel_members_channel_user_unique UNIQUE (channel_id, user_id);
