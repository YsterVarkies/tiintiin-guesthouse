// Pulls React Bits components (JS + CSS variants) from the public registry
// into src/components/reactbits/. Usage: node scripts/add-reactbits.mjs SplitText CountUp ...
import fs from 'node:fs';
import path from 'node:path';

const names = process.argv.slice(2);
const outRoot = path.resolve('src/components/reactbits');

for (const name of names) {
  const url = `https://reactbits.dev/r/${name}-JS-CSS.json`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`✗ ${name}: HTTP ${res.status}`);
    continue;
  }
  const json = await res.json();
  for (const file of json.files) {
    const dest = path.join(outRoot, file.path);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, file.content);
    console.log(`✓ ${file.path}`);
  }
  if (json.dependencies?.length) console.log(`  deps: ${json.dependencies.join(', ')}`);
}
