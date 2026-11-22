export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const missing = [];

  if (!url?.trim()) missing.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!publishableKey?.trim()) missing.push('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');

  if (missing.length > 0) {
    throw new Error(
      `Missing required Supabase environment variable(s): ${missing.join(', ')}. ` +
      'Set them in the project-root .env.local file for local development or in your deployment environment.'
    );
  }

  return { url, publishableKey };
}
