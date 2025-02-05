import nodemon from 'nodemon';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const buildScript = resolve(__dirname, 'build.js');

nodemon({
  watch: 'components',
  ext: 'ts,tsx,css,html',
  ignore: ['**/node_modules/**'],
  exec: `node ${buildScript}`,
});

nodemon
  .on('start', () => {
    console.log('Watch mode started...');
  })
  .on('restart', (files) => {
    console.log('Changes detected in:', files);
  })
  .on('quit', () => {
    console.log('Watch mode stopped');
    process.exit();
  });
