import { useLocalSearchParams } from 'expo-router';

import { RecipeDetailScreen } from '@/screens/recipe-detail';

export default function Route() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <RecipeDetailScreen id={id} />;
}
