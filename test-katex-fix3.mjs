import { marked } from 'marked';
import markedKatex from 'marked-katex-extension';
marked.use(markedKatex({ throwOnError: false, output: 'html', nonStandard: true }));

const md = 'A person (large $r$, high $S$) will have edges.';
const html = await marked.parse(md);
const fs = await import('fs');
fs.writeFileSync('katex-test-output.txt', 
  'Error: ' + (html.includes('katex-error') ? 'YES' : 'NO') + '\n' +
  'Contains katex span: ' + (html.includes('class="katex"') ? 'YES' : 'NO') + '\n' +
  'HTML:\n' + html
);
