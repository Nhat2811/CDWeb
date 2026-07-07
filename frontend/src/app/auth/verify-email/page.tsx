import { Suspense } from 'react';
import { VerifyEmailForm } from './verify-email-form';

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Đang tải...</div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}
