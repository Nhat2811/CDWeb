'use client';

import { Suspense } from 'react';
import { CheckCircle2, XCircle, TicketCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function PaymentResultPage() {
  return (
    <Suspense fallback={<PaymentResultSkeleton />}>
      <PaymentResultContent />
    </Suspense>
  );
}

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const provider = searchParams.get('provider') ?? 'payment';
  const status = searchParams.get('status') ?? 'success';
  const success = status === 'success';

  return (
    <div className="grid min-h-[calc(100vh-140px)] place-items-center">
      <Card className="w-full max-w-lg p-6 text-center">
        <div className={`mx-auto grid h-16 w-16 place-items-center rounded-full ${success ? 'bg-teal-50 text-[#14b8a6]' : 'bg-rose-50 text-rose-600'}`}>
          {success ? <CheckCircle2 size={34} /> : <XCircle size={34} />}
        </div>
        <h1 className="mt-5 text-2xl font-extrabold text-slate-950">
          {success ? 'Thanh toán thành công' : 'Thanh toán chưa hoàn tất'}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Cổng {provider.toUpperCase()} đã trả kết quả về hệ thống. Vé của bạn sẽ hiển thị trạng thái mới trong trang Vé của tôi.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button className="flex-1" onClick={() => window.location.assign('/my-tickets')}>
            <TicketCheck size={18} />
            Đến Vé của tôi
          </Button>
          <Link href="/" className="flex-1">
            <Button type="button" variant="outline" className="w-full">
              <ArrowLeft size={18} />
              Về trang sự kiện
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

function PaymentResultSkeleton() {
  return (
    <div className="grid min-h-[calc(100vh-140px)] place-items-center">
      <div className="h-64 w-full max-w-lg animate-pulse rounded-lg bg-white shadow-soft" />
    </div>
  );
}
