import { Prisma } from '@prisma/client';

export function normalizeArabicRegex(s: string): string {
    if (!s) return "";
    let r = "";
    const l = s.length;

    for (let i = 0; i < l; i++) {
        const ch = s[i];

        if (i === l - 2 && (ch === 'ب' || ch === 'ت')) {
            r += "[بت]";
        } else if (i === l - 1) {
            if (['ا', 'ى', 'ه', 'ة'].includes(ch)) r += "[اىهة]";
            else if (ch === 'ي') r += "[يئى]";
            else r += getNormalCharRegex(ch);
        } else {
            r += getNormalCharRegex(ch);
        }
    }
    return r;
}

function getNormalCharRegex(ch: string): string {
    if (['ا', 'أ', 'إ', 'آ'].includes(ch)) return "[اأإآ]";
    if (ch === 'ى') return "[ىي]";
    if (['ه', 'ة'].includes(ch)) return "[هة]";
    if (['ي', 'ئ'].includes(ch)) return "[يئ]";
    if (['و', 'ؤ'].includes(ch)) return "[وؤ]";
    return ch;
}

export function buildEmployeeSearchQuery(rawQuery: string) {
    let strRaw = rawQuery.trim();
    if (!strRaw) return Prisma.empty;

    strRaw = strRaw.replace(/ة/g, "ه").replace(/ى/g, "ي");
    const strSearch = normalizeArabicRegex(strRaw);
    const parts = strRaw.split(/\s+/);

    if (strRaw.length < 2) return Prisma.empty;

    if (parts.length === 1) {
        if (/^\d{6,}$/.test(strRaw)) {
            return Prisma.sql`("الرقم_الوطني" ~ ${strSearch} OR "الرقم_الذاتي" ~ ${strSearch})`;
        }
        return Prisma.sql`("الاسم" ~ ${strSearch} OR "اسم_الأب" ~ ${strSearch} OR "النسبة" ~ ${strSearch} OR "الاسم_الثلاثي" ~ ${strSearch})`;
    }

    if (parts.length === 2) {
        const normWord1 = normalizeArabicRegex(parts[0]);
        const rawWord2 = parts[1];
        
        const normWord2FirstChar = rawWord2.length > 0 ? normalizeArabicRegex(rawWord2[0]) : "";
        const normWord2Full = normalizeArabicRegex(rawWord2);

        if (rawWord2.length <= 3) {
            // Case 1: First Name + short Last Name/Father initial
            return Prisma.sql`("الاسم" ~ ${normWord1} AND ("اسم_الأب" ~ ${'^' + normWord2FirstChar} OR "النسبة" ~ ${'^' + normWord2FirstChar}))`;
        } else {
            // Case 1b: First Name + full Last Name or Father Name
            return Prisma.sql`("الاسم" ~ ${normWord1} AND ("النسبة" ~ ${normWord2Full} OR "اسم_الأب" ~ ${normWord2Full}))`;
        }
    }

    if (parts.length === 3) {
        const normWord1 = normalizeArabicRegex(parts[0]);
        const normWord2Char1 = normalizeArabicRegex(parts[1][0]);
        const normWord3 = normalizeArabicRegex(parts[2]);

        return Prisma.sql`("الاسم" ~ ${normWord1} AND "اسم_الأب" ~ ${'^' + normWord2Char1} AND "النسبة" ~ ${normWord3})`;
    }

    // Default: Fallback to full name regex
    return Prisma.sql`("الاسم_الثلاثي" ~ ${strSearch})`;
}
