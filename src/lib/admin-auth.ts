import type { Session } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';

import { ADMIN_EMAIL, supabase } from '@/lib/supabase';

/**
 * Session admin, derivee uniquement de Supabase Auth — comme le site. C'est le
 * meme JWT qui autorise les ecritures cote RLS : un simple drapeau local
 * donnerait une interface d'admin sans aucun droit reel.
 */
export function useAdminSession() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data }) => alive && setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => alive && setSession(s));
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw new Error(error.message);
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return {
    /** undefined tant que la session n'a pas ete lue. */
    session,
    isAdmin: session?.user?.email === ADMIN_EMAIL,
    signIn,
    signOut,
  };
}
