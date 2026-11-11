import assert from 'node:assert/strict';
import {moduleURL,codeURL} from './load-module.mjs';
const sbUrl=new URL('../lib/supabase.ts',import.meta.url);
const oldFetch=globalThis.fetch;
let session={user:{id:'account-a'},access_token:'token-a'};
globalThis.__accountTestClient={auth:{getSession:async()=>({data:{session},error:null})}};
const stub=codeURL('export const createClient=()=>globalThis.__accountTestClient;');
// Rewrite the sole package import in the source fixture; exercise the real apiFetch implementation.
const {readFileSync}=await import('node:fs');const ts=(await import('typescript')).default;
const code=ts.transpileModule(readFileSync(sbUrl,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText.replace("'@supabase/supabase-js'",JSON.stringify(stub));
process.env.NEXT_PUBLIC_SUPABASE_URL='https://test.supabase.co';process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY='public-test';
const {apiFetch}=await import(codeURL(code));
let calls=0;
globalThis.fetch=async(url,init)=>{calls++;assert.equal(init.headers.get('X-Account-Id'),'account-a');assert.equal(init.headers.get('Authorization'),'Bearer token-a');return new Response('{}')};
await apiFetch('/api/state',{},'account-a');assert.equal(calls,1);
session={user:{id:'account-b'},access_token:'token-b'};
await assert.rejects(()=>apiFetch('/api/state',{method:'PUT',body:'private-a'},'account-a'),/A conta mudou/);assert.equal(calls,1,'account A payload must never be sent with B token');
session=null;await assert.rejects(()=>apiFetch('/api/state',{},'account-a'),/Sessão expirada/);
globalThis.fetch=oldFetch;
const routeUrl=new URL('../app/api/state/route.ts',import.meta.url);
globalThis.__serverAuthUser={id:'account-b'};
const serverStub=codeURL('export const createClient=()=>({auth:{getUser:async()=>({data:{user:globalThis.__serverAuthUser},error:null})}});');
const routeCode=ts.transpileModule(readFileSync(routeUrl,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText.replace("'@supabase/supabase-js'",JSON.stringify(serverStub)).replace("'../../../lib/state-schema'",JSON.stringify(moduleURL(new URL('../lib/state-schema.ts',import.meta.url))));
const {GET,PUT}=await import(codeURL(routeCode));
for(const handler of [GET,PUT]){const response=await handler(new Request('https://example.test/api/state',{method:handler===PUT?'PUT':'GET',headers:{authorization:'Bearer token-b','X-Account-Id':'account-a'},...(handler===PUT?{body:'{}'}:{})}));assert.equal(response.status,409)}
console.log('Account boundary: request identity binding, logout, client account switch and server mismatch rejection passed.');
