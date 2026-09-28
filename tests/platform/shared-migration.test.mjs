import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { sharedProjectMigration } from '../../scripts/platform-shared-migration.mjs';

test('existing-project rollout preserves inquiries and initializes production without replaying baseline', async () => {
  const db = new PGlite();
  try {
    await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
      create schema auth; create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$ select null::uuid $$;
      create schema storage; create table storage.buckets(id text primary key,name text,public boolean);`);
    await db.exec(await readFile(new URL('../../supabase-schema.sql',import.meta.url),'utf8'));
    await db.exec("insert into inquiries(name,email,message,notes,status) values('Existing','existing@example.invalid','Keep me','Private','Closed')");
    const before = (await db.query('select id,name,email,message,notes,status,created_at from inquiries')).rows;
    await db.exec(await sharedProjectMigration());
    assert.deepEqual((await db.query('select id,name,email,message,notes,status,created_at from inquiries')).rows,before);
    assert.equal((await db.query('select environment from platform_settings')).rows[0].environment,'production');
    assert.equal((await db.query('select count(*)::int as total from platform_credentials')).rows[0].total,0);
    await assert.rejects(db.exec(await sharedProjectMigration()),/Platform already exists/);
  } finally { await db.close(); }
});
