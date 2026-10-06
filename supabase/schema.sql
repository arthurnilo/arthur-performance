-- Execute uma vez no SQL Editor do SEU projeto Supabase.
-- Cada conta só acessa seu próprio registro. Nunca use service_role no navegador.
begin;
create table if not exists public.athlete_state (
 user_id uuid primary key references auth.users(id) on delete cascade,
 data jsonb not null check (jsonb_typeof(data)='object'),
 revision integer not null default 1 check (revision>0),
 updated_at timestamptz not null default now()
);
alter table public.athlete_state enable row level security;
revoke all on public.athlete_state from anon;
grant select, insert, update on public.athlete_state to authenticated;
drop policy if exists "Read own state" on public.athlete_state;
drop policy if exists "Insert own state" on public.athlete_state;
drop policy if exists "Update own state" on public.athlete_state;
create policy "Read own state" on public.athlete_state for select to authenticated using ((select auth.uid())=user_id);
create policy "Insert own state" on public.athlete_state for insert to authenticated with check ((select auth.uid())=user_id);
create policy "Update own state" on public.athlete_state for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
-- Compare-and-swap atômico: evita sobrescrever o progresso salvo em outro aparelho.
-- SECURITY INVOKER preserva as políticas RLS do usuário autenticado.
create or replace function public.save_athlete_state(p_data jsonb,p_expected_revision integer)
returns integer language plpgsql security invoker set search_path = '' as $$
declare next_revision integer;
begin
 if auth.uid() is null then raise exception 'Unauthorized' using errcode='42501'; end if;
 if p_expected_revision is null or p_expected_revision<0 or p_data is null or jsonb_typeof(p_data)<>'object' or octet_length(p_data::text)>1500000 then
  raise exception 'Invalid state' using errcode='22023';
 end if;
 if p_expected_revision=0 then
  insert into public.athlete_state(user_id,data,revision) values(auth.uid(),p_data,1)
  on conflict (user_id) do nothing returning revision into next_revision;
 else
  update public.athlete_state set data=p_data,revision=revision+1,updated_at=now()
  where user_id=auth.uid() and revision=p_expected_revision
  returning revision into next_revision;
 end if;
 if next_revision is null then raise exception 'Revision conflict' using errcode='40001'; end if;
 return next_revision;
end;
$$;
revoke all on function public.save_athlete_state(jsonb,integer) from public, anon;
grant execute on function public.save_athlete_state(jsonb,integer) to authenticated;
commit;
