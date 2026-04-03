'use client';

import { deleteUser } from '@/app/admin/actions';
import { useTransition } from 'react';

export default function DeleteUserButton({ userId, disabled }: { userId: number, disabled: boolean }) {
    const [isPending, startTransition] = useTransition();

    return (
        <button
            onClick={() => {
                if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
                    startTransition(async () => {
                        await deleteUser(userId);
                    });
                }
            }}
            disabled={disabled || isPending}
            className="text-red-500 hover:text-red-700 font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isPending ? 'جاري الحذف...' : 'حذف'}
        </button>
    );
}
