import { execSync } from 'child_process';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const scriptsDir = path.join(__dirname, '../scripts');
const scriptPath = path.join(scriptsDir, 'main.ts');

execSync(`npx ts-node --esm ${scriptPath}`, {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit',
  env: { ...process.env, FORCE_COLOR: '1' },
});
