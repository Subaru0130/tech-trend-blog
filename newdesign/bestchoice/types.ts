export interface CategoryItem {
  name: string;
  subtitle: string;
  icon: string;
}

export interface FeaturedCategory {
  title: string;
  subtitle: string;
  imageUrl: string;
}

export type ColorTheme = 'blue' | 'green' | 'purple';

export interface SectionData {
  id: string;
  title: string;
  icon: string;
  color: ColorTheme;
  items: CategoryItem[];
  linkText: string;
}