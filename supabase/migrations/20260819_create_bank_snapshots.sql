create table if not exists public.bank_snapshots (
  user_id uuid not null references auth.users(id) on delete cascade,
  bank_key text not null,
  payload jsonb not null default '[]'::jsonb check (jsonb_typeof(payload) = 'array'),
  updated_at timestamptz not null default now(),
  primary key (user_id, bank_key)
);

alter table public.bank_snapshots enable row level security;

revoke all on table public.bank_snapshots from authenticated;
grant select, insert, update, delete on table public.bank_snapshots to authenticated;
revoke all on table public.bank_snapshots from anon;

create policy "Users can read their own bank snapshots"
on public.bank_snapshots for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert their own bank snapshots"
on public.bank_snapshots for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own bank snapshots"
on public.bank_snapshots for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own bank snapshots"
on public.bank_snapshots for delete to authenticated
using ((select auth.uid()) = user_id);
