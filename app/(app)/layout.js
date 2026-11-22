import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '../../lib/supabase/server';
import Navbar from '../../components/Navbar';

export default async function AppLayout({ children }) {
  const user = await getAuthenticatedUser();
  if (!user) redirect('/login');

  return (
    <div className="app-layout">
      <Navbar />
      <main className="app-shell">
        {children}
      </main>
    </div>
  );
}
