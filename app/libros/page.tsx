'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LibrosPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/mi-biblioteca');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#E5F2FE] flex items-center justify-center p-4">
      <div className="w-10 h-10 border-4 border-roncedo-celeste border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
