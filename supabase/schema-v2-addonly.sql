-- === Schema v2 追加専用 (既存テーブルに一切触れない) ===

-- 1. profilesカラム追加
alter table public.profiles add column if not exists display_name text;
alter table public.profiles add column if not exists current_streak integer default 0 not null;
alter table public.profiles add column if not exists longest_streak integer default 0 not null;
alter table public.profiles add column if not exists follower_count integer default 0 not null;
alter table public.profiles add column if not exists following_count integer default 0 not null;
alter table public.profiles add column if not exists total_workouts integer default 0 not null;
alter table public.profiles add column if not exists total_reps integer default 0 not null;
alter table public.profiles add column if not exists title text;

-- 2. postsカラム追加
alter table public.posts add column if not exists image_url text;

-- 3. 新テーブル作成
create table if not exists public.follows (
  id uuid default uuid_generate_v4() primary key,
  follower_id uuid references public.profiles(id) on delete cascade not null,
  following_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  unique(follower_id, following_id)
);

create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null,
  actor_id uuid references public.profiles(id) on delete cascade not null,
  post_id uuid references public.posts(id) on delete cascade,
  read boolean default false not null,
  created_at timestamptz default now() not null
);

create table if not exists public.challenges (
  id uuid default uuid_generate_v4() primary key,
  creator_id uuid references public.profiles(id) on delete cascade not null,
  opponent_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  goal_reps integer not null,
  creator_reps integer default 0 not null,
  opponent_reps integer default 0 not null,
  status text default 'pending' not null,
  ends_at timestamptz not null,
  created_at timestamptz default now() not null
);

-- 4. RLS有効化
alter table public.follows enable row level security;
alter table public.notifications enable row level security;
alter table public.challenges enable row level security;

-- 5. ポリシー追加 (重複スキップ)
do $$ begin
  if not exists (select 1 from pg_policies where tablename='follows' and policyname='Follows viewable by everyone') then
    create policy "Follows viewable by everyone" on public.follows for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='follows' and policyname='Users can follow') then
    create policy "Users can follow" on public.follows for insert with check (auth.uid() = follower_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='follows' and policyname='Users can unfollow') then
    create policy "Users can unfollow" on public.follows for delete using (auth.uid() = follower_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='notifications' and policyname='Users see own notifications') then
    create policy "Users see own notifications" on public.notifications for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='notifications' and policyname='System can insert notifications') then
    create policy "System can insert notifications" on public.notifications for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='notifications' and policyname='Users update own notifications') then
    create policy "Users update own notifications" on public.notifications for update using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='challenges' and policyname='Challenges viewable by participants') then
    create policy "Challenges viewable by participants" on public.challenges for select using (auth.uid() = creator_id or auth.uid() = opponent_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='challenges' and policyname='Users can create challenges') then
    create policy "Users can create challenges" on public.challenges for insert with check (auth.uid() = creator_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='challenges' and policyname='Participants can update') then
    create policy "Participants can update" on public.challenges for update using (auth.uid() = creator_id or auth.uid() = opponent_id);
  end if;
end $$;

-- 6. 関数 (CREATE OR REPLACE = 常に安全)
create or replace function public.handle_follow_insert() returns trigger as $$
begin
  update public.profiles set following_count = following_count + 1 where id = new.follower_id;
  update public.profiles set follower_count = follower_count + 1 where id = new.following_id;
  insert into public.notifications(user_id, type, actor_id)
    values (new.following_id, 'follow', new.follower_id);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_follow_created on public.follows;
create trigger on_follow_created after insert on public.follows
  for each row execute procedure public.handle_follow_insert();

create or replace function public.handle_follow_delete() returns trigger as $$
begin
  update public.profiles set following_count = greatest(following_count - 1, 0) where id = old.follower_id;
  update public.profiles set follower_count = greatest(follower_count - 1, 0) where id = old.following_id;
  return old;
end;
$$ language plpgsql security definer;

drop trigger if exists on_follow_deleted on public.follows;
create trigger on_follow_deleted after delete on public.follows
  for each row execute procedure public.handle_follow_delete();

create or replace function public.handle_like_notify() returns trigger as $$
declare
  post_owner uuid;
begin
  select user_id into post_owner from public.posts where id = new.post_id;
  if post_owner <> new.user_id then
    insert into public.notifications(user_id, type, actor_id, post_id)
      values (post_owner, 'like', new.user_id, new.post_id);
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_like_notify on public.likes;
create trigger on_like_notify after insert on public.likes
  for each row execute procedure public.handle_like_notify();

create or replace function public.update_streak(uid uuid) returns void as $$
declare
  last_date date;
  today date := current_date;
  streak int;
begin
  select date(created_at) into last_date
    from public.workout_sessions
    where user_id = uid and verified = true
    order by created_at desc
    offset 1 limit 1;

  select current_streak into streak from public.profiles where id = uid;

  if last_date = today - 1 then
    streak := streak + 1;
  elsif last_date < today - 1 or last_date is null then
    streak := 1;
  end if;

  update public.profiles
  set
    current_streak = streak,
    longest_streak = greatest(longest_streak, streak),
    total_workouts = total_workouts + 1
  where id = uid;
end;
$$ language plpgsql security definer;

-- 7. Realtime (エラー無視)
do $$ begin
  alter publication supabase_realtime add table public.notifications;
exception when others then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.follows;
exception when others then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.challenges;
exception when others then null; end $$;
