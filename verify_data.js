const fs = require('fs');
const path = require('path');

function walkDir(dir) {
    let files = [];
    try {
        const list = fs.readdirSync(dir);
        list.forEach(file => {
            const p = path.join(dir, file);
            const stat = fs.statSync(p);
            if (stat.isDirectory()) {
                if (!p.includes('node_modules') && !p.includes('.git')) {
                    files = files.concat(walkDir(p));
                }
            } else {
                // البحث عن الملفات الكبيرة (أكبر من 40 ميجابايت)
                if (stat.size > 40 * 1024 * 1024) {
                    files.push({ path: p, sizeMB: (stat.size / (1024 * 1024)).toFixed(2) });
                }
            }
        });
    } catch (e) { }
    return files;
}

console.log('--- Searching for Large Data Files (>40MB) on Desktop... ---');
const bigFiles = walkDir('C:\\Users\\Dell\\Desktop');
bigFiles.forEach(f => console.log(`${f.path} - Size: ${f.sizeMB} MB`));
console.log('--- Search Finished ---');
