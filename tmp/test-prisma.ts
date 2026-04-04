import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function main() {
    const keys = Object.keys(prisma);
    const models = keys.filter(k => !k.startsWith('_') && typeof (prisma as any)[k] === 'object');
    fs.writeFileSync('tmp/prisma-models.txt', models.join('\n'));
    console.log("Done writing to tmp/prisma-models.txt");
}

main().catch(console.error).finally(() => prisma.$disconnect());
