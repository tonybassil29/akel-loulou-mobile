import { AdminDashboardScreen } from '@/screens/admin-dashboard';
import { AdminLoginScreen } from '@/screens/admin-login';
import { LoadingState } from '@/components/screen-state';
import { useAdminSession } from '@/lib/auth';

export default function Route() {
  const { isAdmin, isLoading } = useAdminSession();

  // Tant que la session persistee n'est pas relue, afficher le login ferait
  // clignoter le formulaire a chaque demarrage a froid.
  if (isLoading) return <LoadingState label="" />;
  return isAdmin ? <AdminDashboardScreen /> : <AdminLoginScreen />;
}
