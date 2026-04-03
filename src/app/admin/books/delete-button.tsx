'use client'

import { useState } from 'react';
import { deleteBook } from './actions';
import { useRouter } from 'next/navigation';

export default function DeleteBookButton({ id }: { id: number }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm('هل أنت متأكد من حذف هذا الكتاب؟ لا يمكن التراجع عن هذا الإجراء.')) return;

        setIsDeleting(true);
        try {
            const result = await deleteBook(id);
            if (result.success) {
                // Next.js cache revalidation happens on the server, we just need to refresh our view if needed
                router.refresh();
            } else {
                alert(result.error);
            }
        } catch (error) {
            console.error(error);
            alert('حدث خطأ غير متوقع');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`font-bold text-sm px-3 py-1.5 rounded-lg transition-colors ${isDeleting
                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                    : 'text-red-500 hover:text-red-700 hover:bg-red-50'
                }`}
        >
            {isDeleting ? 'جاري الحذف...' : 'حذف'}
        </button>
    );
}
