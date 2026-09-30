import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gdichqsqnevfarghpvix.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkaWNocXNxbmV2ZmFyZ2hwdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzMTUxMzcsImV4cCI6MjEwNTg5MTEzN30.9LdIAKrrUiZG-OVAuQdkyt7I-Q_3vH2Jd_BKZWg0YiM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

