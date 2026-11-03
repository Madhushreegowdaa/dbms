import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import Navbar from '../../components/Navbar';

export default async function AppLayout({ children }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
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
