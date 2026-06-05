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
  ['Vietnam Music Night 2026', 'Dem nhac live voi nhieu nghe si tre, san khau anh sang hien dai va khu check-in ngoai troi.', 'Am nhac', 'TP. Ho Chi Minh'],
  ['EDM Beach Festival', 'Le hoi EDM ngoai troi ven bien voi DJ quoc te, hieu ung visual va food zone.', 'Am nhac', 'Nha Trang'],
  ['Acoustic Rooftop Session', 'Dem acoustic than mat tren san thuong voi indie band va khong gian chill cuoi tuan.', 'Am nhac', 'Da Lat'],
  ['K-Pop Dance Concert', 'Dem nhac va dance cover K-Pop voi fan meeting, photobooth va lightstick zone.', 'Am nhac', 'Ha Noi'],

  ['Tech Summit Saigon', 'Hoi nghi cong nghe ve AI, cloud, bao mat va san pham so danh cho developer va startup.', 'Cong nghe', 'TP. Ho Chi Minh'],
  ['AI Product Day', 'Su kien demo san pham AI, prompt engineering, automation va ung dung AI trong doanh nghiep.', 'Cong nghe', 'Ha Noi'],
  ['Cloud Native Meetup', 'Workshop ve Kubernetes, observability, CI/CD va kien truc microservices.', 'Cong nghe', 'Da Nang'],
  ['Cyber Security Lab', 'Buoi thuc hanh bao mat ung dung web, pentest co ban va xu ly su co.', 'Cong nghe', 'TP. Ho Chi Minh'],

  ['Business Growth Forum', 'Dien dan tang truong kinh doanh, van hanh, marketing va goi von cho doanh nghiep vua va nho.', 'Kinh doanh', 'Ha Noi'],
  ['Startup Pitch Day', 'Ngay goi von cho startup giai doan seed, co mentor, nha dau tu va demo booth.', 'Kinh doanh', 'TP. Ho Chi Minh'],
  ['E-commerce Masterclass', 'Chuong trinh chia se chien luoc ban hang da kenh, van hanh kho va toi uu chuyen doi.', 'Kinh doanh', 'Can Tho'],
  ['Sales Leadership Forum', 'Hoi thao quan tri doi ngu sales, CRM, pipeline va du bao doanh thu.', 'Kinh doanh', 'Da Nang'],

  ['Coffee Workshop Pro', 'Workshop rang xay, cupping, latte art va van hanh quan ca phe.', 'Workshop', 'Da Lat'],
  ['Photography Walk', 'Workshop chup anh duong pho, bo cuc anh va hau ky Lightroom cho nguoi moi.', 'Workshop', 'Hoi An'],
  ['UX Writing Bootcamp', 'Lop thuc hanh viet microcopy, thong bao loi va content cho san pham so.', 'Workshop', 'TP. Ho Chi Minh'],
  ['Handmade Candle Class', 'Buoi lam nen thom thu cong, phoi mui va dong goi san pham.', 'Workshop', 'Ha Noi'],

  ['Food & Culture Weekend', 'Khong gian am thuc, workshop van hoa va bieu dien acoustic cuoi tuan.', 'Am thuc', 'Da Nang'],
  ['Saigon Street Food Tour', 'Ngay hoi am thuc duong pho voi cac gian hang dia phuong va minigame trai nghiem.', 'Am thuc', 'TP. Ho Chi Minh'],
  ['Vietnamese Cuisine Fair', 'Le hoi mon Viet ba mien, khu bep mo va lop nau an gia dinh.', 'Am thuc', 'Hue'],
  ['Craft Beer Weekend', 'Su kien thu bia thu cong, food pairing va giao luu voi brewer.', 'Am thuc', 'Ha Noi'],

  ['Marathon City Run', 'Giai chay thanh pho voi cu ly 5K, 10K, 21K va khu phuc hoi sau duong chay.', 'The thao', 'Da Nang'],
  ['Yoga Sunrise Camp', 'Buoi yoga binh minh, sound healing va khu healthy brunch.', 'The thao', 'Nha Trang'],
  ['Basketball 3x3 Cup', 'Giai bong ro 3x3 cho cong dong tre, co khu fan zone va trao giai.', 'The thao', 'TP. Ho Chi Minh'],
  ['Cycling Weekend Challenge', 'Thu thach dap xe cuoi tuan, tram tiep nuoc va khu check-in finisher.', 'The thao', 'Da Lat'],

  ['Art Expo Contemporary', 'Trien lam nghe thuat duong dai voi tranh, sap dat va trinh dien da phuong tien.', 'Nghe thuat', 'Hue'],
  ['Indie Film Screening', 'Chuong trinh chieu phim doc lap kem phan giao luu voi dao dien va ekip san xuat.', 'Nghe thuat', 'Ha Noi'],
  ['Design Conference', 'Su kien danh cho UI/UX, branding, motion design va design system.', 'Nghe thuat', 'TP. Ho Chi Minh'],
  ['Theatre Night', 'Dem kich san khau nho voi phan giao luu dao dien va dien vien.', 'Nghe thuat', 'Da Nang'],

  ['Book Fair Spring', 'Hoi sach mua xuan, ky tang tac gia, toa dam xuat ban va khu sach thieu nhi.', 'Giao duc', 'Can Tho'],
  ['English Speaking Day', 'Ngay hoi luyen noi tieng Anh voi mentor, mini debate va networking.', 'Giao duc', 'TP. Ho Chi Minh'],
  ['Career Orientation Expo', 'Ngay hoi dinh huong nghe nghiep, CV clinic va phong van thu.', 'Giao duc', 'Ha Noi'],
  ['Personal Finance Class', 'Lop quan ly tai chinh ca nhan, tiet kiem, dau tu co ban va ngan sach gia dinh.', 'Giao duc', 'Da Nang'],
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
  'Am nhac': ['TP. Ho Chi Minh', 'Ha Noi', 'Da Nang', 'Nha Trang', 'Da Lat'],
  'Cong nghe': ['TP. Ho Chi Minh', 'Ha Noi', 'Da Nang', 'Can Tho'],
  'Kinh doanh': ['Ha Noi', 'TP. Ho Chi Minh', 'Da Nang', 'Can Tho'],
  Workshop: ['Da Lat', 'Hoi An', 'TP. Ho Chi Minh', 'Ha Noi'],
  'Am thuc': ['Da Nang', 'Hue', 'TP. Ho Chi Minh', 'Ha Noi', 'Can Tho'],
  'The thao': ['Da Nang', 'Nha Trang', 'Da Lat', 'TP. Ho Chi Minh'],
  'Nghe thuat': ['Hue', 'Ha Noi', 'TP. Ho Chi Minh', 'Da Nang'],
  'Giao duc': ['Ha Noi', 'TP. Ho Chi Minh', 'Da Nang', 'Can Tho'],
};

for (const [category, titles] of Object.entries(extraEventsByCategory)) {
  const locations = categoryLocations[category] || ['TP. Ho Chi Minh'];
  titles.forEach((title, index) => {
    events.push([
      `${title} 2026`,
      `Su kien ${category.toLowerCase()} mo rong so ${index + 1}, co khu trai nghiem, networking va check-in QR cho khach tham du.`,
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

  const admin = await ensureUser('Admin Demo', 'admin@example.com', 'admin');
  await ensureUser('Customer Demo', 'customer@example.com', 'customer');

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
  console.log('Demo users: admin@example.com / 123456, customer@example.com / 123456');
  console.log(`Admin id: ${admin._id}`);
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
