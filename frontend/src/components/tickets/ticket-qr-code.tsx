import { QrCode } from 'lucide-react';

type TicketQRCodeProps = {
  value: string;
  size?: 'sm' | 'lg';
};

export function TicketQRCode({ value, size = 'sm' }: TicketQRCodeProps) {
  const dimension = size === 'lg' ? 'h-56 w-56' : 'h-28 w-28';
  return value ? (
    <img
      className={`${dimension} rounded-lg border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-700`}
      src={value}
      alt="QR check-in"
    />
  ) : (
    <div className={`${dimension} grid place-items-center rounded-lg border border-slate-200 bg-slate-50 text-slate-400`}>
      <QrCode size={size === 'lg' ? 64 : 34} />
    </div>
  );
}
