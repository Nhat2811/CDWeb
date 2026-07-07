'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/store/auth-store';
import { UserRole } from '@/types';

export function useProtected(roles?: UserRole | UserRole[]) {
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    if (!auth.ready) return;
    if (!auth.user) {
      router.replace('/login');
      return;
    }
    if (roles) {
      const rolesArray = Array.isArray(roles) ? roles : [roles];
      // Workaround for stringified roles in dependency array
      if (!rolesArray.includes(auth.user.role)) {
        router.replace('/');
      }
    }
  }, [auth.ready, auth.user, JSON.stringify(roles), router]);

  return auth;
}
