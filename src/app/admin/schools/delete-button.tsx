'use client';

import { deleteSchool } from '@/app/admin/schools/actions';
import { useTransition } from 'react';

export default function DeleteSchoolButton({ schoolId }: { schoolId: number }) {
    const [isPending, startTransition] = useTransition();

    return (
        <button
            onClick={() => {
                if (confirm('هل أنت متأكد من حذف هذه المدرسة؟ سيتم فك ارتباط الموظفين بها إن وجدوا.')) {
                    startTransition(async () => {
                        await deleteSchool(schoolId);
                    });
                }
            }}
            disabled={isPending}
            className="text-red-500 hover:text-red-700 font-medium hover:underline text-sm disabled:opacity-50"
        >
            {isPending ? 'جاري الحذف...' : 'حذف'}
        </button>
    );
}
