-- 3A: Foreign key constraints on blocked_users
ALTER TABLE public.blocked_users
  ADD CONSTRAINT fk_blocked_users_blocker
    FOREIGN KEY (blocker_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_blocked_users_blocked
    FOREIGN KEY (blocked_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3B: Unique constraint for upsert on channel_read_cursors
ALTER TABLE public.channel_read_cursors
  ADD CONSTRAINT uq_channel_read_cursors_user_channel
    UNIQUE (user_id, channel_id);

-- 3D: Performance indexes
CREATE INDEX IF NOT EXISTS idx_route_messages_channel_created
  ON public.route_messages(channel_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_direct_messages_conversation
  ON public.direct_messages(sender_id, receiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_driver_presence_last_seen
  ON public.driver_presence(last_seen_at DESC);

-- 6B + 4C: Add theme and language columns to driver_profiles
ALTER TABLE public.driver_profiles
  ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'dark',
  ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';
