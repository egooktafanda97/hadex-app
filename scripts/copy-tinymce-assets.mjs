import path from 'node:path';
import { access, cp, mkdir, rm } from 'node:fs/promises';

const source = path.join(process.cwd(), 'node_modules', 'tinymce');
const target = path.join(process.cwd(), 'public', 'tinymce');
await access(path.join(source, 'tinymce.min.js'));
await rm(target, { recursive: true, force: true });
await mkdir(path.dirname(target), { recursive: true });
await cp(source, target, {
  recursive: true,
  filter: (entry) => !entry.endsWith('.map'),
});
console.log('Asset TinyMCE tersalin ke public/tinymce');
