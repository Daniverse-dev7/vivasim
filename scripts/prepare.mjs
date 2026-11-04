import { copyFileSync, mkdirSync, cpSync } from 'node:fs';
mkdirSync('public', {recursive:true});
copyFileSync('node_modules/pdfjs-dist/build/pdf.worker.min.mjs', 'public/pdf.worker.min.mjs');
mkdirSync('public/legacy', {recursive:true});
copyFileSync('index.html', 'public/legacy/index.html');
copyFileSync('styles.css', 'public/legacy/styles.css');
cpSync('src', 'public/legacy/src', {recursive:true});
