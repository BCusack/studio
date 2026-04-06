import { marked } from 'marked';
import markedKatex from 'marked-katex-extension';
marked.use(markedKatex({ throwOnError: false, output: 'html', nonStandard: true }));

const md = `1. **Hub formation is earned**: high-salience, frequently reinforced nodes (large $r$) are permitted to become densely connected hubs. A person mentioned daily (large $r$, high $S$) will have edges.
2. **Cascading pruning**: when $S$ falls below $S_{\\min}$.`;

const html = await marked.parse(md);
if (html.includes('katex-error')) {
  const errors = html.match(/<span class="katex-error"[^>]*>[^<]+<\/span>/g);
  console.log('ERRORS:', errors);
} else {
  console.log('All expressions render correctly - no errors');
}
