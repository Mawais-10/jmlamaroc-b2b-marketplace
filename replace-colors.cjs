const fs = require('fs');
const path = require('path');

const PRIMARY_GREEN = /#1A7A5E/gi;
const PRIMARY_ORANGE = '#E85D04';

const LIGHT_GREEN = /#E8F5F0/gi;
const LIGHT_ORANGE = '#FFF2EB';

const DARK_GREEN = /#1E3A30/gi;
const DARK_ORANGE = '#3E1A0A';

const GREEN_HOVER = /#125E48/gi;
const ORANGE_HOVER = '#CC5204';

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content
    .replace(PRIMARY_GREEN, PRIMARY_ORANGE)
    .replace(LIGHT_GREEN, LIGHT_ORANGE)
    .replace(DARK_GREEN, DARK_ORANGE)
    .replace(GREEN_HOVER, ORANGE_HOVER);

  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('Updated:', filePath);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.css') || filePath.endsWith('.js')) {
      replaceInFile(filePath);
    }
  }
}

walkDir(path.join(__dirname, 'src'));
console.log('Done!');
