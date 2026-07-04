const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, '..', 'deploy', 'start.cjs');
const targetDir = path.join(__dirname, '..', 'dist', 'iglesia', 'server');
const target = path.join(targetDir, 'start.cjs');

if (!fs.existsSync(targetDir)) {
  console.log('postbuild: no se encontro carpeta de servidor SSR, se omite copia de start.cjs');
  process.exit(0);
}

fs.copyFileSync(source, target);
console.log(`postbuild: start.cjs copiado a ${target}`);
