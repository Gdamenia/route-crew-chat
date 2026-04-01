
-- Voice/location messages support for route_messages
ALTER TABLE public.route_messages ADD COLUMN message_type TEXT DEFAULT 'text';
ALTER TABLE public.route_messages ADD COLUMN media_url TEXT;
ALTER TABLE public.route_messages ADD COLUMN location_lat DOUBLE PRECISION;
ALTER TABLE public.route_messages ADD COLUMN location_lng DOUBLE PRECISION;

-- Voice/location messages support for direct_messages
ALTER TABLE public.direct_messages ADD COLUMN message_type TEXT DEFAULT 'text';
ALTER TABLE public.direct_messages ADD COLUMN media_url TEXT;
ALTER TABLE public.direct_messages ADD COLUMN location_lat DOUBLE PRECISION;
ALTER TABLE public.direct_messages ADD COLUMN location_lng DOUBLE PRECISION;

-- Driver verification
ALTER TABLE public.driver_profiles ADD COLUMN is_verified BOOLEAN DEFAULT false;

-- Blocked users
CREATE TABLE public.blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL,
  blocked_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);

ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "blocked_select_own" ON public.blocked_users FOR SELECT USING (auth.uid() = blocker_id);
CREATE POLICY "blocked_insert_own" ON public.blocked_users FOR INSERT WITH CHECK (auth.uid() = blocker_id);
CREATE POLICY "blocked_delete_own" ON public.blocked_users FOR DELETE USING (auth.uid() = blocker_id);

CREATE INDEX idx_blocked_users_blocker ON public.blocked_users(blocker_id);
CREATE INDEX idx_blocked_users_blocked ON public.blocked_users(blocked_id);

-- Channel read cursors for unread tracking
CREATE TABLE public.channel_read_cursors (
  user_id UUID NOT NULL,
  channel_id UUID NOT NULL,
  last_read_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, channel_id)
);

ALTER TABLE public.channel_read_cursors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cursor_select_own" ON public.channel_read_cursors FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "cursor_upsert_own" ON public.channel_read_cursors FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cursor_update_own" ON public.channel_read_cursors FOR UPDATE USING (auth.uid() = user_id);

-- Voice messages storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('voice-messages', 'voice-messages', true) ON CONFLICT DO NOTHING;
CREATE POLICY "Voice messages are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'voice-messages');
CREATE POLICY "Users can upload voice messages" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'voice-messages' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add more route channels
INSERT INTO public.route_channels (route_name, route_code, description) VALUES
  ('I-5 North', 'I5N', 'Interstate 5 Northbound — West Coast'),
  ('I-5 South', 'I5S', 'Interstate 5 Southbound — West Coast'),
  ('I-70 East', 'I70E', 'Interstate 70 Eastbound — Midwest'),
  ('I-70 West', 'I70W', 'Interstate 70 Westbound — Midwest'),
  ('I-75 North', 'I75N', 'Interstate 75 Northbound'),
  ('I-75 South', 'I75S', 'Interstate 75 Southbound'),
  ('I-90 East', 'I90E', 'Interstate 90 Eastbound — Northern US'),
  ('I-90 West', 'I90W', 'Interstate 90 Westbound — Northern US'),
  ('I-20 East', 'I20E', 'Interstate 20 Eastbound — Southern US'),
  ('I-20 West', 'I20W', 'Interstate 20 Westbound — Southern US'),
  ('I-65 North', 'I65N', 'Interstate 65 Northbound'),
  ('I-65 South', 'I65S', 'Interstate 65 Southbound'),
  ('I-81 North', 'I81N', 'Interstate 81 Northbound — Appalachian'),
  ('I-81 South', 'I81S', 'Interstate 81 Southbound — Appalachian'),
  ('PA Turnpike East', 'PATE', 'Pennsylvania Turnpike Eastbound'),
  ('PA Turnpike West', 'PATW', 'Pennsylvania Turnpike Westbound')
ON CONFLICT (route_code) DO NOTHING;
