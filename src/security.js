export const MAX_SIZE = 5 * 1024 * 1024;
export function validateFile(file) {
  if (!file || file.size === 0) throw new Error('Choose a nonempty sample file.');
  if (file.size > MAX_SIZE) throw new Error('File must be 5 MB or smaller.');
  const ext = file.name.split('.').pop().toLowerCase();
  const mime = {pdf: 'application/pdf', txt: 'text/plain'}[ext];
  if (!mime || file.type !== mime) throw new Error('Choose a PDF or plain text file.');
  return ext;
}
export function objectPath(userId, fileName, uuid) {
  const clean = fileName.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-100);
  return `${userId}/${uuid}_${clean}`;
}
