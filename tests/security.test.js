import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateFile,objectPath,MAX_SIZE,makeToken,hashToken,displayName,cleanName} from '../src/security.js';
test('accepts supported documents and normalizes common browser MIME variations',()=>{
 assert.equal(validateFile({name:'sample.pdf',type:'application/pdf',size:20}),'pdf');
 assert.equal(validateFile({name:'sample.TXT',type:'text/plain',size:MAX_SIZE}),'txt');
 assert.equal(validateFile({name:'sheet.csv',type:'application/vnd.ms-excel',size:30}),'csv');
 assert.equal(validateFile({name:'notes.docx',type:'',size:30}),'docx');
});
test('rejects empty, oversized, unsupported and mismatched files',()=>{
 for(const file of [null,{name:'a.txt',type:'text/plain',size:0},{name:'a.txt',type:'text/plain',size:MAX_SIZE+1},{name:'a.html',type:'text/html',size:5},{name:'a.pdf',type:'text/html',size:5}]) assert.throws(()=>validateFile(file));
});
test('keeps user filenames out of path traversal and HTML markup',()=>{
 assert.equal(objectPath('owner','../../<script>.txt','unique').split('/').length,2);
 assert.ok(!cleanName('<script>hello</script>').includes('<'));
 assert.equal(displayName('cb1e74f0-7a69-41a2-9c7f-062e6d4174e0_report.pdf'),'report.pdf');
});
test('sharing tokens use 256 bits of randomness and stable SHA-256 fingerprints',async()=>{
 const a=makeToken(),b=makeToken();assert.match(a,/^[0-9a-f]{64}$/);assert.notEqual(a,b);
 assert.equal(await hashToken('abc'),'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
});
