'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/store/auth-store';
import { UserRole } from '@/types';

export function useProtected(role?: UserRole) {
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    if (!auth.ready) return;
    if (!auth.user) router.replace('/login');
    if (role && auth.user?.role !== role) router.replace('/');
  }, [auth.ready, auth.user, role, router]);

  return auth;
}
