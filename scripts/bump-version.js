#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const appJsonPath = path.join(__dirname, '..', 'app.json');

try {
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  
  const currentVersion = appJson.expo.version;
  const versionParts = currentVersion.split('.');
  let major = parseInt(versionParts[0] || '0', 10);
  let minor = parseInt(versionParts[1] || '0', 10);
  let patch = parseInt(versionParts[2] || '0', 10);
  
  patch += 1;
  
  if (patch >= 10) {
    patch = 0;
    minor += 1;
    
    if (minor >= 10) {
      minor = 0;
      major += 1;
    }
  }
  
  const newVersion = `${major}.${minor}.${patch}`;
  appJson.expo.version = newVersion;
  
  fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n');
  
  console.log(`Version bumped from ${currentVersion} to ${newVersion}`);
  
  process.exit(0);
} catch (error) {
  console.error('Error bumping version:', error);
  process.exit(1);
}