const fs = require('fs');
const path = require('path');
const MdbReader = require('mdb-reader').default || require('mdb-reader');

const dbPath = path.join(__dirname, 'prisma', 'moe.accdb');
const buffer = fs.readFileSync(dbPath);
const reader = new MdbReader(buffer);

const schema = {};
const tables = reader.getTableNames();

tables.forEach(t => {
    try {
        const table = reader.getTable(t);
        schema[t] = table.getColumnNames();
    } catch(e) {
        schema[t] = 'Error: ' + e.message;
    }
});

fs.writeFileSync('full_schema_dump.json', JSON.stringify(schema, null, 2));
console.log('Schema dump completed to full_schema_dump.json');
process.exit(0);
