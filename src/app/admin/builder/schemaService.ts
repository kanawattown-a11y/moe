import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

const DYNAMIC_MARKER = '// --- DYNAMIC MODELS START ---';

export async function updateDynamicSchema() {
    try {
        console.log('🔄 Starting Dynamic Schema Update...');

        // 1. Fetch all meta configuration from the database
        const tables = await prisma.metaTable.findMany({
            include: {
                fields: true,
                relations: true,
            },
        });

        // 2. Read the existing schema.prisma file
        const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
        let schemaContent = fs.readFileSync(schemaPath, 'utf8');

        // Remove old dynamic models (Custom Tables)
        if (schemaContent.includes(DYNAMIC_MARKER)) {
            schemaContent = schemaContent.split(DYNAMIC_MARKER)[0].trim() + '\n\n';
        } else {
            schemaContent += '\n\n';
        }

        // Remove old injected fields from System Tables
        schemaContent = schemaContent.replace(/\/\/ --- DYNAMIC SYSTEM FIELDS START ---[\s\S]*?\/\/ --- DYNAMIC SYSTEM FIELDS END ---\n?/g, '');

        const systemTables = tables.filter((t: any) => t.isSystem);
        const customTables = tables.filter((t: any) => !t.isSystem);

        // --- 3A. Inject System Tables ---
        systemTables.forEach((table: any) => {
            const regex = new RegExp(`model\\s+${table.name}\\s+\\{([\\s\\S]*?)\\}`, 'gi');
            schemaContent = schemaContent.replace(regex, (match) => {
                let injectedCode = `  // --- DYNAMIC SYSTEM FIELDS START ---\n`;

                table.fields.forEach((field: any) => {
                    const optionalMark = field.isRequired ? '' : '?';
                    injectedCode += `  ${field.name} ${field.type}${optionalMark}\n`;
                });

                table.relations.forEach((rel: any) => {
                    injectedCode += `  ${rel.foreignKey} Int?\n`;
                    const relName = `sys_${table.slug.substring(0, 5).replace(/[^a-zA-Z0-9]/g, '')}_${rel.targetModel.substring(0, 5).replace(/[^a-zA-Z0-9]/g, '')}_${rel.id}`;
                    injectedCode += `  ${rel.targetModel.toLowerCase()}_rel ${rel.targetModel}? @relation(fields: [${rel.foreignKey}], references: [id], map: "${relName}")\n`;
                });

                injectedCode += `  // --- DYNAMIC SYSTEM FIELDS END ---\n`;

                return match.replace(/\}[\s]*$/, `\n${injectedCode}}`);
            });
        });

        // --- 3B. Generate Custom Dynamic Models ---
        let dynamicPrismaCode = `${DYNAMIC_MARKER}\n\n`;

        customTables.forEach((table: any) => {
            dynamicPrismaCode += `model ${table.name} {\n`;
            dynamicPrismaCode += `  id Int @id @default(autoincrement())\n`;

            // Fields
            table.fields.forEach((field: any) => {
                const optionalMark = field.isRequired ? '' : '?';
                dynamicPrismaCode += `  ${field.name} ${field.type}${optionalMark}\n`;
            });

            // Relations
            table.relations.forEach((rel: any) => {
                dynamicPrismaCode += `  ${rel.foreignKey} Int?\n`;
                // To avoid relation name conflicts, we can explicitly generate a map/relation name
                const relName = `fk_${table.slug.substring(0, 10).replace(/[^a-zA-Z0-9]/g, '')}_${rel.targetModel.substring(0, 10).replace(/[^a-zA-Z0-9]/g, '')}_${rel.id}`;
                dynamicPrismaCode += `  ${rel.targetModel.toLowerCase()}_rel ${rel.targetModel}? @relation(fields: [${rel.foreignKey}], references: [id], map: "${relName}")\n`;
            });

            // Map table to lowercase slug to avoid upper/lower case strictness
            dynamicPrismaCode += `\n  @@map("t_${table.slug.replace(/-/g, '_')}")\n`;
            dynamicPrismaCode += `}\n\n`;
        });

        // 4. Overwrite schema.prisma
        const newSchemaContent = schemaContent + dynamicPrismaCode;
        fs.writeFileSync(schemaPath, newSchemaContent, 'utf8');
        console.log('✅ Updated schema.prisma file.');

        // 5. Run Prisma DB Push & Generate
        console.log('⏳ Running prisma db push...');
        const { stdout: pushOut, stderr: pushErr } = await execAsync('npx prisma db push --accept-data-loss', {
            cwd: process.cwd(),
        });
        if (pushErr) console.warn('Prisma Push Warning:', pushErr);
        console.log(pushOut);

        console.log('⏳ Running prisma generate...');
        const { stdout: genOut, stderr: genErr } = await execAsync('npx prisma generate', {
            cwd: process.cwd(),
        });
        if (genErr) console.warn('Prisma Gen Warning:', genErr);
        console.log(genOut);

        console.log('🎉 Dynamic Schema Update Complete!');
        return { success: true };
    } catch (error) {
        console.error('❌ Failed to update dynamic schema:', error);
        return { success: false, error: String(error) };
    }
}
