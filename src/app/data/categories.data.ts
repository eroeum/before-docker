import { CategoryConfig } from '../models/category.model';

export const CATEGORIES: CategoryConfig[] = [
  {
    id: 'software',
    name: 'Software Technologies',
    description: 'Languages, frameworks, tools, and platforms — all before or after Docker.',
    icon: 'code',
  },
  {
    id: 'space',
    name: 'Space Exploration',
    description: 'Missions, telescopes, and rockets — ranked by their distance from the Docker era.',
    icon: 'rocket_launch',
  },
  {
    id: 'engineering',
    name: 'Engineering Milestones',
    description: 'Transistors, telegraphs, and the web — great inventions measured in Docker years.',
    icon: 'engineering',
  },
];

export const CATEGORY_MAP: Record<string, CategoryConfig> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c])
);
