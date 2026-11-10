-- This is for supabase configuration, please dont edit.
-- I have added every feature needed, before puting it in sql editor, ask me :)
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default 'Student',
  program text not null default '',
  year text not null default '',
  bio text not null default '',
  avatar_url text not null default '',
  offers text[] not null default '{}',
  wants text[] not null default '{}',
  availability text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists avatar_url text not null default '';

create table if not exists public.swap_requests (
  id uuid primary key default gen_random_uuid(),
  from_user uuid not null references public.profiles(id) on delete cascade,
  to_user uuid not null references public.profiles(id) on delete cascade,
  offered_skill text not null,
  wanted_skill text not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  constraint swap_request_not_self check (from_user <> to_user)
);

create index if not exists swap_requests_from_user_idx on public.swap_requests(from_user, created_at desc);
create index if not exists swap_requests_to_user_idx on public.swap_requests(to_user, created_at desc);
create unique index if not exists one_pending_swap_per_pair_idx on public.swap_requests(from_user, to_user) where status = 'pending';

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references public.swap_requests(id) on delete cascade,
  member_1 uuid not null references public.profiles(id) on delete cascade,
  member_2 uuid not null references public.profiles(id) on delete cascade,
  offer text not null default 'Skill exchange',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint conversation_members_differ check (member_1 <> member_2)
);

create index if not exists conversations_member_1_idx on public.conversations(member_1, updated_at desc);
create index if not exists conversations_member_2_idx on public.conversations(member_2, updated_at desc);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1200),
  created_at timestamptz not null default now()
);

create index if not exists messages_conversation_created_idx on public.messages(conversation_id, created_at);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at before update on public.profiles
for each row execute function public.touch_updated_at();

drop trigger if exists conversations_touch_updated_at on public.conversations;
create trigger conversations_touch_updated_at before update on public.conversations
for each row execute function public.touch_updated_at();

create or replace function public.bump_conversation_on_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations set updated_at = now() where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists messages_bump_conversation on public.messages;
create trigger messages_bump_conversation after insert on public.messages
for each row execute function public.bump_conversation_on_message();

-- A conversation is created only when the recipient accepts a pending request.
create or replace function public.create_conversation_for_accepted_swap()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'accepted' and old.status = 'pending' then
    insert into public.conversations (request_id, member_1, member_2, offer)
    values (
      new.id,
      new.from_user,
      new.to_user,
      new.offered_skill || ' for ' || new.wanted_skill
    )
    on conflict (request_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists swap_accepted_creates_conversation on public.swap_requests;
create trigger swap_accepted_creates_conversation after update of status on public.swap_requests
for each row execute function public.create_conversation_for_accepted_swap();

alter table public.profiles enable row level security;
alter table public.swap_requests enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

drop policy if exists "Signed-in students can view profiles" on public.profiles;
create policy "Signed-in students can view profiles" on public.profiles
for select to authenticated using (true);

drop policy if exists "Students can create their own profile" on public.profiles;
create policy "Students can create their own profile" on public.profiles
for insert to authenticated with check (id = (select auth.uid()));

drop policy if exists "Students can edit their own profile" on public.profiles;
create policy "Students can edit their own profile" on public.profiles
for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

drop policy if exists "Students can view their own swap requests" on public.swap_requests;
create policy "Students can view their own swap requests" on public.swap_requests
for select to authenticated using (from_user = (select auth.uid()) or to_user = (select auth.uid()));

drop policy if exists "Students can send swap requests" on public.swap_requests;
create policy "Students can send swap requests" on public.swap_requests
for insert to authenticated with check (from_user = (select auth.uid()) and from_user <> to_user);

drop policy if exists "Recipients can respond to swap requests" on public.swap_requests;
create policy "Recipients can respond to swap requests" on public.swap_requests
for update to authenticated using (to_user = (select auth.uid()) and status = 'pending')
with check (to_user = (select auth.uid()) and status in ('accepted', 'declined'));

-- Keep sender, recipient, and skill terms immutable when a recipient responds.
create or replace function public.protect_swap_request_fields()
returns trigger
language plpgsql
as $$
begin
  if new.from_user <> old.from_user or new.to_user <> old.to_user
     or new.offered_skill <> old.offered_skill or new.wanted_skill <> old.wanted_skill then
    raise exception 'Swap request details cannot be changed after sending';
  end if;
  if old.status <> 'pending' then
    raise exception 'Only pending swap requests can be changed';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_swap_request_fields_trigger on public.swap_requests;
create trigger protect_swap_request_fields_trigger before update on public.swap_requests
for each row execute function public.protect_swap_request_fields();

drop policy if exists "Members can view their conversations" on public.conversations;
create policy "Members can view their conversations" on public.conversations
for select to authenticated using (member_1 = (select auth.uid()) or member_2 = (select auth.uid()));

drop policy if exists "Conversation members can read messages" on public.messages;
create policy "Conversation members can read messages" on public.messages
for select to authenticated using (
  exists (
    select 1 from public.conversations c
    where c.id = conversation_id
      and (c.member_1 = (select auth.uid()) or c.member_2 = (select auth.uid()))
  )
);

drop policy if exists "Conversation members can send messages as themselves" on public.messages;
create policy "Conversation members can send messages as themselves" on public.messages
for insert to authenticated with check (
  sender_id = (select auth.uid()) and exists (
    select 1 from public.conversations c
    where c.id = conversation_id
      and (c.member_1 = (select auth.uid()) or c.member_2 = (select auth.uid()))
  )
);

drop policy if exists "Authors can delete their own messages" on public.messages;
create policy "Authors can delete their own messages" on public.messages
for delete to authenticated using (
  sender_id = (select auth.uid()) and exists (
    select 1 from public.conversations c
    where c.id = conversation_id
      and (c.member_1 = (select auth.uid()) or c.member_2 = (select auth.uid()))
  )
);

-- Enable message INSERT events for Supabase Realtime (safe to rerun).
do $$
begin
  alter publication supabase_realtime add table public.messages;
exception when duplicate_object then
  null;
end;
$$;
