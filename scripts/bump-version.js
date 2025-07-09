#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const appJsonPath = path.join(__dirname, '..', 'app.json');

try {
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  
  const currentVersion = appJson.expo.version;
  const versionParts = currentVersion.split('.');
  const majorMinor = versionParts.slice(0, 2).join('.');
  const patch = parseInt(versionParts[2] || '0', 10);
  
  const newVersion = `${majorMinor}.${patch + 1}`;
  appJson.expo.version = newVersion;
  
  fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n');
  
  console.log(`Version bumped from ${currentVersion} to ${newVersion}`);
  
  process.exit(0);
} catch (error) {
  console.error('Error bumping version:', error);
  process.exit(1);
}