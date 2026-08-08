const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function fixPhysicalProperties(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;

  let original = fs.readFileSync(filePath, 'utf8');
  let content = original;

  // Regex replacements for Tailwind classes
  content = content.replace(/\bleft-([0-9\.]+)\b/g, 'start-$1');
  content = content.replace(/\bright-([0-9\.]+)\b/g, 'end-$1');
  content = content.replace(/\B-left-([0-9\.]+)\b/g, '-start-$1');
  content = content.replace(/\B-right-([0-9\.]+)\b/g, '-end-$1');
  
  content = content.replace(/\btext-left\b/g, 'text-start');
  content = content.replace(/\btext-right\b/g, 'text-end');
  
  content = content.replace(/\bpl-([0-9\.]+)\b/g, 'ps-$1');
  content = content.replace(/\bpr-([0-9\.]+)\b/g, 'pe-$1');

  content = content.replace(/\bml-([0-9\.]+)\b/g, 'ms-$1');
  content = content.replace(/\bmr-([0-9\.]+)\b/g, 'me-$1');
  
  content = content.replace(/\B-ml-([0-9\.]+)\b/g, '-ms-$1');
  content = content.replace(/\B-mr-([0-9\.]+)\b/g, '-me-$1');
  
  content = content.replace(/\brounded-tl-/g, 'rounded-ts-');
  content = content.replace(/\brounded-tr-/g, 'rounded-te-');
  content = content.replace(/\brounded-bl-/g, 'rounded-es-');
  content = content.replace(/\brounded-br-/g, 'rounded-ee-');

  // Some components might have hardcoded inline styles left/right
  // Be careful with these, only do known safe replacements, let's just stick to tailwind for now.

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

walkDir('f:/موقع/Mechatronics-Data-main9/Mechatronics-Data-main9/مشروع جديد/src', fixPhysicalProperties);
console.log('Finished updating physical properties globally!');
