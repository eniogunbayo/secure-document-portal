import {hashToken} from '../../src/security.js';
const headers={'Cache-Control':'no-store, private','Pragma':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'none'; frame-ancestors 'none'"};
function fail(status,error){return Response.json({error},{status,headers});}
export async function onRequest(context){
 if(context.request.method!=='GET')return fail(405,'Method not allowed.');
 const token=new URL(context.request.url).searchParams.get('token');
 if(!token||!/^[0-9a-f]{64}$/.test(token))return fail(404,'This sharing link is unavailable.');
 const base=context.env.SUPABASE_URL,secret=context.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!base||!secret)return fail(503,'Sharing is not connected yet. Please ask the owner to finish Pouch setup.');
 try{
  const origin=new URL(base);if(origin.protocol!=='https:'||!origin.hostname.endsWith('.supabase.co'))return fail(503,'Sharing configuration is unavailable.');
  const auth={apikey:secret,Authorization:`Bearer ${secret}`};
  const hash=await hashToken(token),query=new URL('/rest/v1/pouch_shares',origin);
  query.searchParams.set('select','owner_id,object_path,file_name,expires_at,revoked_at');query.searchParams.set('token_hash',`eq.${hash}`);query.searchParams.set('limit','1');
  const fetcher=fetch;
  const lookup=await fetcher(query.href,{headers:auth,cache:'no-store'});
  if(!lookup.ok)return fail(503,'Sharing is temporarily unavailable.');
  const [share]=await lookup.json();
  if(!share||share.revoked_at||!Number.isFinite(Date.parse(share.expires_at))||Date.parse(share.expires_at)<=Date.now())return fail(404,'This link has expired, was revoked, or is unavailable.');
  if(!share.object_path.startsWith(`${share.owner_id}/`))return fail(404,'This sharing link is unavailable.');
  const path=share.object_path.split('/').map(encodeURIComponent).join('/');
  const file=await fetcher(new URL(`/storage/v1/object/authenticated/documents/${path}`,origin).href,{headers:auth,cache:'no-store'});
  if(!file.ok)return fail(404,'This file is no longer available.');
  const name=share.file_name.replace(/[^a-zA-Z0-9._ ()-]/g,'_').slice(0,140)||'shared-file';
  return new Response(file.body,{headers:{...headers,'Content-Type':'application/octet-stream','Content-Disposition':`attachment; filename="${name}"`,'X-Pouch-Filename':name}});
 }catch{return fail(503,'Sharing is temporarily unavailable. Please try again later.');}
}
