'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const CreateArticleSchema = z.object({
    title: z.string().min(5, { message: 'العنوان يجب أن يكون 5 أحرف على الأقل' }),
    content: z.string().min(20, { message: 'المحتوى يجب أن يكون 20 حرفاً على الأقل' }),
    excerpt: z.string().optional(),
})

export async function createArticle(prevState: any, formData: FormData) {
    const validatedFields = CreateArticleSchema.safeParse({
        title: formData.get('title'),
        content: formData.get('content'),
        excerpt: formData.get('excerpt'),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'البيانات غير مكتملة.',
        }
    }

    const { title, content, excerpt } = validatedFields.data
    const image = formData.get('image') as File;
    let imageUrl = null;

    // Simple Base64 conversion for now (Production should use S3/Cloudinary)
    if (image && image.size > 0) {
        if (image.size > 5 * 1024 * 1024) { // 5MB limit
            return { message: 'حجم الصورة كبير جداً. الحد الأقصى 5 ميغابايت.' };
        }

        const buffer = await image.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        imageUrl = `data:${image.type};base64,${base64}`;
    }

    try {
        const slug = title.trim().replace(/\s+/g, '-') + '-' + Date.now();

        await prisma.news.create({
            data: {
                title,
                content,
                excerpt: excerpt || content.substring(0, 150),
                image_url: imageUrl,
                slug,
                is_published: true,
            },
        })
    } catch (error) {
        console.error(error);
        return {
            message: 'حدث خطأ أثناء حفظ الخبر.',
        }
    }

    revalidatePath('/admin/news');
    revalidatePath('/news');
    revalidatePath('/'); // Homepage
    redirect('/admin/news');
}
