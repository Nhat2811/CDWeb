const dns = require('dns');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const QRCode = require('qrcode');

dns.setServers(['8.8.8.8', '1.1.1.1']);

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
    status: { type: String, enum: ['pending', 'paid', 'cancelled', 'used'], default: 'paid' },
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
  ['Vietnam Music Night 2026', 'Đêm nhạc live với nhiều nghệ sĩ trẻ, sân khấu ánh sáng hiện đại và khu check-in ngoài trời.', 'Am nhac', 'TP. Hồ Chí Minh'],
  ['EDM Beach Festival', 'Lễ hội EDM ngoài trời ven biển với DJ quốc tế, hiệu ứng visual và food zone.', 'Am nhac', 'Nha Trang'],
  ['Acoustic Rooftop Session', 'Đêm acoustic thân mật trên sân thượng với indie band và không gian chill cuối tuần.', 'Am nhac', 'Đà Lạt'],
  ['K-Pop Dance Concert', 'Đêm nhạc và dance cover K-Pop với fan meeting, photobooth và lightstick zone.', 'Am nhac', 'Hà Nội'],

  ['Tech Summit Saigon', 'Hội nghị công nghệ về AI, cloud, bảo mật và sản phẩm số dành cho developer và startup.', 'Cong nghe', 'TP. Hồ Chí Minh'],
  ['AI Product Day', 'Sự kiện giới thiệu sản phẩm AI, prompt engineering, automation và ứng dụng AI trong doanh nghiệp.', 'Cong nghe', 'Hà Nội'],
  ['Cloud Native Meetup', 'Workshop về Kubernetes, observability, CI/CD và kiến trúc microservices.', 'Cong nghe', 'Đà Nẵng'],
  ['Cyber Security Lab', 'Buổi thực hành bảo mật ứng dụng web, pentest cơ bản và xử lý sự cố.', 'Cong nghe', 'TP. Hồ Chí Minh'],

  ['Business Growth Forum', 'Diễn đàn tăng trưởng kinh doanh, vận hành, marketing và gọi vốn cho doanh nghiệp vừa và nhỏ.', 'Kinh doanh', 'Hà Nội'],
  ['Startup Pitch Day', 'Ngày gọi vốn cho startup giai đoạn seed, có mentor, nhà đầu tư và gian trưng bày sản phẩm.', 'Kinh doanh', 'TP. Hồ Chí Minh'],
  ['E-commerce Masterclass', 'Chương trình chia sẻ chiến lược bán hàng đa kênh, vận hành kho và tối ưu chuyển đổi.', 'Kinh doanh', 'Cần Thơ'],
  ['Sales Leadership Forum', 'Hội thảo quản trị đội ngũ sales, CRM, pipeline và dự báo doanh thu.', 'Kinh doanh', 'Đà Nẵng'],

  ['Coffee Workshop Pro', 'Workshop rang xay, cupping, latte art và vận hành quán cà phê.', 'Workshop', 'Đà Lạt'],
  ['Photography Walk', 'Workshop chụp ảnh đường phố, bố cục ảnh và hậu kỳ Lightroom cho người mới.', 'Workshop', 'Hội An'],
  ['UX Writing Bootcamp', 'Lớp thực hành viết microcopy, thông báo lỗi và content cho sản phẩm số.', 'Workshop', 'TP. Hồ Chí Minh'],
  ['Handmade Candle Class', 'Buổi làm nến thơm thủ công, phối mùi và đóng gói sản phẩm.', 'Workshop', 'Hà Nội'],

  ['Food & Culture Weekend', 'Không gian ẩm thực, workshop văn hóa và biểu diễn acoustic cuối tuần.', 'Am thuc', 'Đà Nẵng'],
  ['Saigon Street Food Tour', 'Ngày hội ẩm thực đường phố với các gian hàng địa phương và minigame trải nghiệm.', 'Am thuc', 'TP. Hồ Chí Minh'],
  ['Vietnamese Cuisine Fair', 'Lễ hội món Việt ba miền, khu bếp mở và lớp nấu ăn gia đình.', 'Am thuc', 'Huế'],
  ['Craft Beer Weekend', 'Sự kiện thử bia thủ công, food pairing và giao lưu với brewer.', 'Am thuc', 'Hà Nội'],

  ['Marathon City Run', 'Giải chạy thành phố với cự ly 5K, 10K, 21K và khu phục hồi sau đường chạy.', 'The thao', 'Đà Nẵng'],
  ['Yoga Sunrise Camp', 'Buổi yoga bình minh, sound healing và khu healthy brunch.', 'The thao', 'Nha Trang'],
  ['Basketball 3x3 Cup', 'Giải bóng rổ 3x3 cho cộng đồng trẻ, có khu fan zone và trao giải.', 'The thao', 'TP. Hồ Chí Minh'],
  ['Cycling Weekend Challenge', 'Thử thách đạp xe cuối tuần, trạm tiếp nước và khu check-in finisher.', 'The thao', 'Đà Lạt'],

  ['Art Expo Contemporary', 'Triển lãm nghệ thuật đương đại với tranh, sắp đặt và trình diễn đa phương tiện.', 'Nghe thuat', 'Huế'],
  ['Indie Film Screening', 'Chương trình chiếu phim độc lập kèm phần giao lưu với đạo diễn và ekip sản xuất.', 'Nghe thuat', 'Hà Nội'],
  ['Design Conference', 'Sự kiện dành cho UI/UX, branding, motion design và design system.', 'Nghe thuat', 'TP. Hồ Chí Minh'],
  ['Theatre Night', 'Đêm kịch sân khấu nhỏ với phần giao lưu đạo diễn và diễn viên.', 'Nghe thuat', 'Đà Nẵng'],

  ['Book Fair Spring', 'Hội sách mùa xuân, ký tặng tác giả, tọa đàm xuất bản và khu sách thiếu nhi.', 'Giao duc', 'Cần Thơ'],
  ['English Speaking Day', 'Ngày hội luyện nói tiếng Anh với mentor, mini debate và networking.', 'Giao duc', 'TP. Hồ Chí Minh'],
  ['Career Orientation Expo', 'Ngày hội định hướng nghề nghiệp, CV clinic và phỏng vấn thử.', 'Giao duc', 'Hà Nội'],
  ['Personal Finance Class', 'Lớp quản lý tài chính cá nhân, tiết kiệm, đầu tư cơ bản và ngân sách gia đình.', 'Giao duc', 'Đà Nẵng'],
];

const extraEventsByCategory = {
  'Am nhac': [
    'Pop Live Session',
    'Rock Arena Night',
    'Jazz Sunset Show',
    'Hip Hop Street Jam',
    'Bolero Memories',
    'Piano Chamber Evening',
    'DJ Club Circuit',
    'Folk Song Heritage',
    'Indie Band Showcase',
    'Choir Harmony Concert',
  ],
  'Cong nghe': [
    'Frontend Engineering Day',
    'Backend Architecture Forum',
    'Mobile App Summit',
    'Data Analytics Bootcamp',
    'DevOps Automation Day',
    'Blockchain Builder Meet',
    'IoT Smart City Lab',
    'Product Management Tech',
    'No-code Startup Workshop',
    'Game Development Meetup',
  ],
  'Kinh doanh': [
    'SME Strategy Day',
    'Marketing Performance Forum',
    'Founder Networking Night',
    'Retail Innovation Expo',
    'Finance For Founders',
    'Brand Growth Clinic',
    'HR Leadership Summit',
    'Customer Success Forum',
    'Export Business Connect',
    'Investment Readiness Day',
  ],
  Workshop: [
    'Watercolor Weekend',
    'Content Creator Lab',
    'Public Speaking Class',
    'Leather Craft Studio',
    'Flower Arrangement Day',
    'Podcast Production Lab',
    'Resume Clinic Workshop',
    'Mind Mapping Practice',
    'Ceramic Handbuilding Class',
    'Home Barista Starter',
  ],
  'Am thuc': [
    'BBQ Garden Party',
    'Seafood Tasting Night',
    'Chocolate Dessert Fair',
    'Healthy Meal Prep Day',
    'Regional Noodle Festival',
    'Tea Tasting Ceremony',
    'Vegan Food Market',
    'Bakery Open Kitchen',
    'Street Snack Carnival',
    'Chef Table Experience',
  ],
  'The thao': [
    'Football Fan Cup',
    'Badminton Community Open',
    'Swimming Sprint Day',
    'Trail Running Challenge',
    'Fitness Bootcamp',
    'Climbing Beginner Day',
    'Table Tennis League',
    'Pickleball Social Cup',
    'Martial Arts Showcase',
    'SUP Weekend Race',
  ],
  'Nghe thuat': [
    'Gallery Night Walk',
    'Modern Dance Stage',
    'Short Film Weekend',
    'Illustration Market',
    'Calligraphy Practice Day',
    'Photography Exhibition',
    'Creative Poster Fair',
    'Sculpture Open Studio',
    'Traditional Music Theatre',
    'Digital Art Showcase',
  ],
  'Giao duc': [
    'STEM Kids Day',
    'University Open Talk',
    'Scholarship Info Session',
    'Language Exchange Meet',
    'Study Abroad Fair',
    'Coding For Beginners',
    'Math Challenge Camp',
    'Research Skills Workshop',
    'Career Mentor Coffee',
    'Reading Habit Day',
  ],
};

const categoryLocations = {
  'Am nhac': ['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Nha Trang', 'Đà Lạt'],
  'Cong nghe': ['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ'],
  'Kinh doanh': ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Cần Thơ'],
  Workshop: ['Đà Lạt', 'Hội An', 'TP. Hồ Chí Minh', 'Hà Nội'],
  'Am thuc': ['Đà Nẵng', 'Huế', 'TP. Hồ Chí Minh', 'Hà Nội', 'Cần Thơ'],
  'The thao': ['Đà Nẵng', 'Nha Trang', 'Đà Lạt', 'TP. Hồ Chí Minh'],
  'Nghe thuat': ['Huế', 'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng'],
  'Giao duc': ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Cần Thơ'],
};

const categoryNameMap = {
  'Am nhac': 'âm nhạc',
  'Cong nghe': 'công nghệ',
  'Kinh doanh': 'kinh doanh',
  'The thao': 'thể thao',
  'Nghe thuat': 'nghệ thuật',
  'Giao duc': 'giáo dục',
  'Am thuc': 'ẩm thực',
  'Workshop': 'workshop',
};

for (const [category, titles] of Object.entries(extraEventsByCategory)) {
  const locations = categoryLocations[category] || ['TP. Hồ Chí Minh'];
  titles.forEach((title, index) => {
    events.push([
      `${title} 2026`,
      `Sự kiện ${categoryNameMap[category] || category.toLowerCase()} mở rộng số ${index + 1}, có khu trải nghiệm, networking và check-in QR cho khách tham dự.`,
      category,
      locations[index % locations.length],
    ]);
  });
}

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

  const admin = await ensureUser('System Admin', 'admin@example.com', 'admin');
  await ensureUser('Customer User', 'customer@example.com', 'customer');

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
      { name: 'Early Bird', price: 199000, quantity: 100 },
      { name: 'Standard', price: 349000, quantity: 100 },
      { name: 'VIP', price: 799000, quantity: 100 },
      { name: 'VVIP', price: 1499000, quantity: 100 },
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
        const customer = await User.findOne({ email: 'customer@example.com' });
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
  console.log('Initial users: admin@example.com / 123456, customer@example.com / 123456');
  console.log(`Admin id: ${admin._id}`);
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
