const { execSync } = require('child_process');
const fs = require('fs');

let legendaryVersion;
try {
    legendaryVersion = execSync('git describe --exact-match --tags', { encoding: 'utf8' }).trim();
} catch (error) {
    legendaryVersion = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
}
fs.writeFileSync('version.js', `window.legendaryVersion = "${legendaryVersion}";\n`, { encoding: 'utf8' });
