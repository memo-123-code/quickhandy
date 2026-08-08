const fs = require('fs');

function fixPhysicalProperties(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Regex replacements for Tailwind classes
  // left-X -> start-X
  content = content.replace(/\bleft-([0-9\.]+)\b/g, 'start-$1');
  // right-X -> end-X
  content = content.replace(/\bright-([0-9\.]+)\b/g, 'end-$1');
  // -left-X -> -start-X
  content = content.replace(/\B-left-([0-9\.]+)\b/g, '-start-$1');
  // -right-X -> -end-X
  content = content.replace(/\B-right-([0-9\.]+)\b/g, '-end-$1');
  // text-left -> text-start
  content = content.replace(/\btext-left\b/g, 'text-start');
  // text-right -> text-end
  content = content.replace(/\btext-right\b/g, 'text-end');
  // pl-X -> ps-X
  content = content.replace(/\bpl-([0-9\.]+)\b/g, 'ps-$1');
  // pr-X -> pe-X
  content = content.replace(/\bpr-([0-9\.]+)\b/g, 'pe-$1');

  fs.writeFileSync(filePath, content, 'utf8');
}

fixPhysicalProperties('f:/موقع/Mechatronics-Data-main9/Mechatronics-Data-main9/مشروع جديد/src/app/dashboard/admin/page.tsx');
fixPhysicalProperties('f:/موقع/Mechatronics-Data-main9/Mechatronics-Data-main9/مشروع جديد/src/app/dashboard/admin/loading.tsx');
console.log('Fixed physical properties!');
