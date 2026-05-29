import { PaymentPage } from '@/components/payment/payment-page';

export default async function BookingPaymentRoute({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;

  return <PaymentPage bookingId={bookingId} />;
}
