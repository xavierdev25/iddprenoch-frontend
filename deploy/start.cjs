const fs = require('fs');
const path = require('path');

const logPath = path.join(__dirname, 'start-debug.log');
function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  try {
    fs.appendFileSync(logPath, line);
  } catch (e) {
    // si ni siquiera puede escribir el log, no hay mucho más que hacer aquí
  }
  console.log(line);
}

log('start.cjs: iniciando...');

import('./server.mjs')
  .then((mod) => {
    log('start.cjs: server.mjs cargado correctamente');
    const app = mod.reqHandler;
    if (!app) {
      log(
        'start.cjs: ERROR - mod.reqHandler es undefined. Exports disponibles: ' +
          Object.keys(mod).join(', '),
      );
      process.exit(1);
    }
    const port = process.env.PORT || 4000;
    log(`start.cjs: intentando escuchar en el puerto ${port}...`);
    app.listen(port, () => {
      log(`start.cjs: escuchando correctamente en el puerto ${port}`);
    });
  })
  .catch((err) => {
    log('start.cjs: ERROR al cargar/arrancar - ' + (err && err.stack ? err.stack : String(err)));
    process.exit(1);
  });

process.on('uncaughtException', (err) => {
  log('start.cjs: uncaughtException - ' + (err && err.stack ? err.stack : String(err)));
});
process.on('unhandledRejection', (err) => {
  log('start.cjs: unhandledRejection - ' + (err && err.stack ? err.stack : String(err)));
});
