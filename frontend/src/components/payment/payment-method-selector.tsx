'use client';

import clsx from 'clsx';
import { CreditCard, Landmark, WalletCards } from 'lucide-react';
import { PaymentGatewayConfig, PaymentProvider } from '@/types';

export type PaymentMethodValue = 'vnpay' | 'momo';

const methods: Array<{
  value: PaymentMethodValue;
  title: string;
  description: string;
  Icon: typeof CreditCard;
  provider: PaymentProvider;
}> = [
  {
    value: 'vnpay',
    title: 'VNPay',
    description: 'Thanh toan qua cong VNPay.',
    Icon: Landmark,
    provider: 'vnpay',
  },
  {
    value: 'momo',
    title: 'MoMo',
    description: 'Thanh toan bang vi MoMo.',
    Icon: WalletCards,
    provider: 'momo',
  },
];

type PaymentMethodSelectorProps = {
  value: PaymentMethodValue;
  disabled?: boolean;
  gatewayConfig?: PaymentGatewayConfig | null;
  onChange: (value: PaymentMethodValue) => void;
};

export function PaymentMethodSelector({ value, disabled, gatewayConfig, onChange }: PaymentMethodSelectorProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {methods.map((method) => {
        const Icon = method.Icon;
        const selected = value === method.value;
        const providerConfig = gatewayConfig?.[method.provider];
        const canUseQrFallback = method.provider === 'momo' || method.provider === 'vnpay';
        const unavailable = !canUseQrFallback && providerConfig?.enabled === false;
        const qrFallback = canUseQrFallback && providerConfig?.enabled === false;
        const isDisabled = disabled || unavailable;

        return (
          <button
            key={method.value}
            type="button"
            disabled={isDisabled}
            onClick={() => onChange(method.value)}
            title={unavailable ? providerConfig?.reason : undefined}
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
            <span className="min-w-0">
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-slate-950 dark:text-white">{method.title}</span>
                {(unavailable || qrFallback) && (
                  <span
                    className={clsx(
                      'rounded border px-2 py-0.5 text-[11px] font-bold',
                      qrFallback
                        ? 'border-teal-200 bg-teal-50 text-teal-700'
                        : 'border-amber-200 bg-amber-50 text-amber-700',
                    )}
                  >
                    {qrFallback ? 'QR' : 'Chua cau hinh'}
                  </span>
                )}
              </span>
              <span className="mt-1 block text-sm leading-5 text-slate-500">{method.description}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
