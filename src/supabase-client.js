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

// Promo / referral table
const PROMO_TABLE = "promo";

// localStorage key the frontend uses to persist an active promo code
const PROMO_STORAGE_KEY = "active_promo_code";

// Name of the Postgres RPC function that atomically increments total_clients
const PROMO_RPC = "increment_promo_clients";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export {
  supabase,
  SUPABASE_STORAGE_BUCKET,
  SUPABASE_TABLE,
  PROMO_TABLE,
  PROMO_STORAGE_KEY,
  PROMO_RPC,
};