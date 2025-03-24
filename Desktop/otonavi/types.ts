export type Store = {
  id: string;
  name: string;
  genre: string;
  area: string;
  capacity: number;
  payment_methods: string[];
  opening_hours: string;
  image_url?: string | null;
  description?: string;
};