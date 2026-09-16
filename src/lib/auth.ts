import type { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

import { ADMIN_EMAIL, supabase } from './supabase';

/**
 * Session admin. L'etat derive uniquement du JWT Supabase : c'est ce meme jeton
 * qui autorise les ecritures cote RLS, donc afficher une interface d'admin sans
 * lui donnerait des boutons qui echouent tous en 401.
 */
export function useAdminSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setIsLoading(false);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  return {
    session,
    /** true tant que le jeton persistant n'a pas ete relu — evite un flash de login. */
    isLoading,
    isAdmin: session?.user?.email === ADMIN_EMAIL,
    signIn: (email: string, password: string) =>
      supabase.auth.signInWithPassword({ email: email.trim(), password }),
    signOut: () => supabase.auth.signOut(),
  };
}
