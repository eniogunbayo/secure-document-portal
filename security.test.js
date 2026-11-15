import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateFile,objectPath,MAX_SIZE} from '../src/security.js';
test('permits small PDF and text documents',()=>{
 assert.equal(validateFile({name:'sample.pdf',type:'application/pdf',size:20}),'pdf');
 assert.equal(validateFile({name:'sample.TXT',type:'text/plain',size:MAX_SIZE}),'txt');
});
test('rejects empty, oversized, unsupported and mismatched files',()=>{
 for(const file of [null,{name:'a.txt',type:'text/plain',size:0},{name:'a.txt',type:'text/plain',size:MAX_SIZE+1},{name:'a.html',type:'text/html',size:5},{name:'a.pdf',type:'text/html',size:5}]) assert.throws(()=>validateFile(file));
});
test('builds owner folder path without embedded file path separators',()=>{
 const path=objectPath('owner','../../<script>.txt','unique');
 assert.equal(path.split('/').length,2); assert.ok(path.startsWith('owner/unique_')); assert.ok(!path.includes('<'));
});
