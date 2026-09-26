import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

const a = '81c437f5-f64e-47c0-a71a-cc84da8914db';
const b = '41c437f5-f64e-47c0-a71a-cc84da8914db';
const user = '71c437f5-f64e-47c0-a71a-cc84da8914db';
const credential = 'a1c437f5-f64e-47c0-a71a-cc84da8914db';
const payload = { externalId: 'consultation-1', externalCustomerId: 'customer-1', schema: 'consultation.v1', kind: 'virtual', createdAt: '2026-01-01T00:00:00Z', customer: { name: 'Synthetic Pilot', email: 'pilot@example.invalid', phone: null } };

test('PostgreSQL enforces ownership, RLS, idempotency, revocation and atomic persistence', async () => {
  const db = new PGlite();
  try {
    await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
      create schema auth; create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true),'')::uuid $$;
      grant usage on schema auth,public to authenticated,anon,service_role;
      grant execute on function auth.uid() to authenticated;`);
    await db.exec(await readFile(new URL('../../supabase/migrations/202609250001_platform_foundation.sql', import.meta.url), 'utf8'));
    await db.query('insert into auth.users values ($1)', [user]);
    await db.query("insert into platform_businesses(id,slug,name) values($1,'other','Other business')", [b]);
    await db.query("insert into platform_memberships(business_id,user_id,role) values($1,$2,'business_owner')", [a,user]);
    await db.query("insert into platform_credentials(id,business_id,environment,name,token_hash,scopes,expires_at) values($1,$2,'staging','Pilot', $3,array['create:submission'],now()+interval '1 day')", [credential,a,'a'.repeat(64)]);
    const accept = async (body=payload, hash='a'.repeat(64), business=a, env='staging') => (await db.query('select platform_accept_submission($1,$2,$3,$4,$5) as receipt',[credential,business,env,JSON.stringify(body),hash])).rows[0].receipt;
    const first = await accept(); const retry = await accept();
    assert.equal(first.id,retry.id); assert.equal(retry.duplicate,true);
    for (const table of ['customers','submissions','leads']) assert.equal((await db.query(`select count(*)::int as count from platform_${table}`)).rows[0].count,1);
    assert.equal((await db.query('select count(*)::int as count from platform_activity')).rows[0].count,3);
    await assert.rejects(accept({...payload,kind:'in-person'},'b'.repeat(64)), /idempotency conflict/);
    await assert.rejects(accept(payload,'a'.repeat(64),b), /access denied/);
    await assert.rejects(accept(payload,'a'.repeat(64),a,'production'), /environment mismatch/);
    await assert.rejects(accept({...payload,externalId:'bad-date',externalCustomerId:'rollback-customer',createdAt:'bad-date'}));
    assert.equal((await db.query('select count(*)::int as count from platform_customers')).rows[0].count,1, 'failed intake rolls back new customer');
    await assert.rejects(db.query("insert into platform_leads(business_id,environment,customer_id,submission_id) values($1,'staging',$2,$3)",[b,first.customerId,first.id]), /foreign key/);
    await db.query("insert into platform_customers(business_id,environment,external_id,name,email) values($1,'staging','private-b','Other person','other@example.invalid')",[b]);
    await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','${user}',false);`);
    assert.equal((await db.query('select id from platform_businesses')).rows.length,1);
    assert.equal((await db.query('select id from platform_customers')).rows.length,1);
    assert.equal((await db.query('select id from platform_customers where business_id=$1',[b])).rows.length,0);
    await assert.rejects(db.query('select * from platform_credentials'),/permission denied/);
    await assert.rejects(db.query("update platform_memberships set role='elevate_owner'"),/permission denied/);
    await assert.rejects(db.query('delete from platform_activity'),/permission denied/);
    await db.exec('reset role');
    await db.query('update platform_memberships set active=false where user_id=$1',[user]);
    await db.exec('set role authenticated');
    assert.equal((await db.query('select id from platform_customers')).rows.length,0);
    await db.exec('reset role; set role anon');
    await assert.rejects(db.query('select * from platform_customers'),/permission denied/);
    await db.exec('reset role');
    await db.query('update platform_credentials set revoked_at=now() where id=$1',[credential]);
    await assert.rejects(accept(),/access denied/);
    const limits = await Promise.all(Array.from({length:3},() => db.query("select platform_rate_limit('test',2) as allowed")));
    assert.deepEqual(limits.map(result => result.rows[0].allowed),[true,true,false]);
  } finally { await db.close(); }
});
