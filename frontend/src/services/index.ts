import type { OnboardOSClient } from './types';
import { mockClient } from './mock/mockClient';
import { apiClient } from './api/apiClient';
import { supabaseClient } from './supabase/supabaseClient';

const dataMode = import.meta.env.VITE_DATA_MODE || 'mock';

export const client: OnboardOSClient =
  dataMode === 'supabase'
    ? supabaseClient
    : dataMode === 'api'
    ? apiClient
    : mockClient;

export * from './types';
export { mockClient } from './mock/mockClient';
export { apiClient } from './api/apiClient';
export { supabaseClient } from './supabase/supabaseClient';
