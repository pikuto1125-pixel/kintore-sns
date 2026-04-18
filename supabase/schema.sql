-- Enable required extensions
create extension if not exists "uuid-ossp";

-- Profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  avatar_url text,
  bio text,
  last_trained_at timestamptz,
  can_post boolean default false not null,
  created_at timestamptz default now() not null
);

-- Workout sessions table
create table public.workout_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  exercises jsonb not null default '[]',
  total_reps integer not null default 0,
  duration_seconds integer not null default 0,
  verified boolean default false not null,
  created_at timestamptz default now() not null
);

-- Posts table
create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  badges text[] default '{}' not null,
  workout_session_id uuid references public.workout_sessions(id) on delete set null,
  likes_count integer default 0 not null,
  created_at timestamptz default now() not null
);

-- Likes table
create table public.likes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  unique(user_id, post_id)
);

-- RLS Policies
alter table public.profiles enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.posts enable row level security;
alter table public.likes enable row level security;

-- Profiles policies
create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Workout sessions policies
create policy "Workout sessions viewable by everyone"
  on public.workout_sessions for select using (true);

create policy "Users can insert own workout sessions"
  on public.workout_sessions for insert with check (auth.uid() = user_id);

create policy "Users can update own workout sessions"
  on public.workout_sessions for update using (auth.uid() = user_id);

-- Posts policies
create policy "Posts are viewable by everyone"
  on public.posts for select using (true);

create policy "Users can insert own posts"
  on public.posts for insert with check (auth.uid() = user_id);

create policy "Users can delete own posts"
  on public.posts for delete using (auth.uid() = user_id);

-- Likes policies
create policy "Likes are viewable by everyone"
  on public.likes for select using (true);

create policy "Users can manage own likes"
  on public.likes for insert with check (auth.uid() = user_id);

create policy "Users can delete own likes"
  on public.likes for delete using (auth.uid() = user_id);

-- Function: auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function: update likes_count
create or replace function public.handle_like_insert()
returns trigger as $$
begin
  update public.posts set likes_count = likes_count + 1 where id = new.post_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_like_created
  after insert on public.likes
  for each row execute procedure public.handle_like_insert();

create or replace function public.handle_like_delete()
returns trigger as $$
begin
  update public.posts set likes_count = greatest(likes_count - 1, 0) where id = old.post_id;
  return old;
end;
$$ language plpgsql security definer;

create trigger on_like_deleted
  after delete on public.likes
  for each row execute procedure public.handle_like_delete();

-- Function: update last_trained_at and can_post on workout verification
create or replace function public.verify_workout(session_id uuid)
returns void as $$
begin
  update public.workout_sessions
  set verified = true
  where id = session_id and user_id = auth.uid();

  update public.profiles
  set last_trained_at = now(), can_post = true
  where id = auth.uid();
end;
$$ language plpgsql security definer;

-- Realtime
alter publication supabase_realtime add table public.posts;
alter publication supabase_realtime add table public.likes;
