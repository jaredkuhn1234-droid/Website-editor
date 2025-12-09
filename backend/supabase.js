import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.46.0/+esm';

const SUPABASE_URL = 'https://vpvpdlsfjmydhvyafmjo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwdnBkbHNmam15ZGh2eWFmbWpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNzk5NDIsImV4cCI6MjA4MDY1NTk0Mn0.bTSQ1cyYIN2FTKQRyjskhheXbHJxknV9IDVZoqB_fJ0';

if (!SUPABASE_URL) console.warn('Supabase URL not configured.');
if (!SUPABASE_ANON_KEY) console.warn('Supabase anon key not configured.');

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
