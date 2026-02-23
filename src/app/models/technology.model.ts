export interface Technology {
  id: string;
  name: string;
  year: number;
  categoryId: string;
  wikipediaTitle: string;
  fallbackDescription?: string;
  fallbackImageUrl?: string;
}

export interface WikipediaData {
  description: string;
  thumbnailUrl: string | null;
  extract: string;
}

export interface DisplayTech extends Technology {
  wiki: WikipediaData | null;
  isLoading: boolean;
}
