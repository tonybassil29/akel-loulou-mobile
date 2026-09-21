import type { Session } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';

import { ADMIN_EMAIL, supabase } from '@/lib/supabase';

/** Le site, qui recoit le lien de reinitialisation et affiche le formulaire. */
const SITE_URL = 'https://laurecipe.akeloulou.workers.dev';

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

  /** Un seul compte admin, connu de la base : on ne demande que le mot de passe. */
  const signIn = useCallback(async (password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email: ADMIN_EMAIL, password });
    if (error) throw new Error(error.message === 'Invalid login credentials' ? 'Mot de passe incorrect.' : error.message);
  }, []);

  /**
   * Mot de passe oublie : Supabase envoie un lien a l'adresse admin. Le lien
   * ouvre le site, qui affiche le formulaire de nouveau mot de passe ; on
   * revient ensuite se connecter ici. Aucun mot de passe ne transite par nous.
   */
  const resetPassword = useCallback(async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(ADMIN_EMAIL, { redirectTo: `${SITE_URL}/seodvfaxaidp` });
    if (error) throw new Error(error.message);
  }, []);

  /** Nouveau mot de passe, session ouverte. Supabase ne garde qu'un hash bcrypt sale. */
  const changePassword = useCallback(async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
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
    resetPassword,
    changePassword,
  };
}
