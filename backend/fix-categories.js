const { MongoClient } = require('mongodb');

async function run() {
  const client = new MongoClient('mongodb://127.0.0.1:27017');
  try {
    await client.connect();
    const db = client.db('event_booking');
    const events = db.collection('events');
    
    // Fix existing categories
    await events.updateMany({ category: 'Am nhac' }, { $set: { category: 'Âm nhạc' } });
    await events.updateMany({ category: 'Cong nghe' }, { $set: { category: 'Công nghệ' } });
    await events.updateMany({ category: 'Kinh doanh' }, { $set: { category: 'Kinh doanh' } });
    
    // Add new events to show more categories
    const newEvents = [
      {
        title: 'Giải Marathon Mùa Xuân',
        category: 'Thể thao',
        location: 'Hà Nội',
        startDate: new Date('2026-08-01T06:00:00Z'),
        endDate: new Date('2026-08-01T12:00:00Z'),
        status: 'published',
        description: 'Giải chạy marathon thường niên dành cho mọi lứa tuổi.',
        image: 'https://images.unsplash.com/photo-1552674605-15cff24c00e8?auto=format&fit=crop&w=1200&q=80',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Triển lãm Tranh Sơn Dầu',
        category: 'Nghệ thuật',
        location: 'Đà Nẵng',
        startDate: new Date('2026-09-10T09:00:00Z'),
        endDate: new Date('2026-09-15T18:00:00Z'),
        status: 'published',
        description: 'Khám phá các tác phẩm tranh sơn dầu từ các họa sĩ nổi tiếng.',
        image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1200&q=80',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Hội thảo Trí tuệ Nhân tạo',
        category: 'Giáo dục',
        location: 'TP. Hồ Chí Minh',
        startDate: new Date('2026-10-05T08:00:00Z'),
        endDate: new Date('2026-10-05T17:00:00Z'),
        status: 'published',
        description: 'Hội thảo chuyên sâu về AI và tương lai giáo dục.',
        image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Lễ hội Ẩm thực Đường phố',
        category: 'Ẩm thực',
        location: 'Cần Thơ',
        startDate: new Date('2026-11-20T16:00:00Z'),
        endDate: new Date('2026-11-22T22:00:00Z'),
        status: 'published',
        description: 'Thưởng thức hàng trăm món ăn đường phố đặc sắc 3 miền.',
        image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Chuyến đi bộ leo núi',
        category: 'Du lịch',
        location: 'Đà Lạt',
        startDate: new Date('2026-12-01T06:00:00Z'),
        endDate: new Date('2026-12-03T18:00:00Z'),
        status: 'published',
        description: 'Trải nghiệm du lịch sinh thái và leo núi.',
        image: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=1200&q=80',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    await events.insertMany(newEvents);
    console.log('Update and insertion successful!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

run();
