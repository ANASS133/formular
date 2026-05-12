import { createClient } from "@supabase/supabase-js";

// ── Supabase Configuration ──
// Replace these with your Supabase project values:
//   URL:       https://app.supabase.com → your project → Settings → API → Project URL
//   Anon Key:  https://app.supabase.com → your project → Settings → API → anon/public key
const SUPABASE_URL = "https://vaaoosziexlywonrfbvf.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_6A9kpLoCUCYWBF8F0x6CfQ_p6np_N97";

// Storage bucket name (create this in your Supabase dashboard: Storage → New Bucket)
const SUPABASE_STORAGE_BUCKET = "applications";

// Table name in your Supabase database
const SUPABASE_TABLE = "applications";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export { supabase, SUPABASE_STORAGE_BUCKET, SUPABASE_TABLE };
