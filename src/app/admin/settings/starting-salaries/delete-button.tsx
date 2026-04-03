'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { deleteStartingSalary } from './actions';
import { useRouter } from 'next/navigation';

export default function DeleteItemButton({ id }: { id: number }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm('هل أنت متأكد من حذف أجر بدء التعيين هذا؟')) return;

        setIsDeleting(true);
        const res = await deleteStartingSalary(id);

        if (res.success) {
            router.refresh();
        } else {
            alert(res.message);
        }
        setIsDeleting(false);
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 disabled:opacity-50"
            title="حذف"
        >
            <Trash2 size={18} />
        </button>
    );
}
