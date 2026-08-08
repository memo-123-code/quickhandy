const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function fixBidi(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;

  let original = fs.readFileSync(filePath, 'utf8');
  let content = original;

  // Find <p> tags that don't have dir attribute and add dir="auto"
  // E.g., <p className="..."> -> <p dir="auto" className="...">
  // Or <p> -> <p dir="auto">
  content = content.replace(/<p\b(?![^>]*\bdir=)/g, '<p dir="auto"');
  
  // Find h1, h2, h3, h4 tags as well, since they might have punctuation
  content = content.replace(/<h[1-6]\b(?![^>]*\bdir=)/g, match => `${match} dir="auto"`);

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated bidi in ${filePath}`);
  }
}

walkDir('f:/موقع/Mechatronics-Data-main9/Mechatronics-Data-main9/مشروع جديد/src', fixBidi);
console.log('Finished updating bidi globally!');
