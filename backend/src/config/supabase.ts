/**
 * Supabase Configuration
 * Note: Supabase is disconnected as per configuration.
 * OnboardOS uses high-performance standalone in-memory & SQLite mock store.
 */

export const supabase: any = {
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => Promise.resolve({ data: null, error: null }),
    delete: () => Promise.resolve({ data: null, error: null }),
    eq: () => ({ data: null, error: null }),
  }),
};

export async function testSupabaseConnection(): Promise<{ connected: boolean; message: string }> {
  return {
    connected: false,
    message: 'Supabase is disconnected. Operating in standalone local store mode.',
  };
}
