import { spawn } from 'node:child_process';

// devtools://devtools/bundled/inspector.html?ws=127.0.0.1:14003/socket/cdt/2676d6dd-528c-4453-ac0d-c5dddf78c4d7

function getChromeCommand(): { command: string; args: string[] } {
  const platform = process.platform;

  switch (platform) {
    case 'darwin':
      return { command: 'open', args: ['-a', 'Google Chrome'] };
    case 'win32':
      return { command: 'cmd', args: ['/c', 'start', 'chrome'] };
    case 'linux':
      // Try common Chrome executable names on Linux
      return { command: 'google-chrome', args: [] };
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

export function openDevtoolsSessionInChrome(cdtUrl: string) {
  const url = new URL('devtools://devtools/bundled/inspector.html');
  url.searchParams.set('ws', cdtUrl.replace('ws://', ''));

  return new Promise((resolve, reject) => {
    const { command, args } = getChromeCommand();
    const proc = spawn(command, [...args, url.toString()], {
      shell: process.platform === 'win32',
    });
    proc.on('error', (err) => {
      reject(new Error(`Failed to launch Chrome: ${err.message}`));
    });
    proc.on('close', (code) => {
      if (code === 0) {
        resolve(true);
      }
      else {
        reject(new Error('Failed to open devtools session'));
      }
    });
  });
}
