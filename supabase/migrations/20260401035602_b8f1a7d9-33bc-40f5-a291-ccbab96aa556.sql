
create extension if not exists "uuid-ossp";

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  language text default 'en',
  created_at timestamptz default now()
);

create table public.driver_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  display_name text not null,
  photo_url text,
  truck_type text,
  bio text,
  status text default 'available' check (status in ('available','driving','resting','dnd')),
  visibility_mode text default 'visible_nearby' check (visibility_mode in ('visible_nearby','visible_channels','hidden')),
  dnd_enabled boolean default false,
  created_at timestamptz default now(),
  unique(user_id)
);

create table public.driver_presence (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  lat double precision,
  lng double precision,
  current_route text,
  heading double precision,
  last_seen_at timestamptz default now(),
  is_visible boolean default true,
  status text default 'available',
  unique(user_id)
);

create table public.route_channels (
  id uuid primary key default uuid_generate_v4(),
  route_name text not null,
  route_code text not null unique,
  description text,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table public.route_channel_members (
  id uuid primary key default uuid_generate_v4(),
  channel_id uuid not null references public.route_channels(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  joined_at timestamptz default now(),
  muted boolean default false,
  unique(channel_id, user_id)
);

create table public.route_messages (
  id uuid primary key default uuid_generate_v4(),
  channel_id uuid not null references public.route_channels(id) on delete cascade,
  sender_user_id uuid not null references public.users(id) on delete cascade,
  text_content text not null,
  created_at timestamptz default now()
);

create table public.reports (
  id uuid primary key default uuid_generate_v4(),
  reporter_user_id uuid not null references public.users(id),
  target_type text not null check (target_type in ('user','message')),
  target_id uuid not null,
  reason text not null,
  created_at timestamptz default now()
);

insert into public.route_channels (route_name, route_code, description) values
  ('I-95 North', 'I95N', 'Interstate 95 Northbound'),
  ('I-95 South', 'I95S', 'Interstate 95 Southbound'),
  ('I-80 East', 'I80E', 'Interstate 80 Eastbound'),
  ('I-80 West', 'I80W', 'Interstate 80 Westbound'),
  ('I-40 East', 'I40E', 'Interstate 40 Eastbound'),
  ('I-40 West', 'I40W', 'Interstate 40 Westbound'),
  ('I-10 East', 'I10E', 'Interstate 10 Eastbound'),
  ('I-10 West', 'I10W', 'Interstate 10 Westbound'),
  ('NJ Turnpike South', 'NJTS', 'NJ Turnpike Southbound'),
  ('NJ Turnpike North', 'NJTN', 'NJ Turnpike Northbound');

alter table public.users enable row level security;
alter table public.driver_profiles enable row level security;
alter table public.driver_presence enable row level security;
alter table public.route_channels enable row level security;
alter table public.route_channel_members enable row level security;
alter table public.route_messages enable row level security;
alter table public.reports enable row level security;

create policy "users_select_own" on public.users for select using (auth.uid() = id);
create policy "users_insert_own" on public.users for insert with check (auth.uid() = id);
create policy "users_update_own" on public.users for update using (auth.uid() = id);

create policy "profiles_select_all" on public.driver_profiles for select using (true);
create policy "profiles_insert_own" on public.driver_profiles for insert with check (auth.uid() = user_id);
create policy "profiles_update_own" on public.driver_profiles for update using (auth.uid() = user_id);

create policy "presence_select_visible" on public.driver_presence for select using (is_visible = true or user_id = auth.uid());
create policy "presence_insert_own" on public.driver_presence for insert with check (auth.uid() = user_id);
create policy "presence_update_own" on public.driver_presence for update using (auth.uid() = user_id);

create policy "channels_select_all" on public.route_channels for select using (true);

create policy "members_select_all" on public.route_channel_members for select using (true);
create policy "members_insert_own" on public.route_channel_members for insert with check (auth.uid() = user_id);
create policy "members_delete_own" on public.route_channel_members for delete using (auth.uid() = user_id);
create policy "members_update_own" on public.route_channel_members for update using (auth.uid() = user_id);

create policy "messages_select_all" on public.route_messages for select using (true);
create policy "messages_insert_own" on public.route_messages for insert with check (auth.uid() = sender_user_id);

create policy "reports_insert_own" on public.reports for insert with check (auth.uid() = reporter_user_id);
