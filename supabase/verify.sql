-- Consultas somente leitura. Execute no SQL Editor depois de schema.sql.
select relname, relrowsecurity from pg_class where oid='public.athlete_state'::regclass;
select policyname, cmd, roles, qual, with_check from pg_policies where schemaname='public' and tablename='athlete_state';
select proname, prosecdef from pg_proc where oid='public.save_athlete_state(jsonb,integer)'::regprocedure;
-- Esperado: relrowsecurity=true; três políticas para authenticated; prosecdef=false.
