const fs = require('fs');
const path = require('path');
const MdbReader = require('mdb-reader').default || require('mdb-reader');

const dbPath = path.join(__dirname, 'prisma', 'moe.accdb');
console.log('Scanning all tables in:', dbPath);

if (!fs.existsSync(dbPath)) {
    console.error('File not found!');
    process.exit(1);
}

const buffer = fs.readFileSync(dbPath);
const reader = new MdbReader(buffer);

const tableNames = reader.getTableNames();
let foundAny = false;

console.log('--- TABLES WITH MORE THAN 100 RECORDS ---');
for (const name of tableNames) {
    try {
        const table = reader.getTable(name);
        if (table.rowCount > 100) {
            console.log(`[DATA FOUND] Table: ${name}, Count: ${table.rowCount}`);
            foundAny = true;
        }
    } catch (e) {
        // Skip system/corrupted tables
    }
}

if (!foundAny) {
    console.log('No tables found with more than 100 records in this file.');
    console.log('Total tables scanned:', tableNames.length);
}
