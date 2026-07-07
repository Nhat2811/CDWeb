import { getEvents } from '@/services/events.service';
import ClientEventList from './ClientEventList';

export const dynamic = 'force-dynamic';

export default async function Page() {
  try {
    const data = await getEvents({ status: 'published', page: '1', limit: '100' });
    return <ClientEventList initialEvents={data.items} initialMeta={data.meta} />;
  } catch (err) {
    // Fallback if backend is down during SSR
    return <ClientEventList initialEvents={[]} initialMeta={null} />;
  }
}
