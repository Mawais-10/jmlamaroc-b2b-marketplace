const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace the logo text "ChouFliya" -> "JML Maroc"
  let newContent = content
    .replace(/ChouFliya/g, 'JML Maroc')
    .replace(/CHOUFLIYA/g, 'JML MAROC')
    .replace(/choufliya\.ma/g, 'jmlmaroc.ma')
    .replace(/choufliya/gi, 'jmlmaroc')
    // Fix the logo "C" -> "J"
    .replace(/<span className="text-white font-bold text-sm">C<\/span>/g, '<span className="text-white font-bold text-sm">J</span>')
    .replace(/<span className="text-white font-bold text-lg">C<\/span>/g, '<span className="text-white font-bold text-lg">J</span>')
    .replace(/<span className="text-white text-xl font-bold">C<\/span>/g, '<span className="text-white text-xl font-bold">J</span>');

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
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      replaceInFile(filePath);
    }
  }
}

walkDir(path.join(__dirname, 'src'));
console.log('Done replacing text!');
