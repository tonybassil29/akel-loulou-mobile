export type RecipeCategory = 'plat' | 'dessert' | 'menu_only';

export interface Equipment {
  name: string;
  image_url: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string | null;
  category: RecipeCategory | string;
  ingredients: string[];
  instructions: string;
  image_url: string | null;
  servings: number | null;
  prep_time: number | null;
  cook_time: number | null;
  difficulty: string | null;
  country: string | null;
  spices: string[];
  equipment: Equipment[];
  tags: string[];
  hidden: boolean | null;
  is_secondary: boolean | null;
  show_portions: boolean | null;
  /** Recettes liees, telles que le site les enregistre : { id, title }. */
  related_recipes: { id: string; title: string }[] | null;
  created_at: string;
  updated_at: string;
}

export interface GalleryItem {
  id: string;
  url: string;
  name: string | null;
  recipe_id: string | null;
  created_at: string;
}

export interface HeaderSettings {
  topBadge?: string;
  titlePart1?: string;
  titleHighlight?: string;
  subtitle?: string;
  logoUrl?: string;
  /** Libelles et emojis des pilules de filtre, editables depuis l'admin du site. */
  filterAllText?: string;
  filterAllEmoji?: string;
  filterPlatText?: string;
  filterPlatEmoji?: string;
  filterDessertText?: string;
  filterDessertEmoji?: string;
}

export interface AboutSettings {
  quote?: string;
  title?: string;
  text?: string;
  imageUrl?: string;
  [key: string]: unknown;
}
