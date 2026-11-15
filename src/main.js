import { createClient } from '@supabase/supabase-js';
import { validateFile, objectPath } from './security.js';
import './style.css';
const $ = id => document.getElementById(id);
const message = text => { $('status').textContent = text; };
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
let client, user;
function credentials() { return {email: $('email').value.trim(), password: $('password').value}; }
async function run(action) {
  const buttons = [...document.querySelectorAll('button')];
  buttons.forEach(b => b.disabled = true);
  try { await action(); } catch (error) { message(error.message || 'Request failed. Try again.'); }
  finally { buttons.forEach(b => b.disabled = !client); }
}
async function listFiles() {
  $('files').replaceChildren();
  const {data, error} = await client.storage.from('documents').list(user.id, {limit:100, sortBy:{column:'created_at',order:'desc'}});
  if (error) throw error;
  if (!data.length) { const item = document.createElement('li'); item.textContent = 'Your vault is empty. Upload your first sample document.'; $('files').append(item); }
  for (const file of data) {
    const item = document.createElement('li');
    const name = document.createElement('span'); name.textContent = file.name.slice(37);
    const button = document.createElement('button'); button.className = 'secondary'; button.textContent = 'Download';
    button.addEventListener('click', () => run(async () => {
      const {data, error} = await client.storage.from('documents').download(`${user.id}/${file.name}`);
      if (error) throw error;
      const href = URL.createObjectURL(data); const a = document.createElement('a');
      a.href = href; a.download = file.name.slice(37); a.click();
      setTimeout(() => URL.revokeObjectURL(href), 30000);
      message('Download authorized.');
    }));
    item.append(name,button); $('files').append(item);
  }
}
async function updateSession(session) {
  user = session?.user;
  $('auth-panel').hidden = !!user; $('workspace').hidden = !user;
  $('files').replaceChildren(); $('password').value = '';
  if (user) { $('identity').textContent = user.email; await listFiles(); }
}
if (!url || !key || url.includes('YOUR_PROJECT') || key.includes('REPLACE_ME')) {
  message('Setup needed: connect your Supabase project using the README. Sign-in and uploads are unavailable until then.');
  document.querySelectorAll('button').forEach(b => b.disabled = true);
} else {
  client = createClient(url, key, {auth:{persistSession:false, detectSessionInUrl:false}});
  client.auth.onAuthStateChange((_event,session) => { setTimeout(() => run(() => updateSession(session)), 0); });
}
$('auth-form').addEventListener('submit', e => {e.preventDefault(); run(async () => {
  const {error} = await client.auth.signInWithPassword(credentials());
  if (error) throw new Error('Sign-in failed. Check your credentials and email confirmation.');
  message('Signed in.');
});});
$('signup').addEventListener('click', () => { if (!$('auth-form').reportValidity()) return; run(async () => {
  const {data,error} = await client.auth.signUp(credentials()); if(error) throw error;
  message(data.session ? 'Account created.' : 'Check your email for a confirmation link, then return here to sign in.');
});});
$('signout').addEventListener('click', () => run(async () => {
  const {error} = await client.auth.signOut(); if(error) throw error;
  await updateSession(null); message('Signed out.');
}));
$('refresh').addEventListener('click', () => run(listFiles));
$('upload-form').addEventListener('submit', e => {e.preventDefault(); run(async () => {
  const file = $('file').files[0]; validateFile(file);
  const path = objectPath(user.id,file.name,crypto.randomUUID());
  const {error} = await client.storage.from('documents').upload(path,file,{upsert:false,contentType:file.type});
  if(error) throw error;
  $('upload-form').reset(); await listFiles(); message('Document uploaded to your private folder.');
});});
const testButton = document.createElement('button');
testButton.textContent = 'Test access to Account A’s file';
testButton.className = 'secondary';
$('workspace').append(testButton);

testButton.addEventListener('click', () => run(async () => {
  const path =
    '2e03935d-1c07-4852-85d3-ae2827dbdec4/' +
    'cb1e74f0-7a69-41a2-9c7f-062e6d4174e0_Eni_O__Resume_SOC.pdf';

  const { data, error } = await client.storage
    .from('documents')
    .download(path);

  if (error) {
    message(`No file returned: ${error.message}`);
  } else if (data) {
    message('File access succeeded for the signed-in account.');
  }
}));
