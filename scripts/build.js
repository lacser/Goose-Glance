import { execSync } from 'child_process';

try {
  // Build TypeScript files
  execSync('tsc -p components/popup/tsconfig.app.json', { stdio: 'inherit' });
  execSync('tsc -p components/popup/tsconfig.node.json', { stdio: 'inherit' });
  execSync('tsc -p components/content/tsconfig.app.json', { stdio: 'inherit' });
  execSync('tsc -p components/content/tsconfig.node.json', {
    stdio: 'inherit',
  });

  // Build Vite
  execSync('vite build components/popup', { stdio: 'inherit' });
  execSync('vite build components/content', { stdio: 'inherit' });

  // Copy public directory if it exists
  if (process.platform === 'win32') {
    execSync('if exist public xcopy /E /I /Y public dist', {
      stdio: 'inherit',
    });
  } else {
    execSync('[ -d public ] && cp -R public/* dist/ || true', {
      stdio: 'inherit',
    });
  }

  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
