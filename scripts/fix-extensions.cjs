const fs = require('fs');
const path = require('path');

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && full.endsWith('.js')) patchFile(full);
  }
}

function patchFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/(from\s+|import\s*\(\s*)['"](\.\.?\/.+?)['"]/g, (m, p1, p2) => {
    if (/[.][a-zA-Z0-9]+$/.test(p2)) return `${p1}'${p2}'`;
    return `${p1}'${p2}.js'`;
  });
  content = content.replace(/(export\s+(?:\*\s+from|\{[^}]*\}\s+from)\s*)['"](\.\.?\/.+?)['"]/g, (m, p1, p2) => {
    if (/[.][a-zA-Z0-9]+$/.test(p2)) return `${p1}'${p2}'`;
    return `${p1}'${p2}.js'`;
  });
  fs.writeFileSync(file, content, 'utf8');
}

const root = path.resolve(__dirname, '..', 'dist');
if (fs.existsSync(root)) walk(root);
console.log('Patched import/export paths in dist to use .js extensions');
