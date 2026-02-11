import { execSync } from 'child_process';
import * as path from 'path';

const scriptsDir = path.join(__dirname, '../scripts');
const scriptPath = path.join(scriptsDir, 'main.ts');

execSync(`npx ts-node ${scriptPath}`, {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit',
  env: { ...process.env, FORCE_COLOR: '1' },
});
