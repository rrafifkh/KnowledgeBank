revoke all on table public.bank_snapshots from authenticated;
grant select, insert, update, delete on table public.bank_snapshots to authenticated;
revoke all on table public.bank_snapshots from anon;
