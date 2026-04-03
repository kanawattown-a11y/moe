'use client';

import { deleteItem } from '@/app/admin/settings/actions';
import { useTransition } from 'react';

export default function DeleteItemButton({ tableSlug, id }: { tableSlug: string, id: number }) {
    const [isPending, startTransition] = useTransition();

    return (
        <button
            onClick={() => {
                if (confirm('هل أنت متأكد من الحذف؟')) {
                    startTransition(async () => {
                        try {
                            await deleteItem(tableSlug, id);
                        } catch (e: any) {
                            alert(e.message);
                        }
                    });
                }
            }}
            disabled={isPending}
            className="text-red-500 hover:text-red-700 font-bold px-3 py-1 bg-red-50 hover:bg-red-100 rounded transition text-xs disabled:opacity-50"
        >
            {isPending ? '...' : 'حذف'}
        </button>
    );
}
