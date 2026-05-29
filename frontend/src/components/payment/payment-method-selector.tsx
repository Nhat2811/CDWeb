'use client';

import { Building2, CreditCard, WalletCards, XCircle } from 'lucide-react';
import clsx from 'clsx';
import { PaymentCheckoutMethod } from '@/types';

export type PaymentMethodValue = PaymentCheckoutMethod | 'mock_failure';

const methods: Array<{
  value: PaymentMethodValue;
  title: string;
  description: string;
  Icon: typeof CreditCard;
}> = [
  {
    value: 'card',
    title: 'Thẻ nội địa/quốc tế',
    description: 'Mock gateway xử lý ngay.',
    Icon: CreditCard,
  },
  {
    value: 'e_wallet',
    title: 'Ví điện tử',
    description: 'Giả lập thanh toán ví.',
    Icon: WalletCards,
  },
  {
    value: 'bank_transfer',
    title: 'Chuyển khoản',
    description: 'Xác nhận tức thì trong môi trường test.',
    Icon: Building2,
  },
  {
    value: 'mock_failure',
    title: 'Test thất bại',
    description: 'Giữ booking pending để thanh toán lại.',
    Icon: XCircle,
  },
];

type PaymentMethodSelectorProps = {
  value: PaymentMethodValue;
  disabled?: boolean;
  onChange: (value: PaymentMethodValue) => void;
};

export function PaymentMethodSelector({ value, disabled, onChange }: PaymentMethodSelectorProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {methods.map((method) => {
        const Icon = method.Icon;
        const selected = value === method.value;

        return (
          <button
            key={method.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(method.value)}
            className={clsx(
              'flex min-h-24 items-start gap-3 rounded-lg border bg-white p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-teal-300 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-900',
              selected
                ? 'border-[#14b8a6] shadow-[0_12px_30px_rgba(20,184,166,0.16)]'
                : 'border-slate-200 hover:border-teal-200 dark:border-slate-800',
            )}
          >
            <span
              className={clsx(
                'grid h-10 w-10 shrink-0 place-items-center rounded bg-slate-100 dark:bg-slate-800',
                selected && 'bg-teal-50 text-[#14b8a6]',
              )}
            >
              <Icon size={20} />
            </span>
            <span>
              <span className="block font-bold text-slate-950 dark:text-white">{method.title}</span>
              <span className="mt-1 block text-sm leading-5 text-slate-500">{method.description}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
