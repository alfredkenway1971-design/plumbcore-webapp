'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = useAuthStore((s) => s.profile);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const router = useRouter();

  const role = profile?.role;

  // Redirect non-admin users away from admin pages
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (role !== 'super_admin' && role !== 'admin') {
      router.push('/dashboard');
    }
  }, [isLoading, isAuthenticated, role, router]);

  if (isLoading) return null;
  if (role !== 'super_admin' && role !== 'admin') return null;

  return <>{children}</>;
}
