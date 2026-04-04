const fs = require('fs');
const path = require('path');
const MdbReader = require('mdb-reader').default || require('mdb-reader');

const downloadsDir = 'C:/Users/Dell/Downloads';
const files = fs.readdirSync(downloadsDir);
const targetFile = files.find(f => f.toLowerCase().endsWith('.accdb') && f.includes('2026'));

if (!targetFile) {
    console.log('No 2026 .accdb file found in Downloads.');
    process.exit(1);
}

const dbPath = path.join(downloadsDir, targetFile);
console.log('Deep auditing Downloads DB at:', dbPath);

const buffer = fs.readFileSync(dbPath);
const reader = new MdbReader(buffer);

const tableNames = reader.getTableNames();
console.log(`Total Tables Found: ${tableNames.length}`);

for (const name of tableNames) {
    try {
        const table = reader.getTable(name);
        if (table.rowCount > 0) {
            console.log(`Table: [${name}] | Rows: ${table.rowCount}`);
        }
    } catch (e) {}
}
