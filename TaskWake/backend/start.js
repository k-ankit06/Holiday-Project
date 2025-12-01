

const { spawn } = require('child_process');
const path = require('path');


function startBackend() {
  console.log('Starting TaskWave backend server...');
  
 
  const backendDir = path.join(__dirname);
  
  
  const backendProcess = spawn('node', ['server.js'], {
    cwd: backendDir,
    stdio: 'inherit'
  });

  backendProcess.on('close', (code) => {
    console.log(`Backend server process exited with code ${code}`);
  });

  backendProcess.on('error', (error) => {
    console.error('Failed to start backend server:', error);
  });
}


startBackend();