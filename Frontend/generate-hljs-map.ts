import fs from 'fs';
import path from 'path';

const dirPath = path.resolve('node_modules/highlight.js/lib/languages');
const files = fs.readdirSync(dirPath);

const entries = files
  .filter(file => {
    // Exclut les fichiers qui ne se terminent pas uniquement par .js
    // Exclut les .js.js, .test.js, etc.
    return /^[a-z0-9_-]+\.js$/i.test(file);
  })
  .map(file => {
    const name = path.basename(file, '.js');
    return `  '${name}': () => import('highlight.js/lib/languages/${name}'),`;
  });


const content = `export const HLJS_LANGUAGES: Record<string, () => Promise<any>> = {\n${entries.join('\n')}\n};\n`;

fs.writeFileSync('src/app/highlight-languages.ts', content);
console.log('✅ Fichier highlight-languages.ts généré');
