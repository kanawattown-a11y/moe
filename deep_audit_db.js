const fs = require('fs');
const path = require('path');
const MdbReader = require('mdb-reader').default || require('mdb-reader');

const dbPath = path.join(__dirname, 'prisma', 'moe.accdb');
console.log('Deep auditing all tables in:', dbPath);

if (!fs.existsSync(dbPath)) {
    console.error('File not found!');
    process.exit(1);
}

const buffer = fs.readFileSync(dbPath);
const reader = new MdbReader(buffer);

const tableNames = reader.getTableNames();
console.log(`Total Tables: ${tableNames.length}`);

for (const name of tableNames) {
    try {
        const table = reader.getTable(name);
        if (table.rowCount > 0) {
            console.log(`Table: ${name} | Rows: ${table.rowCount}`);
        }
    } catch (e) {}
}
