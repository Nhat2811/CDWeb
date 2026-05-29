const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const QRCode = require('qrcode');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/event_booking';

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, enum: ['admin', 'customer'], default: 'customer' },
  },
  { timestamps: true },
);

const eventSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    image: String,
    location: String,
    startDate: Date,
    endDate: Date,
    category: String,
    status: { type: String, enum: ['draft', 'published', 'cancelled'], default: 'published' },
  },
  { timestamps: true },
);

const ticketSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', index: true },
    name: { type: String, enum: ['VIP', 'VVIP', 'Standard', 'Early Bird'] },
    price: Number,
    quantity: Number,
    sold: { type: Number, default: 0 },
  },
  { timestamps: true },
);
ticketSchema.index({ event: 1, name: 1 }, { unique: true });

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' },
    quantity: Number,
    totalPrice: Number,
    status: { type: String, enum: ['pending', 'paid', 'cancelled'], default: 'paid' },
    qrCode: String,
  },
  { timestamps: true },
);

const User = mongoose.model('User', userSchema);
const Event = mongoose.model('Event', eventSchema);
const Ticket = mongoose.model('Ticket', ticketSchema);
const Booking = mongoose.model('Booking', bookingSchema);

const images = [
  'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1522158637959-30385a09e0da?auto=format&fit=crop&w=1200&q=80',
];

const events = [
  ['Vietnam Music Night 2026', 'Đêm nhạc live với nhiều nghệ sĩ trẻ, sân khấu ánh sáng hiện đại và khu check-in ngoài trời.', 'Nhạc hội', 'TP. Hồ Chí Minh'],
  ['Tech Summit Saigon', 'Hội nghị công nghệ về AI, cloud, bảo mật và sản phẩm số dành cho developer và startup.', 'Công nghệ', 'TP. Hồ Chí Minh'],
  ['Food & Culture Weekend', 'Không gian ẩm thực, workshop văn hóa và biểu diễn acoustic cuối tuần.', 'Ẩm thực', 'Đà Nẵng'],
  ['Business Growth Forum', 'Diễn đàn tăng trưởng kinh doanh, vận hành, marketing và gọi vốn cho doanh nghiệp vừa và nhỏ.', 'Kinh doanh', 'Hà Nội'],
  ['Indie Film Screening', 'Chuỗi chiếu phim độc lập kèm phần giao lưu với đạo diễn và ekip sản xuất.', 'Điện ảnh', 'Hà Nội'],
  ['Art Expo Contemporary', 'Triển lãm nghệ thuật đương đại với tranh, sắp đặt và trình diễn đa phương tiện.', 'Nghệ thuật', 'Huế'],
  ['Marathon City Run', 'Giải chạy thành phố với cự ly 5K, 10K, 21K và khu phục hồi sau đường chạy.', 'Thể thao', 'Đà Nẵng'],
  ['Startup Pitch Day', 'Ngày gọi vốn cho startup giai đoạn seed, có mentor, nhà đầu tư và demo booth.', 'Startup', 'TP. Hồ Chí Minh'],
  ['EDM Beach Festival', 'Lễ hội EDM ngoài trời ven biển với DJ quốc tế, hiệu ứng visual và food zone.', 'Nhạc hội', 'Nha Trang'],
  ['Book Fair Spring', 'Hội sách mùa xuân, ký tặng tác giả, tọa đàm xuất bản và khu sách thiếu nhi.', 'Sách', 'Cần Thơ'],
  ['Design Conference', 'Sự kiện dành cho UI/UX, branding, motion design và design system.', 'Thiết kế', 'TP. Hồ Chí Minh'],
  ['Coffee Workshop Pro', 'Workshop rang xay, cupping, latte art và vận hành quán cà phê.', 'Workshop', 'Đà Lạt'],
];

async function ensureUser(name, email, role) {
  const password = await bcrypt.hash('123456', 10);
  return User.findOneAndUpdate(
    { email },
    { $setOnInsert: { name, email, password, role } },
    { upsert: true, new: true },
  );
}

async function seed() {
  await mongoose.connect(uri);
  console.log(`Connected to ${uri}`);

  const admin = await ensureUser('Admin Demo', 'admin@example.com', 'admin');
  const customer = await ensureUser('Customer Demo', 'customer@example.com', 'customer');

  let eventCount = 0;
  let ticketCount = 0;
  let bookingCount = 0;

  for (let index = 0; index < events.length; index += 1) {
    const [title, description, category, location] = events[index];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + index + 2);
    startDate.setHours(18 + (index % 4), 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + 3);

    const event = await Event.findOneAndUpdate(
      { title },
      {
        title,
        description,
        category,
        location,
        startDate,
        endDate,
        image: images[index % images.length],
        status: 'published',
      },
      { upsert: true, new: true },
    );
    eventCount += 1;

    const ticketPresets = [
      { name: 'Early Bird', price: 150000 + index * 10000, quantity: 100 },
      { name: 'Standard', price: 280000 + index * 15000, quantity: 100 },
      { name: 'VIP', price: 650000 + index * 25000, quantity: 100 },
      { name: 'VVIP', price: 1200000 + index * 35000, quantity: 100 },
    ];

    for (const preset of ticketPresets) {
      const sold = Math.min(Math.floor(preset.quantity * (0.12 + (index % 4) * 0.05)), preset.quantity);
      const ticket = await Ticket.findOneAndUpdate(
        { event: event._id, name: preset.name },
        { ...preset, event: event._id, sold },
        { upsert: true, new: true },
      );
      ticketCount += 1;

      if (index < 8 && preset.name !== 'VIP') {
        const existing = await Booking.findOne({ user: customer._id, event: event._id, ticket: ticket._id });
        if (!existing) {
          const quantity = preset.name === 'Early Bird' ? 2 : 1;
          const qrCode = await QRCode.toDataURL(
            JSON.stringify({ user: customer._id, event: event._id, ticket: ticket._id, quantity }),
          );
          await Booking.create({
            user: customer._id,
            event: event._id,
            ticket: ticket._id,
            quantity,
            totalPrice: preset.price * quantity,
            status: index % 5 === 0 ? 'pending' : 'paid',
            qrCode,
          });
          bookingCount += 1;
        }
      }
    }
  }

  console.log(`Seeded ${eventCount} events, ${ticketCount} tickets, ${bookingCount} new bookings.`);
  console.log('Demo users: admin@example.com / 123456, customer@example.com / 123456');
  console.log(`Admin id: ${admin._id}`);
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
