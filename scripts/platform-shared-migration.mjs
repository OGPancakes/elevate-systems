import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export async function sharedProjectMigration() {
  const names = ['202609200001_feather_change_requests.sql', '202609250001_platform_foundation.sql', '202609250002_platform_support.sql'];
  const parts = await Promise.all(names.map(async name => {
    const sql = await readFile(new URL(`../supabase/migrations/${name}`, import.meta.url), 'utf8');
    return sql.replace(/^\s*(?:begin|commit);\s*$/gmi, '');
  }));
  return `-- Reviewed existing-project rollout. Does not replay the baseline schema.
begin;
set local lock_timeout = '5s';
set local statement_timeout = '60s';
do $$ begin
  if to_regclass('public.platform_businesses') is not null then
    raise exception 'Platform already exists; inspect migration history instead of replaying';
  end if;
  if exists(select 1 from pg_policies where schemaname='public' and tablename='inquiries') then
    raise exception 'Existing inquiry policies require manual review';
  end if;
end $$;
-- Capture existing values inside the transaction and reject any unintended changes.
create temporary table platform_legacy_inquiry_check on commit drop as
select id,name,email,message,status,notes,created_at from public.inquiries;
${parts.join('\n')}
update public.platform_settings set environment='production' where singleton;
do $$ begin
  if exists (
    select 1 from platform_legacy_inquiry_check old
    left join public.inquiries live using(id)
    where live.id is null or row(old.name,old.email,old.message,old.status,old.notes,old.created_at)
      is distinct from row(live.name,live.email,live.message,live.status,live.notes,live.created_at)
      or live.platform_business_id is not null
  ) then raise exception 'Existing inquiry preservation check failed'; end if;
end $$;
notify pgrst, 'reload schema';
commit;
`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) process.stdout.write(await sharedProjectMigration());
