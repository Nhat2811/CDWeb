import { Badge } from '@/components/ui/badge';
import { BookingStatus } from '@/types';

const statusMap: Record<BookingStatus, { label: string; tone: 'teal' | 'amber' | 'rose' | 'slate' }> = {
  paid: { label: 'Đã thanh toán', tone: 'teal' },
  pending: { label: 'Chờ thanh toán', tone: 'amber' },
  cancelled: { label: 'Đã hủy', tone: 'rose' },
  used: { label: 'Đã sử dụng', tone: 'slate' },
};

export function TicketStatusBadge({ status }: { status: BookingStatus }) {
  const config = statusMap[status] ?? statusMap.pending;
  return <Badge tone={config.tone}>{config.label}</Badge>;
}
