const fs = require('fs');
const path = require('path');
const MdbReader = require('mdb-reader').default || require('mdb-reader');

const dbPath = path.join(__dirname, 'prisma', 'moe.accdb');
const buffer = fs.readFileSync(dbPath);
const reader = new MdbReader(buffer);

console.log('# Data Reconciliation Audit\n');
console.log('| Table Name | Record Count | Status in Seed.js |');
console.log('| :--- | :--- | :--- |');

const tables = reader.getTableNames();
const seedContent = fs.readFileSync(path.join(__dirname, 'prisma', 'seed.js'), 'utf8');

tables.forEach(t => {
    let count = 0;
    try {
        count = reader.getTable(t).getData().length;
    } catch(e) {
        count = 'Error';
    }

    const isMapped = seedContent.includes(t);
    const status = isMapped ? '✅ Mapped' : (t.startsWith('~') || t.startsWith('USys') ? '🚫 Internal' : '❌ MISSING');
    
    console.log(`| ${t} | ${count} | ${status} |`);
});
