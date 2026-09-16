import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

/**
 * Meme projet Supabase que le site web : l'app mobile lit et ecrit les memes
 * recettes. La cle publiable est publique par design — ce sont les policies RLS
 * qui autorisent (lecture pour tous, ecriture pour le compte admin connecte).
 */
const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://dkxtmhlrewmueuwcxeki.supabase.co';

const SUPABASE_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  'sb_publishable_cUge5RXqHdISbnrtxGubew_gLAwwwVg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // Pas de session dans l'URL sur mobile : il n'y a pas de redirect OAuth ici.
    detectSessionInUrl: false,
  },
});

/** Compte autorise a ecrire — doit rester aligne avec public.is_admin() cote base. */
export const ADMIN_EMAIL = 'tonybassil294@gmail.com';
