export const MAX_SIZE = 5 * 1024 * 1024;
export const TYPES = {
 pdf:'application/pdf',txt:'text/plain',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp',
 docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
 xlsx:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
 pptx:'application/vnd.openxmlformats-officedocument.presentationml.presentation',csv:'text/csv',zip:'application/zip'
};
export function extension(name) { return name.split('.').pop().toLowerCase(); }
export function validateFile(file) {
 if (!file || file.size === 0) throw new Error('Choose a nonempty file.');
 if (file.size > MAX_SIZE) throw new Error(`${file.name}: files must be 5 MB or smaller.`);
 const ext=extension(file.name); if(!TYPES[ext]) throw new Error(`${file.name}: this file type isn’t supported.`);
 if(file.type && file.type !== TYPES[ext] && !(ext === 'zip' && file.type === 'application/x-zip-compressed') && !(ext === 'csv' && file.type === 'application/vnd.ms-excel')) throw new Error('The file extension and declared type do not match.');
 return ext;
}
export function cleanName(name) { return name.trim().replace(/[^a-zA-Z0-9._ ()-]/g,'_').slice(0,140); }
export function objectPath(userId,fileName,uuid) { return `${userId}/${uuid}_${cleanName(fileName)}`; }
export function displayName(name) { return /^[0-9a-f-]{36}_/i.test(name) ? name.slice(37) : name; }
export function formatBytes(bytes) { return bytes >= 1048576 ? `${(bytes/1048576).toFixed(1)} MB` : `${Math.max(0,Math.round(bytes/1024))} KB`; }
export function makeToken() { return Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join(''); }
export async function hashToken(token) { return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token))),b=>b.toString(16).padStart(2,'0')).join(''); }
