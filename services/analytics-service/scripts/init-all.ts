import { spawn } from 'child_process';
import path from 'path';

async function runScript(scriptName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, scriptName);
    const process = spawn('ts-node', [scriptPath], {
      stdio: 'inherit',
      env: { ...process.env }
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Script ${scriptName} failed with code ${code}`));
      }
    });

    process.on('error', (error) => {
      reject(error);
    });
  });
}

async function initializeAll() {
  try {
    console.log('Starting initialization of all services...');

    // Run initialization scripts in sequence
    await runScript('init-db.ts');
    await runScript('init-redis.ts');
    await runScript('init-rabbitmq.ts');
    await runScript('init-sonarqube.ts');

    console.log('All services initialized successfully');
  } catch (error) {
    console.error('Error during initialization:', error);
    process.exit(1);
  }
}

// Run all initializations
initializeAll(); 