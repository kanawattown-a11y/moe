const fs = require('fs');
const path = require('path');

const sourceDir = 'C:/Users/Dell/Desktop/MOE';
const destPath = 'C:/Users/Dell/Desktop/MOE/moe-system/prisma/moe.accdb';

console.log('Searching for data file in:', sourceDir);

const files = fs.readdirSync(sourceDir);
// Find the largest .accdb file that is NOT currently in the prisma folder
// (or just the one with '2026' or 'بيانات')
const sourceFile = files.find(f => 
    f.toLowerCase().endsWith('.accdb') && 
    (f.includes('2026') || f.includes('\u0628\u064a\u0627\u0646\u0627\u062a'))
);

if (!sourceFile) {
    console.error('CRITICAL: Could not find the source data file in the parent directory.');
    process.exit(1);
}

const fullSourcePath = path.join(sourceDir, sourceFile);
console.log(`Found source file: ${sourceFile} (${fullSourcePath})`);
console.log(`Copying to: ${destPath}`);

try {
    fs.copyFileSync(fullSourcePath, destPath);
    console.log('--- SUCCESS: Database file replaced with correct source. ---');
    
    // Quick verification
    const stats = fs.statSync(destPath);
    console.log(`New file size: ${stats.size} bytes`);
} catch (err) {
    console.error('Copy failed:', err.message);
}
