-- === Schema v2 (safe, idempotent, no DECLARE variables) ===

-- ① profilesに列追加
alter table public.profiles add column if not exists display_name text;
alter table public.profiles add column if not exists current_streak integer not null default 0;
alter table public.profiles add column if not exists longest_streak integer not null default 0;
alter table public.profiles add column if not exists follower_count integer not null default 0;
alter table public.profiles add column if not exists following_count integer not null default 0;
alter table public.profiles add column if not exists total_workouts integer not null default 0;
alter table public.profiles add column if not exists total_reps integer not null default 0;
alter table public.profiles add column if not exists title text;

-- ② postsに列追加
alter table public.posts add column if not exists image_url text;

-- ③ followsテーブル
create table if not exists public.follows (
  id uuid default uuid_generate_v4() primary key,
  follower_id uuid references public.profiles(id) on delete cascade not null,
  following_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  unique(follower_id, following_id)
);
alter table public.follows enable row level security;

-- ④ notificationsテーブル
create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null,
  actor_id uuid references public.profiles(id) on delete cascade not null,
  post_id uuid references public.posts(id) on delete cascade,
  read boolean not null default false,
  created_at timestamptz default now() not null
);
alter table public.notifications enable row level security;

-- ⑤ challengesテーブル
create table if not exists public.challenges (
  id uuid default uuid_generate_v4() primary key,
  creator_id uuid references public.profiles(id) on delete cascade not null,
  opponent_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  goal_reps integer not null,
  creator_reps integer not null default 0,
  opponent_reps integer not null default 0,
  status text not null default 'pending',
  ends_at timestamptz not null,
  created_at timestamptz default now() not null
);
alter table public.challenges enable row level security;

-- ⑥ RLSポリシー（重複スキップ）
do $policy$ begin
  if not exists (select 1 from pg_policies where tablename='follows' and policyname='follows_select') then
    create policy "follows_select" on public.follows for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='follows' and policyname='follows_insert') then
    create policy "follows_insert" on public.follows for insert with check (auth.uid() = follower_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='follows' and policyname='follows_delete') then
    create policy "follows_delete" on public.follows for delete using (auth.uid() = follower_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='notifications' and policyname='notifications_select') then
    create policy "notifications_select" on public.notifications for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='notifications' and policyname='notifications_insert') then
    create policy "notifications_insert" on public.notifications for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='notifications' and policyname='notifications_update') then
    create policy "notifications_update" on public.notifications for update using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='challenges' and policyname='challenges_select') then
    create policy "challenges_select" on public.challenges for select using (auth.uid() = creator_id or auth.uid() = opponent_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='challenges' and policyname='challenges_insert') then
    create policy "challenges_insert" on public.challenges for insert with check (auth.uid() = creator_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='challenges' and policyname='challenges_update') then
    create policy "challenges_update" on public.challenges for update using (auth.uid() = creator_id or auth.uid() = opponent_id);
  end if;
end; $policy$;

-- ⑦ フォロー挿入トリガー（DECLARE不使用）
create or replace function public.handle_follow_insert()
returns trigger as $func$
begin
  update public.profiles set following_count = following_count + 1 where id = new.follower_id;
  update public.profiles set follower_count  = follower_count  + 1 where id = new.following_id;
  insert into public.notifications(user_id, type, actor_id)
    values (new.following_id, 'follow', new.follower_id);
  return new;
end;
$func$ language plpgsql security definer;

drop trigger if exists on_follow_created on public.follows;
create trigger on_follow_created
  after insert on public.follows
  for each row execute procedure public.handle_follow_insert();

-- ⑧ フォロー削除トリガー（DECLARE不使用）
create or replace function public.handle_follow_delete()
returns trigger as $func$
begin
  update public.profiles set following_count = greatest(following_count - 1, 0) where id = old.follower_id;
  update public.profiles set follower_count  = greatest(follower_count  - 1, 0) where id = old.following_id;
  return old;
end;
$func$ language plpgsql security definer;

drop trigger if exists on_follow_deleted on public.follows;
create trigger on_follow_deleted
  after delete on public.follows
  for each row execute procedure public.handle_follow_delete();

-- ⑨ いいね通知トリガー（DECLARE不使用・サブクエリ方式）
create or replace function public.handle_like_notify()
returns trigger as $func$
begin
  insert into public.notifications(user_id, type, actor_id, post_id)
    select p.user_id, 'like', new.user_id, new.post_id
    from public.posts p
    where p.id = new.post_id
      and p.user_id <> new.user_id;
  return new;
end;
$func$ language plpgsql security definer;

drop trigger if exists on_like_notify on public.likes;
create trigger on_like_notify
  after insert on public.likes
  for each row execute procedure public.handle_like_notify();

-- ⑩ ストリーク更新関数（DECLARE完全廃止・CASE式で完結）
create or replace function public.update_streak(uid uuid)
returns void as $func$
begin
  update public.profiles
  set
    current_streak = (
      case
        when (
          select date(created_at)
          from public.workout_sessions
          where user_id = uid and verified = true
          order by created_at desc
          offset 1 limit 1
        ) = current_date - 1
        then current_streak + 1
        else 1
      end
    ),
    longest_streak = greatest(
      longest_streak,
      (
        case
          when (
            select date(created_at)
            from public.workout_sessions
            where user_id = uid and verified = true
            order by created_at desc
            offset 1 limit 1
          ) = current_date - 1
          then current_streak + 1
          else 1
        end
      )
    ),
    total_workouts = total_workouts + 1
  where id = uid;
end;
$func$ language plpgsql security definer;

-- ⑪ Realtime（重複エラー無視）
do $rt$ begin
  alter publication supabase_realtime add table public.notifications;
exception when others then null; end; $rt$;

do $rt$ begin
  alter publication supabase_realtime add table public.follows;
exception when others then null; end; $rt$;

do $rt$ begin
  alter publication supabase_realtime add table public.challenges;
exception when others then null; end; $rt$;
