import { useLocalSearchParams } from 'expo-router';

import { CookingModeScreen } from '@/screens/cooking-mode';

export default function Route() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <CookingModeScreen id={id} />;
}
