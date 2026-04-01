
-- Speed up membership lookups by user
CREATE INDEX IF NOT EXISTS idx_route_channel_members_user_id ON public.route_channel_members(user_id);

-- Speed up member counts by channel
CREATE INDEX IF NOT EXISTS idx_route_channel_members_channel_id ON public.route_channel_members(channel_id);

-- Speed up nearby driver queries
CREATE INDEX IF NOT EXISTS idx_driver_presence_geo ON public.driver_presence(is_visible, lat, lng) WHERE is_visible = true;

-- Speed up message loading by channel
CREATE INDEX IF NOT EXISTS idx_route_messages_channel_created ON public.route_messages(channel_id, created_at DESC);

-- Speed up profile lookups by user_id
CREATE INDEX IF NOT EXISTS idx_driver_profiles_user_id ON public.driver_profiles(user_id);
