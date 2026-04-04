'use server'

import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { uploadFileToS3 } from '@/lib/s3';

import { createAuditLog } from '@/services/audit-service';

export async function createEmployee(formData: FormData) {
    // ... same as before but adding audit
    const firstName = formData.get('first_name') as string;
    const fatherName = formData.get('father_name') as string;
    const lastName = formData.get('last_name') as string;
    // ... (rest of parsing) ...

    // I'll keep the logic but wrap the prisma call and add auditing
    const employee = await prisma.employee.create({
        data: {
            first_name: formData.get('first_name') as string,
            father_name: formData.get('father_name') as string,
            last_name: formData.get('last_name') as string,
            mother_full_name: formData.get('mother_full_name') as string,
            full_name_triplet: `${formData.get('first_name')} ${formData.get('father_name')} ${formData.get('last_name')}`,
            gender: formData.get('gender') as string,
            national_id: formData.get('national_id') as string,
            birth_place: formData.get('birth_place') as string,
            birth_date: formData.get('birth_date') ? new Date(formData.get('birth_date') as string) : null,
            mobile: formData.get('mobile') as string,
            suwayda_full_address: formData.get('address_details') as string,
            city_id: formData.get('city_id') ? Number(formData.get('city_id')) : null,
            village_id: formData.get('village_id') ? Number(formData.get('village_id')) : null,
            marital_status_id: formData.get('marital_status_id') ? Number(formData.get('marital_status_id')) : null,
            children_count: formData.get('children_count') ? Number(formData.get('children_count')) : 0,
            job_category_id: formData.get('job_category_id') ? Number(formData.get('job_category_id')) : null,
            appt_job_title_id: formData.get('appt_job_title_id') ? Number(formData.get('appt_job_title_id')) : null,
            curr_job_title_id: formData.get('curr_job_title_id') ? Number(formData.get('curr_job_title_id')) : null,
            school_id: formData.get('school_id') ? Number(formData.get('school_id')) : null,
            complex_id: formData.get('complex_id') ? Number(formData.get('complex_id')) : null,
            appointment_type_id: formData.get('appointment_type_id') ? Number(formData.get('appointment_type_id')) : null,
            status_id: formData.get('status_id') ? Number(formData.get('status_id')) : null,
            assigned_work_id: formData.get('assigned_work_id') ? Number(formData.get('assigned_work_id')) : null,
            appointment_date: formData.get('appointment_date') ? new Date(formData.get('appointment_date') as string) : null,
            notes: formData.get('notes') as string,
            base_salary: formData.get('base_salary') ? Number(formData.get('base_salary')) : 0,
            family_allowance: formData.get('family_allowance') ? Number(formData.get('family_allowance')) : 0,
            nature_of_work_allowance: formData.get('nature_of_work_allowance') ? Number(formData.get('nature_of_work_allowance')) : 0,
            other_deductions: formData.get('other_deductions') ? Number(formData.get('other_deductions')) : 0,
        },
    });

    await createAuditLog({
        action: 'CREATE',
        resource: 'Employee',
        resourceId: employee.id.toString(),
        details: `Created employee: ${employee.full_name_triplet}`,
    });

    redirect('/admin/employees');
}

export async function updateEmployee(id: number, formData: FormData) {
    const firstName = formData.get('first_name') as string;
    const fatherName = formData.get('father_name') as string;
    const lastName = formData.get('last_name') as string;
    const motherName = formData.get('mother_full_name') as string;
    const gender = formData.get('gender') as string;
    const birthPlace = formData.get('birth_place') as string;
    const birthDateStr = formData.get('birth_date') as string;

    const selfNumber = formData.get('self_number') as string;
    const nationalId = formData.get('national_id') as string;
    const jobCode = formData.get('job_code') as string;

    const mobile = formData.get('mobile') as string;
    const addressDetails = formData.get('address_details') as string;
    const cityId = formData.get('city_id') ? Number(formData.get('city_id')) : null;
    const villageId = formData.get('village_id') ? Number(formData.get('village_id')) : null;

    const maritalStatusId = formData.get('marital_status_id') ? Number(formData.get('marital_status_id')) : null;
    const childrenCount = formData.get('children_count') ? Number(formData.get('children_count')) : null;

    const schoolId = formData.get('school_id') ? Number(formData.get('school_id')) : null;
    const complexId = formData.get('complex_id') ? Number(formData.get('complex_id')) : null;
    const jobTitleId = formData.get('job_title_id') ? Number(formData.get('job_title_id')) : null;
    const jobTitleApptId = formData.get('job_title_at_appt_id') ? Number(formData.get('job_title_at_appt_id')) : null;
    const appointmentTypeId = formData.get('appointment_type_id') ? Number(formData.get('appointment_type_id')) : null;
    const jobCategoryId = formData.get('job_category_id') ? Number(formData.get('job_category_id')) : null;
    const workStatusId = formData.get('status_id') ? Number(formData.get('status_id')) : null;
    const assignedWorkId = formData.get('assigned_work_id') ? Number(formData.get('assigned_work_id')) : null;
    const appointmentDateStr = formData.get('appointment_date') as string;
    const notes = formData.get('notes') as string;

    const birthDate = birthDateStr ? new Date(birthDateStr) : null;
    const appointmentDate = appointmentDateStr ? new Date(appointmentDateStr) : null;

    await prisma.employee.update({
        where: { id },
        data: {
            first_name: firstName,
            father_name: fatherName,
            last_name: lastName,
            mother_full_name: motherName,

            self_number: selfNumber,
            national_id: nationalId,
            job_code: jobCode,

            gender: gender,
            birth_place: birthPlace,
            birth_date: birthDate,

            mobile: mobile,
            suwayda_full_address: addressDetails,
            city_id: cityId,
            village_id: villageId,

            marital_status_id: maritalStatusId,
            children_count: childrenCount,

            school_id: schoolId,
            complex_id: complexId,
            curr_job_title_id: jobTitleId,
            appt_job_title_id: jobTitleApptId,

            appointment_type_id: appointmentTypeId,
            job_category_id: jobCategoryId,
            status_id: workStatusId,
            assigned_work_id: assignedWorkId,
            appointment_date: appointmentDate,

            notes: notes,
            base_salary: formData.get('base_salary') ? Number(formData.get('base_salary')) : 0,
            family_allowance: formData.get('family_allowance') ? Number(formData.get('family_allowance')) : 0,
            nature_of_work_allowance: formData.get('nature_of_work_allowance') ? Number(formData.get('nature_of_work_allowance')) : 0,
            other_deductions: formData.get('other_deductions') ? Number(formData.get('other_deductions')) : 0,
            full_name_triplet: `${firstName} ${fatherName} ${lastName}`.trim(),
        },
    });

    redirect(`/admin/employees/${id}`);
}

import { auth } from '@/auth';

export async function createArticle(prevState: any, formData: FormData) {
    const session = await auth();
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const excerpt = formData.get('excerpt') as string;
    const imageUrl = formData.get('image_url') as string;

    const slug = title.trim().replace(/\s+/g, '-') + '-' + Date.now();

    const article = await prisma.news.create({
        data: {
            title,
            content,
            excerpt,
            image_url: imageUrl,
            slug,
            is_published: true,
            author_id: session?.user?.id ? parseInt(session.user.id) : null,
        },
    });

    await createAuditLog({
        action: 'CREATE',
        resource: 'Article',
        resourceId: article.id.toString(),
        details: `Created news article: ${title}`,
    });

    revalidatePath('/news');
    revalidatePath('/admin/news');
    revalidatePath('/');
    redirect('/admin/news');
}

export async function updateArticle(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    const id = Number(formData.get('id'));
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const excerpt = formData.get('excerpt') as string;
    const imageUrl = formData.get('image_url') as string;
    const isPublished = formData.get('is_published') === 'true' || formData.get('is_published') === 'on';

    // Regenerate slug if title changed (optional, but good for SEO)
    const slug = title.trim().replace(/\s+/g, '-') + '-' + id;

    const article = await prisma.news.update({
        where: { id },
        data: {
            title,
            content,
            excerpt,
            image_url: imageUrl,
            slug,
            is_published: isPublished,
        },
    });

    await createAuditLog({
        action: 'UPDATE',
        resource: 'Article',
        resourceId: id.toString(),
        details: `Updated news article: ${title}`,
    });

    revalidatePath(`/news/${article.slug}`);
    revalidatePath('/news');
    revalidatePath('/admin/news');
    revalidatePath('/');
    redirect('/admin/news');
}

export async function deleteArticle(id: number) {
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    const article = await prisma.news.delete({
        where: { id },
    });

    await createAuditLog({
        action: 'DELETE',
        resource: 'Article',
        resourceId: id.toString(),
        details: `Deleted news article: ${article.title}`,
    });

    revalidatePath('/news');
    revalidatePath('/admin/news');
    revalidatePath('/');
    return { success: true };
}

export async function createBook(formData: FormData) {
    const session = await auth();
    const title = formData.get('title') as string;
    const authorName = formData.get('author_name') as string;
    const description = formData.get('description') as string;
    const categoryId = formData.get('category_id') ? Number(formData.get('category_id')) : null;

    const fileUrl = formData.get('file_url') as string;
    const coverUrl = formData.get('cover_url') as string;

    if (!fileUrl) {
        throw new Error("ملف الكتاب مطلوب.");
    }

    const book = await prisma.book.create({
        data: {
            title,
            author: authorName,
            summary: description,
            file_url: fileUrl,
            cover_url: coverUrl,
            category_id: categoryId,
            uploader_id: session?.user?.id ? parseInt(session.user.id) : null,
            is_public: true,
        },
    });

    await createAuditLog({
        action: 'CREATE',
        resource: 'Book',
        resourceId: book.id.toString(),
        details: `Uploaded book: ${title}`,
    });

    redirect('/admin/books');
}

// --- Extended Transaction Actions ---

export async function addEducation(employeeId: number, formData: FormData) {
    const certificateTypeId = formData.get('certificate_type_id') as string;
    const universityId = formData.get('university_id') as string;
    const collegeId = formData.get('college_id') as string;
    const instituteId = formData.get('institute_id') as string;
    const grad_year = formData.get('graduation_year') as string;

    if (!employeeId || !certificateTypeId) {
        throw new Error('Missing required fields');
    }

    await prisma.employeeEducation.create({
        data: {
            employee_id: employeeId,
            certificate_type_id: parseInt(certificateTypeId, 10),
            university_id: universityId ? parseInt(universityId, 10) : null,
            college_id: collegeId ? parseInt(collegeId, 10) : null,
            institute_id: instituteId ? parseInt(instituteId, 10) : null,
            grad_year: grad_year || null,
        }
    });

    redirect(`/admin/employees/${employeeId}`);
}

export async function addVacation(employeeId: number, formData: FormData) {
    const leave_type = formData.get('type') as string;
    const duration = formData.get('duration') as string;
    const start_date = formData.get('start_date') as string;
    const end_date = formData.get('end_date') as string;
    const decision_num = formData.get('decision_num') as string;
    const notes = formData.get('notes') as string;

    await prisma.leaveRequest.create({
        data: {
            employee_id: employeeId,
            leave_type,
            decision_num,
            start_date: start_date ? new Date(start_date) : null,
            end_date: end_date ? new Date(end_date) : null,
            duration: duration ? parseInt(duration, 10) : null,
        }
    });
    redirect(`/admin/employees/${employeeId}`);
}

export async function addMovement(employeeId: number, formData: FormData) {
    const type = formData.get('type') as string; // Ndab, Ifad, etc.
    const destination = formData.get('destination') as string;
    const decisionNum = formData.get('decision_num') as string;
    const decisionDateStr = formData.get('decision_date') as string;
    const leaveDateStr = formData.get('leave_date') as string;
    const resumptionDateStr = formData.get('resumption_date') as string;
    const notes = formData.get('notes') as string;

    await prisma.transferOrLoan.create({
        data: {
            employee_id: employeeId,
            action_type: type, // Maps to 'نوع_الإجراء'
            entity: destination,
            decision_num: decisionNum,
            decision_date: decisionDateStr ? new Date(decisionDateStr) : null,
            start_date: leaveDateStr ? new Date(leaveDateStr) : null,
            return_date: resumptionDateStr ? new Date(resumptionDateStr) : null,
            notes
        }
    });
    redirect(`/admin/employees/${employeeId}`);
}

export async function addPromotion(employeeId: number, formData: FormData) {
    const decisionNum = formData.get('decision_num') as string;
    const decisionDateStr = formData.get('decision_date') as string;
    const promotionDateStr = formData.get('promotion_date') as string;
    // const newJobTitleId = formData.get('new_job_title_id') ? Number(formData.get('new_job_title_id')) : null; // Not in schema currently
    const notes = formData.get('notes') as string;

    await prisma.promotion.create({
        data: {
            employee_id: employeeId,
            // decision_num: decisionNum, // Not in schema
            // decision_date: decisionDateStr ? new Date(decisionDateStr) : null, // Not in schema
            current_date: promotionDateStr ? new Date(promotionDateStr) : null,
            notes
        }
    });
    redirect(`/admin/employees/${employeeId}`);
}

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

export async function authenticate(prevState: string | undefined, formData: FormData) {
    try {
        await signIn('credentials', {
            ...Object.fromEntries(formData),
            redirectTo: '/admin/employees', 
        });
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'بيانات الدخول غير صحيحة.';
                default:
                    return 'حدث خطأ غير متوقع.';
            }
        }
        // Re-throw redirect errors so Next.js can handle them
        throw error;
    }
}
