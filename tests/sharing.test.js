import {test} from 'node:test';
import assert from 'node:assert/strict';
import {onRequest} from '../functions/api/shared.js';
const token='a'.repeat(64);
const context=(tokenValue=token)=>({request:new Request(`https://pouch.example/api/shared?token=${tokenValue}`),env:{SUPABASE_URL:'https://example.supabase.co',SUPABASE_SERVICE_ROLE_KEY:'test-server-secret'}});
const share={owner_id:'owner',object_path:'owner/abc_note.txt',file_name:'note.txt',expires_at:new Date(Date.now()+3600000).toISOString(),revoked_at:null};
test('rejects malformed tokens without requesting storage',async t=>{
 const fetch=t.mock.method(globalThis,'fetch',()=>{throw Error('Must not fetch');});
 const response=await onRequest(context('invalid'));assert.equal(response.status,404);assert.equal(fetch.mock.callCount(),0);
});
test('fails closed when backend secrets are absent',async()=>{
 const c=context();c.env={};assert.equal((await onRequest(c)).status,503);
});
for(const [name,record] of [['missing',null],['revoked',{...share,revoked_at:new Date().toISOString()}],['expired',{...share,expires_at:'2020-01-01'}],['invalid expiry',{...share,expires_at:'invalid'}],['wrong owner folder',{...share,object_path:'someone-else/file.txt'}]]){
 test(`blocks ${name} sharing link before retrieving file`,async t=>{
  const fetch=t.mock.method(globalThis,'fetch',async()=>Response.json(record?[record]:[]));
  const r=await onRequest(context());assert.equal(r.status,404);assert.equal(fetch.mock.callCount(),1);assert.equal(r.headers.get('Cache-Control'),'no-store, private');
 });
}
test('active link streams file as attachment and rechecks revocation on next download',async t=>{
 let revoked=false,calls=0;
 t.mock.method(globalThis,'fetch',async(url,options)=>{
  assert.equal(options.headers.apikey,'test-server-secret');
  if(String(url).includes('/rest/v1/')){assert.ok(!String(url).includes(token));return Response.json([{...share,revoked_at:revoked?'2026-01-01':null}]);}
  calls++;return new Response('sample file');
 });
 const first=await onRequest(context());assert.equal(first.status,200);assert.equal(await first.text(),'sample file');
 assert.equal(first.headers.get('Content-Disposition'),'attachment; filename="note.txt"');assert.equal(first.headers.get('Content-Type'),'application/octet-stream');
 revoked=true;assert.equal((await onRequest(context())).status,404);assert.equal(calls,1);
});
test('does not return backend credentials or errors when the provider fails',async t=>{
 t.mock.method(globalThis,'fetch',async()=>{throw new Error('test-server-secret');});
 const r=await onRequest(context());assert.equal(r.status,503);assert.ok(!(await r.text()).includes('test-server-secret'));
});
