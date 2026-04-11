'use client';

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { deleteItem } from '../lib/api';

interface DeleteItemProps {
  className?: string;
  children?: ReactNode;
  id: number | string;
}

export default function DeleteItem({ children, className, id }: DeleteItemProps) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      await deleteItem(id);
      router.refresh();
    } catch (error) {
      window.alert((error as Error).message);
    }
  };

  return (
    <button className={className} onClick={handleDelete}>
      {children}
    </button>
  );
}
