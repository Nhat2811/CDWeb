'use client';

import { motion } from 'framer-motion';
import { CalendarClock, Clock3, MapPin, ShieldCheck, Sparkles, Tags, UsersRound } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Event, Ticket } from '@/types';

const fallbackImage =
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=80';

type EventDetailSectionProps = {
  event: Event;
  tickets: Ticket[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function EventDetailSection({ event, tickets }: EventDetailSectionProps) {
  const remaining = tickets.reduce((total, ticket) => total + Math.max(ticket.quantity - ticket.sold, 0), 0);
  const tags = [event.category, event.status === 'published' ? 'Đang mở bán' : event.status, 'QR Check-in'];

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <Card className="overflow-hidden">
        <div className="relative">
          <img className="h-72 w-full object-cover md:h-[420px]" src={event.image || fallbackImage} alt={event.title} />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} tone={tag === 'Đang mở bán' ? 'teal' : 'slate'} className="bg-white/90 text-slate-900">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-5 p-5 md:p-7">
          <div>
            <h1 className="text-3xl font-extrabold tracking-normal text-slate-950 dark:text-white md:text-5xl">
              {event.title}
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
              {event.description}
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <InfoItem icon={<MapPin size={19} />} label="Địa điểm" value={event.location} />
            <InfoItem icon={<Clock3 size={19} />} label="Thời gian" value={formatDate(event.startDate)} />
            <InfoItem icon={<Tags size={19} />} label="Thể loại" value={event.category} />
            <InfoItem icon={<TicketCounter />} label="Số vé còn lại" value={`${remaining} vé`} />
          </div>
        </div>
      </Card>

      <InfoSection
        icon={<UsersRound size={20} />}
        title="Thông tin tổ chức"
        content="Ban tổ chức Event Booking phối hợp cùng đối tác địa phương để vận hành khu check-in, hỗ trợ khách tham dự và đảm bảo trải nghiệm xuyên suốt sự kiện."
      />
      <InfoSection
        icon={<ShieldCheck size={20} />}
        title="Quy định tham gia"
        content="Vui lòng xuất trình QR code khi vào cổng, đến trước giờ bắt đầu ít nhất 30 phút và tuân thủ hướng dẫn của ban tổ chức. Vé đã thanh toán không áp dụng hủy tự động trong ngày diễn ra sự kiện."
      />
      <Card className="p-5 md:p-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded bg-teal-50 text-[#14b8a6] dark:bg-teal-950">
            <CalendarClock size={20} />
          </span>
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">Lịch trình sự kiện</h2>
        </div>
        <div className="space-y-4">
          {[
            ['17:30', 'Mở cổng và check-in QR'],
            ['18:30', 'Khai mạc chương trình'],
            ['19:00', 'Nội dung chính và phần trình diễn'],
            ['21:30', 'Giao lưu, chụp ảnh và bế mạc'],
          ].map(([time, content]) => (
            <div key={time} className="flex gap-4 rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
              <strong className="min-w-16 text-[#14b8a6]">{time}</strong>
              <span className="text-slate-700 dark:text-slate-200">{content}</span>
            </div>
          ))}
        </div>
      </Card>
    </motion.section>
  );
}

function TicketCounter() {
  return <Sparkles size={19} />;
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-3 rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
      <span className="mt-0.5 text-[#14b8a6]">{icon}</span>
      <span>
        <span className="block text-xs font-semibold uppercase text-slate-500">{label}</span>
        <span className="mt-1 block font-semibold text-slate-900 dark:text-white">{value}</span>
      </span>
    </div>
  );
}

function InfoSection({ icon, title, content }: { icon: React.ReactNode; title: string; content: string }) {
  return (
    <Card className="p-5 md:p-6">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid h-10 w-10 place-items-center rounded bg-teal-50 text-[#14b8a6] dark:bg-teal-950">{icon}</span>
        <h2 className="text-xl font-bold text-slate-950 dark:text-white">{title}</h2>
      </div>
      <p className="leading-7 text-slate-600 dark:text-slate-300">{content}</p>
    </Card>
  );
}
