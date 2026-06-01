const fs = require('fs-extra');
const path = require('path');
const pkg = require('../package.json');

const htmlPath = path.resolve(__dirname, '../public/index.html');
let html = fs.readFileSync(htmlPath, 'utf-8');

const title = `Envm ${pkg.version}`;
html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);

fs.writeFileSync(htmlPath, html, 'utf-8');
console.log(`✅ HTML title updated to: ${title}`);
