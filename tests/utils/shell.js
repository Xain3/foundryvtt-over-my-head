import { spawn } from 'child_process';

export function runShell(command, args = [], options = {}) {
  return new Promise((resolve) => {
    const cwd = options.cwd || process.cwd();
    const env = { ...process.env, ...(options.env || {}) };

    const child = spawn(command, args, {
      cwd,
      env,
      shell: false,
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (d) => (stdout += d.toString()));
    child.stderr.on('data', (d) => (stderr += d.toString()));

    child.on('close', (code) => {
      resolve({ code, stdout, stderr });
    });
    child.on('error', (err) => {
      resolve({ code: 1, stdout, stderr: `${stderr}${err?.message || String(err)}` });
    });
  });
}

export function runBashScript(scriptPath, scriptArgs = [], options = {}) {
  return runShell('bash', [scriptPath, ...scriptArgs], options);
}
