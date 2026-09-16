import { useLocalSearchParams } from 'expo-router';

import { AdminRecipeFormScreen } from '@/screens/admin-recipe-form';

export default function Route() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return <AdminRecipeFormScreen id={id} />;
}
