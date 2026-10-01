import { readdir, readFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import { parse } from 'parse5';

const root = resolve('dist');
const site = new URL('https://gomodules.alexrios.me');

async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? files(path) : path;
  }))).flat();
}

const allFiles = new Set(await files(root));
const pages = new Map();
const failures = [];

for (const file of allFiles) {
  if (!file.endsWith('.html')) continue;
  const html = await readFile(file, 'utf8');
  const ids = new Set();
  const links = [];
  let headings = 0;
  function visit(node) {
    if (node.tagName === 'h1') headings++;
    for (const { name, value } of node.attrs ?? []) {
      if (name === 'id') ids.add(value);
      if (name === 'href' || name === 'src') links.push(value);
    }
    for (const child of node.childNodes ?? []) visit(child);
  }
  visit(parse(html));
  if (headings !== 1) failures.push(`${relative(root, file)}: ${headings} títulos h1`);
  if (/\{%\s*(?:hint|endhint)/.test(html)) failures.push(`${relative(root, file)}: bloco GitBook não convertido`);
  pages.set(file, { ids, links });
}

let checked = 0;
for (const [file, { links }] of pages) {
  const path = '/' + relative(root, file).replace(/index\.html$/, '');
  for (const href of links) {
    const url = new URL(href, new URL(path, site));
    if (url.origin !== site.origin) continue;
    checked++;
    const destination = resolve(root, '.' + decodeURIComponent(url.pathname));
    const target = allFiles.has(destination) ? destination
      : allFiles.has(join(destination, 'index.html')) ? join(destination, 'index.html')
      : destination.replace(/\/$/, '') + '.html';
    if (!allFiles.has(target)) {
      failures.push(`${path}: ${href} não existe`);
    } else if (url.hash && pages.has(target) && !pages.get(target).ids.has(decodeURIComponent(url.hash.slice(1)))) {
      failures.push(`${path}: âncora ${href} não existe`);
    }
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`${pages.size} páginas HTML e ${checked} links/âncoras internos conferidos.`);
}
